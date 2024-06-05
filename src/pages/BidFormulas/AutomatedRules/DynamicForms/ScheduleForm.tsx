import Form from "antd/lib/form";
import React from "react";
import {
  DYN_CUSTOM_DAY,
  DYN_DAY_IN_MONTH,
  DYN_DAY_IN_WEEK,
  DYN_HOUR,
  FREQUENCY_IDS,
  LIST_DAYS_IN_MONTH,
  SCHEDULE_FORM,
} from "../constants";
import SelectDayOnWeek from "../../../../partials/common/Dropdowns/SelectDayOnWeek";
import DatePicker from "antd/lib/date-picker";
import { Space, TimePicker } from "antd";
import { ScheduleGroup } from "../interface";
import Select from "antd/lib/select";
import { DEFAULT_GROUPS, FAKED } from "../../../../constants/constants";
import {
  handleAddGroup,
  handleRemoveGroup,
} from "../../../../utils/helper/FormHelper";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import classNames from "classnames";

export default function ScheduleForm(props) {
  const { form, activedFrequency, scheduleGroup, setScheduleGroup } = props;

  const onAddSchedule = () => {
    removeValidate();
    handleAddGroup(scheduleGroup, setScheduleGroup, DEFAULT_GROUPS);
  };

  const onRemoveGroup = (group) => {
    removeValidate();
    handleRemoveGroup(group, scheduleGroup, setScheduleGroup, resetGroup);
  };

  const resetGroup = (groupId) => {
    form.setFieldsValue({
      [activedFrequency + DYN_HOUR + groupId]: undefined,
      [DYN_DAY_IN_WEEK + groupId]: undefined,
      [DYN_DAY_IN_MONTH + groupId]: undefined,
      [DYN_CUSTOM_DAY + groupId]: undefined,
    });
  };

  const handleTimeChange = (value, id) => {
    removeValidate();
    form.setFieldValue(activedFrequency + DYN_HOUR + id, value);
  };

  const removeValidate = () => {
    form.setFields([{ name: SCHEDULE_FORM, value: FAKED, errors: [] }]);
  };

  let showAdd = true;
  let pickerName = "";
  let schedulePickerEl;

  switch (activedFrequency[0]) {
    case FREQUENCY_IDS.daily:
      break;
    case FREQUENCY_IDS.weekly:
      pickerName = DYN_DAY_IN_WEEK;
      schedulePickerEl = <SelectDayOnWeek onChange={() => removeValidate()} />;
      break;
    case FREQUENCY_IDS.monthly:
      pickerName = DYN_DAY_IN_MONTH;
      schedulePickerEl = (
        <Select
          placeholder="Day in month"
          className="!w-[130px]"
          onChange={() => removeValidate()}
        >
          {LIST_DAYS_IN_MONTH.map((data) => (
            <Select.Option value={data.value} key={data.value}>
              {data.label}
            </Select.Option>
          ))}
        </Select>
      );
      break;
    case FREQUENCY_IDS.custom:
      pickerName = DYN_CUSTOM_DAY;
      break;

    default:
      showAdd = false;
      break;
  }

  return (
    <Space direction="vertical">
      <Form.Item
        noStyle
        name={SCHEDULE_FORM}
        rules={[
          {
            message: "Please select a valid time",
            validator: (rule, value, callback) => {
              return new Promise((resolve, reject) => {
                const listData: any = [];
                scheduleGroup.forEach((el) => {
                  if (showAdd) {
                    const data = form.getFieldValue(
                      activedFrequency + DYN_HOUR + el.id
                    );
                    listData.push(data);
                  }

                  if (pickerName) {
                    const data2 = form.getFieldValue(pickerName + el.id);
                    listData.push(data2);
                  }
                });
                const hasErr = listData.some((el) => !el);

                if (!hasErr || !showAdd) {
                  resolve("");
                }
                reject();
              });
            },
          },
        ]}
      >
        <div>
          {scheduleGroup.map((group: ScheduleGroup, idx) => {
            const { id } = group;

            return (
              <div
                key={id}
                className={classNames(
                  idx !== scheduleGroup.length - 1 && "mb-2"
                )}
              >
                <Space className="group/schedule">
                  {pickerName && (
                    <Form.Item label={<></>} noStyle name={pickerName + id}>
                      {schedulePickerEl ? (
                        schedulePickerEl
                      ) : (
                        <DatePicker
                          className="!w-[130px]"
                          onChange={() => removeValidate()}
                        />
                      )}
                    </Form.Item>
                  )}
                  {showAdd && (
                    <Form.Item
                      label={<></>}
                      noStyle
                      name={activedFrequency + DYN_HOUR + id}
                    >
                      <TimePicker
                        format="HH:mm"
                        minuteStep={15}
                        showNow={false}
                        popupClassName="noFooterTimePick"
                        onSelect={(value) => handleTimeChange(value, id)}
                      />
                    </Form.Item>
                  )}
                  <div className="!ml-1">
                    {scheduleGroup?.length > 1 && (
                      <DeleteOutlined
                        className="cursor-pointer text-base mt-1"
                        onClick={() => onRemoveGroup(group)}
                      />
                    )}
                  </div>
                </Space>
              </div>
            );
          })}
        </div>
      </Form.Item>

      {showAdd && (
        <div className="text-link inline-block" onClick={onAddSchedule}>
          Add
        </div>
      )}
    </Space>
  );
}
