import React from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";

export const WEEKLY_IDS = {
  mon: "MONDAY",
  tue: "TUESDAY",
  wed: "WEDNESDAY",
  thu: "THURSDAY",
  fri: "FRIDAY",
  sat: "SATURDAY",
  sun: "SUNDAY",
};
export const WEEKLY_OPTIONS = [
  { label: "Monday", value: WEEKLY_IDS.mon },
  { label: "Tuesday", value: WEEKLY_IDS.tue },
  { label: "Wednesday", value: WEEKLY_IDS.wed },
  { label: "Thursday", value: WEEKLY_IDS.thu },
  { label: "Friday", value: WEEKLY_IDS.fri },
  { label: "Saturday", value: WEEKLY_IDS.sat },
  { label: "Sunday", value: WEEKLY_IDS.sun },
];

function SelectDayOnWeek(props) {
  const { value, onChange, classNames } = props;

  return (
    <Select
      placeholder="Day in week"
      className={`!w-[130px] ${classNames}`}
      value={value}
      onChange={onChange}
    >
      {WEEKLY_OPTIONS.map((data, idx) => (
        <Select.Option value={data.value} key={idx}>
          {data.label}
        </Select.Option>
      ))}
    </Select>
  );
}

SelectDayOnWeek.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  classNames: PropTypes.string,
};

export default SelectDayOnWeek;
