import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/User.js";
import { getFirebaseAuthenticatedUser } from "../middleware/firebaseAuth.js";
import {
  conversationRoom,
  createMessage,
  getConversationOrder,
  isConversationParticipant,
  isValidConversationId
} from "./chatService.js";

let io;

function getToken(socket) {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return authToken;

  const authorization = socket.handshake.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
}

async function getSocketUser(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new Error("User not found or inactive");
    return user;
  } catch {
    const authenticated = await getFirebaseAuthenticatedUser(token);
    return authenticated.user;
  }
}

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket"]
  });

  io.use(async (socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) throw new Error("Authentication required");

      socket.user = await getSocketUser(token);
      next();
    } catch (error) {
      next(new Error("Invalid socket authentication"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinConversation", async (conversationId, callback) => {
      try {
        if (!isValidConversationId(conversationId)) {
          throw new Error("Invalid conversation");
        }

        const order = await getConversationOrder(conversationId);
        if (!isConversationParticipant(order, socket.user)) {
          throw new Error("Not authorized for this conversation");
        }

        socket.join(conversationRoom(conversationId));
        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on("sendMessage", async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;
        const text = payload?.text;
        if (!isValidConversationId(conversationId) || !text?.trim()) {
          throw new Error("Conversation and message text are required");
        }

        const order = await getConversationOrder(conversationId);
        if (!isConversationParticipant(order, socket.user)) {
          throw new Error("Not authorized for this conversation");
        }

        const message = await createMessage(conversationId, socket.user, text);
        io.to(conversationRoom(conversationId)).emit("newMessage", message);
        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });
  });

  return io;
}

export function emitNewMessage(orderId, message) {
  if (io) {
    io.to(conversationRoom(orderId)).emit("newMessage", message);
  }
}
