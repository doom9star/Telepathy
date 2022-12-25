import React from "react";
import { useHistory } from "react-router";
import { axios } from "../ts/constants";
import { useConvoContext, useGlobalContext } from "../context";
import { IJsonResponse } from "../ts/types";
import { resetConvoState, resetGlobalState } from "../context/actionCreators";

export function useLogout() {
  const { dispatch: globalDispatcher } = useGlobalContext();
  const { dispatch: convoDispatcher } = useConvoContext();
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const handler = React.useCallback(async () => {
    setLoading(true);
    const { data } = await axios.delete<IJsonResponse>("/auth/logout");
    setLoading(false);
    if (data.status === 200) {
      globalDispatcher(resetGlobalState());
      convoDispatcher(resetConvoState());
      history.push("/");
    }
  }, [globalDispatcher, convoDispatcher, history]);
  return { loading, handler };
}
