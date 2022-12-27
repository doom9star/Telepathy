import Axios from "axios";

export const theme = {
  main: "#1F51FF",
};

export const axios = Axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export enum ENames {
  SOLO = 1,
  GROUP,
  SEARCH,
  WORLD,
  PROFILE,
  SETTINGS,
}
