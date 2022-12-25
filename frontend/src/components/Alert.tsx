import classNames from "classnames";
import React from "react";

interface Props {
  styles?: string;
}

function Alert(props: Props) {
  return (
    <div
      className={
        "border shadow-sm flex items-center justify-between px-4 py-2 " +
        classNames({ [props.styles || ""]: props.styles })
      }
      role="alert"
    >
      <div className="flex items-center">
        <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
        <p className="text-sm text-green-500 font-bold">
          Account created successfully! Check your email to activate it.
        </p>
      </div>
      <i className="fas fa-times-circle text-xl text-gray-300"></i>
    </div>
  );
}

export default Alert;
