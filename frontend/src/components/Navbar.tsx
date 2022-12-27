import React from "react";
import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useGlobalContext } from "../context";
import Logo from "./Logo";
import { setScreen } from "../context/actionCreators";
import { ScreenType } from "../ts/types";

function Navbar() {
  const {
    state: { user },
    dispatch: globalDispatcher,
  } = useGlobalContext();
  const [showMenu, setShowMenu] = React.useState(false);
  const { handler: logout } = useLogout();

  return (
    <>
      <div
        className="fixed z-50 flex justify-evenly bg-blue-500"
        style={{ width: "100vw", height: "8vh" }}
      >
        <Logo styles="text-white" />
        <div className="flex items-center">
          {!user ? (
            <>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-100 rounded w-20 text-center py-1 text-sm font-bold mr-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-100 text-blue-500 rounded w-20 text-center text-sm py-1 font-bold"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="flex cursor-pointer">
                <img
                  src={user.avatar ? user.avatar.url : "/noImg.jpg"}
                  alt="noImg"
                  className="w-7 h-7 mr-2 rounded-full object-cover"
                />
                <span className="text-white mr-4 font-bold">
                  <span className="text-gray-400">@</span>
                  {user.username}
                </span>
              </div>
              <span className="relative">
                <i
                  className={`fas fa-chevron-${
                    showMenu ? "up" : "down"
                  } text-gray-300 cursor-pointer`}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div
                    className="absolute bg-white py-4 w-36 -left-16 top-8 flex flex-col shadow-md text-sm text-gray-500"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <span
                      className="py-2 px-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        globalDispatcher(setScreen(ScreenType.STARRED));
                      }}
                    >
                      <i className="fas fa-star text-blue-600 w-6" />
                      Starred
                    </span>
                    <span
                      className="py-2 px-4 cursor-pointer hover:bg-gray-50"
                      onClick={logout}
                    >
                      <i className="fas fa-sign-out-alt w-6 text-blue-600" />
                      Logout
                    </span>
                  </div>
                )}
              </span>
            </>
          )}
        </div>
      </div>
      {/* <Alert /> */}
    </>
  );
}

export default Navbar;
