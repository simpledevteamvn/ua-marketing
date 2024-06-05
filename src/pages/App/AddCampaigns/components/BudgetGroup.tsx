import React from "react";
import PropTypes from "prop-types";
import Form from "antd/lib/form";
import { COUNTRY_REQUIRED } from "../../../../constants/formMessage";
import SelectCountryFromList from "../../../../partials/common/Forms/SelectCountryFromList";
import Radio from "antd/lib/radio";
import { BudgetGroupOpts } from "../constants";
import Select from "antd/lib/select";
import DailyAndTotalBudgetForm, {
  DYNAMIC_DAILY_BUDGET,
  DYNAMIC_DAILY_BUDGET_OPEN,
  DYNAMIC_TOTAL_BUDGET,
  DYNAMIC_TOTAL_BUDGET_OPEN,
} from "./DailyAndTotalBudgetForm";

export const DYNAMIC_BUDGET_TYPE = "dynamicBudgetType";
export const DYNAMIC_BUDGET_COUNTRIES = "dynamicBudgetCountries";

function BudgetGroup(props) {
  const { form, budgetGroup, listCountries, onChangeCountriesInGroup } = props;
  const { id, countries } = budgetGroup;

  const onChangeDailyMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: DYNAMIC_DAILY_BUDGET + id, value: "", errors: [] },
      { name: DYNAMIC_DAILY_BUDGET_OPEN + id, value: checked },
    ]);
  };

  const onChangeTotalMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: DYNAMIC_TOTAL_BUDGET + id, value: "", errors: [] },
      { name: DYNAMIC_TOTAL_BUDGET_OPEN + id, value: checked },
    ]);
  };

  return (
    <div className="ml-6">
      <Form.Item
        label="Type"
        name="dailyBudgetEl"
        // rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item
        name={DYNAMIC_BUDGET_TYPE + id}
        label={<></>}
        colon={false}
        className="!mb-2"
        labelCol={{ sm: { span: 5 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 19 }, xs: { span: 16 } }}
      >
        <Radio.Group>
          {BudgetGroupOpts.map((el) => (
            <Radio.Button value={el.value} key={el.value}>
              {el.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item
        className="!mt-3"
        label="Countries"
        name={DYNAMIC_BUDGET_COUNTRIES + id}
        rules={[{ required: true, message: COUNTRY_REQUIRED }]}
      >
        <SelectCountryFromList
          listCountries={listCountries}
          value={countries}
          onChange={(v) => onChangeCountriesInGroup(id, v)}
        />
      </Form.Item>

      <DailyAndTotalBudgetForm
        id={id}
        form={form}
        onChangeDailyMode={onChangeDailyMode}
        onChangeTotalMode={onChangeTotalMode}
      />
    </div>
  );
}

BudgetGroup.defaultProps = {
  budgetGroup: {},
  listCountries: [],
};

BudgetGroup.propTypes = {
  form: PropTypes.object,
  budgetGroup: PropTypes.object,
  listCountries: PropTypes.array,
  onChangeCountriesInGroup: PropTypes.func,
};

export default BudgetGroup;
