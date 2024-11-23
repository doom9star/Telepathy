import { Radio } from "antd";
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
    async (e: any) => {
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
          </h3>
          <div
            onChange={handleAccountRestriction}
            className="flex mt-4 items-center text-sm text-gray-500"
          >
            <Radio.Group
              options={[
                { label: "Public", value: "0" },
                { label: "Private", value: "1" },
              ]}
              onChange={handleAccountRestriction}
              value={user?.restricted ? "1" : "0"}
              optionType="button"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
