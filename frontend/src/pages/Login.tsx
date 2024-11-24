import { Button, Form, Input } from "antd";
import React from "react";
import { FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { useGlobalContext } from "../context";
import { setUser } from "../context/actionCreators";
import { axios } from "../ts/constants";

interface LoginInfo {
  email: string;
  password: string;
}

function Login() {
  const { dispatch } = useGlobalContext();
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const handleLogin = React.useCallback(
    async (values: LoginInfo) => {
      setLoading(true);
      const { data } = await axios.post("/auth/login", values);
      setLoading(false);
      if (data.status === 200) {
        dispatch(setUser(data.body));
      } else {
        setServerError(data.body.message);
      }
    },
    [dispatch]
  );

  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "80vh" }}
    >
      <div className="w-full flex flex-col">
        {serverError && (
          <Alert
            message={serverError}
            styles="text-red-800 bg-red-100 mb-4"
            onClose={() => setServerError("")}
          />
        )}
        <Link to={"/"} className="self-center">
          <img src="/logo.jpeg" alt="logo" className="w-64 h-32 object-cover" />
        </Link>
        <Form labelCol={{ span: 8 }} labelAlign="left" onFinish={handleLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input inputMode="email" autoFocus />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center justify-center text-xs">
              <span className="ml-2 text-gray-500">New here? &nbsp;</span>
              <Link to="/register">
                <span className="text-blue-500 underline">register</span>
              </Link>
            </div>
            <div className="flex items-center justify-center text-xs">
              <span className="ml-2 text-gray-500">
                Forgot password? &nbsp;
              </span>
              <Link to="/forgot-password">
                <span className="text-blue-500 underline">reset</span>
              </Link>
            </div>
          </div>
          <Form.Item className="flex justify-center">
            <Button
              type="primary"
              className="text-xs ml-4"
              icon={<FiLogIn size={10} />}
              htmlType="submit"
              loading={loading}
            >
              login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
