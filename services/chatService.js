import mongoose from "mongoose";
import Message from "../models/Message.js";
import Order from "../models/Order.js";

export function conversationRoom(orderId) {
  return `conversation-${orderId}`;
}

export async function getConversationOrder(orderId) {
  return Order.findById(orderId).populate({
    path: "items",
    populate: {
      path: "product",
      populate: [
        { path: "owner", select: "name email phone collegeName collegeId avatar" },
        { path: "createdBy", select: "name email phone collegeName collegeId avatar" }
      ]
    }
  });
}

export function isConversationParticipant(order, user) {
  if (!order || !user) return false;

  const userId = user._id.toString();
  if (order.user?.toString() === userId) return true;

  return order.items?.some((item) => {
    const product = item.product;
    const ownerId = product?.owner?._id || product?.owner;
    const creatorId = product?.createdBy?._id || product?.createdBy;
    return ownerId?.toString() === userId || creatorId?.toString() === userId;
  }) || false;
}

export async function createMessage(orderId, user, text) {
  const message = await Message.create({
    order: orderId,
    sender: user._id,
    senderName: user.name || "User",
    text: text.trim()
  });

  return message.toObject();
}

export async function getOrderMessages(orderId) {
  return Message.find({ order: orderId }).sort({ createdAt: 1 }).lean();
}

export async function attachOrderMessages(orders) {
  const orderList = Array.isArray(orders) ? orders : [orders];
  const orderIds = orderList.map((order) => order._id).filter(Boolean);
  const messages = orderIds.length
    ? await Message.find({ order: { $in: orderIds } }).sort({ createdAt: 1 }).lean()
    : [];
  const messagesByOrder = new Map();

  for (const message of messages) {
    const key = message.order.toString();
    const existing = messagesByOrder.get(key) || [];
    existing.push(message);
    messagesByOrder.set(key, existing);
  }

  return orderList.map((order) => {
    const result = order.toObject ? order.toObject() : { ...order };
    result.messages = [
      ...(result.messages || []),
      ...(messagesByOrder.get(order._id.toString()) || [])
    ];
    return result;
  });
}

export function isValidConversationId(orderId) {
  return mongoose.Types.ObjectId.isValid(orderId);
}
