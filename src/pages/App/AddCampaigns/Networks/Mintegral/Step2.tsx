import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import { FIELD_REQUIRED } from "../../../../../constants/formMessage";
import Select from "antd/lib/select";
import { getLabelFromStr } from "../../../../../utils/Helpers";
import {
  ALL_AREA,
  SPECIAL_AREA,
  bulkLink,
  defaultGroups,
  formClass,
} from "../../constants";
import Segmented from "antd/lib/segmented";
import TransferCountries from "../../../../../partials/common/Forms/TransferCountries";
import BatchSelectCountry from "../../components/BatchSelectCountry";
import {
  PlusIcon,
  backActionHook,
  getDynamicFieldFromGroup,
} from "../../Helpers";
import { DYNAMIC_BID, DYNAMIC_COUNTRIES } from "../../components/BidRateGroup";

export const ALL_DEVICES = "ALL"; // "PHONE" + "TABLET"

function Step2(props) {
  const [form] = Form.useForm();
  const {
    campaignConfigs,
    next,
    stepData,
    setStepData,
    onPrev,
    countBackAction,
  } = props;

  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [batchAddCountry, setBatchAddCountry] = useState(false);

  const { networks, osVersionMax, osVersionMin, targetDevices } =
    campaignConfigs;
  const initialValues = {
    locationLabelEl: "faked",
  };

  backActionHook(form, onPrev, countBackAction);

  useEffect(() => {
    form.setFieldsValue({
      osVersionMin: osVersionMin?.unlimited,
      osVersionMax: osVersionMax?.unlimited,
      targetDevice: ALL_DEVICES,
      networks,
    });
  }, [campaignConfigs]);

  useEffect(() => {
    const initData = stepData?.step2;
    if (initData) {
      const {
        targetLocations,
        networks,
        osVersionMin,
        osVersionMax,
        targetDevice,
      } = initData;
      form.setFieldsValue({
        targetLocations,
        networks,
        osVersionMin,
        osVersionMax,
        targetDevice,
      });
    }
  }, [stepData?.step2]);

  const onChange = (values) => {
    setTargetKeys(values);
    form.setFieldValue("targetLocations", values);

    const { step3 } = stepData;
    const budgetMode = step3?.budgetMode;

    let newBidData = {};
    let newBudgetData: any = {};
    let bidGroups = step3?.bidGroups;
    let budgetGroups = step3?.budgetGroups;

    if (bidGroups?.length) {
      if (bidGroups.length > 1 || bidGroups[0].countries?.length) {
        newBidData = getDynamicFieldFromGroup(bidGroups, [
          DYNAMIC_COUNTRIES,
          DYNAMIC_BID,
        ]);
        bidGroups = [];
      }
    }

    if (budgetMode === SPECIAL_AREA) {
      // Đổi lại mode vì nếu dùng hàm getDynamicFieldFromGroup thì sẽ set sai giá trị init mong muốn
      newBudgetData.budgetMode = ALL_AREA;
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

  let targetDeviceOpts: any = [];
  if (targetDevices?.length) {
    targetDeviceOpts.push({
      label: getLabelFromStr(ALL_DEVICES),
      value: ALL_DEVICES,
    });
    targetDevices.forEach((el) => {
      targetDeviceOpts.push({
        label: getLabelFromStr(el),
        value: el,
      });
    });
  }

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
        name="networks"
        label="Networks"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <Select
          placeholder="Select type"
          className={formClass}
          mode="multiple"
          maxTagCount="responsive"
        >
          {networks?.map((type, idx) => (
            <Select.Option value={type} key={idx}>
              {type}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="System Version" className="!mb-0">
        <Form.Item
          name="osVersionMin"
          className="inline-block w-[calc(260px-16px)]"
        >
          <Select placeholder="Select min version">
            {Object.keys(osVersionMin || {})?.map((ver, idx) => (
              <Select.Option value={osVersionMin[ver]} key={idx}>
                {ver}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <div className="inline-block w-8 leading-8 text-center">-</div>
        <Form.Item
          name="osVersionMax"
          className="inline-block w-[calc(260px-16px)]"
        >
          <Select placeholder="Select max version">
            {Object.keys(osVersionMin || {})?.map((ver, idx) => (
              <Select.Option value={osVersionMax[ver]} key={idx}>
                {ver}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form.Item>

      <Form.Item name="targetDevice" label="Target device">
        <Segmented options={targetDeviceOpts} />
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
