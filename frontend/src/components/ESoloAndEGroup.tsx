import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
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
    <div className="relative">
      <Tooltip id="top" place="top" />
      <div className="flex flex-col justify-center pt-5">
        <span className="text-2xl text-blue-500 pt-4 pb-10 self-center font-bold">
          <i
            className={`fas fa-${title === "Solo" ? "user-friends" : "users"}`}
          />
        </span>
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
                className={`flex items-center p-2 m-2 cursor-pointer hover:bg-gray-50 transition duration-700 ${
                  activeID === convo.id && "opacity-50"
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
                    <span className="text-gray-400">
                      {lastMessage.sender.id === user?.id && (
                        <i
                          className={`fas fa-${
                            isLastMessageNotViewed
                              ? "check text-gray-400"
                              : "check-double text-blue-500"
                          } mr-2 text-xs`}
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
                  <span className="bg-red-500 rounded-full text-white px-2 text-xs py-1 ml-auto">
                    {convo.unread}
                  </span>
                )}
              </div>
            );
          }
          return null;
        })}
        {title === "Group" && (
          <Link
            to="/home/create-group"
            className="text-blue-500 cursor-pointer bg-gray-100 py-2 px-3 shadow-md fixed rounded-full hover:opacity-80"
            style={{
              left: "340px",
              bottom: "50px",
            }}
            data-for="top"
            data-tip="New Group"
          >
            <i className="fas fa-plus" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default ESoloAndEGroup;
