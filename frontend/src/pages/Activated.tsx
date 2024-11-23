import { Button } from "antd";
import { AxiosResponse } from "axios";
import React from "react";
import { FiLogIn } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { axios } from "../ts/constants";

function Activated() {
  const [stale, setStale] = React.useState(false);

  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    axios.post(`/auth/activate/${params.uid}`).then((res: AxiosResponse) => {
      if (res.data.status === 404 || res.data.status === 500) navigate("/");
      if (res.data.body) setStale(true);
    });
  }, [params.uid, navigate]);

  return (
    <div
      className="max-w-md mx-auto flex items-center "
      style={{ height: "80vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Link to={"/"} className="self-center">
          <img src="/logo.jpeg" alt="logo" className="w-64 h-32 object-cover" />
        </Link>
        <div className="flex flex-col items-center text-gray-500">
          <i className="fas fa-check-circle text-2xl text-green-500"></i>
          <span className="font-bold mt-2">
            Account has {stale && "already"} been activated.
          </span>
          <span>You can login now.</span>
          <Button
            type="primary"
            className="text-xs mt-4"
            icon={<FiLogIn size={10} />}
            onClick={() => navigate("/login")}
          >
            login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Activated;
