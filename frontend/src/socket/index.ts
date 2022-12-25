import IOClient from "socket.io-client";

export default IOClient(process.env.REACT_APP_SERVER_URL as string, {
  withCredentials: true,
  reconnection: false,
});
