import { useConvoContext, useGlobalContext } from "../context";
import { setAID, setETab } from "../context/actionCreators";
import socket from "../socket";
import { ENames } from "../ts/constants";
import { ConversationType } from "../ts/types";

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
        return;
      }
    }
    socket.emit("conversation:create", ConversationType.SOLO, {
      participants: [uid],
    });
  };

  return [handler];
}
