import { Badge, Tooltip } from "antd";
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
        <Tooltip title="Solo" placement="right">
          <Badge
            count={activeETab !== ENames.SOLO ? solosUnread : ""}
            offset={[-10, 8]}
            hidden
          >
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
          </Badge>
        </Tooltip>
      </div>
      <div className="relative">
        <Tooltip title="Group" placement="right">
          <Badge
            count={activeETab !== ENames.GROUP ? groupsUnread : ""}
            offset={[-10, 8]}
            hidden
          >
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
          </Badge>
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
