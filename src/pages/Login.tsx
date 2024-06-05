import React, { useEffect, useRef, useState } from "react";
import Checkbox from "../partials/elements/Checkbox";
import Input from "../partials/elements/Input";
import service, { OG_CODE_HEADER } from "../partials/services/axios.config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loading from "../utils/Loading";
import Page from "../utils/composables/Page";
import { Logo, PageBg } from "../utils/helper/UIHelper";
import { useDispatch } from "react-redux";
import { login, updateUser } from "../redux/account/accountSlice";
import {
  ORGANIZATION_PATH,
  REMEMBER_PASSWORD,
  ROLES,
} from "../constants/constants";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { state } = useLocation();
  const inputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberPass, setRememberPass] = useState(true);

  useEffect(() => {
    setEmail(state?.email || "");
    setOrganizationCode(state?.organizationCode || "");
  }, []);

  const onLogin = () => {
    if (!email || !password) return;

    setIsLoading(true);
    service
      .post("/authenticate", {
        email,
        password,
        organizationCode,
        isNotShowToken: true,
        isNotSendOgCode: true,
      })
      .then(
        (res: any) => {
          const from = state?.from?.pathname;
          const token = res.results;
          setIsLoading(false);

          if (!token) {
            return navigate("/otp", {
              state: { email, password, rememberPass, from, organizationCode },
            });
          }

          dispatch(login(token));
          if (rememberPass) {
            localStorage.setItem(REMEMBER_PASSWORD, "true");
          }

          const headers = { [OG_CODE_HEADER]: organizationCode };
          service.get("/user", { headers }).then(
            (userRes: any) => {
              const isAdmin = userRes.results?.role?.name === ROLES.admin;
              dispatch(
                updateUser(Object.assign({}, userRes.results, { isAdmin }))
              );

              if (from) {
                return navigate(from);
              }

              navigate(`${ORGANIZATION_PATH}/${organizationCode}/`);
            },
            () => navigate("/")
          );
        },
        () => setIsLoading(false)
      );
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onLogin();
    }
  };

  return (
    <Page>
      <section className="flex">
        {isLoading && <Loading />}

        <PageBg />
        <div className="page-wrapper">
          <Logo />
          <div className="page-content">
            <div className="page-content-padding">
              <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign in to your account
              </h1>
              <div className="space-y-4 md:space-y-6">
                <Input
                  id="organizationCode"
                  type="text"
                  value={organizationCode}
                  onChange={setOrganizationCode}
                  label="Organization code"
                  placeholder="Enter your organization code"
                  onKeyDown={onKeyDown}
                  required
                />

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  label="Your email"
                  placeholder="name@gmail.com"
                  onKeyDown={onKeyDown}
                  required
                />

                <Input
                  innerRef={inputRef}
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  onKeyDown={onKeyDown}
                  placeholder="Enter password"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-start">
                    <Checkbox
                      id="remember"
                      label="Remember me"
                      checked={rememberPass}
                      onChange={(e) => setRememberPass(e.target.checked)}
                    />
                  </div>
                  <Link
                    to="/forgot_password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-600/80 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="!mt-1">
                  Don't have an account?{" "}
                  <Link
                    to="/sign-up"
                    className="font-medium text-indigo-600 hover:text-indigo-600/80 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  onClick={onLogin}
                >
                  Sign in
                </button>
                {/* <p className="text-sm font-light text-gray-500">
                Don't have an account yet?{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Sign up
                </a>
              </p> */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
};

export default Login;
