import { connect } from "socket.io-client";

export const socket = connect(process.env.REACT_APP_SERVER_URL as string, {
  withCredentials: true,
  reconnection: false,
});
