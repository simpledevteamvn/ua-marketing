import React, { useEffect, useState } from "react";
import Page from "../../utils/composables/Page";
import Loading from "../../utils/Loading";
import service, { OG_CODE_HEADER } from "../../partials/services/axios.config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, updateUser } from "../../redux/account/accountSlice";
import {
  MESSAGE_DURATION,
  ORGANIZATION_PATH,
  REMEMBER_PASSWORD,
  ROLES,
} from "../../constants/constants";
import Input from "../../partials/elements/Input";
import message from "antd/lib/message";
import Countdown from "antd/lib/statistic/Countdown";
import classNames from "classnames";
import { Logo, PageBg } from "../../utils/helper/UIHelper";

function EnterOtp(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isShowCountdown, setIsShowCountdown] = useState(false);

  const [otp, setOtp] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberPass: true,
    from: "",
    organizationCode: "",
  });

  useEffect(() => {
    const email = state?.email;
    const password = state?.password;
    const rememberPass = state?.rememberPass;
    const from = state?.from;
    const organizationCode = state?.organizationCode;

    if (!email || !password) {
      navigate("/login");
    }
    setLoginData({ email, password, rememberPass, from, organizationCode });
  }, []);

  const onVerify = () => {
    if (!otp) return;

    const { email, password, rememberPass, from, organizationCode } = loginData;
    const params = {
      email,
      password,
      googleAuthenticatorCode: otp,
      isNotShowToken: true,
      organizationCode,
      isNotSendOgCode: true,
    };

    setIsLoading(true);
    service.post("/authenticate", params).then(
      (res: any) => {
        const token = res.results;
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
            setIsLoading(false);

            if (from) {
              return navigate(from);
            }

            navigate(`${ORGANIZATION_PATH}/${organizationCode}/`);
          },
          () => {
            setIsLoading(false);
          }
        );
      },
      () => setIsLoading(false)
    );
  };

  const onResend = () => {
    if (isShowCountdown) return;
    const email = loginData.email;

    setIsShowCountdown(true);
    setIsLoading(true);
    service.post("/user/resend/qr-code", null, { params: { email } }).then(
      (res) => {
        message.success(
          `New QR code sent successfully to ${email}!`,
          MESSAGE_DURATION
        );
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const onChangeCountdown = (val) => {
    if (val < 1 * 1000) {
      setIsShowCountdown(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onVerify();
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
                Two-Step Verification
              </h1>

              <div className="text-center !mt-4">
                Enter the 6-digit security code from Google Authenticator.
              </div>
              <Input
                id="code"
                value={otp}
                onChange={setOtp}
                placeholder="6-digit security code"
                onKeyDown={onKeyDown}
              />
              <button
                type="submit"
                className="btn-primary w-full"
                onClick={onVerify}
              >
                Submit
              </button>
              <div className="flex items-center justify-center space-x-1 text-sm font-light text-gray-500 !mt-4">
                <div>Don't recive a code?</div>

                <div
                  className={classNames(
                    "flex items-center justify-center",
                    isShowCountdown
                      ? "text-indigo-600/60 cursor-not-allowed"
                      : "text-indigo-700 hover:text-indigo-800 cursor-pointer"
                  )}
                  title="Resend the QR code"
                  onClick={onResend}
                >
                  Resend
                  {isShowCountdown && (
                    <span className="flex items-center justify-center mb-0.5 ml-0.5">
                      {"("}
                      <Countdown
                        className="remaining-time-statistic"
                        format="ss"
                        value={Date.now() + 30 * 1000}
                        onChange={onChangeCountdown}
                      />
                      {")"}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center !mt-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-600/80 hover:underline"
                >
                  Back to Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}

EnterOtp.propTypes = {};

export default EnterOtp;
