import { useConvoContext, useGlobalContext } from "../context";
import { starMessage } from "../context/actionCreators";
import { axios } from "../ts/constants";
import { IJsonResponse } from "../ts/types";

export function useStarMessage() {
  const {
    state: { user },
  } = useGlobalContext();
  const { dispatch } = useConvoContext();

  const handler = (cid: string, mid: string, value: 1 | -1) => {
    axios
      .post<IJsonResponse>("/api/message/star", { mid, value })
      .then(({ data }) => {
        if (data.status === 200)
          dispatch(starMessage(cid, mid, user!.id, value));
      });
  };

  return handler;
}
