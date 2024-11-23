import { Button, Form, Input } from "antd";
import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { axios } from "../ts/constants";

interface RegisterInfo {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const [loading, setLoading] = React.useState(false);
  const [created, setCreated] = React.useState(false);

  const handleRegister = React.useCallback(async (values: RegisterInfo) => {
    setLoading(true);
    const { data } = await axios.post("/auth/register", values);
    setLoading(false);
    if (!data.body) setCreated(true);
  }, []);

  return (
    <div
      className="max-w-md mx-auto flex items-center "
      style={{ height: "100vh" }}
    >
      <div className="w-full flex flex-col">
        <Link to={"/"} className="self-center">
          <img src="/logo.jpeg" alt="logo" className="w-64 h-32 object-cover" />
        </Link>
        {created ? (
          <div className="flex flex-col items-center text-gray-500 border border-solid border-gray-100 py-8 px-4">
            <i className="fas fa-check-circle text-2xl text-green-500"></i>
            <span className="font-bold">Account created successfully.</span>
            <span className="text-sm">
              We have sent you an email for activation.
            </span>
          </div>
        ) : (
          <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            onFinish={handleRegister}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input autoFocus />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input inputMode="email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your password again!",
                },
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    if (!value || getFieldValue("password") === value)
                      return Promise.resolve();
                    return Promise.reject(new Error("Passwords must match!"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <div className="flex items-center justify-end mb-5">
              <div className="flex items-center justify-center text-xs">
                <span className="ml-2 text-gray-500">
                  Already registered? &nbsp;
                </span>
                <Link to="/login">
                  <span className="text-blue-500 underline">login</span>
                </Link>
              </div>
            </div>
            <Form.Item className="flex justify-center">
              <Button
                type="primary"
                className="text-xs ml-4"
                icon={<FaUserPlus size={10} />}
                htmlType="submit"
                loading={loading}
              >
                register
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
}

export default Register;
