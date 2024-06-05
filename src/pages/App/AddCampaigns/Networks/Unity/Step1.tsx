import React, { useEffect } from "react";
import Form from "antd/lib/form";
import {
  FIELD_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../../constants/formMessage";
import AntInput from "antd/lib/input/Input";
import Select from "antd/lib/select";
import {
  AUTOMATED,
  DeliveryOpts,
  LONG_TIME,
  TIME_DISTANCE,
  defaultGroups,
  formClass,
} from "../../constants";
import DatePicker from "antd/lib/date-picker";
import { BID_CPI_TYPE, FAKED } from "../../../../../constants/constants";
import Radio from "antd/lib/radio";
import moment from "moment";
import { getLabelFromStr } from "../../../../../utils/Helpers";
import {
  DYNAMIC_BASE_BID,
  DYNAMIC_BID,
  DYNAMIC_COUNTRIES,
  DYNAMIC_GOAL,
  DYNAMIC_MAX_BID,
} from "../../components/BidRateGroup";
import { DAILY_CB, TOTAL_CB } from "../../components/DailyAndTotalBudgetForm";

function Step1(props) {
  const [form] = Form.useForm();
  const { campaignConfigs, next, stepData, setStepData } = props;
  const { biddingStrategies, types } = campaignConfigs;

  const initialValues = { timeLabelEl: FAKED, deliveryMode: LONG_TIME };
  const formDelivery = Form.useWatch("deliveryMode", form);
  const formBillingType = Form.useWatch("type", form);
  const formStartDate = Form.useWatch("startDate", form);
  const formEndDate = Form.useWatch("endDate", form);

  useEffect(() => {
    const initData = stepData?.step1;
    if (initData) {
      form.setFieldsValue(initData);
    }
  }, [stepData?.step1]);

  const disabledStartDate = (current) => {
    if (!formEndDate) return false;
    return current && moment(current).isAfter(formEndDate);
  };

  const disabledEndDate = (current) => {
    return current && moment(current).isBefore(formStartDate);
  };

  const onChangeDeliveryMode = (e) => {
    if (e.target.value === LONG_TIME) {
      form.setFieldValue("endDate", "");
    }
  };

  const onChangeBidType = (value) => {
    const bidGroups = stepData?.step2?.bidGroups;

    if (bidGroups?.length) {
      const oldGroupIds = bidGroups.map((el) => el.id);
      const dynamicFields = {};
      oldGroupIds.forEach((groupId) => {
        dynamicFields[DYNAMIC_COUNTRIES + groupId] = undefined;
        dynamicFields[DYNAMIC_BID + groupId] = undefined;
        dynamicFields[DYNAMIC_GOAL + groupId] = undefined;
        dynamicFields[DYNAMIC_BASE_BID + groupId] = undefined;
        dynamicFields[DYNAMIC_MAX_BID + groupId] = undefined;
      });

      const newData = {
        ...stepData,
        step2: {
          ...stepData.step2,
          ...dynamicFields,
          bidGroups: defaultGroups,
        },
      };

      setStepData(newData);
    }
  };

  const onChangeBidStrategy = (v) => {
    if (v === AUTOMATED) {
      const newData = {
        ...stepData,
        step2: {
          ...stepData.step2,
          [DAILY_CB]: false,
          [TOTAL_CB]: false,
        },
      };

      setStepData(newData);
    }
  };

  const onFinish = (values) => {
    // console.log("values :>> ", values);
    next(values);
  };

  return (
    <Form
      id="FormStep1"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
      className="!mb-6"
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: VALUE_REQUIRED }]}
      >
        <AntInput placeholder="Enter a campaign name" className={formClass} />
      </Form.Item>
      <Form.Item
        name="type"
        label="Billing type"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select
          placeholder="Select type"
          className={formClass}
          onChange={onChangeBidType}
        >
          {types?.map((type, idx) => (
            <Select.Option value={type} key={idx}>
              {getLabelFromStr(type)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {formBillingType === BID_CPI_TYPE && (
        <Form.Item
          name="biddingStrategy"
          label="Bidding strategy"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <Select
            placeholder="Select type"
            className={formClass}
            onChange={onChangeBidStrategy}
          >
            {biddingStrategies?.map((type, idx) => (
              <Select.Option value={type} key={idx}>
                {getLabelFromStr(type)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item
        name="startUrl"
        label="Start url"
        rules={[{ required: true, message: VALUE_REQUIRED }]}
      >
        <AntInput placeholder="Enter a link" className={formClass} />
      </Form.Item>
      <Form.Item
        name="clickUrl"
        label="Click url"
        rules={[{ required: true, message: VALUE_REQUIRED }]}
      >
        <AntInput placeholder="Enter a link" className={formClass} />
      </Form.Item>
      <Form.Item name="impressionUrl" label="Impression url">
        <AntInput placeholder="Enter a link" className={formClass} />
      </Form.Item>

      <Form.Item
        label="Delivery Time"
        name="timeLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item
        name="deliveryMode"
        label={<></>}
        colon={false}
        className="!mb-4 max-w-3xl"
        labelCol={{ sm: { span: 6 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 18 }, xs: { span: 16 } }}
      >
        <Radio.Group onChange={onChangeDeliveryMode}>
          {DeliveryOpts.map((el) => (
            <Radio.Button value={el.value} key={el.value}>
              {el.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item className="max-w-3xl !mb-0">
        <Form.Item
          name="startDate"
          className="inline-block !mb-0"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <DatePicker
            placeholder="Start time"
            className="min-w-[180px]"
            disabledDate={disabledStartDate}
          />
        </Form.Item>
        {formDelivery === TIME_DISTANCE && (
          <>
            <span className="inline-block text-center w-8 leading-8">-</span>
            <Form.Item
              name="endDate"
              className="inline-block !mb-0"
              rules={[{ required: true, message: FIELD_REQUIRED }]}
            >
              <DatePicker
                placeholder="End time"
                className="min-w-[180px]"
                disabledDate={disabledEndDate}
              />
            </Form.Item>
          </>
        )}
      </Form.Item>
    </Form>
  );
}

export default Step1;
