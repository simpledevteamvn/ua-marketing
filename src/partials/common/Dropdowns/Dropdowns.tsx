import Select from "antd/lib/select";
import React from "react";
import { DIMENSION_OPTIONS } from "../../../constants/dropdowns";
import { filterSelect } from "../../../utils/Helpers";

const { Option } = Select;

export const DIMENSION_SUFFIX = {
  includes: "includes",
  excludes: "excludes",
};

export const METRIC_SUFFIX = {
  between: "between",
  except: "except",
};

export const METRIC_OPTIONS = [
  { value: "0", name: "Cost" },
  { value: "1", name: "Ad Network Installs" },
  { value: "2", name: "Attributed Installs" },
];

export const ADJUSTMENT_IDS = {
  inc: "INCREASE_BY_PERCENTAGE",
  dec: "DECREASE_BY_PERCENTAGE",
  incByValue: "INCREASE_BY_VALUE",
  decByValue: "DECREASE_BY_VALUE",
  value: "CHANGE_TO_VALUE",
};
export const BID_ADJUSTMENT = [
  {
    id: ADJUSTMENT_IDS.inc,
    /**
     * @deprecated:
     * "value" dùng cho chức năng cũ (BatchEdit), thay nó băng id theo api mới
     */
    value: 0,
    name: "Increase by percentage",
    icon: "%",
    bidDefaultValue: 0,
    budgetDefaultValue: 0,
    bidStep: 1,
    budgetStep: 1,
  },
  {
    id: ADJUSTMENT_IDS.dec,
    value: 1,
    name: "Decrease by percentage",
    icon: "%",
    bidDefaultValue: 0,
    budgetDefaultValue: 0,
    bidStep: 1,
    budgetStep: 1,
  },
  {
    id: ADJUSTMENT_IDS.incByValue,
    value: 2,
    name: "Increase by value",
    icon: "$",
    bidDefaultValue: 0.0,
    budgetDefaultValue: 0,
    bidStep: 0.01,
    budgetStep: 1,
  },
  {
    id: ADJUSTMENT_IDS.decByValue,
    value: 3,
    name: "Decrease by value",
    icon: "$",
    bidDefaultValue: 0.0,
    budgetDefaultValue: 0,
    bidStep: 0.01,
    budgetStep: 1,
  },
  {
    id: ADJUSTMENT_IDS.value,
    value: 4,
    name: "Change to value",
    icon: "$",
    bidDefaultValue: 0.01,
    budgetDefaultValue: 100,
    bidStep: 0.01,
    budgetStep: 1,
  },
];

export function DimensionSuffixDrd({ value, onChange, classNames = "" }) {
  return (
    <Select
      className={`w-[98px] ${classNames}`}
      value={value}
      onChange={onChange}
    >
      <Option value={DIMENSION_SUFFIX.includes}>includes</Option>
      <Option value={DIMENSION_SUFFIX.excludes}>excludes</Option>
    </Select>
  );
}

export function MetricSuffixDrd({ value, onChange }) {
  return (
    <Select className="w-[98px]" value={value} onChange={onChange}>
      <Option value={METRIC_SUFFIX.between}>between</Option>
      <Option value={METRIC_SUFFIX.except}>except</Option>
    </Select>
  );
}

export function DimensionDrd({
  value,
  onChange,
  placeholder = "Select a dimension",
  options = DIMENSION_OPTIONS,
}) {
  return (
    <Select
      className="w-[190px] sm:w-[215px]"
      placeholder={placeholder}
      showSearch
      value={value}
      onChange={onChange}
      filterOption={filterSelect}
    >
      {options.map((opt, idx) => (
        <Option value={opt.value} key={idx}>
          {opt.name}
        </Option>
      ))}
    </Select>
  );
}

export function MetricDrd({
  value,
  onChange,
  placeholder = "Select a metric",
}) {
  return (
    <Select
      className="w-[215px]"
      placeholder={placeholder}
      showSearch
      value={value}
      onChange={onChange}
      filterOption={filterSelect}
    >
      {METRIC_OPTIONS.map((opt, idx) => (
        <Option value={opt.value} key={idx}>
          {opt.name}
        </Option>
      ))}
    </Select>
  );
}

export function AdjustmentDrd({
  value = undefined,
  onChange = undefined,
  classNames = "",
}: any) {
  return (
    <Select
      className={`w-[98px] ${classNames}`}
      value={value}
      onChange={onChange}
      placeholder="Select editing mode"
    >
      {BID_ADJUSTMENT.map((el, idx) => (
        <Option value={el.id} key={idx}>
          {el.name}
        </Option>
      ))}
    </Select>
  );
}

/**
 * @deprecated
 * Use the AdjustmentDrd function instead
 */
export function BidAdjustmentDrd({
  value = undefined,
  onChange = undefined,
  classNames = "",
}: any) {
  return (
    <Select
      className={`w-[98px] ${classNames}`}
      value={value}
      onChange={onChange}
      placeholder="Select editing mode"
    >
      {BID_ADJUSTMENT.map((el, idx) => (
        <Option value={el.value} key={idx}>
          {el.name}
        </Option>
      ))}
    </Select>
  );
}
