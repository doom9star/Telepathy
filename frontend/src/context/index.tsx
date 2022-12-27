import React, { ReactElement } from "react";
import { GLTypes } from "../ts/types";
import { GlobalReducer, ConvoReducer } from "./reducer";
import {
  TGlobalContext,
  TConvoContext,
  IConvoState,
  IGlobalState,
} from "./types";

const GlobalContext = React.createContext({});
const ConvoContext = React.createContext({});

export const GlobalState: IGlobalState = {
  user: null,
  lMgr: Object.keys(GLTypes)
    .filter((t) => !isNaN(Number(t)))
    .reduce(
      (p, c) => ({
        ...p,
        [parseInt(c)]: false,
      }),
      {}
    ) as any,
  activeETab: null,
  screen: { previous: null, current: null, data: {} },
};

export const ConvoState: IConvoState = {
  convos: {},
  activeID: null,
};

export const useGlobalContext = () =>
  React.useContext(GlobalContext) as TGlobalContext;
export const useConvoContext = () =>
  React.useContext(ConvoContext) as TConvoContext;

function Provider({ children }: { children: ReactElement }) {
  const [Gstate, Gdispatch] = React.useReducer(GlobalReducer, GlobalState);
  const [Cstate, Cdispatch] = React.useReducer(ConvoReducer, ConvoState);

  return (
    <GlobalContext.Provider value={{ state: Gstate, dispatch: Gdispatch }}>
      <ConvoContext.Provider value={{ state: Cstate, dispatch: Cdispatch }}>
        {children}
      </ConvoContext.Provider>
    </GlobalContext.Provider>
  );
}

export default Provider;
