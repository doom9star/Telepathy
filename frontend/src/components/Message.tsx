import { Button } from "antd";
import classNames from "classnames";
import React from "react";
import { FaStar } from "react-icons/fa";
import { IoReturnUpForward } from "react-icons/io5";
import ReactTimeAgo from "react-time-ago";
import { useConvoContext, useGlobalContext } from "../context";
import { useStarMessage } from "../hooks/useStarMessage";
import { ConversationType, IMessage } from "../ts/types";

interface Props {
  message: IMessage;
  shareMessage: (m: IMessage) => void;
  convoType?: ConversationType;
}

function Message({ message, convoType, shareMessage }: Props) {
  const {
    state: { user },
  } = useGlobalContext();
  const {
    state: { activeID },
  } = useConvoContext();

  const starMessage = useStarMessage();

  const isSender = React.useMemo(
    () => message.sender.id === user?.id,
    [user, message]
  );

  const isStarred = React.useMemo(
    () => message.starrers.includes(user!.id),
    [message, user]
  );

  const isNotViewed = React.useMemo(() => {
    return message.recievers.some((r) => r.id !== user?.id && !r.read);
  }, [message, user]);

  return (
    <div
      className={`bg-white border border-solid border-gray-100 p-6 mt-4 text-gray-500 ${
        user?.id === message.sender.id ? "self-end mr-2" : "ml-2"
      } break-words`}
      style={{ maxWidth: "60%", minWidth: "60%" }}
    >
      {message.forwarded && (
        <p className="text-xs mb-4 text-gray-400">
          <IoReturnUpForward className="mr-2" /> Forwarded
        </p>
      )}
      {convoType === ConversationType.GROUP && (
        <div className="flex items-center">
          <img
            src={
              message.sender.avatar ? message.sender.avatar.url : "/noImg.jpg"
            }
            alt="noImg"
            className="w-7 h-7 object-cover rounded-full mr-4"
          />
          <span className="font-bold text-gray-600 text-xs">
            {isSender ? "You" : message.sender.username}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <p
          style={{ wordSpacing: "0.4em" }}
          className={`${
            convoType === ConversationType.GROUP && "pl-10 pt-2"
          } whitespace-pre-wrap text-xs font-bold`}
        >
          {message.body}
        </p>
        <div className="ml-2 text-sm text-gray-400">
          <Button
            icon={
              <FaStar
                className={classNames({
                  "text-gray-500": !isStarred,
                  "text-blue-500": isStarred,
                })}
              />
            }
            className="mr-2"
            onClick={() =>
              starMessage(activeID!, message.id, isStarred ? -1 : 1)
            }
          />
          <Button
            icon={<IoReturnUpForward />}
            onClick={() => shareMessage(message)}
          />
        </div>
      </div>
      <div
        className={`flex items-center ${
          isSender ? "justify-between" : "justify-end"
        } text-xs`}
      >
        {isSender && (
          <i
            className={`fas fa-${
              isNotViewed ? "check text-gray-400" : "check-double text-blue-500"
            } mt-4`}
          />
        )}
        <span className="text-gray-400 self-end">
          <ReactTimeAgo date={new Date(message.createdAt)} locale={"en-us"} />
        </span>
      </div>
    </div>
  );
}

export default Message;
