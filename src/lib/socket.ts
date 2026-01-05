import { io, Socket } from 'socket.io-client';

const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const SOCKET_URL = raw.replace(/\/api\/?$/i, '');

let socket: Socket | null = null;

export const connectSocket = (token?: string | null, teamId?: string | null) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    query: {
      teamId: teamId || undefined,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default connectSocket;
