import React from "react";
import validator from "validator";

import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import { axios } from "../ts/constants";

function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
    },
    [setEmail]
  );

  const handleSend = React.useCallback(async () => {
    if (!validator.isEmail(email)) setError("Email must be an email!");
    else {
      setError(undefined);
      setLoading(true);
      const { data } = await axios.post("/auth/forgot-password", { email });
      setLoading(false);
      if (data.status === 404) setError(data.body);
      else {
        setSent(true);
      }
    }
  }, [email]);

  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "100vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Logo styles="self-center mb-4 text-blue-500" />
        {sent ? (
          <div className="flex flex-col items-center text-gray-500">
            <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
            <span>We have sent you an email,</span>
            <span>check your inbox to reset your password!</span>
          </div>
        ) : (
          <>
            <Input
              inputProps={{
                required: true,
                type: "email",
                name: "email",
                placeholder: "Email",
                autoFocus: true,
                onChange: onChange,
                value: email,
              }}
              error={error}
            />
            <Button
              label="Send"
              onClick={handleSend}
              styles="bg-blue-500 text-white mt-10"
              spinnerColor={"blue"}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
