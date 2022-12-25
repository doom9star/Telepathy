import React from "react";
import classNames from "classnames";

interface Props {
  inputProps: object;
  error?: string;
  styles?: string;
}

function Input({ inputProps, error, styles }: Props) {
  return (
    <label className="flex items-center relative focus group w-full">
      <input
        {...inputProps}
        className={
          "px-4 py-1 w-full leading-9 outline-none my-2 border border-gray-200" +
          classNames({
            " border-2 border-red-300": error,
            [` ${styles}`]: styles,
          })
        }
      />
      {error && (
        <i
          title={error}
          className="fas fa-exclamation-triangle absolute right-5 text-red-600"
        ></i>
      )}
    </label>
  );
}

export default Input;
