import React from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { axios } from "../ts/constants";
import { RouteComponentProps } from "react-router-dom";
import { AxiosResponse } from "axios";

function Activated(props: RouteComponentProps) {
  const [stale, setStale] = React.useState(false);

  React.useEffect(() => {
    const { uid } = props.match.params as { uid: string };
    axios.post(`/auth/activate/${uid}`).then((res: AxiosResponse) => {
      if (res.data.status === 404 || res.data.status === 500)
        props.history.push("/");
      if (res.data.body) setStale(true);
    });
  }, [setStale, props.match.params, props.history]);

  return (
    <div
      className="max-w-md mx-auto flex items-center "
      style={{ height: "80vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Logo styles="self-center mb-4 text-blue-500" />
        <div className="flex flex-col items-center text-gray-500">
          <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
          <span>Account has {stale && "already"} been activated!</span>
          <Link
            to="/login"
            className="self-center mt-5 bg-blue-500 text-gray-100 rounded w-20 text-center text-sm p-2 font-bold"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Activated;
