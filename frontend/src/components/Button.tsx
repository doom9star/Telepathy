import classNames from "classnames";
import React from "react";

interface Props {
  label: string;
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => Promise<void> | void;
  styles?: string;
  spinnerColor?: string;
  isLoading?: boolean;
  icon?: string;
  disabled?: boolean;
}

function Button(props: Props) {
  return (
    <div className="relative self-center">
      <button
        type="button"
        onClick={props.onClick}
        disabled={props.disabled}
        className={
          "rounded w-24 text-center text-sm p-2 font-bold " +
          classNames({
            [props.styles as string]: props.styles,
            "opacity-50": props.isLoading,
            "bg-gray-400": props.disabled,
          })
        }
      >
        {props.icon && <i className={"pr-2 " + props.icon}></i>}
        {props.label}
      </button>
      {props.isLoading && (
        <div
          className={
            "w-5 h-5 border-2 border-b-0 animate-spin rounded-full absolute bottom-2 left-10 z-10" +
            classNames({
              [` border-${props.spinnerColor}-500`]: props.spinnerColor,
            })
          }
        ></div>
      )}
    </div>
  );
}

export default Button;
