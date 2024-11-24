import { Button, Dropdown } from "antd";
import React, { useCallback } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa";
import { useGlobalContext } from "../context";
import { setScreen } from "../context/actionCreators";
import { useActiveConvo } from "../hooks/useActiveConvo";
import { useNewConversation } from "../hooks/useNewConversation";
import { socket } from "../socket";
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

  const getItems = useCallback(
    (participant: string, isCreator: boolean, isParticipantAdmin: boolean) => {
      const _ = [];

      if (participant !== user?.id) {
        _.push({
          key: "message",
          label: "Message",
          onClick: () => {
            newConversation(participant);
            dispatch(setScreen(ScreenType.MESSAGE));
          },
        });
      }

      if (!isCreator && !isParticipantAdmin) {
        _.push({
          key: "promote",
          label: "Promote",
          onClick: () => {
            socket.emit(
              "user:admin",
              "promote",
              convoProps?.convo.id,
              participant
            );
          },
        });
      }

      if (!isCreator && isParticipantAdmin) {
        _.push({
          key: "demote",
          label: "Demote",
          onClick: () => {
            socket.emit(
              "user:admin",
              "demote",
              convoProps?.convo.id,
              participant
            );
          },
        });
      }

      if (!isCreator) {
        _.push({
          key: "remove",
          label: "Remove",
          onClick: () => {},
        });
      }

      return _;
    },
    [user?.id, convoProps?.convo.id, dispatch, newConversation]
  );

  return (
    <div className="p-4 flex flex-col">
      <Button
        icon={<FaArrowLeft />}
        onClick={() => dispatch(setScreen(screen.previous))}
      />
      {isSolo ? (
        <>
          <img
            src={imageURL}
            alt="noImg"
            className="w-60 rounded-full mx-auto h-60 mt-4 object-cover"
          />
          <p className="text-center font-bold text-gray-600 text-2xl">{name}</p>
        </>
      ) : (
        <>
          <img
            src={imageURL}
            alt="noImg"
            className="w-60 h-60 my-4 object-cover border-2 mx-auto"
          />
          <p className="text-center mb-10 text-gray-500 font-bold text-xl">
            {name}
          </p>
          <div className="flex flex-col items-end mx-2">
            <p
              className="text-sm my-2 font-semibold text-gray-500"
              style={{ wordSpacing: "0.3rem" }}
            >
              {convoProps?.convo.description}
            </p>
            <p className="text-sm mb-0 text-gray-500">
              <i className="fas fa-user-tie mr-2 text-blue-400" />
              {convoProps?.convo.creator.username}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <i className="fas fa-calendar-day mr-2 text-blue-400" />
              {date}
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-center mt-20 text-sm text-gray-600">
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
                  className="border border-solid border-gray-100 rounded-md mb-2 relative flex"
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
                    <div className="ml-auto">
                      {isParticipantAdmin && (
                        <span
                          className={`text-lg text-${
                            p.id === convoProps.convo.creator.id
                              ? "yellow"
                              : "gray"
                          }-600 rounded-full`}
                        >
                          <i className="fas fa-ribbon" />
                        </span>
                      )}
                      {isAdmin && p.id !== user?.id && (
                        <Dropdown
                          className="ml-4"
                          menu={{
                            items: getItems(
                              p.id,
                              isCreator,
                              !!isParticipantAdmin
                            ),
                          }}
                        >
                          <Button icon={<BiDotsVerticalRounded />} />
                        </Dropdown>
                      )}
                    </div>
                  </div>
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
