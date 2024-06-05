import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Input from "../../partials/elements/Input";
import service from "../../partials/services/axios.config";
import { updateUser } from "../../redux/account/accountSlice";
import { RootState } from "../../redux/store";
import Page from "../../utils/composables/Page";
import { CheckPassword, checkPasswordStr } from "../../utils/helper/UIHelper";
import Loading from "../../utils/Loading";

function Account() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.account?.userData);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user.id) return;

    setName(user.name || "");
    setPhone(user.phone || "");
    setEmail(user.email);
  }, []);

  const onChangePassword = () => {
    service
      .put("user/change-password", {
        currentPassword: password,
        newPassword,
      })
      .then(
        (res: any) => {
          toast(res.message || "Change password success", { type: "success" });
          resetPasswordForm();
        },
        () => {}
      );
  };

  const onUpdateInfo = () => {
    setIsLoading(true);
    service.put("user", { name, phone }).then(
      (res: any) => {
        setIsLoading(false);
        dispatch(updateUser(res.results));
        toast(res.message || "Update user info success", { type: "success" });
      },
      () => setIsLoading(false)
    );
  };

  const resetPasswordForm = () => {
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Page>
      <div className="font-medium text-lg text-black">
        {isLoading && <Loading />}

        <div className="font-bold mb-4">Change password</div>

        <div className="ml-12">
          <div className="flex items-end">
            <div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Current password"
                className="xs:w-80 rounded"
              />
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="New password"
                className="xs:w-80 rounded mt-4"
              />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm password"
                className="xs:w-80 rounded mt-4"
              />
            </div>

            <CheckPassword password={newPassword} className="ml-6" />
          </div>

          <button
            className="btn-primary mt-6"
            type="submit"
            disabled={
              !password ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !checkPasswordStr(newPassword)
            }
            onClick={onChangePassword}
          >
            Change
          </button>
        </div>

        <div className="mt-20">
          <div className="font-bold mb-4">Update info</div>

          <div className="ml-12">
            <Input
              id="email"
              value={email}
              onChange={setEmail}
              placeholder="Email"
              className="xs:w-80"
              disabled
            />
            <Input
              id="name"
              value={name}
              onChange={setName}
              placeholder="Name"
              className="xs:w-80 mt-4"
            />
            <Input
              id="phone"
              value={phone}
              onChange={setPhone}
              placeholder="Phone"
              className="xs:w-80 mt-4"
            />
            <button
              className="btn-primary mt-6"
              disabled={!name}
              onClick={onUpdateInfo}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default Account;
