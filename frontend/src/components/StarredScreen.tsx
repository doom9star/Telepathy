import React from "react";
import ReactTimeAgo from "react-time-ago";
import { useConvoContext, useGlobalContext } from "../context";
import { setAID, setScreen } from "../context/actionCreators";
import { useStarMessage } from "../hooks/useStarMessage";
import { axios } from "../ts/constants";
import { IJsonResponse, IMessage, ScreenType } from "../ts/types";
import Loader from "./Loader";

function StarredScreen() {
  const starMessage = useStarMessage();
  const {
    dispatch: globalDispatcher,
    state: { screen },
  } = useGlobalContext();
  const { dispatch: convoDispatcher } = useConvoContext();

  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    axios
      .get<IJsonResponse>("/api/message/star")
      .then(({ data }) => {
        if (data.status === 200) setMessages(data.body);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gray-100 w-full h-full relative p-4">
      <p className="text-center mt-4 mb-10 text-gray-600 font-bold">
        <i className="fas fa-star mr-1 text-blue-600" />
        <i className="fas fa-paper-plane mr-4 text-blue-600" />
        Starred Messages
      </p>
      <i
        className="fas fa-chevron-left bg-blue-500 text-xs text-white mb-4 py-1 px-2 rounded-full cursor-pointer hover:opacity-80"
        onClick={() => globalDispatcher(setScreen(screen.previous))}
      />
      {loading ? (
        <Loader styles={{ left: "50%" }} />
      ) : (
        messages.map((m) => (
          <div
            className="flex flex-col bg-white p-4 mb-2 cursor-pointer hover:opacity-90"
            key={m.id}
            onClick={() => {
              convoDispatcher(setAID(m.conversation!.id));
              globalDispatcher(setScreen(ScreenType.MESSAGE));
            }}
          >
            <div className="flex items-center">
              <img
                alt={m.id}
                src={m.sender.avatar ? m.sender.avatar.url : "/noImg.jpg"}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span className="text-gray-600 font-bold">
                {m.sender.username}
              </span>
              <span className="ml-auto text-gray-400 font-bold text-xs">
                <ReactTimeAgo date={new Date(m.createdAt)} locale={"en-us"} />
              </span>
            </div>
            <div className="flex flex-col py-4 px-8">
              {m.forwarded && (
                <span className="text-gray-400 text-sm">
                  <i className="fas fa-share mr-2" />
                  Forwarded
                </span>
              )}
              <p className="my-2 mx-5 font-semibold text-gray-600">{m.body}</p>
              <p className="mx-5 mt-4 text-sm text-gray-400">
                <i
                  className={"fas fa-star mr-4 cursor-pointer text-red-600"}
                  onClick={() => {
                    starMessage(m.conversation!.id, m.id, -1);
                    setMessages(messages.filter((_) => _.id !== m.id));
                  }}
                />
                <i
                  className="fas fa-share hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    globalDispatcher(setScreen(ScreenType.SHARE, m));
                  }}
                />
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default StarredScreen;
