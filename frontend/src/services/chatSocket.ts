import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let socketToken: string | null = null;

function getSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;
  return apiUrl ? apiUrl.replace(/\/api\/?$/, '') : window.location.origin;
}

export function getChatSocket(token: string) {
  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socketToken = token;
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
