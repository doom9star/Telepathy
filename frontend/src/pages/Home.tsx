import React from "react";
import InfoScreen from "../components/InfoScreen";
import MessageScreen from "../components/MessageScreen";
import ShareScreen from "../components/ShareScreen";
import StarredScreen from "../components/StarredScreen";
import Explorer from "../components/Explorer";
import Logo from "../components/Logo";
import Sidebar from "../components/Sidebar";
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
      <div
        className="w-full flex"
        style={{ height: "92vh", transform: "translate(0, 8vh)" }}
      >
        <Sidebar />
        {activeETab && <Explorer />}
        <div className="relative h-full w-full overflow-y-scroll bg-gray-100">
          {screen.current === ScreenType.MESSAGE ? (
            <MessageScreen />
          ) : screen.current === ScreenType.INFO ? (
            <InfoScreen />
          ) : screen.current === ScreenType.SHARE ? (
            <ShareScreen />
          ) : screen.current === ScreenType.STARRED ? (
            <StarredScreen />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <Logo styles="text-blue-500 text-9xl" />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
