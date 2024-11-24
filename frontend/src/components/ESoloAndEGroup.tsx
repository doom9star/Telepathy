import { Badge, Button } from "antd";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useConvoContext, useGlobalContext } from "../context";
import { setAID, setScreen } from "../context/actionCreators";
import { ConversationType, ScreenType } from "../ts/types";

interface Props {
  title: "Solo" | "Group";
}

function ESoloAndEGroup({ title }: Props) {
  const {
    state: { convos, activeID },
    dispatch: convoDispatcher,
  } = useConvoContext();

  const {
    state: { user },
    dispatch: globalDispatcher,
  } = useGlobalContext();

  return (
    <div className="flex relative flex-col justify-center pt-5 px-2">
      <span className="text-2xl text-blue-500 pt-4 pb-10 self-center font-bold">
        <i
          className={`fas fa-${title === "Solo" ? "user-friends" : "users"}`}
        />
      </span>
      {title === "Group" && (
        <Link to={"/home/create-group"} className="ml-auto">
          <Button icon={<FaPlus />} />
        </Link>
      )}
      {Object.values(convos).map(({ convo }) => {
        if (title.toUpperCase() === convo.type) {
          const isSolo = convo.type === ConversationType.SOLO;
          const participant = isSolo
            ? convo.participants.find((p) => p.id !== user?.id)
            : null;
          const lastMessage = convo.messages[0];
          const isLastMessageNotViewed = lastMessage?.recievers?.some(
            (r) => r.id !== user?.id && !r.read
          );
          const image = isSolo
            ? participant?.avatar
              ? participant.avatar.url
              : "/noImg.jpg"
            : convo.thumbnail
            ? convo.thumbnail.url
            : "/noThumbnail.png";
          const name = isSolo ? participant?.username : convo.name;

          return (
            <div
              key={convo.id}
              className={`flex items-center p-2 m-2 cursor-pointer hover:bg-gray-50 transition duration-700 rounded-lg ${
                activeID === convo.id && "opacity-70 bg-white"
              }`}
              onClick={() => {
                convoDispatcher(setAID(convo.id));
                globalDispatcher(setScreen(ScreenType.MESSAGE));
              }}
            >
              <img
                src={image}
                alt="noImg"
                className="w-10 h-10 mr-4 rounded-full object-cover"
              />
              <div className="text-sm flex flex-col">
                <span className="font-bold text-gray-600">{name}</span>
                {lastMessage && (
                  <span className="text-gray-400 text-xs">
                    {lastMessage.sender.id === user?.id && (
                      <i
                        style={{ fontSize: "0.5rem" }}
                        className={`fas fa-${
                          isLastMessageNotViewed
                            ? "check text-gray-400"
                            : "check-double text-blue-500"
                        } mr-2`}
                      />
                    )}
                    {!isSolo && (
                      <span className="font-bold mr-2">
                        {lastMessage.sender.username}:
                      </span>
                    )}
                    {`${
                      lastMessage.body.length > 25
                        ? lastMessage.body.slice(0, 25) + "..."
                        : lastMessage.body
                    }`}
                  </span>
                )}
              </div>
              {convo.unread! > 0 && (
                <Badge count={convo.unread} className="ml-auto" />
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default ESoloAndEGroup;
