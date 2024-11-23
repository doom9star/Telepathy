import { Dropdown, MenuProps, Spin } from "antd";
import React, { ChangeEvent, useMemo } from "react";
import { useGlobalContext } from "../context";
import { setUser } from "../context/actionCreators";
import { axios } from "../ts/constants";
import { IJsonResponse, IUser } from "../ts/types";

function EProfile() {
  const {
    state: { user },
    dispatch,
  } = useGlobalContext();
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
    [dispatch]
  );

  const removeAvatar = React.useCallback(async () => {
    setLoading(true);
    const { data } = await axios.delete<IJsonResponse & { body: IUser }>(
      "/api/image/avatar"
    );
    setLoading(false);
    if (data.status === 200) dispatch(setUser(data.body));
  }, [dispatch]);

  const items: MenuProps["items"] = useMemo(() => {
    const _: any[] = [
      {
        key: "change",
        label: "Change",
        onClick: () => imageRef.current?.click(),
      },
    ];

    if (user?.avatar) {
      _.push({
        key: "remove",
        label: "Remove",
        onClick: removeAvatar,
      });
    }

    return _;
  }, [removeAvatar, user?.avatar]);

  return (
    <div className="h-full px-2">
      <div className="flex flex-col justify-center pt-5">
        <div className="flex flex-col pt-4 items-center relative">
          <img
            src={user?.avatar ? user.avatar.url : "/noImg.jpg"}
            alt="noImg"
            className="w-1/3 rounded-full object-cover"
          />
          {loading ? (
            <div className="absolute w-10 h-10 right-12">
              <Spin size="small" />
            </div>
          ) : (
            <Dropdown menu={{ items }}>
              <i className="fas fa-pen text-blue-600 absolute text-xs right-20 cursor-pointer"></i>
            </Dropdown>
          )}
          <span className="text-gray-600 mt-2 text-xl font-bold">
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
      </div>
    </div>
  );
}

export default EProfile;
