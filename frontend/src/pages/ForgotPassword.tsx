import { Button, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import { axios } from "../ts/constants";

function ForgotPassword() {
  const [serverError, setServerError] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSend = React.useCallback(async (values: any) => {
    setLoading(true);
    const { data } = await axios.post("/auth/forgot-password", {
      email: values.email,
    });
    setLoading(false);
    if (data.status === 404) setServerError(data.body);
    else {
      setSent(true);
    }
  }, []);

  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "100vh" }}
    >
      <div className="w-full flex flex-col p-10">
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
        {sent ? (
          <div className="flex flex-col items-center text-gray-500">
            <i className="fas fa-check-circle text-2xl text-green-500"></i>
            <span className="font-bold">We have sent you an email,</span>
            <span className="text-sm">
              check your inbox to reset your password!
            </span>
          </div>
        ) : (
          <Form labelCol={{ span: 8 }} labelAlign="left" onFinish={handleSend}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input inputMode="email" autoFocus />
            </Form.Item>
            <Form.Item className="flex justify-center">
              <Button
                type="primary"
                className="text-xs ml-4"
                htmlType="submit"
                loading={loading}
              >
                send
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
