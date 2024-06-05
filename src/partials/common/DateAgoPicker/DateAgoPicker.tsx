import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Popover from "antd/lib/popover";
import Button from "antd/lib/button";
import Divider from "antd/lib/divider";
import { FaCheckCircle } from "@react-icons/all-files/fa/FaCheckCircle";
import classNames from "classnames";
import CalendarOutlined from "@ant-design/icons/lib/icons/CalendarOutlined";

const Presets = [
  { label: "Today", start: 0 },
  { label: "Yesterday", start: -1, end: -1 },
  { label: "Last 2 days", start: -1, note: "(including today)" },
  { label: "Last 3 days", start: -2, note: "(including today)" },
  { label: "Last 7 days", start: -6, note: "(including today)" },
  { label: "Last 3 days", start: -3, end: -1 },
  { label: "Last 7 days", start: -7, end: -1 },
];

const MAX_DAY = 28;
const arr = Array.from(Array(MAX_DAY).keys());
const ListDays = arr.reverse();

function DateAgoPicker(props) {
  const { onChange, value, hasError } = props;
  const [open, setOpen] = useState(false);

  const [activedValues, setActivedValues] = useState<number[]>([]);
  const [clickedId, setClickedId] = useState<number>();

  useEffect(() => {
    if (!value?.length || !open) return;
    updateActivedValue(value);
  }, [value, open]);

  const updateActivedValue = (value) => {
    const newData = arr.filter(
      (number) => number <= Math.abs(value[0]) && number >= Math.abs(value[1])
    );
    setActivedValues(newData);
  };

  const onOpenChange = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      setClickedId(undefined);
    }
  };

  const onClickDay = (newId) => {
    if (clickedId === undefined) {
      setActivedValues([newId]);
      setClickedId(newId);
    } else {
      const start = Math.max(clickedId, newId);
      const end = Math.min(clickedId, newId);
      onChange([-start, -end]);
      onOpenChange(false);
    }
  };

  const handleMouseEnter = (id) => {
    if (clickedId === undefined) return;
    const start = Math.max(clickedId, id);
    const end = Math.min(clickedId, id);
    updateActivedValue([-start, -end]);
  };

  const getEnd = (value) => (value === undefined ? 0 : value);

  const contentEl = (
    <div className="popover-custom-zIndex popover-custom-padding !max-w-max p-1">
      <div className="text-center mb-3 font-semibold">Condition Filter</div>
      <hr />
      <div className="flex pt-2 sm:pt-4 overflow-hidden">
        <div className="w-[80px] sm:w-[105px] flex flex-col space-y-2">
          {Presets.map((el, idx) => {
            return (
              <div
                key={idx}
                className="cursor-pointer"
                onClick={() => {
                  onChange([el.start, getEnd(el.end)]);
                  onOpenChange(false);
                }}
              >
                <div className="font-medium">{el.label}</div>
                <div className="-mt-1 text-neutral-400 text-xs">{el.note}</div>
              </div>
            );
          })}
        </div>
        <Divider type="vertical" className="!h-auto !mx-0 sm:!mx-2" />
        <div className="pl-2 sm:pl-3 text-xs2 text-right tracking-tight grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
          {ListDays.map((dayAgo) => {
            const dayName = !dayAgo ? "Today" : dayAgo + " days ago";
            const actived =
              activedValues.includes(dayAgo) || clickedId === dayAgo;

            return (
              <div
                key={dayAgo}
                className={classNames(
                  "p-1.5 w-[57px] sm:w-[62px] h-[50px] rounded flex flex-col justify-between leading-[13px] cursor-pointer",
                  "bg-slate-50 hover:bg-blue-50"
                )}
                style={{ backgroundColor: actived ? "#e1f0fe" : undefined }}
                onClick={() => onClickDay(dayAgo)}
                onMouseEnter={() => handleMouseEnter(dayAgo)}
              >
                <div>
                  {actived && (
                    <FaCheckCircle className="text-green-600 ml-auto text-xxs" />
                  )}
                </div>
                <div>{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  const btnName = getTextResult(value);

  return (
    <div>
      <Popover
        content={contentEl}
        trigger="click"
        placement="bottomLeft"
        open={open}
        onOpenChange={onOpenChange}
      >
        <Button
          title={btnName}
          className={classNames("!pl-2 !pr-2.5", hasError && "!border-red-600")}
        >
          <div className="flex items-center">
            <div className="w-[125px] text-left text-xs2 truncate !text-gray-800">
              {btnName}
            </div>
            <CalendarOutlined className="!text-black/25 text-xs3 ml-1" />
          </div>
        </Button>
      </Popover>
    </div>
  );
}

DateAgoPicker.defaultProps = {
  value: [],
};

DateAgoPicker.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
  hasError: PropTypes.bool,
};

export default DateAgoPicker;

const getTextResult = (value) => {
  if (!value?.length) return "";
  const start = Math.abs(value[0]);
  const end = Math.abs(value[1]);

  if (start === end) {
    return start === 0 ? "Today" : start + " days ago";
  }
  if (end === 0) {
    const value = start + 1;
    return "Last " + value + " days, including today";
  }
  if (end === 1) {
    return "Last " + start + " days";
  }

  return "Last " + start + " day to " + end + " day";
};
