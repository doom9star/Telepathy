import { Spin } from "antd";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PrivateRoute, PublicRoute } from "./components/Route";
import { useGlobalContext } from "./context";
import { setUser } from "./context/actionCreators";
import { useActiveConvo } from "./hooks/useActiveConvo";
import Activated from "./pages/Activated";
import CreateAndEditGroup from "./pages/CreateAndEditGroup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import { axios } from "./ts/constants";

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

  if (!isDone)
    return (
      <div
        className="flex justify-center items-center"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Spin />
      </div>
    );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute children={<Landing />} />} />
        <Route path="/home" element={<PrivateRoute children={<Home />} />} />
        <Route
          path="/home/create-group"
          element={
            <PrivateRoute children={<CreateAndEditGroup type="CREATE" />} />
          }
        />
        <Route
          path="/home/edit-group"
          element={
            <PrivateRoute
              children={
                convoProps?.convo ? (
                  <CreateAndEditGroup type="EDIT" />
                ) : (
                  <Navigate replace to={"/home"} />
                )
              }
            />
          }
        />
        <Route path="/login" element={<PublicRoute children={<Login />} />} />
        <Route
          path="/register"
          element={<PublicRoute children={<Register />} />}
        />
        <Route
          path="/activate/:uid"
          element={<PublicRoute children={<Activated />} />}
        />
        <Route
          path="/forgot-password"
          element={<PublicRoute children={<ForgotPassword />} />}
        />
        <Route
          path="/reset-password/:uid"
          element={<PublicRoute children={<ResetPassword />} />}
        />
        <Route path="*" element={<Navigate replace to={"/"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
