import React from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";

export const TIME_UNIT_IDS = {
  hour: "HOUR",
  day: "DAY",
  week: "WEEK",
  month: "MONTH",
};

export const LIST_TIME_UNITS = [
  { label: "hours", value: TIME_UNIT_IDS.hour },
  { label: "days", value: TIME_UNIT_IDS.day },
  { label: "weeks", value: TIME_UNIT_IDS.week },
  { label: "months", value: TIME_UNIT_IDS.month },
];

function TimeUnit(props) {
  const { value, onChange, classNames } = props;

  return (
    <Select
      // placeholder="Select time unit"
      className={`w-[85px] text-xs text-center custom-input-rounded ${classNames}`}
      value={value}
      onChange={onChange}
      size="small"
    >
      {LIST_TIME_UNITS.map((data, idx) => (
        <Select.Option value={data.value} key={idx}>
          {data.label}
        </Select.Option>
      ))}
    </Select>
  );
}

TimeUnit.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  classNames: PropTypes.string,
};

export default TimeUnit;
