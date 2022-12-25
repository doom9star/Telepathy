import { ENames } from "../ts/constants";
import {
  GLTypes,
  IConversation,
  IMessage,
  IUser,
  ScreenType,
} from "../ts/types";
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
  SET_LAST_SCROLL_TOP,
  SET_LOADING,
  SET_SCREEN,
  SET_USER,
  SET_USER_ACTIVE,
  SET_USER_ADMIN,
  STAR_MESSAGE,
} from "./actionTypes";
import { IAction } from "./types";

export const setUser = (user: IUser | null): IAction => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const setLoading = (
  id: GLTypes,
  value: boolean,
  callback?: () => void
): IAction => {
  return {
    type: SET_LOADING,
    payload: { id, value, callback },
  };
};

export const setScreen = (type: ScreenType | null, data?: any): IAction => {
  return {
    type: SET_SCREEN,
    payload: { type, data },
  };
};

export const setLastScrollTop = (top: number): IAction => {
  return {
    type: SET_LAST_SCROLL_TOP,
    payload: top,
  };
};

export const resetGlobalState = (): IAction => {
  return {
    type: RESET_GLOBAL_STATE,
  };
};

export const resetConvoState = (): IAction => {
  return {
    type: RESET_CONVO_STATE,
  };
};

export const setETab = (tab: ENames | null): IAction => {
  return {
    type: SET_ETAB,
    payload: tab,
  };
};

export const setAID = (cid: string | null): IAction => {
  return {
    type: SET_AID,
    payload: cid,
  };
};
export const setConversations = (conversations: IConversation[]): IAction => {
  return {
    type: SET_CONVERSATIONS,
    payload: conversations,
  };
};

export const newMessage = (
  message: IMessage,
  type: "create" | "recieve",
  cid?: string
): IAction => {
  return {
    type: NEW_MESSAGE,
    payload: { cid, type, message },
  };
};

export const starMessage = (
  cid: string,
  mid: string,
  uid: string,
  value: 1 | -1
): IAction => {
  return {
    type: STAR_MESSAGE,
    payload: { cid, mid, uid, value },
  };
};

export const readMessages = (
  cid: string,
  uid: string,
  isReciever: boolean
): IAction => {
  return {
    type: READ_MESSAGES,
    payload: { cid, uid, isReciever },
  };
};

export const forwardMessages = (
  newConvos: IConversation[],
  existingConvos: { [cid: string]: IMessage }
): IAction => {
  return {
    type: FORWARD_MESSAGE,
    payload: { newConvos, existingConvos },
  };
};

export const paginateMessages = (
  cid: string,
  messages: IMessage[],
  more: boolean
): IAction => {
  return {
    type: PAGINATE_MESSAGES,
    payload: { cid, messages, more },
  };
};

export const setConversation = (conversation: IConversation): IAction => {
  return {
    type: SET_CONVERSATION,
    payload: conversation,
  };
};

export const setUserActive = (cid: string, active: boolean): IAction => {
  return {
    type: SET_USER_ACTIVE,
    payload: { cid, active },
  };
};

export const setUserAdmin = (
  type: "promote" | "demote",
  cid: string,
  uid: string
): IAction => {
  return {
    type: SET_USER_ADMIN,
    payload: { type, cid, uid },
  };
};
