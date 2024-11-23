import classNames from "classnames";

interface Props {
  message: string;
  styles?: string;
  onClose: () => void;
}

function Alert({ message, styles, onClose }: Props) {
  return (
    <div
      className={
        "px-4 py-3 rounded text-xs relative " +
        classNames({ [styles || ""]: styles })
      }
    >
      <span style={{ fontFamily: "monospace" }}>{message}</span>
      <span
        className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
        onClick={onClose}
      >
        <i className="fas fa-times"></i>
      </span>
    </div>
  );
}

export default Alert;
