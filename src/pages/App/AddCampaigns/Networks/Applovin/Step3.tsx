import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import {
  FIELD_REQUIRED,
  NUMBER_PLACEHOLDER,
} from "../../../../../constants/formMessage";
import Select from "antd/lib/select";
import {
  ALL_AREA,
  AREA_OPTIONS,
  SPECIAL_AREA,
  defaultGroupIds,
  defaultGroups,
} from "../../constants";
import InputNumber from "antd/lib/input-number";
import {
  BID_CPI_TYPE,
  DEFAULT_BID_STEP,
} from "../../../../../constants/constants";
import { BidGroup, BudgetGroupI } from "../../interface";
import BidGroupForm from "../../components/BidGroupForm";
import { backActionHook, resetDynamicFields } from "../../Helpers";
import Radio from "antd/lib/radio";
import { DYNAMIC_BID, DYNAMIC_COUNTRIES } from "../../components/BidRateGroup";
import DailyBudgetGroup from "./DailyBudgetGroup/DailyBudgetGroup";
import {
  DYNAMIC_BUDGET,
  DYNAMIC_BUDGET_COUNTRIES,
} from "./DailyBudgetGroup/FormItem";

function Step3(props) {
  const [form] = Form.useForm();
  const { campaignConfigs, next, stepData, onPrev, countBackAction } = props;

  const [activeKey, setActiveKey] = useState<any>(defaultGroupIds);
  const [activedBudgetKey, setActivedBudgetKey] =
    useState<any>(defaultGroupIds);
  const [bidGroups, setBidGroups] = useState<BidGroup[]>(defaultGroups);
  const [budgetGroups, setBudgetGroups] =
    useState<BudgetGroupI[]>(defaultGroups);

  const formBidMode = Form.useWatch("bidMode", form);
  const formBudgetMode = Form.useWatch("budgetMode", form);

  const initialValues = {
    bidLabelEl: "faked",
    budgetEl: "faked",
    bidMode: ALL_AREA,
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

  const onChangeBidMode = (e) => {
    if (e.target.value === SPECIAL_AREA) {
      resetDynamicFields(form, [DYNAMIC_COUNTRIES, DYNAMIC_BID]);
      setBidGroups(defaultGroups);
      setActiveKey(defaultGroupIds);
    } else {
      setBidGroups([]);
      form.setFieldValue("defaultBid", undefined);
    }
  };

  const onChangeBudgetMode = (e) => {
    if (e.target.value === SPECIAL_AREA) {
      resetDynamicFields(form, [DYNAMIC_BUDGET_COUNTRIES, DYNAMIC_BUDGET]);
      setBudgetGroups(defaultGroups);
      setActivedBudgetKey(defaultGroupIds);
    } else {
      setBudgetGroups([]);
      form.setFieldValue("defaultBudget", undefined);
    }
  };

  const onFinish = (values) => {
    // console.log("values :>> ", values);
    next({ ...values, bidGroups, budgetGroups });
  };

  const allCountries = stepData?.step2?.targetLocations;
  const bidType = stepData?.step1?.bidType || BID_CPI_TYPE;

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
        label="Bid"
        name="bidLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item
        name="bidMode"
        label={<></>}
        colon={false}
        className="!mb-4 max-w-3xl"
        labelCol={{ sm: { span: 4 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 20 }, xs: { span: 16 } }}
      >
        <Radio.Group onChange={onChangeBidMode}>
          {AREA_OPTIONS.map((el) => (
            <Radio.Button value={el.value} key={el.value}>
              {el.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      {formBidMode === ALL_AREA ? (
        <div className="border p-5 pt-3.5 shadow-md rounded max-w-3xl">
          <Form.Item
            name="defaultBid"
            label={
              bidType === BID_CPI_TYPE ? "Default bid" : "Default ROAS Goal"
            }
            rules={[{ required: true, message: FIELD_REQUIRED }]}
            className="!mb-1 remove-padding"
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="w-full"
              addonBefore="$"
            />
          </Form.Item>
        </div>
      ) : (
        <BidGroupForm
          className="mt-4"
          title={bidType === BID_CPI_TYPE ? undefined : "ROAS Goal by location"}
          form={form}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          bidGroups={bidGroups}
          setBidGroups={setBidGroups}
          allCountries={allCountries}
        />
      )}

      <Form.Item className="!mt-8 !mb-0">
        <Form.Item
          label="Budget"
          name="budgetEl"
          rules={[{ required: true }]}
          className="!h-0 !mb-0"
        >
          <Select className="!hidden" />
        </Form.Item>
        <Form.Item
          name="budgetMode"
          label={<></>}
          colon={false}
          className="!mb-4 max-w-3xl"
          labelCol={{ sm: { span: 4 }, xs: { span: 8 } }}
          wrapperCol={{ sm: { span: 20 }, xs: { span: 16 } }}
        >
          <Radio.Group onChange={onChangeBudgetMode}>
            {AREA_OPTIONS.map((el) => (
              <Radio.Button value={el.value} key={el.value}>
                {el.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form.Item>

      {formBudgetMode === ALL_AREA ? (
        <div className="border p-5 pt-3 shadow-md rounded mb-6 max-w-3xl">
          <Form.Item
            name="defaultBudget"
            label="Default daily budget"
            rules={[{ required: true, message: FIELD_REQUIRED }]}
            className="!mb-1"
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="w-full"
              addonBefore="$"
            />
          </Form.Item>
        </div>
      ) : (
        <DailyBudgetGroup
          form={form}
          budgetGroups={budgetGroups}
          setBudgetGroups={setBudgetGroups}
          allCountries={allCountries}
          activeKey={activedBudgetKey}
          setActiveKey={setActivedBudgetKey}
        />
      )}
    </Form>
  );
}

export default Step3;
