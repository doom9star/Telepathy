import React from "react";
import { useHistory } from "react-router-dom";
import { useConvoContext, useGlobalContext } from "../context";
import {
  forwardMessages,
  newMessage,
  readMessages,
  setAID,
  setConversation,
  setETab,
  setLoading,
  setScreen,
  setUserActive,
  setUserAdmin,
} from "../context/actionCreators";
import socket from "../socket";
import { ENames } from "../ts/constants";
import {
  ConversationType,
  GLTypes,
  IConversation,
  IMessage,
  ScreenType,
} from "../ts/types";

export function useIOLnrs() {
  const {
    dispatch: convoDispatcher,
    state: { activeID },
  } = useConvoContext();
  const history = useHistory();
  const activeIDRef = React.useRef<string | null>(activeID);
  const { dispatch: globalDispatcher } = useGlobalContext();

  React.useEffect(() => {
    activeIDRef.current = activeID;
  }, [activeID]);

  React.useEffect(() => {
    socket.on("message:create:success", (message: IMessage) => {
      convoDispatcher(newMessage(message, "create"));
      globalDispatcher(setLoading(GLTypes.MESSAGE_CREATION, false));
    });
    socket.on("message:read:success", (cid: string) => {
      convoDispatcher(readMessages(cid, "", false));
      globalDispatcher(setLoading(GLTypes.MESSAGE_READ, false));
    });
    socket.on(
      "message:forward:success",
      (
        newConvos: IConversation[],
        existingConvos: { [cid: string]: IMessage }
      ) => {
        convoDispatcher(forwardMessages(newConvos, existingConvos));
        globalDispatcher(setLoading(GLTypes.MESSAGE_FORWARD, false));
        globalDispatcher(setScreen(ScreenType.MESSAGE));
      }
    );
    socket.on("message:read:recieve", (cid: string, uid: string) => {
      convoDispatcher(readMessages(cid, uid, true));
    });
    socket.on("message:recieve", (cid: string, message: IMessage) => {
      convoDispatcher(newMessage(message, "recieve", cid));
    });
    socket.on("conversation:create:success", (conversation: IConversation) => {
      globalDispatcher(setLoading(GLTypes.CONVERSATION_CREATION, false));
      if (conversation.type === ConversationType.GROUP) history.push("/home");
      convoDispatcher(setConversation(conversation));
      convoDispatcher(setAID(conversation.id));
      globalDispatcher(setScreen(ScreenType.MESSAGE));
      globalDispatcher(
        setETab(
          conversation.type === ConversationType.SOLO
            ? ENames.SOLO
            : ENames.GROUP
        )
      );
    });
    socket.on("conversation:edit:success", (conversation: IConversation) => {
      globalDispatcher(setLoading(GLTypes.CONVERSATION_EDIT, false));
      history.push("/home");
      convoDispatcher(setConversation(conversation));
    });
    socket.on("conversation:recieve", (conversation: IConversation) =>
      convoDispatcher(setConversation(conversation))
    );
    socket.on("user:active:recieve", (cid: string, active: boolean) => {
      convoDispatcher(setUserActive(cid, active));
    });
    socket.on(
      "user:admin:success",
      (type: "promote" | "demote", cid: string, uid: string) => {
        convoDispatcher(setUserAdmin(type, cid, uid));
      }
    );
  }, [convoDispatcher, globalDispatcher, history]);
}
