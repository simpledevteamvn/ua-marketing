import React from "react";
import PropTypes from "prop-types";
import Form from "antd/lib/form";
import {
  BUDGET_PLACEHOLDER,
  COUNTRY_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../../../constants/formMessage";
import InputNumber from "antd/lib/input-number";
import { DEFAULT_BID_STEP } from "../../../../../../constants/constants";
import SelectCountryFromList from "../../../../../../partials/common/Forms/SelectCountryFromList";

export const DYNAMIC_BUDGET_COUNTRIES = "dynamicBudgetCountries";
export const DYNAMIC_BUDGET = "dynamicBudget";

function FormItem(props) {
  const { budgetGroup, onChangeGroup, listCountries } = props;
  const { id, countries } = budgetGroup;

  return (
    <div className="ml-6">
      <Form.Item
        className="!mb-1"
        name={DYNAMIC_BUDGET_COUNTRIES + id}
        rules={[{ required: true, message: COUNTRY_REQUIRED }]}
      >
        <SelectCountryFromList
          listCountries={listCountries}
          value={countries}
          onChange={(value) => onChangeGroup(id, value)}
        />
      </Form.Item>

      <Form.Item
        className="!mt-4 !mb-1"
        name={DYNAMIC_BUDGET + id}
        rules={[{ required: true, message: VALUE_REQUIRED }]}
      >
        <InputNumber
          min={0}
          step={DEFAULT_BID_STEP}
          placeholder={BUDGET_PLACEHOLDER}
          className="!w-full"
          addonBefore="$"
        />
      </Form.Item>
    </div>
  );
}

FormItem.defaultProps = {
  budgetGroup: {},
  listCountries: [],
};

FormItem.propTypes = {
  budgetGroup: PropTypes.object,
  listCountries: PropTypes.array,
  onChangeGroup: PropTypes.func,
};

export default FormItem;
