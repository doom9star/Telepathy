import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import React from "react";
import ReactDOM from "react-dom";
import Provider from "./context";
import "./index.css";
import Router from "./Router";

TimeAgo.addDefaultLocale(en);

ReactDOM.render(
  <React.StrictMode>
    <Provider>
      <Router />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
