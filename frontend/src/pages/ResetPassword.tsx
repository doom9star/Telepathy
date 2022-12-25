import { axios } from "../ts/constants";
import React from "react";
import validator from "validator";

import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import { Link, RouteComponentProps } from "react-router-dom";

interface ResetInfo {
  password: string;
  confirmPassword: string;
}

function ResetPassword(props: RouteComponentProps) {
  const [info, setInfo] = React.useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState({} as ResetInfo);
  const [loading, setLoading] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  React.useEffect(() => {
    const { uid } = props.match.params as { uid: string };
    axios
      .post(`/auth/reset-password/${uid}`, { password: null })
      .then((res) => {
        if (res.data.status === 401) props.history.push("/login");
      });
  }, [props.match.params, props.history]);

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInfo((state) => ({ ...state, [e.target.name]: e.target.value }));
    },
    [setInfo]
  );

  const handleReset = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      const { confirmPassword, password } = info;
      const errors = {} as ResetInfo;

      if (validator.isEmpty(password)) errors.password = "Must not be empty!";
      else if (!validator.isLength(password, { min: 8 }))
        errors.password = "Must have minimum 8 characters!";
      else if (!validator.equals(password, confirmPassword))
        errors.confirmPassword = "Passwords must match!";

      setErrors(errors);
      if (JSON.stringify(errors) === "{}") {
        setLoading(true);
        const { uid } = props.match.params as { uid: string };
        const { data } = await axios.post(`/auth/reset-password/${uid}`, info);
        setLoading(false);
        if (data.status === 200) setComplete(true);
      }
    },
    [info, setErrors, props.match.params]
  );

  return (
    <div
      className="max-w-md mx-auto flex items-center"
      style={{ height: "100vh" }}
    >
      <div className="w-full flex flex-col p-10 border shadow-sm">
        <Logo styles="self-center mb-4 text-blue-500" />
        {!complete ? (
          <>
            <Input
              inputProps={{
                required: true,
                type: "password",
                name: "password",
                placeholder: "Password",
                value: info.password,
                onChange: onChange,
                autoFocus: true,
              }}
              error={errors.password}
            />
            <Input
              inputProps={{
                required: true,
                type: "password",
                name: "confirmPassword",
                placeholder: "Confirm Password",
                value: info.confirmPassword,
                onChange: onChange,
              }}
              error={errors.confirmPassword}
            />
            <Button
              label="Reset"
              onClick={handleReset}
              styles="bg-blue-500 text-white mt-10"
              spinnerColor={"blue"}
              isLoading={loading}
            />
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <i className="fas fa-check-circle text-2xl text-green-500 mr-2"></i>
            <span>Password has been successfully updated</span>
            <Link
              to="/login"
              className="self-center mt-5 bg-blue-500 text-gray-100 rounded w-20 text-center text-sm p-2 font-bold"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
