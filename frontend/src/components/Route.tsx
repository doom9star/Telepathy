import { Navigate } from "react-router-dom";
import { useGlobalContext } from "../context";
import { socket } from "../socket";
import Navbar from "./Navbar";

type Props = {
  children: any;
};

export const PrivateRoute: React.FC<Props> = (props) => {
  const {
    state: { user },
  } = useGlobalContext();

  if (!user) return <Navigate to="/login" />;

  if (!socket.connected) socket.connect();

  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
};

export const PublicRoute: React.FC<Props> = (props) => {
  const {
    state: { user },
  } = useGlobalContext();

  if (user) return <Navigate to="/home" />;

  if (socket.connected) socket.disconnect();

  return props.children;
};
