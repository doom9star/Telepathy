import { Button } from "antd";
import { CiHome } from "react-icons/ci";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../context";

function Landing() {
  const {
    state: { user },
  } = useGlobalContext();

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: "100vh" }}
    >
      <img src="/logo.jpeg" alt="logo" className="w-64 h-32 object-cover" />
      {user ? (
        <Link to="/home/feed">
          <Button type="primary" icon={<CiHome />}>
            Home
          </Button>
        </Link>
      ) : (
        <div className="flex">
          <Link to="/login" className="mr-4">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button type="primary">Register</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Landing;
