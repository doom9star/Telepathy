import IOClient from "socket.io-client";

export default IOClient("http://localhost:5000", {
  withCredentials: true,
  reconnection: false,
});
