import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import { FAKED, NETWORK_CODES } from "../../../../../constants/constants";
import { BidGroup } from "../../interface";
import BidGroupForm from "../../components/BidGroupForm";
import DailyAndTotalBudgetForm, {
  DAILY_BUDGET,
  DAILY_CB,
  TOTAL_BUDGET,
  TOTAL_CB,
} from "../../components/DailyAndTotalBudgetForm";
import { AUTOMATED, defaultGroups, formClass } from "../../constants";
import { COUNTRIES } from "../../../../../constants/countries";
import { backActionHook } from "../../Helpers";
import SelectCountry from "../../../../../partials/common/Forms/SelectCountry";

function Step2(props) {
  const [form] = Form.useForm();
  const { campaignConfigs, next, stepData, onPrev, countBackAction } = props;

  const [activeKey, setActiveKey] = useState<any>([defaultGroups[0].id]);
  const [bidGroups, setBidGroups] = useState<BidGroup[]>(defaultGroups);

  const initialValues = {
    bidLabelEl: FAKED,
    budgetEl: FAKED,
  };

  backActionHook(form, onPrev, countBackAction, { bidGroups });

  useEffect(() => {
    const initData = stepData?.step2;
    if (initData) {
      const { bidGroups } = initData;
      bidGroups?.length && setBidGroups(bidGroups);
      form.setFieldsValue(initData);

      if (
        bidGroups?.length === 1 &&
        Object.keys(bidGroups[0] || {}).length === 1 // Chỉ có id field => init expand
      ) {
        setActiveKey([defaultGroups[0].id]);
      }
    } else {
      setActiveKey([defaultGroups[0].id]);
    }
  }, [stepData]);

  const onChangeDailyMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: DAILY_BUDGET, value: "", errors: [] },
      { name: DAILY_CB, value: checked },
    ]);
  };

  const onChangeTotalMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: TOTAL_BUDGET, value: "", errors: [] },
      { name: TOTAL_CB, value: checked },
    ]);

    if (checked) {
      onChangeDailyMode({ target: { checked: true } });
    }
  };

  const onFinish = (values) => {
    // console.log("values :>> ", values);
    next({ ...values, bidGroups });
  };

  const isAutomated = stepData?.step1?.biddingStrategy === AUTOMATED;

  return (
    <Form
      id="FormStep2"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
      className="!mb-6"
    >
      <Form.Item
        label={
          isAutomated
            ? "Bid: Select the countries to be run with bid as auto"
            : "Bid"
        }
        name="bidLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !-mb-2"
      >
        <Select className="!hidden" />
      </Form.Item>
      <Form.Item label={<></>} className="!mb-0">
        {!isAutomated ? (
          <BidGroupForm
            form={form}
            type={stepData?.step1?.type}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            bidGroups={bidGroups}
            setBidGroups={setBidGroups}
            allCountries={COUNTRIES[NETWORK_CODES.unity]}
          />
        ) : (
          <Form.Item name="countries">
            <SelectCountry hasAllOpt={false} classNames={formClass} />
          </Form.Item>
        )}
      </Form.Item>

      <Form.Item
        label="Budget"
        name="budgetEl"
        rules={[{ required: true }]}
        className="!mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <div className="border p-5 shadow-md rounded max-w-3xl">
        <DailyAndTotalBudgetForm
          form={form}
          onChangeDailyMode={onChangeDailyMode}
          onChangeTotalMode={onChangeTotalMode}
          disableDaily={isAutomated}
          disableTotal={isAutomated}
        />
      </div>
    </Form>
  );
}

export default Step2;
