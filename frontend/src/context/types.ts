import React from "react";
import { ENames } from "../ts/constants";
import { GLTypes, IConversation, IUser, ScreenType } from "../ts/types";

export interface IConvoProps {
  convo: IConversation;
  more: boolean;
  active?: boolean;
}

export interface IAction {
  type: string;
  payload?: any;
}

export interface IGlobalState {
  user: IUser | null;
  showStarred: boolean;
  activeETab: ENames | null;
  lastScrollTop: number;
  screen: {
    previous: ScreenType | null;
    current: ScreenType | null;
    data?: any;
  };
  lMgr: Record<GLTypes, { loading: boolean; callback: () => void }>;
}

export interface IConvoState {
  convos: Record<string, IConvoProps>;
  activeID: string | null;
}

export interface IContext<TState = null> {
  state: TState;
  dispatch: React.Dispatch<IAction>;
}

export type TGlobalContext = IContext<IGlobalState>;
export type TConvoContext = IContext<IConvoState>;
