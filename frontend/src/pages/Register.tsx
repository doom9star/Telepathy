import React from "react";
import { Link } from "react-router-dom";
import validator from "validator";

import { axios } from "../ts/constants";
import Input from "../components/Input";
import Logo from "../components/Logo";
import Button from "../components/Button";

interface RegisterInfo {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function Register() {
  const [user, setUser] = React.useState<RegisterInfo>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState({} as RegisterInfo);
  const [loading, setLoading] = React.useState(false);
  const [created, setCreated] = React.useState(false);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUser((state) => ({ ...state, [e.target.name]: e.target.value }));
    },
    []
  );
  const handleRegister = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      const { email, username, password, confirmPassword } = user;
      const errors = {} as RegisterInfo;
      if (validator.isEmpty(username)) errors.username = "Must not by empty!";
      if (!validator.isEmail(email)) errors.email = "Must be an actual email!";
      if (validator.isEmpty(password)) errors.password = "Must not be empty!";
      else if (!validator.isLength(password, { min: 8 }))
        errors.password = "Must have minimum 8 characters!";
      else if (!validator.equals(password, confirmPassword))
        errors.confirmPassword = "Passwords must match!";

      if (JSON.stringify(errors) === "{}") {
        setLoading(true);
        const { data } = await axios.post("/auth/register", user);
        setLoading(false);
        if (!data.body) setCreated(true);
      } else setErrors(errors);
    },
    [user]
  );

  return (
    <div
      className="max-w-md mx-auto flex items-center "
      style={{ height: "100vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Logo styles="self-center mb-4 text-blue-500" />
        {created ? (
          <div className="flex flex-col items-center text-gray-500">
            <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
            <span>Account created successfully,</span>
            <span>We have sent you an email for activation!</span>
          </div>
        ) : (
          <>
            <Input
              inputProps={{
                required: true,
                type: "text",
                name: "username",
                placeholder: "Username",
                value: user.username,
                onChange: onChange,
                autoFocus: true,
              }}
              error={errors.username}
            />
            <Input
              inputProps={{
                required: true,
                type: "email",
                name: "email",
                placeholder: "Email",
                value: user.email,
                onChange: onChange,
              }}
              error={errors.email}
            />
            <Input
              inputProps={{
                required: true,
                type: "password",
                name: "password",
                placeholder: "Password",
                value: user.password,
                onChange: onChange,
              }}
              error={errors.password}
            />
            <Input
              inputProps={{
                required: true,
                type: "password",
                name: "confirmPassword",
                placeholder: "Confirm Password",
                value: user.confirmPassword,
                onChange: onChange,
              }}
              error={errors.confirmPassword}
            />
            <span className="text-sm text-gray-500 mt-2">
              Already Registered? &nbsp;
              <Link
                to="/login"
                className="text-blue-500 underline font-semibold"
              >
                Login
              </Link>
            </span>
            <Button
              label="Register"
              styles="bg-blue-500 text-gray-100 mt-10"
              onClick={handleRegister}
              isLoading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
