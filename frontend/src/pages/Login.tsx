import React from "react";
import { Link } from "react-router-dom";
import validator from "validator";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import { axios } from "../ts/constants";
import { setUser } from "../context/actionCreators";
import { useGlobalContext } from "../context";

interface LoginInfo {
  email: string;
  password: string;
}

function Login() {
  const { dispatch } = useGlobalContext();

  const [info, setInfo] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({} as LoginInfo);
  const [loading, setLoading] = React.useState(false);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInfo((state) => ({ ...state, [e.target.name]: e.target.value }));
    },
    [setInfo]
  );
  const handleLogin = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.preventDefault();
      const { email, password } = info;
      const errors = {} as LoginInfo;
      if (!validator.isEmail(email)) errors.email = "Must be an actual email!";
      if (validator.isEmpty(password)) errors.password = "Must not be empty!";

      setErrors(errors);
      if (JSON.stringify(errors) === "{}") {
        setLoading(true);
        const { data } = await axios.post("/auth/login", info);
        setLoading(false);
        if (data.status === 200) {
          dispatch(setUser(data.body));
        } else {
          if (!data.body.general) setErrors({ ...data.body });
        }
      }
    },
    [info, dispatch]
  );
  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "80vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Logo styles="self-center mb-4 text-blue-500" />
        <Input
          inputProps={{
            required: true,
            type: "email",
            name: "email",
            placeholder: "Email",
            value: info.email,
            onChange: onChange,
            autoFocus: true,
          }}
          error={errors.email}
        />
        <Input
          inputProps={{
            required: true,
            type: "password",
            name: "password",
            placeholder: "Password",
            value: info.password,
            onChange: onChange,
          }}
          error={errors.password}
        />
        <div className="flex justify-between">
          <span className="text-sm text-gray-500 mt-2">
            New here? &nbsp;
            <Link
              to="/register"
              className="text-blue-500 font-semibold underline"
            >
              Register
            </Link>
          </span>
          <span className="text-sm text-gray-500 mt-2">
            Forgot Password? &nbsp;
            <Link
              to="/reset-password"
              className="text-blue-500 font-semibold underline"
            >
              Reset
            </Link>
          </span>
        </div>
        <Button
          label="Login"
          onClick={handleLogin}
          styles="bg-blue-500 text-white mt-10"
          spinnerColor={"blue"}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

export default Login;
