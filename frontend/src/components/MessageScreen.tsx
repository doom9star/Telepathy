import React from "react";
import { useNavigate } from "react-router-dom";
import { useConvoContext, useGlobalContext } from "../context";
import {
  paginateMessages,
  setAID,
  setLoading,
  setScreen,
} from "../context/actionCreators";
import { useActiveConvo } from "../hooks/useActiveConvo";
import socket from "../socket";
import { axios } from "../ts/constants";
import { GLTypes, IJsonResponse, IMessage, ScreenType } from "../ts/types";
import Button from "./Button";
import Loader from "./Loader";
import Message from "./Message";

const MessageScreen: React.FC = () => {
  const {
    dispatch: convoDispatcher,
    state: { activeID },
  } = useConvoContext();
  const {
    state: { user, lMgr, screen },
    dispatch: globalDispatcher,
  } = useGlobalContext();
  const { name, date, isSolo, imageURL, isCreator, convoProps } =
    useActiveConvo();
  const navigate = useNavigate();

  const [showToolBar, setShowToolBar] = React.useState(false);
  const [paginationLoading, setPaginationLoading] = React.useState(false);
  const [newMessageIndicatorLocation, setNewMessageIndicatorLocation] =
    React.useState<number>(0);
  const [message, setMessage] = React.useState("");

  const messageBoxRef = React.useRef<HTMLDivElement | null>(null);
  const userActiveCheckTimeoutRef = React.useRef<NodeJS.Timeout | undefined>();
  const messageContainerRef = React.useRef<HTMLDivElement | null>(null);
  const newMessageIndicatorRef = React.useRef<HTMLDivElement | null>(null);
  const newMessageIndicatorResetTimeoutRef = React.useRef<
    NodeJS.Timeout | undefined
  >();

  const getMessages = React.useCallback(() => {
    if (convoProps?.more) {
      setPaginationLoading(true);
      axios
        .post<IJsonResponse>(`/api/messages`, {
          cid: activeID,
          offset: convoProps?.convo.messages.length,
        })
        .then(({ data }) => {
          setPaginationLoading(false);
          const { cid, messages, more } = data.body;
          convoDispatcher(paginateMessages(cid, messages, more));
        });
    }
  }, [activeID, convoDispatcher, convoProps]);

  const shareMessage = React.useCallback(
    (message: IMessage) => {
      globalDispatcher(
        setScreen(ScreenType.SHARE, {
          message,
          scrollY: messageContainerRef.current!.scrollTop,
        })
      );
    },
    [globalDispatcher]
  );

  const handleSend = () => {
    if (message.trim() !== "" && !lMgr[GLTypes.MESSAGE_CREATION]) {
      globalDispatcher(setLoading(GLTypes.MESSAGE_CREATION, true));
      socket.emit("message:create", activeID, message);
      setMessage("");
      messageBoxRef.current!.innerText = "";
    }
  };

  React.useEffect(() => {
    if ((convoProps?.convo.unread || 0) > 0 && !lMgr[GLTypes.MESSAGE_READ]) {
      setNewMessageIndicatorLocation(convoProps?.convo.unread!);
      if (newMessageIndicatorResetTimeoutRef.current)
        clearTimeout(newMessageIndicatorResetTimeoutRef.current);
      newMessageIndicatorResetTimeoutRef.current = setTimeout(
        () => setNewMessageIndicatorLocation(0),
        20000
      );
      globalDispatcher(setLoading(GLTypes.MESSAGE_READ, true));
      socket.emit("message:read", convoProps?.convo.id);
    }
  }, [convoProps, globalDispatcher, lMgr]);

  React.useEffect(() => {
    if (convoProps!.convo.messages.length < 10) getMessages();
  }, [getMessages, convoProps]);

  React.useEffect(() => {
    if (newMessageIndicatorRef.current)
      newMessageIndicatorRef.current.scrollIntoView({ behavior: "smooth" });
  });

  React.useEffect(() => {
    if (isSolo && !userActiveCheckTimeoutRef.current) {
      userActiveCheckTimeoutRef.current = setInterval(() => {
        socket.emit(
          "user:active",
          convoProps?.convo.id,
          convoProps?.convo.participants.find((p) => p.id !== user?.id)?.id
        );
      }, 5000);
    }
  }, [isSolo, user, convoProps]);

  React.useEffect(() => {
    if (screen.data?.scrollY !== 0 && messageContainerRef.current)
      messageContainerRef.current.scrollTo({
        top: screen.data!.scrollY,
      });
  }, [screen]);

  return (
    <>
      <div className="h-14 flex justify-between px-5 relative">
        <div className="flex items-center">
          <img
            src={imageURL}
            alt="noImg"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div className="flex flex-col ml-3">
            <span className="text-blue-500">{name}</span>
            {isSolo && convoProps?.active && (
              <span className="text-xs text-gray-500 ">online</span>
            )}
          </div>
        </div>
        <div
          className="flex items-center"
          onClick={() => setShowToolBar(!showToolBar)}
        >
          <i className="fas fa-ellipsis-v text-blue-500 cursor-pointer"></i>
        </div>
        {showToolBar && (
          <div className="absolute right-6 bg-gray-50 top-10 shadow-md">
            <div
              className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
              onClick={() => {
                globalDispatcher(setScreen(null));
                convoDispatcher(setAID(null));
              }}
            >
              <i className="fas fa-comment-slash text-blue-500 w-8"></i>
              Close
            </div>
            {!isSolo && convoProps?.convo.creator.id === user?.id && (
              <div
                onClick={() => {
                  setShowToolBar(false);
                  navigate("/home/edit-group");
                }}
                className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
              >
                <i className="fas fa-pen text-yellow-500 w-8"></i>Edit
              </div>
            )}
            {!isSolo && isCreator ? (
              <div className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100">
                <i className="fas fa-sign-out-alt text-red-500 w-8"></i>Exit
              </div>
            ) : (
              <div className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100">
                <i className="fas fa-trash text-red-500 w-8"></i>Delete
              </div>
            )}
            <div
              className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
              onClick={() => {
                setShowToolBar(false);
                globalDispatcher(
                  setScreen(ScreenType.INFO, {
                    scrollY: messageContainerRef.current!.scrollTop,
                  })
                );
              }}
            >
              <i className="fas fa-info-circle text-green-500 w-8"></i>
              Info
            </div>
          </div>
        )}
      </div>
      <div className="h-3/4">
        <div
          className={
            "h-full w-full overflow-y-scroll no-scrollbar flex flex-col-reverse"
          }
          ref={messageContainerRef}
          onScroll={({ currentTarget: container }) => {
            if (
              container.clientHeight - container.scrollHeight ===
                container.scrollTop &&
              !paginationLoading
            )
              getMessages();
          }}
        >
          {convoProps?.convo.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <i className="fas fa-fan text-9xl text-gray-300" />
            </div>
          )}
          {convoProps?.convo.messages.map((message: IMessage, idx) => (
            <React.Fragment key={message.id}>
              <Message
                message={message}
                convoType={convoProps.convo.type}
                shareMessage={shareMessage}
              />
              {(convoProps.convo.unread! > 0 ||
                newMessageIndicatorLocation > 0) &&
                idx ===
                  (convoProps.convo.unread! || newMessageIndicatorLocation) -
                    1 && (
                  <div
                    className="flex justify-center items-center my-8 text-sm font-bold text-gray-600"
                    ref={newMessageIndicatorRef}
                  >
                    <i className="fas fa-arrow-down text-blue-600 mr-2" />
                    New Messages
                  </div>
                )}
            </React.Fragment>
          ))}
          {!isSolo && !convoProps?.more && (
            <span className="text-gray-500 font-bold text-sm text-center my-4">
              {isCreator
                ? `You created this group - ${date}`
                : `'${convoProps?.convo.creator.username}' created this group on ${date}, Welcome!`}
            </span>
          )}
          {paginationLoading && <Loader styles={{ top: "10%" }} />}
        </div>
      </div>
      <div className="pt-10 mb-4 flex px-5 items-center h-auto">
        <div
          contentEditable
          id="messageBox"
          ref={messageBoxRef}
          className="w-full bg-white focus:outline-none p-2 z-50 overflow-y-scroll border border-gray-300 mr-4"
          style={{ fontSize: "80%" }}
          data-placeholder="Write a message..."
          onInput={(e) => setMessage(e.currentTarget.innerText)}
        ></div>
        <Button
          label="Send"
          onClick={handleSend}
          styles={`bg-blue-500 text-gray-100`}
          icon="fas fa-paper-plane"
          isLoading={lMgr[GLTypes.MESSAGE_CREATION]}
        />
      </div>
    </>
  );
};

export default MessageScreen;
