import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import {
  FIELD_REQUIRED,
  NUMBER_PLACEHOLDER,
} from "../../../../../../constants/formMessage";
import Select from "antd/lib/select";
import { ALL_AREA, defaultGroups } from "../../../constants";
import InputNumber from "antd/lib/input-number";
import { DEFAULT_BID_STEP } from "../../../../../../constants/constants";
import { BidGroup, BudgetGroupI } from "../../../interface";
import classNames from "classnames";
import BudgetForm from "./BudgetForm";
import BidGroupForm, {
  addBidGroupLink,
} from "../../../components/BidGroupForm";
import { backActionHook } from "../../../Helpers";

function Step3(props) {
  const [form] = Form.useForm();
  const { campaignConfigs, next, stepData, onPrev, countBackAction } = props;

  const [activeKey, setActiveKey] = useState<any>([]);
  const [activedBudgetKey, setActivedBudgetKey] = useState<any>([]);
  const [bidGroups, setBidGroups] = useState<BidGroup[]>([]);
  const [budgetGroups, setBudgetGroups] =
    useState<BudgetGroupI[]>(defaultGroups);

  const formBudgetMode = Form.useWatch("budgetMode", form);

  const initialValues = {
    bidLabelEl: "faked",
    budgetEl: "faked",
    dailyBudgetOpen: false,
    totalBudgetOpen: true,
    budgetMode: ALL_AREA,
  };

  backActionHook(form, onPrev, countBackAction, { bidGroups, budgetGroups });

  useEffect(() => {
    const initData = stepData?.step3;
    if (initData) {
      const { bidGroups, budgetGroups } = initData;

      setBidGroups(bidGroups);
      setBudgetGroups(budgetGroups);
      form.setFieldsValue(initData);
    }
  }, [stepData]);

  const onFinish = (values) => {
    // console.log("values :>> ", values);
    next({ ...values, bidGroups, budgetGroups });
  };

  const allCountries = stepData?.step2?.targetLocations;

  return (
    <Form
      id="FormStep3"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Default bid"
        name="bidLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !-mb-2"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item label={<></>} className="!mb-0">
        <Form.Item
          name="defaultBid"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
          className="!mb-0"
        >
          <InputNumber
            min={0}
            step={DEFAULT_BID_STEP}
            placeholder={NUMBER_PLACEHOLDER}
            className="!w-60"
            addonBefore="$"
          />
        </Form.Item>
        <div className={classNames(bidGroups?.length ? "!mb-3" : "!mb-7")}>
          {bidGroups?.length > 0 ? (
            <BidGroupForm
              className="mt-4"
              form={form}
              activeKey={activeKey}
              setActiveKey={setActiveKey}
              bidGroups={bidGroups}
              setBidGroups={setBidGroups}
              allCountries={allCountries}
            />
          ) : (
            <>{addBidGroupLink({ bidGroups, setBidGroups, setActiveKey })}</>
          )}
        </div>
      </Form.Item>

      <BudgetForm
        form={form}
        formBudgetMode={formBudgetMode}
        allCountries={allCountries}
        budgetGroups={budgetGroups}
        setBudgetGroups={setBudgetGroups}
        setActiveKey={setActivedBudgetKey}
        activeKey={activedBudgetKey}
      />
    </Form>
  );
}

export default Step3;
