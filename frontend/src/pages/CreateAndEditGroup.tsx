import { Button, Dropdown, Input, MenuProps } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useMemo } from "react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../context";
import { setLoading } from "../context/actionCreators";
import { useActiveConvo } from "../hooks/useActiveConvo";
import { useUserSearch } from "../hooks/useUserSearch";
import { socket } from "../socket";
import {
  ConversationType,
  GLTypes,
  ImageState,
  IUser,
  SearchOptions,
} from "../ts/types";
import { getFileURI } from "../ts/utils";

interface Info {
  name: string;
  description: string;
}

interface Props {
  type: "CREATE" | "EDIT";
}

function CreateAndEditGroup({ type }: Props) {
  const isEdit = React.useMemo(() => type === "EDIT", [type]);
  const { convoProps } = useActiveConvo();

  const {
    state: { user, lMgr },
    dispatch,
  } = useGlobalContext();

  const [query, setQuery] = React.useState("");
  const [info, setInfo] = React.useState<Info>({
    name: isEdit ? convoProps?.convo.name! : "",
    description: isEdit ? convoProps?.convo.description! : "",
  });
  const [thumbnail, setThumbnail] = React.useState<{
    file: File | null;
    uri: string | null;
    state: ImageState;
  }>({
    file: null,
    uri:
      isEdit && convoProps?.convo.thumbnail
        ? convoProps?.convo.thumbnail.url
        : null,
    state: ImageState.NONE,
  });
  const [participants, setParticipants] = React.useState<IUser[]>(
    isEdit
      ? convoProps!.convo.participants.filter((p) => p.id !== user?.id)
      : []
  );
  const imageRef = React.useRef<HTMLInputElement | null>(null);

  const { handler, users, loading: userSearchLoading } = useUserSearch();

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInfo((state) => ({ ...state, [e.target.name]: e.target.value }));
    },
    [setInfo]
  );

  const handleThumbnailChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files![0];
      getFileURI(file).then((uri) => {
        setThumbnail({
          file,
          uri,
          state: ImageState.UPDATE,
        });
      });
    },
    []
  );

  const handleCreate = async () => {
    dispatch(setLoading(GLTypes.CONVERSATION_CREATION, true));
    socket.emit("conversation:create", ConversationType.GROUP, {
      ...info,
      thumbnail: thumbnail.uri,
      participants: participants.map((p) => p.id),
    });
  };

  const handleEdit = async (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    dispatch(setLoading(GLTypes.CONVERSATION_EDIT, true));
    socket.emit("conversation:edit", convoProps?.convo.id, {
      ...info,
      thumbnail: thumbnail.uri,
      thumbnailState: thumbnail.state,
      participants: participants.map((p) => p.id),
    });
  };

  const items: MenuProps["items"] = useMemo(() => {
    const _: any[] = [
      {
        key: "change",
        label: "Change",
        onClick: () => imageRef.current?.click(),
      },
    ];

    if (thumbnail.uri) {
      _.push({
        key: "remove",
        label: "Remove",
        onClick: () => {
          setThumbnail({
            file: null,
            uri: null,
            state: convoProps?.convo.thumbnail
              ? ImageState.REMOVE
              : ImageState.NONE,
          });
        },
      });
    }

    return _;
  }, [convoProps?.convo.thumbnail, thumbnail.uri]);

  useEffect(() => {
    handler(query, SearchOptions.NAME);
  }, [query, handler]);

  return (
    <React.Fragment>
      <div
        className="max-w-md mx-auto flex flex-col justify-center"
        style={{ paddingTop: "10vh" }}
      >
        <Link to={"/home"} className="max-w-max">
          <Button icon={<FaArrowLeft />} />
        </Link>
        <div className="w-full flex flex-col p-10">
          <div className="relative self-center w-24 h-24 mb-8">
            <input
              type="file"
              hidden
              ref={imageRef}
              onChange={handleThumbnailChange}
            />
            <Dropdown menu={{ items }}>
              <i className="fas fa-pen text-blue-600 absolute text-xs right-0 cursor-pointer"></i>
            </Dropdown>
            <img
              src={thumbnail.uri ? thumbnail.uri : "/noThumbnail.png"}
              alt="noThumbnail"
              className="object-cover rounded-full w-full h-full"
            />
          </div>
          <Input
            autoFocus
            name="name"
            placeholder="Name"
            value={info.name}
            onChange={onChange}
            className="mb-2"
          />
          <TextArea
            rows={10}
            name="description"
            placeholder="Description"
            value={info.description}
            onChange={onChange}
            className="mb-2"
          />
          <div className="relative">
            <Input.Search
              placeholder="Search Users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              loading={userSearchLoading}
            />
            {users.length > 0 && (
              <div
                className="bg-gray-100 absolute z-50 top-8 w-full overflow-y-scroll"
                style={{
                  maxHeight: "300px",
                }}
              >
                {users.map((u) => {
                  const isParticipant = participants.find((p) => p.id === u.id);
                  return (
                    <div
                      className="flex items-center p-3 cursor-pointer hover:opacity-80"
                      key={u.id}
                    >
                      <img
                        src={u.avatar ? u.avatar.url : "/noImg.jpg"}
                        alt="noImg"
                        className="w-10 h-10 object-cover rounded-full mr-4"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-600">
                          {u.username}
                        </span>
                        <span className="text-gray-500 text-xs">{u.id}</span>
                      </div>

                      <div className="ml-auto">
                        {!isParticipant ? (
                          <Button
                            icon={<FaPlus />}
                            onClick={() => {
                              setParticipants([...participants, u]);
                            }}
                          />
                        ) : (
                          <Button
                            icon={<IoMdClose />}
                            onClick={() =>
                              setParticipants(
                                participants.filter((p) => p.id !== u.id)
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
          {participants.length > 0 && (
            <div className="flex justify-start mt-2">
              {participants.map((p) => (
                <div className="flex items-center p-2 bg-gray-100 rounded-lg mr-3 mb-3">
                  <img
                    src={p.avatar ? p.avatar.url : "/noImg.jpg"}
                    alt="noImg"
                    className="w-7 h-7 object-cover rounded-full mr-4"
                  />
                  <span className="font-bold text-xs text-gray-600">
                    {p.username}
                  </span>
                  <i
                    className="fas fa-times ml-8 cursor-pointer text-xs hover:opacity-80"
                    onClick={() =>
                      setParticipants(
                        participants.filter((_p) => _p.id !== p.id)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
          <Button
            type="primary"
            className="max-w-max my-4 ml-auto"
            onClick={isEdit ? handleEdit : handleCreate}
            loading={
              isEdit
                ? lMgr[GLTypes.CONVERSATION_EDIT]
                : lMgr[GLTypes.CONVERSATION_CREATION]
            }
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default CreateAndEditGroup;
