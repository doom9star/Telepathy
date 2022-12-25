import React from "react";
import { axios } from "../ts/constants";
import { IJsonResponse, IUser } from "../ts/types";

export function useUserSearch() {
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handler = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (query.trim() !== "") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLoading(true);
        setError("");
        timeoutRef.current = setTimeout(async () => {
          const { data } = await axios.get<IJsonResponse & { body: IUser[] }>(
            `/api/search/user/${query}`
          );
          setError(
            data.body.length !== 0
              ? ""
              : `You searched for "${query}", not found!`
          );
          setUsers(data.body);
          setLoading(false);
        }, 2000);
      } else {
        setUsers([]);
        setLoading(false);
        setError("");
      }
    },
    []
  );

  return { users, loading, error, handler };
}
