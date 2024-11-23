import React from "react";
import { Link } from "react-router-dom";
import Explorer from "../components/Explorer";
import InfoScreen from "../components/InfoScreen";
import MessageScreen from "../components/MessageScreen";
import ShareScreen from "../components/ShareScreen";
import Sidebar from "../components/Sidebar";
import StarredScreen from "../components/StarredScreen";
import { useConvoContext, useGlobalContext } from "../context";
import { setConversations } from "../context/actionCreators";
import { useIOLnrs } from "../hooks/useIOLnrs";
import { axios } from "../ts/constants";
import { IJsonResponse, ScreenType } from "../ts/types";

function Home() {
  const {
    state: { activeETab, screen },
  } = useGlobalContext();

  const { dispatch } = useConvoContext();

  useIOLnrs();

  React.useEffect(() => {
    axios.get<IJsonResponse>("/api/conversations").then(({ data }) => {
      dispatch(setConversations(data.body));
    });
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="w-full flex" style={{ height: "100vh" }}>
        <Sidebar />
        {activeETab && <Explorer />}
        <div
          className="relative w-full mt-20 overflow-y-scroll"
          style={{ height: "90vh" }}
        >
          {screen.current === ScreenType.MESSAGE ? (
            <MessageScreen />
          ) : screen.current === ScreenType.INFO ? (
            <InfoScreen />
          ) : screen.current === ScreenType.SHARE ? (
            <ShareScreen />
          ) : screen.current === ScreenType.STARRED ? (
            <StarredScreen />
          ) : (
            <Link
              to={"/"}
              className="self-center flex items-center justify-center h-full"
            >
              <img
                src="/logo.jpeg"
                alt="logo"
                className="w-96 h-96 object-cover"
              />
            </Link>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
