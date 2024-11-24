import React from "react";
import { useGlobalContext } from "../context";
import { ENames } from "../ts/constants";
import EProfile from "./EProfile";
import Search from "./Search";
import ESettings from "./ESettings";
import ESoloAndEGroup from "./ESoloAndEGroup";

function Explorer() {
  const {
    state: { activeETab },
  } = useGlobalContext();

  return (
    <div className="w-1/3 relative bg-gray-50" style={{ minWidth: "350px" }}>
      {activeETab === ENames.SOLO ? (
        <ESoloAndEGroup title="Solo" />
      ) : activeETab === ENames.GROUP ? (
        <ESoloAndEGroup title="Group" />
      ) : activeETab === ENames.SEARCH ? (
        <Search />
      ) : activeETab === ENames.SETTINGS ? (
        <ESettings />
      ) : activeETab === ENames.PROFILE ? (
        <EProfile />
      ) : null}
    </div>
  );
}
export default Explorer;
