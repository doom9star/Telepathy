import Axios from "axios";

export const theme = {
  main: "#1F51FF",
};

export const axios = Axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL as string,
  withCredentials: true,
});

export enum ENames {
  SOLO = 1,
  GROUP,
  SEARCH,
  PROFILE,
  SETTINGS,
}
