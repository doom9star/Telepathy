import React from "react";
import { useNavigate } from "react-router-dom";
import { useConvoContext, useGlobalContext } from "../context";
import { resetConvoState, resetGlobalState } from "../context/actionCreators";
import { axios } from "../ts/constants";
import { IJsonResponse } from "../ts/types";

export function useLogout() {
  const [loading, setLoading] = React.useState(false);

  const { dispatch: globalDispatcher } = useGlobalContext();
  const { dispatch: convoDispatcher } = useConvoContext();
  const navigate = useNavigate();

  const handler = React.useCallback(async () => {
    setLoading(true);
    const { data } = await axios.delete<IJsonResponse>("/auth/logout");
    setLoading(false);
    if (data.status === 200) {
      globalDispatcher(resetGlobalState());
      convoDispatcher(resetConvoState());
      navigate("/");
    }
  }, [globalDispatcher, convoDispatcher, navigate]);

  return { loading, handler };
}
