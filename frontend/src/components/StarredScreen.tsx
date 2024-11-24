import { Button, Spin } from "antd";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoReturnUpForward } from "react-icons/io5";
import { LuStarOff } from "react-icons/lu";
import ReactTimeAgo from "react-time-ago";
import { useConvoContext, useGlobalContext } from "../context";
import { setAID, setScreen } from "../context/actionCreators";
import { useStarMessage } from "../hooks/useStarMessage";
import { axios } from "../ts/constants";
import { IJsonResponse, IMessage, ScreenType } from "../ts/types";

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
    <div className="w-[90%] h-full px-4">
      <p className="text-center mt-4 mb-10 text-gray-600">
        <i className="fas fa-star mr-2 text-blue-600" />
        Starred Messages
      </p>
      <Button
        icon={<FaArrowLeft />}
        onClick={() => globalDispatcher(setScreen(screen.previous))}
      />
      <div className="mt-4">
        {loading ? (
          <div className="w-full flex justify-center">
            <Spin />
          </div>
        ) : (
          messages.map((m) => (
            <div
              className="flex flex-col border border-solid border-gray-100 mb-2 p-3 cursor-pointer hover:opacity-90"
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
                <span className="ml-auto text-gray-400 text-xs">
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
                <p className="my-2 mx-5 text-xs font-bold text-gray-600">
                  {m.body}
                </p>
                <p className="mx-5 mt-4 text-sm text-gray-400">
                  <Button
                    icon={<LuStarOff />}
                    onClick={(e) => {
                      e.stopPropagation();
                      starMessage(m.conversation!.id, m.id, -1);
                      setMessages(messages.filter((_) => _.id !== m.id));
                    }}
                    className="mr-2"
                  />
                  <Button
                    icon={<IoReturnUpForward />}
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
    </div>
  );
}

export default StarredScreen;
