import { useConvoContext, useGlobalContext } from "../context";
import {
  setAID,
  setETab,
  setLoading,
  setScreen,
} from "../context/actionCreators";
import socket from "../socket";
import { ENames } from "../ts/constants";
import { ConversationType, GLTypes, ScreenType } from "../ts/types";

export function useNewConversation() {
  const {
    state: { convos },
    dispatch: convoDispatcher,
  } = useConvoContext();
  const { dispatch: globalDispatcher } = useGlobalContext();

  const handler = (uid: string) => {
    for (const { convo } of Object.values(convos)) {
      if (
        convo.type === ConversationType.SOLO &&
        convo.participants.find((p) => p.id === uid)
      ) {
        globalDispatcher(setETab(ENames.SOLO));
        convoDispatcher(setAID(convo.id));
        globalDispatcher(setScreen(ScreenType.MESSAGE));
        return;
      }
    }
    globalDispatcher(setLoading(GLTypes.CONVERSATION_CREATION, true));
    socket.emit("conversation:create", ConversationType.SOLO, {
      participants: [uid],
    });
  };

  return [handler];
}
