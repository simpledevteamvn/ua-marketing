import React, { useEffect } from "react";
import Form from "antd/lib/form";
import {
  FIELD_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../../constants/formMessage";
import AntInput from "antd/lib/input/Input";
import Select from "antd/lib/select";
import { formClass } from "../../constants";
import { getLabelFromStr } from "../../../../../utils/Helpers";

function Step1(props) {
  const [form] = Form.useForm();
  const { campaignConfigs, next, stepData } = props;
  const { bidTypes, tracingMethods } = campaignConfigs;

  const initialValues = {};

  useEffect(() => {
    const initData = stepData?.step1;
    if (initData) {
      form.setFieldsValue(initData);
    }
  }, [stepData]);

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
        name="bidType"
        label="Bid type"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select placeholder="Select type" className={formClass}>
          {bidTypes?.map((type, idx) => (
            <Select.Option value={type} key={idx}>
              {getLabelFromStr(type)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="trackingMethod"
        label="Tracking method"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select placeholder="Select method" className={formClass}>
          {tracingMethods?.map((type, idx) => (
            <Select.Option value={type} key={idx}>
              {getLabelFromStr(type)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="clickUrl"
        label="Click url"
        rules={[{ required: true, message: VALUE_REQUIRED }]}
      >
        <AntInput placeholder="Enter a link" className={formClass} />
      </Form.Item>

      <Form.Item
        name="impressionUrl"
        label="Impression url"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <AntInput placeholder="Enter a link" className={formClass} />
      </Form.Item>
    </Form>
  );
}

export default Step1;
