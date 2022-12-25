import React from "react";
import { Link } from "react-router-dom";

interface Props {
  styles?: string;
}

function Logo(props: Props) {
  return (
    <Link
      to="/"
      className={
        "flex items-center cursor-pointer font-semibold " + props.styles
      }
      style={{ fontFamily: "cursive", letterSpacing: "0.2em" }}
    >
      <i className="fab fa-500px text-2xl pr-2"></i>
      <span className="text-sm">TELEPATHY</span>
    </Link>
  );
}

export default Logo;
