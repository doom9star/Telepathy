import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
import ReactDOM from "react-dom/client";
import Provider from "./context";
import "./index.css";
import App from "./App";

TimeAgo.addDefaultLocale(en);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider>
    <App />
  </Provider>
);
