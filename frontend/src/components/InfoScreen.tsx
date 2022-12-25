import React from "react";
import { useGlobalContext } from "../context";
import { setScreen } from "../context/actionCreators";
import { useActiveConvo } from "../hooks/useActiveConvo";
import { useNewConversation } from "../hooks/useNewConversation";
import socket from "../socket";
import { ScreenType } from "../ts/types";

const InfoScreen: React.FC = () => {
  const {
    state: { user, screen },
    dispatch,
  } = useGlobalContext();
  const { name, date, isSolo, isAdmin, imageURL, convoProps } =
    useActiveConvo();
  const [newConversation] = useNewConversation();

  const [currentMenu, setCurrentMenu] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <i
        className="fas fa-chevron-left bg-blue-500 text-xs text-white py-1 px-2 rounded-full cursor-pointer hover:opacity-80"
        onClick={() => dispatch(setScreen(screen.previous))}
      />
      {isSolo ? (
        <>
          <img
            src={imageURL}
            alt="noImg"
            className="w-60 rounded-full mx-auto h-60 my-4 object-cover border-2"
          />
          <p className="text-center font-bold text-gray-600 text-2xl">
            @{name}
          </p>
        </>
      ) : (
        <>
          <img
            src={imageURL}
            alt="noImg"
            className="w-full h-60 my-4 object-cover border-2"
          />
          <p
            className="text-center mb-10 text-gray-500 font-bold text-xl"
            style={{ fontFamily: "cursive" }}
          >
            <i className="fas fa-signature mr-2 text-blue-400" />
            {name}
          </p>
          <p
            className="text-sm m-2 font-semibold text-gray-500"
            style={{ wordSpacing: "0.3rem", fontFamily: "cursive" }}
          >
            <i className="fas fa-align-center mr-2 text-blue-400" />
            {convoProps?.convo.description}
          </p>
          <div className="flex flex-col items-center mx-2 float-right">
            <p className="text-sm font-bold text-gray-500">
              <i className="fas fa-user-tie mr-2 text-blue-400" />
              {convoProps?.convo.creator.username}
            </p>
            <p className="text-sm font-semibold mt-2 text-gray-500">
              <i className="fas fa-calendar-day mr-2 text-blue-400" />
              {date}
            </p>
          </div>
          <div className="m-4 w-full md:w-1/2">
            <p className="text-center mt-20 text-sm font-bold text-gray-600">
              <i className="fas fa-users mr-2 text-blue-400" />
              Participants
            </p>
            {convoProps?.convo.participants.map((p) => {
              const isParticipantAdmin = convoProps?.convo.admins!.find(
                (aid) => aid === p.id
              );
              const isCreator = p.id === convoProps.convo.creator.id;
              return (
                <div
                  onClick={() => {
                    setCurrentMenu(currentMenu === p.id ? null : p.id);
                  }}
                  className="relative flex"
                >
                  <div
                    key={p.id}
                    className={`flex w-full items-center p-2 m-2 cursor-pointer hover:bg-white transition duration-700`}
                  >
                    <img
                      src={p.avatar ? p.avatar.url : "/noImg.jpg"}
                      alt="noImg"
                      className="w-10 h-10 mr-4 rounded-full object-cover"
                    />
                    <span className="font-bold text-gray-600">
                      {p.id === user?.id ? "You" : p.username}
                    </span>
                    {isParticipantAdmin && (
                      <span
                        className={`text-lg ml-auto text-${
                          p.id === convoProps.convo.creator.id
                            ? "yellow"
                            : "gray"
                        }-600 rounded-full`}
                      >
                        <i className="fas fa-ribbon" />
                      </span>
                    )}
                  </div>
                  {isAdmin && p.id !== user?.id && currentMenu === p.id && (
                    <div className="flex text-sm bg-white py-2 px-2 cursor-pointer absolute z-50 top-10 left-40 shadow-md">
                      <i
                        onClick={() => {
                          if (p.id !== user?.id) {
                            newConversation(p.id);
                            dispatch(setScreen(ScreenType.MESSAGE));
                          }
                        }}
                        className="fas fa-paper-plane px-3 py-2 text-blue-600 hover:bg-gray-100"
                      />
                      {!isCreator ? (
                        !isParticipantAdmin ? (
                          <i
                            onClick={() =>
                              socket.emit(
                                "user:admin",
                                "promote",
                                convoProps.convo.id,
                                p.id
                              )
                            }
                            className="fas px-3 py-2 fa-arrow-up text-green-600 hover:bg-gray-100"
                          />
                        ) : (
                          <i
                            onClick={() =>
                              socket.emit(
                                "user:admin",
                                "demote",
                                convoProps.convo.id,
                                p.id
                              )
                            }
                            className="fas px-3 py-2 fa-arrow-down text-red-600 hover:bg-gray-100"
                          />
                        )
                      ) : null}
                      {!isCreator && (
                        <i className="fas px-3 py-2 fa-trash-alt text-purple-600 hover:bg-gray-100" />
                      )}
                      <i
                        className="fas px-3 py-2 fa-times text-yellow-500 hover:bg-gray-100"
                        onClick={() => {
                          setCurrentMenu(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default InfoScreen;
