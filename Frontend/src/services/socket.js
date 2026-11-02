import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false, // Don't connect until user is authenticated
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    if (token) {
      cb({ token });
    } else {
      // Disconnect if no token
      socket.disconnect();
    }
  },
});

// Connect when token is available
if (localStorage.getItem("token")) {
  socket.connect();
}

// Listen for token changes (after login)
window.addEventListener("storage", (e) => {
  if (e.key === "token") {
    if (e.newValue && !socket.connected) {
      socket.connect();
    } else if (!e.newValue && socket.connected) {
      socket.disconnect();
    }
  }
});

export default socket;
