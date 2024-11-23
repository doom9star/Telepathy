import React from "react";
import { Link } from "react-router-dom";
import validator from "validator";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import Logo from "../components/Logo";
import { useGlobalContext } from "../context";
import { setLoading } from "../context/actionCreators";
import { useActiveConvo } from "../hooks/useActiveConvo";
import { useUserSearch } from "../hooks/useUserSearch";
import { socket } from "../socket";
import { ConversationType, GLTypes, ImageState, IUser } from "../ts/types";
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
  const [errors, setErrors] = React.useState({} as Info);
  const [showToolBar, setShowToolBar] = React.useState(false);
  const imageRef = React.useRef<HTMLInputElement | null>(null);

  const {
    handler,
    error: queryError,
    users,
    loading: userSearchLoading,
  } = useUserSearch();

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

  const validateInfo = React.useCallback(() => {
    const errors = {} as Info;
    if (validator.isEmpty(info.name)) errors.name = "Must not be empty!";
    setErrors(errors);
    return errors;
  }, [info]);

  const handleCreate = async (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    const errors = validateInfo();
    if (JSON.stringify(errors) === "{}") {
      dispatch(setLoading(GLTypes.CONVERSATION_CREATION, true));
      socket.emit("conversation:create", ConversationType.GROUP, {
        ...info,
        thumbnail: thumbnail.uri,
        participants: participants.map((p) => p.id),
      });
    }
  };

  const handleEdit = async (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    const errors = validateInfo();
    if (JSON.stringify(errors) === "{}") {
      dispatch(setLoading(GLTypes.CONVERSATION_EDIT, true));
      socket.emit("conversation:edit", convoProps?.convo.id, {
        ...info,
        thumbnail: thumbnail.uri,
        thumbnailState: thumbnail.state,
        participants: participants.map((p) => p.id),
      });
    }
  };

  return (
    <React.Fragment>
      <div
        className="max-w-md mx-auto flex flex-col justify-center"
        style={{ paddingTop: "10vh" }}
      >
        <Link to="/home">
          <i className="fas fa-chevron-left bg-gray-100 text-blue-500 self-start py-2 px-3 my-2 rounded-full" />
        </Link>
        <div className="w-full flex flex-col p-10 border shadow-sm">
          <Logo styles="self-center mb-4 text-blue-500" />
          <div className="relative self-center my-5 w-24 h-24 rounded-full border p-1">
            <input
              type="file"
              hidden
              ref={imageRef}
              onChange={handleThumbnailChange}
            />
            {showToolBar && (
              <div className="absolute w-32 left-24 bg-gray-50 top-5 z-10 shadow-md">
                <div
                  className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
                  onClick={() => {
                    setShowToolBar(false);
                    imageRef.current?.click();
                  }}
                >
                  <i className="fas fa-image text-blue-500"></i> &nbsp;Change
                </div>
                {thumbnail.uri && (
                  <div
                    className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
                    onClick={() => {
                      setShowToolBar(false);
                      setThumbnail({
                        file: null,
                        uri: null,
                        state: convoProps?.convo.thumbnail
                          ? ImageState.REMOVE
                          : ImageState.NONE,
                      });
                    }}
                  >
                    <i className="fas fa-user-alt-slash text-red-500"></i>{" "}
                    Remove
                  </div>
                )}
              </div>
            )}
            <i
              className="fas fa-pen cursor-pointer absolute -right-2 text-xs text-blue-500 hover:opacity-80"
              onClick={() => setShowToolBar(!showToolBar)}
            />
            <img
              src={thumbnail.uri ? thumbnail.uri : "/noThumbnail.png"}
              alt="noThumbnail"
              className="object-cover rounded-full w-full h-full"
            />
          </div>
          <Input
            inputProps={{
              required: true,
              type: "text",
              name: "name",
              placeholder: "Name",
              value: info.name,
              onChange: onChange,
              autoFocus: true,
            }}
            error={errors.name}
          />
          <textarea
            placeholder="Description"
            className="outline-none border border-gray-200 resize-none h-40 p-4"
            name="description"
            value={info.description}
            onChange={onChange}
          />
          <div className="relative">
            <Input
              inputProps={{
                type: "text",
                name: "query",
                placeholder: "Add Participants",
                onChange: handler,
                autoComplete: "off",
              }}
              error={queryError}
            />
            {(users.length > 0 || userSearchLoading) && (
              <div
                className="bg-gray-100 absolute z-50 top-14 w-full overflow-y-scroll p-2"
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
                    const isParticipant = participants.find(
                      (p) => p.id === u.id
                    );
                    return (
                      <div
                        className="flex items-center p-2 cursor-pointer hover:bg-white"
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
                        <i
                          className={`fas fa-${
                            isParticipant ? "times" : "plus"
                          } ml-auto ${
                            isParticipant ? "text-red-500" : "text-blue-500"
                          }`}
                          onClick={() => {
                            setParticipants(
                              !isParticipant
                                ? participants.concat(u)
                                : participants.filter((p) => p.id !== u.id)
                            );
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {participants.length > 0 &&
            participants.map((p) => (
              <div className="grid grid-cols-2 gap-2 m-3" key={p.id}>
                <div className="flex items-center p-2 bg-gray-100 rounded-full">
                  <img
                    src={p.avatar ? p.avatar.url : "/noImg.jpg"}
                    alt="noImg"
                    className="w-7 h-7 object-cover rounded-full mr-4"
                  />
                  <span className="font-bold text-gray-600">{p.username}</span>
                  <i
                    className="fas fa-times text-blue-500 ml-auto cursor-pointer text-xs hover:opacity-80"
                    onClick={() =>
                      setParticipants(
                        participants.filter((_p) => _p.id !== p.id)
                      )
                    }
                  />
                </div>
              </div>
            ))}
          <Button
            label={isEdit ? "Update" : "Create"}
            onClick={isEdit ? handleEdit : handleCreate}
            styles="bg-blue-500 text-white mt-10"
            spinnerColor={"blue"}
            isLoading={
              isEdit
                ? lMgr[GLTypes.CONVERSATION_EDIT]
                : lMgr[GLTypes.CONVERSATION_CREATION]
            }
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default CreateAndEditGroup;
