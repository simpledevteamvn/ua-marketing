import React from "react";
import PropTypes from "prop-types";
import InputNumber from "antd/lib/input-number";

function InputMaxMin(props) {
  const { minValue, maxValue, setMinValue, setMaxValue, onPressEnter } = props;

  return (
    <div className="flex">
      <InputNumber
        className="!rounded-r-none z-10 !w-28"
        placeholder="Min"
        value={minValue}
        onChange={(num) => setMinValue(num)}
        onPressEnter={onPressEnter}
      />
      <div className="border !border-x-0 border-antBorder bg-zinc-100 w-[30px] flex items-center">
        <span className="mx-auto text-base">~</span>
      </div>
      <InputNumber
        className="!rounded-l-none z-10 !w-28"
        placeholder="Max"
        value={maxValue}
        onChange={(num) => setMaxValue(num)}
        onPressEnter={onPressEnter}
      />
    </div>
  );
}

InputMaxMin.propTypes = {
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  setMinValue: PropTypes.func,
  setMaxValue: PropTypes.func,
  onPressEnter: PropTypes.func,
};

export default InputMaxMin;
