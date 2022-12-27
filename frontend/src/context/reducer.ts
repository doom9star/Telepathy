import produce from "immer";
import { ConvoState, GlobalState } from ".";
import { GLTypes, IConversation, IMessage } from "../ts/types";
import {
  FORWARD_MESSAGE,
  NEW_MESSAGE,
  PAGINATE_MESSAGES,
  READ_MESSAGES,
  RESET_CONVO_STATE,
  RESET_GLOBAL_STATE,
  SET_AID,
  SET_CONVERSATION,
  SET_CONVERSATIONS,
  SET_ETAB,
  SET_LOADING,
  SET_SCREEN,
  SET_USER,
  SET_USER_ACTIVE,
  SET_USER_ADMIN,
  STAR_MESSAGE,
} from "./actionTypes";
import { IAction, IConvoState, IGlobalState } from "./types";

export const GlobalReducer = (
  state = GlobalState,
  action: IAction
): IGlobalState => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case SET_LOADING:
      return produce(state, (draft) => {
        const { id, value } = action.payload;
        draft.lMgr[id as GLTypes] = value;
      });
    case SET_SCREEN:
      return {
        ...state,
        screen: {
          previous:
            action.payload.type === null ||
            action.payload.type === state.screen.previous
              ? null
              : state.screen.current,
          current: action.payload.type,
          data: { ...state.screen.data, ...action.payload.data },
        },
      };
    case SET_ETAB:
      return {
        ...state,
        activeETab: action.payload === state.activeETab ? null : action.payload,
      };
    case RESET_GLOBAL_STATE:
      return GlobalState;
    default:
      return state;
  }
};

export const ConvoReducer = (
  state = ConvoState,
  action: IAction
): IConvoState => {
  switch (action.type) {
    case SET_AID:
      return produce(state, (draft) => {
        if (!action.payload && !state.convos[state.activeID!].convo.legit) {
          delete draft.convos[draft.activeID!];
        }
        draft.activeID = action.payload;
      });
    case SET_CONVERSATIONS:
      return produce(state, (draft) => {
        for (const convo of action.payload) {
          draft.convos[convo.id] = { convo, more: true };
        }
      });
    case NEW_MESSAGE: {
      return produce(state, (draft) => {
        const { cid = draft.activeID!, type, message } = action.payload;
        if (type === "recieve") draft.convos[cid].convo.unread!++;
        draft.convos[cid].convo.messages.unshift(message);
      });
    }
    case STAR_MESSAGE: {
      return produce(state, (draft) => {
        const { cid, mid, uid, value } = action.payload;
        const midx = draft.convos[cid].convo.messages.findIndex(
          (m) => m.id === mid
        )!;
        if (value === 1)
          draft.convos[cid].convo.messages[midx].starrers.push(uid);
        else
          draft.convos[cid].convo.messages[midx].starrers = draft.convos[
            cid
          ].convo.messages[midx].starrers.filter((sid) => sid !== uid);
      });
    }
    case READ_MESSAGES:
      return produce(state, (draft) => {
        const { cid, uid, isReciever } = action.payload;
        if (!isReciever) draft.convos[cid].convo.unread = 0;
        else {
          for (let i = 0; i < draft.convos[cid].convo.messages.length; i++) {
            let m = draft.convos[cid].convo.messages[i];
            const uidx = m.recievers.findIndex((r) => r.id === uid);
            if (m.recievers[uidx].read) break;
            m.recievers[uidx] = { id: uid, read: true };
            draft.convos[cid].convo.messages[i] = m;
          }
        }
      });
    case FORWARD_MESSAGE:
      return produce(state, (draft) => {
        const {
          newConvos,
          existingConvos,
        }: {
          newConvos: IConversation[];
          existingConvos: { [cid: string]: IMessage };
        } = action.payload;
        newConvos.forEach(
          (convo: IConversation) =>
            (draft.convos[convo.id] = { convo, more: false })
        );
        Object.keys(existingConvos).forEach((ecid: string) =>
          draft.convos[ecid].convo.messages.unshift(existingConvos[ecid])
        );
      });
    case PAGINATE_MESSAGES:
      return produce(state, (draft) => {
        const { cid, messages, more } = action.payload;
        draft.convos[cid].convo.messages =
          draft.convos[cid].convo.messages.concat(messages);
        draft.convos[cid].more = more;
      });
    case SET_CONVERSATION:
      return produce(state, (draft) => {
        if (draft.convos[action.payload.id]) {
          const conversation = action.payload;
          conversation.messages =
            draft.convos[action.payload.id].convo.messages;
          draft.convos[action.payload.id].convo = conversation;
        } else
          draft.convos[action.payload.id] = {
            convo: action.payload,
            more: true,
          };
      });
    case SET_USER_ACTIVE:
      return produce(state, (draft) => {
        const { cid, active } = action.payload;
        if (draft.convos[cid] || draft.activeID === cid)
          draft.convos[cid].active = active;
      });
    case SET_USER_ADMIN:
      return produce(state, (draft) => {
        const { type, cid, uid } = action.payload;
        if (type === "promote") draft.convos[cid].convo.admins?.push(uid);
        else if (type === "demote")
          draft.convos[cid].convo.admins = draft.convos[
            cid
          ].convo.admins!.filter((aid) => aid !== uid);
      });
    case RESET_CONVO_STATE:
      return ConvoState;
    default:
      return state;
  }
};
