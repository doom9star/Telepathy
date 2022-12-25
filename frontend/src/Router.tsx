import React from "react";
import {
  BrowserRouter,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from "react-router-dom";
import Loader from "./components/Loader";
import Activated from "./pages/Activated";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import P404 from "./pages/P404";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import { useGlobalContext } from "./context";
import { axios } from "./ts/constants";
import { setUser } from "./context/actionCreators";
import Navbar from "./components/Navbar";
import CreateAndEditGroup from "./pages/CreateAndEditGroup";
import socket from "./socket";
import { useActiveConvo } from "./hooks/useActiveConvo";

const PrivateRoute: React.FC<RouteProps> = (props) => {
  const {
    state: { user },
  } = useGlobalContext();
  if (!user) return <Redirect to="/login" />;
  if (!socket.connected) socket.connect();
  return <Route {...props} />;
};
const PublicRoute: React.FC<RouteProps> = (props) => {
  const {
    state: { user },
  } = useGlobalContext();
  if (user) return <Redirect to="/home" />;
  if (socket.connected) socket.disconnect();
  return <Route {...props} />;
};

function Router() {
  const { convoProps } = useActiveConvo();
  const { dispatch } = useGlobalContext();
  const [isDone, setIsDone] = React.useState(false);
  React.useEffect(() => {
    axios.get("/auth/me").then(({ data }) => {
      if (data.status === 200) {
        dispatch(setUser(data.body));
      }
      setIsDone(true);
    });
  }, [dispatch]);

  if (!isDone) return <Loader />;

  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        <PublicRoute exact path="/" component={Landing} />
        <PrivateRoute exact path="/home" component={Home} />
        <PrivateRoute
          exact
          path="/home/create-group"
          render={() => <CreateAndEditGroup type="CREATE" />}
        />
        <PrivateRoute
          exact
          path="/home/edit-group"
          render={() => {
            if (convoProps?.convo) return <CreateAndEditGroup type="EDIT" />;
            return <Redirect to={"/home"} />;
          }}
        />
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute exact path="/register" component={Register} />
        <PublicRoute exact path="/activate/:uid" component={Activated} />
        <PublicRoute exact path="/forgot-password" component={ForgotPassword} />
        <PublicRoute
          exact
          path="/reset-password/:uid"
          component={ResetPassword}
        />
        <Route path="*" component={P404} />
      </Switch>
    </BrowserRouter>
  );
}

export default Router;
