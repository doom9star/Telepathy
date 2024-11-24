import { Input, Radio, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNewConversation } from "../hooks/useNewConversation";
import { useUserSearch } from "../hooks/useUserSearch";
import { SearchOptions } from "../ts/types";

export default function Search() {
  const [option, setOption] = useState<SearchOptions>(SearchOptions.NAME);
  const [query, setQuery] = useState<string>("");
  const { users, loading, error, handler } = useUserSearch();
  const [handleNewConversation] = useNewConversation();

  useEffect(() => {
    handler(query, option);
  }, [option, query, handler]);

  return (
    <div className="flex flex-col justify-center pt-5 px-2">
      <span className="text-2xl text-blue-500 pt-4 pb-5 self-center font-bold">
        <i className={`fas fa-search`} />
      </span>
      <div className="h-20 flex justify-center items-center">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
        />
      </div>
      <div className="flex mt-2 justify-end items-center">
        <Radio.Group
          options={[
            { label: "Name", value: SearchOptions.NAME },
            { label: "Id", value: SearchOptions.ID },
          ]}
          onChange={(e) => setOption(e.target.value)}
          value={option}
          optionType="button"
        />
      </div>
      {error && (
        <div className="h-52 w-full flex flex-col justify-center items-center">
          <i className="fa fa-frown-o text-4xl text-blue-200"></i>
          <span className="text-gray-500 font-bold p-2 text-sm">{error}</span>
        </div>
      )}
      {loading ? (
        <Spin />
      ) : (
        users.map((u) => (
          <div className="mt-4 px-2" key={u.id}>
            <div className="flex items-center p-2">
              <img
                src={u.avatar ? u.avatar.url : "/noImg.jpg"}
                alt="noImg"
                className="w-10 h-10 object-cover rounded-full mr-4"
              />
              <div className="flex flex-col">
                <span className="font-bold text-gray-600">{u.username}</span>
                <span className="text-xs text-gray-500">{u.id}</span>
              </div>
              <i
                className="fas fa-paper-plane text-blue-500 ml-auto mr-2 cursor-pointer"
                onClick={() => handleNewConversation(u.id)}
              ></i>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
