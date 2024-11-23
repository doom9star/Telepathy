import { Dropdown, MenuProps } from "antd";
import React from "react";
import { useGlobalContext } from "../context";
import { setScreen } from "../context/actionCreators";
import { useLogout } from "../hooks/useLogout";
import { ScreenType } from "../ts/types";

function Navbar() {
  const {
    state: { user },
    dispatch: globalDispatcher,
  } = useGlobalContext();
  const [showMenu, setShowMenu] = React.useState(false);
  const { handler: logout } = useLogout();

  const items: MenuProps["items"] = [
    {
      key: "starred",
      label: "Starred Messages",
      onClick: () => globalDispatcher(setScreen(ScreenType.STARRED)),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: logout,
    },
  ];

  return (
    <div className="absolute right-5 top-5 border border-solid border-gray-100 z-50 rounded-lg">
      <Dropdown menu={{ items }}>
        <div className="flex items-center cursor-pointer p-3">
          <img
            src={user?.avatar ? user.avatar.url : "/noImg.jpg"}
            alt="noImg"
            className="w-7 h-7 mr-2 rounded-full object-cover"
          />
          <span className="mr-8 text-gray-700">
            <span className="text-gray-400">@</span>
            {user?.username}
          </span>
          <i
            className={`fas fa-chevron-${
              showMenu ? "up" : "down"
            } text-gray-200 cursor-pointer`}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>
      </Dropdown>
    </div>
  );
}

export default Navbar;
