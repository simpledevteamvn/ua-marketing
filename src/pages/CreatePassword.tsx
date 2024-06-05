import Popover from "antd/lib/popover";
import React, { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../partials/elements/Input";
import service from "../partials/services/axios.config";
import Page from "../utils/composables/Page";
import {
  CheckPassword,
  checkPasswordStr,
  Logo,
  PageBg,
} from "../utils/helper/UIHelper";
import Loading from "../utils/Loading";
import message from "antd/lib/message";
import { MESSAGE_DURATION } from "../constants/constants";

const CreatePassword = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const organizationCode = searchParams.get("organizationCode");

  const [isLoading, setIsLoading] = useState(false);
  const [isShowChecklist, setIsShowChecklist] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [ggCode, setGgCode] = useState("");

  const onSubmit = () => {
    if (!password || !email || !ggCode || !organizationCode) return;

    if (!checkPasswordStr(password)) {
      return message.error("Please enter a strong password!", MESSAGE_DURATION);
    }

    setIsLoading(true);
    service
      .post("/user/active", {
        password,
        email,
        name,
        organizationCodeHeader: organizationCode,
        googleAuthenticatorCode: ggCode,
        isNotShowToken: true,
      })
      .then(
        (res: any) => {
          const message = res.message || "Create account success!";
          toast(message, { type: "success" });
          setIsLoading(false);
          setTimeout(() => {
            navigate("/login", { state: { email, organizationCode } });
          }, 1500);
        },
        () => setIsLoading(false)
      );
  };

  const onBlurPassword = () => {
    isShowChecklist && setIsShowChecklist(false);
  };

  const onChangePassword = (value) => {
    setPassword(value);

    if (!isShowChecklist && document.activeElement === inputRef.current) {
      setIsShowChecklist(true);
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
                Create a new password for your account
              </h1>
              <Input
                id="name"
                value={name}
                onChange={setName}
                placeholder="Name"
                required
              />
              <div className="relative">
                <div className="absolute w-full text-center mt-6">
                  <Popover
                    content={
                      <CheckPassword acceptEmpty={false} password={password} />
                    }
                    title="Password checklist"
                    trigger="click"
                    open={isShowChecklist && !checkPasswordStr(password)}
                  />
                </div>
              </div>
              <Input
                innerRef={inputRef}
                id="password"
                type="password"
                placeholder="New password"
                value={password}
                onChange={onChangePassword}
                onBlur={onBlurPassword}
                required
              />
              <Input
                label="Enter the 6-digit security code from Google Authenticator."
                id="ggCode"
                value={ggCode}
                onChange={setGgCode}
                placeholder="6-digit security code"
                required
              />
              <button
                type="submit"
                className="btn-primary w-full mt-10"
                onClick={onSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
};

export default CreatePassword;
