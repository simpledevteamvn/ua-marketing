import React, { useEffect } from "react";
import { ConditionGroup } from "../interface";
import Form from "antd/lib/form";
import {
  COMPARATOR,
  DEFAULT_CONDITION_GROUPS,
  DYN_COMPARISON_OBJ,
  DYN_METRIC,
  DYN_OPERATOR,
  DYN_VALUE,
  COMPARISON_IDS,
  CONDITION_FORM,
  COMPARISON_OPTS,
} from "../constants";
import Select from "antd/lib/select";
import InputNumber from "antd/lib/input-number";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import DateAgoPicker from "../../../../partials/common/DateAgoPicker/DateAgoPicker";
import { FAKED } from "../../../../constants/constants";
import classNames from "classnames";

export default function ConditionForm(props) {
  const {
    idx,
    group,
    form,
    metrics,
    conditionGroup,
    setConditionGroup,
    data,
    hasError,
    setFormErrs,
  } = props;
  const { id, metric, operator, compareObj, dates, value } = group;
  const defaultGroup = DEFAULT_CONDITION_GROUPS[0];

  const formMetric = Form.useWatch(DYN_METRIC + id, form);

  useEffect(() => {
    // Những group đầu (dựa theo data của api) là ko cần init, nhưng các group sau khi ấn add vẫn cần init
    if (data?.id) {
      const totalGroup = data.condition?.metricConditions?.length || 1;
      if (totalGroup > id) {
        return;
      }
    }
    initDynamicFields();
  }, [id]);

  const initDynamicFields = (crrId = id) => {
    form.setFieldsValue({
      [DYN_METRIC + crrId]: undefined,
      [DYN_OPERATOR + crrId]: defaultGroup.operator,
      [DYN_COMPARISON_OBJ + crrId]: defaultGroup.compareObj,
      [DYN_VALUE + crrId]: defaultGroup.value,
    });
  };

  const onRemoveGroup = (group: ConditionGroup) => {
    setFormErrs([]);
    form.setFields([{ name: CONDITION_FORM, value: FAKED, errors: [] }]);
    if (conditionGroup.length === 1) {
      const id = conditionGroup[0].id;
      initDynamicFields(id);
      return setConditionGroup([{ id }]);
    }
    setConditionGroup(conditionGroup.filter((el) => el.id !== group.id));
  };

  const onChangeGroup = (value, field = "metric") => {
    setConditionGroup(
      conditionGroup.map((el, id) =>
        idx === id ? { ...el, [field]: value } : el
      )
    );
    form.setFields([{ name: CONDITION_FORM, value: FAKED, errors: [] }]);
    setFormErrs([]);
  };

  const isSelfCompare = compareObj === COMPARISON_IDS.selfCompare;
  let listComparison: any = COMPARISON_OPTS;

  if (formMetric) {
    listComparison = [
      ...COMPARISON_OPTS,
      { label: formMetric, value: COMPARISON_IDS.selfCompare },
    ];
  }

  return (
    <div
      className={classNames(
        "flex flex-wrap items-center !-mx-0.5",
        !idx && "!-mt-1"
      )}
    >
      <Form.Item name={DYN_METRIC + id} noStyle>
        <Select
          placeholder="Select metric"
          className="!w-[200px] !mx-0.5 !mt-1"
          onChange={(v) => onChangeGroup(v)}
        >
          {metrics?.map((metric, idx) => (
            <Select.Option value={metric} key={idx}>
              {metric}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name={DYN_OPERATOR + id} noStyle validateStatus="warning">
        <Select
          className="!w-[80px] !mx-0.5 !mt-1"
          onChange={(v) => onChangeGroup(v, "operator")}
        >
          {COMPARATOR.map((data, idx) => (
            <Select.Option value={data?.value} key={idx}>
              {data.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name={DYN_COMPARISON_OBJ + id}
        noStyle
        validateStatus="warning"
      >
        <Select
          className="!w-[160px] !mx-0.5 !mt-1"
          onChange={(v) => onChangeGroup(v, "compareObj")}
        >
          {listComparison.map((data, idx) => (
            <Select.Option value={data?.value} key={idx}>
              {data.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {isSelfCompare && (
        <div className="!mx-0.5 !mt-1">
          <DateAgoPicker
            hasError={hasError}
            value={dates}
            onChange={(v) => onChangeGroup(v, "dates")}
          />
        </div>
      )}

      <Form.Item noStyle name={DYN_VALUE + id}>
        <InputNumber
          min={0}
          onChange={(v) => onChangeGroup(v, "value")}
          onPressEnter={(e) => e.preventDefault()}
          addonAfter={isSelfCompare ? "%" : undefined}
          className={classNames(
            "w-[90px] !mx-0.5 !mt-1",
            isSelfCompare && "custom-input-margin"
          )}
          controls={false}
        />
      </Form.Item>
      {conditionGroup.length > 1 && (
        <DeleteOutlined
          className="cursor-pointer text-base !ml-3 !mx-0.5 !mt-1"
          onClick={() => onRemoveGroup(group)}
        />
      )}
    </div>
  );
}
