import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useGlobalContext } from "../context";
import { setUser } from "../context/actionCreators";
import { axios } from "../ts/constants";
import { IJsonResponse } from "../ts/types";

function Settings() {
  const {
    state: { user },
    dispatch,
  } = useGlobalContext();

  const [copied, setCopied] = React.useState(false);

  const handleAccountRestriction = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { data } = await axios.put<IJsonResponse>(
        `/api/restrict/${e.target.value}`
      );
      if (data.status === 200)
        dispatch(setUser({ ...user!, restricted: !!parseInt(e.target.value) }));
    },
    [user, dispatch]
  );

  return (
    <div className="h-full px-2">
      <div className="flex flex-col justify-center pt-5">
        <span className="text-2xl text-blue-500 pt-4 pb-10 self-center font-bold">
          <i className="fas fa-cog" />
        </span>
        <div className="px-2 pb-6">
          <h3 className="text-gray-500">
            <i className="fas fa-address-card"></i> &nbsp;ID
          </h3>
          <div className="flex items-center mt-2">
            <span className="border-2 select-none border-gray-200 text-sm text-gray-500 px-2 whitespace-nowrap py-1">
              {user?.id}
            </span>
            {!copied ? (
              <CopyToClipboard
                text={user?.id || ""}
                onCopy={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <i className="fas fa-copy mx-2 text-blue-500 text-xs cursor-pointer hover:text-blue-400"></i>
              </CopyToClipboard>
            ) : (
              <i className="fas fa-check text-sm mx-2 text-green-600"></i>
            )}
          </div>
        </div>
        <div className="px-2 py-6">
          <h3 className="text-gray-500">
            <i className="fas fa-shield-alt"></i> &nbsp;Account
            &nbsp;Restriction
          </h3>
          <div
            onChange={handleAccountRestriction}
            className="flex mt-4 justify-center items-center text-sm text-gray-500"
          >
            <input
              type="radio"
              value="0"
              name="restriction"
              id="publicRadio"
              className="mr-2"
              defaultChecked={!user?.restricted}
            />
            <label htmlFor="publicRadio" className="mr-20">
              Public
            </label>
            <input
              type="radio"
              value="1"
              name="restriction"
              className="mr-2"
              id="privateRadio"
              defaultChecked={user?.restricted}
            />
            <label htmlFor="privateRadio">Private</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
