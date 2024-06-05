import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import { FIELD_REQUIRED } from "../../../../../constants/formMessage";
import Select from "antd/lib/select";
import { getLabelFromStr } from "../../../../../utils/Helpers";
import {
  SPECIAL_AREA,
  bulkLink,
  defaultGroups,
  formClass,
} from "../../constants";
import TransferCountries from "../../../../../partials/common/Forms/TransferCountries";
import BatchSelectCountry from "../../components/BatchSelectCountry";
import {
  PlusIcon,
  backActionHook,
  getDynamicFieldFromGroup,
} from "../../Helpers";
import { PLATFORMS } from "../../../../../constants/constants";
import {
  DYNAMIC_BUDGET,
  DYNAMIC_BUDGET_COUNTRIES,
} from "./DailyBudgetGroup/FormItem";
import { DYNAMIC_BID, DYNAMIC_COUNTRIES } from "../../components/BidRateGroup";

function Step2(props) {
  const [form] = Form.useForm();
  const {
    campaignConfigs,
    next,
    stepData,
    setStepData,
    onPrev,
    countBackAction,
    activedApp,
  } = props;

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [batchAddCountry, setBatchAddCountry] = useState(false);

  const { categories, osVersions } = campaignConfigs;
  const initialValues = {
    locationLabelEl: "faked",
  };

  backActionHook(form, onPrev, countBackAction);

  useEffect(() => {
    const initData = stepData?.step2;
    if (initData) {
      form.setFieldsValue(initData);
    }

    if (listOsVersions?.length) {
      form.setFieldValue("osVersionMin", listOsVersions[0]);
    }
  }, [stepData?.step2]);

  const onChange = (values) => {
    setTargetKeys(values);
    form.setFieldValue("targetLocations", values);

    const { step3 } = stepData;
    const bidMode = step3?.bidMode;
    const budgetMode = step3?.budgetMode;

    let newBidData = {};
    let newBudgetData = {};
    let bidGroups = step3?.bidGroups;
    let budgetGroups = step3?.budgetGroups;

    if (bidMode === SPECIAL_AREA) {
      newBidData = getDynamicFieldFromGroup(bidGroups, [
        DYNAMIC_COUNTRIES,
        DYNAMIC_BID,
      ]);
      bidGroups = defaultGroups;
    }
    if (budgetMode === SPECIAL_AREA) {
      newBudgetData = getDynamicFieldFromGroup(budgetGroups, [
        DYNAMIC_BUDGET_COUNTRIES,
        DYNAMIC_BUDGET,
      ]);
      budgetGroups = defaultGroups;
    }

    setStepData({
      ...stepData,
      step3: {
        ...stepData.step3,
        ...newBidData,
        ...newBudgetData,
        bidGroups,
        budgetGroups,
      },
    });
  };

  const onBatchCountry = (countries: string[]) => {
    setTargetKeys([...targetKeys, ...countries]);
  };

  const onFinish = (values) => {
    // console.log("values :>> ", values);
    next(values);
  };

  const platform = activedApp?.platform || PLATFORMS.android;
  const listOsVersions = osVersions?.[platform] || [];

  return (
    <Form
      id="FormStep2"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Target locations"
        name="locationLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !-mb-2"
      >
        <Select className="!hidden" />
      </Form.Item>
      <Form.Item label={<></>} className="!mb-0">
        <Form.Item
          name="targetLocations"
          className="!mb-0"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <TransferCountries value={targetKeys} onChange={onChange} />
        </Form.Item>
        <Form.Item>
          <div className={bulkLink} onClick={() => setBatchAddCountry(true)}>
            {PlusIcon}
            <span>Add Location in Bulk</span>
          </div>
        </Form.Item>
      </Form.Item>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select placeholder="Select category" className={formClass}>
          {Object.keys(categories || {})?.map((type, idx) => (
            <Select.Option value={categories[type]} key={idx}>
              {getLabelFromStr(type)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="osVersionMin"
        label="OS version min"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select placeholder="Select versions" className={formClass} allowClear>
          {listOsVersions?.map((ver, idx) => (
            <Select.Option value={ver} key={idx}>
              {getLabelFromStr(ver)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <BatchSelectCountry
        isOpen={batchAddCountry}
        onClose={() => setBatchAddCountry(false)}
        onBatchCountry={onBatchCountry}
      />
    </Form>
  );
}

export default Step2;
