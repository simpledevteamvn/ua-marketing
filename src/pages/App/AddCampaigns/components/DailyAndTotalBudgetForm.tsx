import Checkbox from "antd/lib/checkbox";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import React, { useEffect } from "react";
import {
  FIELD_REQUIRED,
  NUMBER_PLACEHOLDER,
} from "../../../../constants/formMessage";
import { DEFAULT_BUDGET_STEP, FAKED } from "../../../../constants/constants";
import InputNumber from "antd/lib/input-number";

export const DAILY_CB = "dailyBudgetOpen";
export const TOTAL_CB = "totalBudgetOpen";
export const DAILY_BUDGET = "dailyBudget";
export const TOTAL_BUDGET = "totalBudget";

export const DYNAMIC_DAILY_BUDGET_OPEN = "dynamicDailyBudgetOpen";
export const DYNAMIC_TOTAL_BUDGET_OPEN = "dynamicTotalBudgetOpen";
export const DYNAMIC_DAILY_BUDGET = "dynamicDailyBudget";
export const DYNAMIC_TOTAL_BUDGET = "dynamicTotalBudget";

export default function DailyAndTotalBudgetForm(props) {
  const {
    id,
    form,
    onChangeDailyMode,
    onChangeTotalMode,
    disableDaily,
    disableTotal,
  } = props;

  let dailyCB = DAILY_CB;
  let totalCB = TOTAL_CB;
  let daily = DAILY_BUDGET;
  let total = TOTAL_BUDGET;

  useEffect(() => {
    form.setFieldsValue({
      dailyBudgetEl: FAKED,
      totalBudgetEl: FAKED,
    });
  }, []);

  if (id !== undefined) {
    dailyCB = DYNAMIC_DAILY_BUDGET_OPEN + id;
    totalCB = DYNAMIC_TOTAL_BUDGET_OPEN + id;
    daily = DYNAMIC_DAILY_BUDGET + id;
    total = DYNAMIC_TOTAL_BUDGET + id;
  }

  const formDaily = Form.useWatch(dailyCB, form);
  const formTotal = Form.useWatch(totalCB, form);

  return (
    <>
      <Form.Item
        label="Daily budget"
        name="dailyBudgetEl"
        rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item
        name={dailyCB}
        label={<></>}
        colon={false}
        className="!mb-2"
        labelCol={{ sm: { span: 7 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 17 }, xs: { span: 16 } }}
        valuePropName="checked"
      >
        <Checkbox onChange={onChangeDailyMode} disabled={disableDaily}>
          Open budget
        </Checkbox>
      </Form.Item>

      <Form.Item
        name={daily}
        rules={[{ required: !formDaily, message: FIELD_REQUIRED }]}
      >
        <InputNumber
          min={1}
          step={DEFAULT_BUDGET_STEP}
          placeholder={NUMBER_PLACEHOLDER}
          className="!w-full"
          addonBefore="$"
          disabled={formDaily}
        />
      </Form.Item>

      <Form.Item
        label="Total budget"
        name="totalBudgetEl"
        rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item
        name={totalCB}
        label={<></>}
        colon={false}
        className="!mb-2"
        labelCol={{ sm: { span: 7 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 17 }, xs: { span: 16 } }}
        valuePropName="checked"
      >
        <Checkbox onChange={onChangeTotalMode} disabled={disableTotal}>
          Open budget
        </Checkbox>
      </Form.Item>

      <Form.Item
        name={total}
        className="!mb-3"
        rules={[{ required: !formTotal, message: FIELD_REQUIRED }]}
      >
        <InputNumber
          min={1}
          step={DEFAULT_BUDGET_STEP}
          placeholder={NUMBER_PLACEHOLDER}
          className="!w-full"
          addonBefore="$"
          disabled={formTotal}
        />
      </Form.Item>
    </>
  );
}
