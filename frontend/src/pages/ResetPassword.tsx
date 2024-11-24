import React from "react";
import { axios } from "../ts/constants";

import { Button, Form, Input } from "antd";
import { FiLogIn } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";

interface ResetInfo {
  password: string;
  confirmPassword: string;
}

function ResetPassword() {
  const [loading, setLoading] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    axios
      .post(`/auth/reset-password/${params.uid}`, { password: null })
      .then((res) => {
        if (res.data.status === 401) navigate("/login");
      });
  }, [params.uid, navigate]);

  const handleReset = React.useCallback(
    async (values: ResetInfo) => {
      setLoading(true);
      const { data } = await axios.post(
        `/auth/reset-password/${params.uid}`,
        values
      );
      setLoading(false);
      if (data.status === 200) setComplete(true);
    },
    [params.uid]
  );

  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "80vh" }}
    >
      <div className="w-full flex flex-col">
        <Link to={"/"} className="self-center">
          <img src="/logo.jpeg" alt="logo" className="w-64 h-32 object-cover" />
        </Link>
        {!complete ? (
          <Form labelCol={{ span: 8 }} labelAlign="left" onFinish={handleReset}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password autoFocus />
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
            <Form.Item className="flex justify-center">
              <Button
                type="primary"
                className="text-xs ml-4"
                htmlType="submit"
                loading={loading}
              >
                reset
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
            <span className="font-bold">Password reset successfully.</span>
            <span className="text-sm">You can login now.</span>
            <Button
              type="primary"
              className="text-xs mt-4"
              icon={<FiLogIn size={10} />}
              onClick={() => navigate("/login")}
            >
              login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
