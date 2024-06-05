import React, { useState } from "react";
import Page from "../utils/composables/Page";
import Loading from "../utils/Loading";
import { Logo, PageBg } from "../utils/helper/UIHelper";
import Input from "../partials/elements/Input";
import { Link, useNavigate } from "react-router-dom";
// import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
// import Popover from "antd/lib/popover";
// import message from "antd/lib/message";
import service from "../partials/services/axios.config";
import { toast } from "react-toastify";

const checkSpecialChars = (str) => {
  // https://stackoverflow.com/questions/32311081/check-for-special-characters-in-string
  // Remove: "-" character (accept this char)
  // Origin: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  const specialChars = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;
  return specialChars.test(str);
};

function SignUp(props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  // const [code, setCode] = useState("");

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onSignUp();
    }
  };

  const onSignUp = () => {
    if (!email || !name) return;
    // if (checkSpecialChars(code)) {
    //   return message.error(
    //     "You have entered special characters. Please don't use them.", MESSAGE_DURATION
    //   );
    // }

    const params = {
      organization: name,
      // organizationCode: code,
      email,
      isNotSendOgCode: true,
    };

    setIsLoading(true);
    service.post("/tenant", params).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        setTimeout(() => {
          navigate("/login", { state: { email } });
        }, 1500);
      },
      () => setIsLoading(false)
    );
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
                Sign up
              </h1>
              <div className="space-y-4 md:space-y-6">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  label="Your email"
                  placeholder="abc@gmail.com"
                  onKeyDown={onKeyDown}
                  required
                />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={setName}
                  label="Organization name"
                  placeholder="Organization Name"
                  onKeyDown={onKeyDown}
                  required
                />
                {/* <Input
                  id="code"
                  type="text"
                  label={
                    <div className="flex items-center">
                      <span>Organization code</span>
                      <Popover
                        title=""
                        content={
                          <>
                            <ul className="list-disc ml-4 !mb-0">
                              <li>
                                Use only lowercase letters, numbers, and hyphens
                                ("-").
                              </li>
                              <li>
                                Avoid using special characters, spaces, or
                                uppercase letters.
                              </li>
                              <li>
                                For example, the URL for the "organization-code"
                                can be:
                                <div className="">
                                  "https://ua-center.data4game.com/organizations/
                                  <span className="font-bold">
                                    organization-code
                                  </span>
                                  ".
                                </div>
                              </li>
                            </ul>
                          </>
                        }
                      >
                        <AiOutlineQuestionCircle size={16} className="ml-1" />
                      </Popover>
                    </div>
                  }
                  value={code}
                  onChange={setCode}
                  onKeyDown={onKeyDown}
                  placeholder="organization-code"
                  required
                /> */}

                <div className="">
                  You already have an account? {""}
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-600/80 hover:underline"
                  >
                    Login here.
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  onClick={onSignUp}
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  );
}

export default SignUp;
