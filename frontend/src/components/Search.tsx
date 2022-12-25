import React from "react";
import { useNewConversation } from "../hooks/useNewConversation";
import { useUserSearch } from "../hooks/useUserSearch";
import Input from "./Input";
import Loader from "./Loader";

export default function Search() {
  const { users, loading, error, handler } = useUserSearch();
  const [handleNewConversation] = useNewConversation();

  return (
    <div className="flex flex-col justify-center pt-5">
      <span className="text-2xl text-blue-500 pt-4 pb-5 self-center font-bold">
        <i className={`fas fa-user text-sm mr-1`} />
        <i className={`fas fa-search`} />
      </span>
      <div className="h-20 flex justify-center items-center px-2">
        <Input
          inputProps={{
            type: "text",
            placeholder: "Search users...",
            name: "query",
            autoFocus: true,
            onChange: handler,
          }}
          styles="mr-2"
        />
      </div>

      {error && (
        <div className="h-52 w-full flex flex-col justify-center items-center">
          <i className="fa fa-frown-o text-4xl text-blue-200"></i>
          <span className="text-gray-500 font-bold p-2 text-sm">{error}</span>
        </div>
      )}
      {loading ? (
        <Loader />
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
