import React, { ChangeEvent } from "react";
import { useGlobalContext } from "../context";
import { setUser } from "../context/actionCreators";
import { axios } from "../ts/constants";
import { IJsonResponse, IUser } from "../ts/types";
import Loader from "./Loader";

function EProfile() {
  const {
    state: { user },
    dispatch,
  } = useGlobalContext();
  const [showToolBar, setShowToolBar] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const imageRef = React.useRef<HTMLInputElement | null>(null);

  const changeAvatar = React.useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files![0];
      const formData = new FormData();
      formData.append("image", file);
      setLoading(true);
      const { data } = await axios.post<IJsonResponse & { body: IUser }>(
        "/api/image/avatar",
        formData
      );
      setLoading(false);
      if (data.status === 200) dispatch(setUser(data.body));
    },
    [dispatch, setLoading]
  );

  const removeAvatar = React.useCallback(async () => {
    setShowToolBar((prev) => !prev);
    setLoading(true);
    const { data } = await axios.delete<IJsonResponse & { body: IUser }>(
      "/api/image/avatar"
    );
    setLoading(false);
    if (data.status === 200) dispatch(setUser(data.body));
  }, [dispatch, setShowToolBar, setLoading]);

  if (loading) return <Loader />;

  return (
    <div className="h-full px-2">
      <div className="flex flex-col justify-center pt-5">
        <span className="text-2xl text-blue-600 pt-4 pb-10 self-center font-bold">
          <i className={`fas fa-user`} />
        </span>
        <div className="flex flex-col pt-4 items-center relative">
          <img
            src={user?.avatar ? user.avatar.url : "/noImg.jpg"}
            alt="noImg"
            className="w-1/2 h-40 rounded-full object-cover"
          />
          {loading ? (
            <div className="absolute w-10 h-10 right-20">
              <Loader styles={{ top: "0%", width: "50%", height: "50%" }} />
            </div>
          ) : (
            <i
              className="fas fa-pen text-blue-600 absolute text-xs right-20 cursor-pointer hover:text-gray-400"
              onClick={() => setShowToolBar(!showToolBar)}
            ></i>
          )}
          <span
            className="text-gray-600 mt-2 text-xl -ml-2"
            style={{ fontFamily: "fantasy" }}
          >
            <span className="text-gray-400">@ </span>
            {user?.username}
          </span>
          {user?.bio && (
            <span
              className="mt-6 text-gray-500 text-sm"
              style={{ wordSpacing: "0.2rem" }}
            >
              {user.bio}
            </span>
          )}
        </div>
        <input type="file" hidden ref={imageRef} onChange={changeAvatar} />
        {showToolBar && (
          <div className="absolute right-0 bg-gray-50 top-16 z-10 shadow-md">
            <div
              className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
              onClick={() => {
                setShowToolBar(!showToolBar);
                imageRef.current?.click();
              }}
            >
              <i className="fas fa-image text-blue-500"></i> &nbsp;Change
            </div>
            {user?.avatar && (
              <div
                className="py-2 px-4 text-gray-500 cursor-pointer text-sm hover:bg-gray-100"
                onClick={removeAvatar}
              >
                <i className="fas fa-user-alt-slash text-red-500"></i> Remove
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EProfile;
