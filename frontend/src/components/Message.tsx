import classNames from "classnames";
import React from "react";
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
      className={`bg-white p-6 mt-4 text-gray-500 ${
        user?.id === message.sender.id ? "self-end mr-2" : "ml-2"
      } break-words`}
      style={{ maxWidth: "60%", minWidth: "60%", fontFamily: "cursive" }}
    >
      {message.forwarded && (
        <p className="text-xs mb-4 text-gray-400">
          <i className="fas fa-share mr-1" /> Forwarded
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
          style={{ wordSpacing: "0.4em", fontFamily: "initial" }}
          className={`${
            convoType === ConversationType.GROUP && "pl-10 pt-2"
          } whitespace-pre-wrap text-xs`}
        >
          {message.body}
        </p>
        <div className="ml-2 text-sm text-gray-400">
          <i
            className={
              "fas fa-star mr-2 hover:text-blue-500 cursor-pointer" +
              classNames({
                " text-blue-500": isStarred,
              })
            }
            onClick={() =>
              starMessage(activeID!, message.id, isStarred ? -1 : 1)
            }
          />
          <i
            className="fas fa-share hover:text-blue-500 cursor-pointer"
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
        <span className="text-gray-400 mt-2 self-end">
          <ReactTimeAgo date={new Date(message.createdAt)} locale={"en-us"} />
        </span>
      </div>
    </div>
  );
}

export default Message;
