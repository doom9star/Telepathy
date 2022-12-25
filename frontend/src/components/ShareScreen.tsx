import { nanoid } from "nanoid";
import React from "react";
import { useConvoContext, useGlobalContext } from "../context";
import { setLoading, setScreen } from "../context/actionCreators";
import { useUserSearch } from "../hooks/useUserSearch";
import socket from "../socket";
import { ConversationType, GLTypes } from "../ts/types";
import Button from "./Button";
import Input from "./Input";
import Loader from "./Loader";

type TForwardees = {
  uid?: string;
  cid?: string;
  name: string;
  image: string;
}[];

const ShareScreen: React.FC = () => {
  const {
    state: { lMgr, user, screen },
    dispatch,
  } = useGlobalContext();
  const {
    state: { convos },
  } = useConvoContext();

  const [forwardees, setForwardees] = React.useState<TForwardees>([]);
  const existingConvos = React.useMemo(() => {
    const _: { uid?: string; cid?: string; type: ConversationType }[] = [];
    Object.values(convos).forEach(({ convo }) => {
      _.push({
        uid:
          convo.type === ConversationType.SOLO
            ? convo.participants.find((p) => p.id !== user?.id)?.id
            : undefined,
        cid: convo.id,
        type: convo.type,
      });
    });
    return _;
  }, [convos, user]);

  const {
    handler,
    error: queryError,
    users,
    loading: userSearchLoading,
  } = useUserSearch();

  const handleSend = () => {
    if (!lMgr[GLTypes.MESSAGE_FORWARD].loading) {
      dispatch(
        setLoading(GLTypes.MESSAGE_FORWARD, true, () =>
          dispatch(setScreen(screen.previous))
        )
      );
      socket.emit(
        "message:forward",
        screen.data.id,
        forwardees.map((f) => ({ uid: f.uid, cid: f.cid }))
      );
    }
  };

  return (
    <div className="p-4">
      <i
        className="fas fa-chevron-left bg-blue-500 text-xs text-white py-1 px-2 rounded-full cursor-pointer hover:opacity-80"
        onClick={() => dispatch(setScreen(screen.previous))}
      />
      <div className="flex items-center">
        <div className="flex flex-col items-center w-3/4">
          <p className="text-gray-600 rounded-xl font-bold p-3 text-sm m-2">
            <i className="fas fa-share mr-2 text-blue-500" />
            Forward To:
          </p>
          <div className="flex flex-wrap m-4" style={{ width: "60%" }}>
            {forwardees.map((f) => (
              <div
                className="flex items-center bg-white px-4 py-2 text-gray-600 m-1 rounded-full"
                key={nanoid()}
              >
                <img
                  alt={f.image}
                  src={f.image}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-xs mr-6 font-bold">{f.name}</span>
                <i
                  className="fas fa-times text-xs cursor-pointer hover:opacity-80"
                  onClick={() =>
                    setForwardees(
                      forwardees.filter(
                        (_f) => `${_f.uid}-${_f.cid}` !== `${f.uid}-${f.cid}`
                      )
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
        {forwardees.length > 0 && (
          <Button
            label="Send"
            onClick={handleSend}
            styles={`bg-blue-500 text-gray-100`}
            icon="fas fa-paper-plane"
            isLoading={lMgr[GLTypes.MESSAGE_FORWARD].loading}
          />
        )}
      </div>
      <div className="relative">
        <Input
          inputProps={{
            type: "text",
            name: "query",
            placeholder: "Search Users...",
            onChange: handler,
            autoComplete: "off",
          }}
          error={queryError}
        />
        {(users.length > 0 || userSearchLoading) && (
          <div
            className="bg-white absolute z-50 top-14 w-1/2 overflow-y-scroll p-2"
            style={{
              minHeight: "100px",
              height: "100px",
            }}
          >
            {userSearchLoading ? (
              <Loader
                styles={{
                  top: "30%",
                }}
              />
            ) : (
              users.map((u) => {
                const isForwardee = forwardees.find((f) => f.uid === u.id);
                const image = u.avatar ? u.avatar.url : "/noImg.jpg";
                return (
                  <div
                    className="flex items-center p-2 cursor-pointer hover:bg-white"
                    key={nanoid()}
                  >
                    <img
                      src={image}
                      alt={image}
                      className="w-10 h-10 object-cover rounded-full mr-4"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-600">
                        {u.username}
                      </span>
                      <span className="text-gray-500 text-xs">{u.id}</span>
                    </div>
                    <i
                      className={`fas fa-${
                        isForwardee ? "times" : "plus"
                      } ml-auto ${
                        isForwardee ? "text-red-500" : "text-blue-500"
                      } hover:opacity-80`}
                      onClick={() => {
                        if (isForwardee) {
                          setForwardees(
                            forwardees.filter((f) => f.uid !== u.id)
                          );
                        } else {
                          const ec = existingConvos.find(
                            (ec) => ec.uid === u.id
                          );
                          setForwardees(
                            forwardees.concat({
                              uid: u.id,
                              cid: ec ? ec.cid : undefined,
                              name: u.username,
                              image,
                            })
                          );
                        }
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2">
        {Object.values(convos).map(({ convo: c }) => {
          const isSolo = c.type === ConversationType.SOLO;
          const participant = c.participants.find((p) => p.id !== user?.id)!;
          const name = isSolo ? participant.username : c.name!;
          const image = isSolo
            ? participant.avatar
              ? participant.avatar.url
              : "/noImg.jpg"
            : c.thumbnail
            ? c.thumbnail.url
            : "/noThumbnail.png";
          const isForwardee = !!forwardees.find((f) => f.cid === c.id);
          return (
            <div
              className="flex items-center px-4 py-4 m-1 text-gray-600 border-b"
              key={nanoid()}
            >
              <img
                alt={image}
                src={image}
                className="shadow-md w-10 h-10 rounded-full mr-4"
              />
              <span className="text-xs mr-6 font-bold">{name}</span>
              <span className="ml-auto cursor-pointer hover:opacity-80">
                <i
                  className={`fas fa-${
                    isForwardee ? "times" : "plus"
                  } ml-auto ${isForwardee ? "text-red-500" : "text-blue-500"}`}
                  onClick={() => {
                    setForwardees(
                      isForwardee
                        ? forwardees.filter((f) => f.cid !== c.id)
                        : forwardees.concat({
                            uid: isSolo ? participant.id : undefined,
                            cid: c.id,
                            name,
                            image,
                          })
                    );
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShareScreen;
