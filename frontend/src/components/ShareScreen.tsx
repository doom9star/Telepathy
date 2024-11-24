import { Button, Input } from "antd";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPaperPlane, FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoReturnUpForward } from "react-icons/io5";
import { useConvoContext, useGlobalContext } from "../context";
import { setLoading, setScreen } from "../context/actionCreators";
import { useUserSearch } from "../hooks/useUserSearch";
import { socket } from "../socket";
import { ConversationType, GLTypes, SearchOptions } from "../ts/types";

type TForwardees = {
  uid?: string;
  cid?: string;
  name: string;
  image: string;
}[];

const ShareScreen: React.FC = () => {
  const [query, setQuery] = useState("");

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

  const { handler, users, loading: userSearchLoading } = useUserSearch();

  const handleSend = () => {
    if (!lMgr[GLTypes.MESSAGE_FORWARD]) {
      dispatch(
        setLoading(GLTypes.MESSAGE_FORWARD, true, () =>
          dispatch(setScreen(screen.previous))
        )
      );
      socket.emit(
        "message:forward",
        screen.data?.message.id,
        forwardees.map((f) => ({ uid: f.uid, cid: f.cid }))
      );
    }
  };

  useEffect(() => {
    handler(query, SearchOptions.NAME);
  }, [query, handler]);

  return (
    <div className="p-4">
      <Button
        icon={<FaArrowLeft />}
        onClick={() => dispatch(setScreen(screen.previous))}
      />
      <div className="flex items-center">
        <div className="flex items-center w-3/4">
          <p className="text-gray-600 rounded-xl p-3 text-sm">
            <IoReturnUpForward className="mr-2" />
            Forward To:
          </p>
          <div className="flex flex-wrap">
            {forwardees.map((f) => (
              <div
                className="border border-solid border-gray-100 flex items-center bg-white px-3 py-2 text-gray-600 m-1 rounded-lg"
                key={f.name}
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
            type="primary"
            icon={<FaPaperPlane />}
            onClick={handleSend}
            loading={lMgr[GLTypes.MESSAGE_FORWARD]}
          />
        )}
      </div>
      <div className="relative">
        <Input.Search
          placeholder="Search Users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          loading={userSearchLoading}
        />
        {users.length > 0 && (
          <div
            className="bg-gray-50 absolute z-50 top-8 w-1/2 overflow-y-scroll"
            style={{
              maxHeight: "300px",
            }}
          >
            {users.map((u) => {
              const isForwardee = forwardees.find((f) => f.uid === u.id);
              const image = u.avatar ? u.avatar.url : "/noImg.jpg";
              return (
                <div
                  className="flex items-center p-3 cursor-pointer hover:opacity-80"
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
                  <div className="ml-auto">
                    {!isForwardee ? (
                      <Button
                        icon={<FaPlus />}
                        onClick={() => {
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
                        }}
                      />
                    ) : (
                      <Button
                        icon={<IoMdClose />}
                        onClick={() =>
                          setForwardees(
                            forwardees.filter((f) => f.uid !== u.id)
                          )
                        }
                      />
                    )}
                  </div>
                </div>
              );
            })}
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
                className="w-10 h-10 rounded-full mr-4"
              />
              <span className="text-xs mr-6 font-bold">{name}</span>
              <div className="ml-auto">
                {!isForwardee ? (
                  <Button
                    icon={<FaPlus />}
                    onClick={() =>
                      setForwardees([
                        ...forwardees,
                        {
                          uid: isSolo ? participant.id : undefined,
                          cid: c.id,
                          name,
                          image,
                        },
                      ])
                    }
                  />
                ) : (
                  <Button
                    icon={<IoMdClose />}
                    onClick={() =>
                      setForwardees(forwardees.filter((f) => f.cid !== c.id))
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShareScreen;
