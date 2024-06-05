import React from "react";
import { Button, Result } from "antd";
import Page from "../utils/composables/Page";
import { useNavigate } from "react-router-dom";
import { ORGANIZATION_PATH } from "../constants/constants";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Page404 = () => {
  const navigate = useNavigate();
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const backToHome = () => {
    const url = ORGANIZATION_PATH + "/" + organizationCode;
    navigate(url);
  };

  return (
    <Page>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={backToHome}>
            Back Home
          </Button>
        }
      />
    </Page>
  );
};
export default Page404;
