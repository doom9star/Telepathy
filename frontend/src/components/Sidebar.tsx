import { Tooltip } from "antd";
import classNames from "classnames";
import React from "react";
import { useConvoContext, useGlobalContext } from "../context";
import { setETab } from "../context/actionCreators";
import { ENames } from "../ts/constants";
import { ConversationType } from "../ts/types";

export default function Sidebar() {
  const {
    state: { activeETab },
    dispatch,
  } = useGlobalContext();
  const {
    state: { convos },
  } = useConvoContext();

  const solosUnread = React.useMemo(() => {
    return Object.values(convos).filter(
      ({ convo }) => convo.type === ConversationType.SOLO && convo.unread! > 0
    ).length;
  }, [convos]);
  const groupsUnread = React.useMemo(() => {
    return Object.values(convos).filter(
      ({ convo }) => convo.type === ConversationType.GROUP && convo.unread! > 0
    ).length;
  }, [convos]);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        {activeETab !== ENames.SOLO && solosUnread > 0 && (
          <div
            className="bg-red-500 absolute z-50 right-2 top-0 rounded-full px-2 py-1 text-white"
            style={{ fontSize: "0.6em" }}
          >
            {solosUnread}
          </div>
        )}
        <Tooltip title="Solo" placement="right">
          <i
            className={
              "fas fa-user-friends p-6 home-icon" +
              classNames({
                " border-solid border-0 border-r-2 border-blue-400":
                  activeETab === ENames.SOLO,
              })
            }
            onClick={() => dispatch(setETab(ENames.SOLO))}
          ></i>
        </Tooltip>
      </div>
      <div className="relative">
        {activeETab !== ENames.GROUP && groupsUnread > 0 && (
          <div
            className="bg-red-500 absolute z-50 right-2 top-0 rounded-full px-2 py-1 text-white"
            style={{ fontSize: "0.6em" }}
          >
            {groupsUnread}
          </div>
        )}
        <Tooltip title="Group" placement="right">
          <i
            className={
              "fas fa-users p-6 home-icon" +
              classNames({
                " border-solid border-0 border-r-2 border-blue-400":
                  activeETab === ENames.GROUP,
              })
            }
            onClick={() => dispatch(setETab(ENames.GROUP))}
          ></i>
        </Tooltip>
      </div>
      <Tooltip title="Search" placement="right">
        <i
          data-tip="Search"
          className={
            "fas fa-search p-6 home-icon" +
            classNames({
              " border-solid border-0 border-r-2 border-blue-400":
                activeETab === ENames.SEARCH,
            })
          }
          onClick={() => dispatch(setETab(ENames.SEARCH))}
        ></i>
      </Tooltip>
      <Tooltip title="World" placement="right">
        <i
          className={
            "fas fa-globe-americas p-6 home-icon" +
            classNames({
              " border-solid border-0 border-r-2 border-blue-400":
                activeETab === ENames.WORLD,
            })
          }
          onClick={() => dispatch(setETab(ENames.WORLD))}
        ></i>
      </Tooltip>
      <Tooltip title="Profile" placement="right">
        <i
          className={
            "fas fa-user p-6 home-icon" +
            classNames({
              " border-solid border-0 border-r-2 border-blue-400":
                activeETab === ENames.PROFILE,
            })
          }
          onClick={() => dispatch(setETab(ENames.PROFILE))}
        ></i>
      </Tooltip>
      <Tooltip title="Settings" placement="right">
        <i
          data-tip="Settings"
          className={
            "fas fa-cog p-6 home-icon" +
            classNames({
              " border-solid border-0 border-r-2 border-blue-400":
                activeETab === ENames.SETTINGS,
            })
          }
          onClick={() => dispatch(setETab(ENames.SETTINGS))}
        ></i>
      </Tooltip>
    </div>
  );
}
