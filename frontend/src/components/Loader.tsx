import classNames from "classnames";
import React from "react";

interface Props {
  styles?: string | object;
}

function Loader(props: Props) {
  return (
    <div
      style={{
        left: "45%",
        top: "50%",
        position: "absolute",
        ...(props.styles && typeof props.styles === "object" && props.styles),
      }}
      className={
        "w-10 h-10 border-2 border-blue-500 z-50 border-b-0 animate-spin rounded-full" +
        classNames({
          [` ${props.styles}`]:
            props.styles && typeof props.styles === "string",
        })
      }
    ></div>
  );
}

export default Loader;
