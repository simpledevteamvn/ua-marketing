import Form from "antd/lib/form";
import React, { useEffect, useState } from "react";
import { FIELD_REQUIRED } from "../../../constants/formMessage";
import AntInput from "antd/lib/input/Input";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import { useQuery } from "@tanstack/react-query";
import { LIST_AD_NETWORK } from "../../../api/constants.api";
import { getListAdNetwork } from "../../../api/common/common.api";
import service from "../../../partials/services/axios.config";
import ButtonGroup, {
  ButtonGroupData,
  getGroupData,
  getBtnGroupRule,
} from "../../../partials/common/ButtonGroup/ButtonGroup";
import { Divider, Space } from "antd";
import {
  DYN_METRIC,
  DEFAULT_CONDITION_GROUPS,
  FREQUENCIES,
  DYN_HOUR,
  DYN_DAY_IN_WEEK,
  DYN_DAY_IN_MONTH,
  DYN_CUSTOM_DAY,
  CONDITION_FORM,
  SCHEDULE_FORM,
  DYN_VALUE,
  COMPARISON_IDS,
  DYN_OPERATOR,
  DYN_COMPARISON_OBJ,
  ACTION_IDS,
  FREQUENCY_IDS,
} from "./constants";
import { ConditionGroup } from "./interface";
import InputNumber from "antd/lib/input-number";
import ConditionForm from "./DynamicForms/ConditionForm";
import { getMetricGroup } from "./Helpers";
import TimeUnit from "../../../partials/common/Dropdowns/TimeUnit";
import ScheduleForm from "./DynamicForms/ScheduleForm";
import { DEFAULT_GROUPS, FAKED } from "../../../constants/constants";
import ActionsForm from "./DynamicForms/ActionsForm";
import DateAgoPicker from "../../../partials/common/DateAgoPicker/DateAgoPicker";
import moment from "moment";

export default function FormAdd(props) {
  const {
    setIsLoading,
    form,
    conditionGroup,
    setConditionGroup,
    scheduleGroup,
    setScheduleGroup,
    activedCrc,
    setActivedCrc,
    activedType,
    setActivedType,
    activedAction,
    setActivedAction,
    activedFrequency,
    setActivedFrequency,
    activedConditionTime,
    setActivedConditionTime,
    data,
    formErrs,
    setFormErrs,
  } = props;

  const [listAdNetwork, setListAdNetwork] = useState([]);

  const [metrics, setMetrics] = useState<any>([]);
  const [targetTypes, setTargetTypes] = useState<ButtonGroupData[]>([]);
  const [currencies, setCurrencies] = useState<ButtonGroupData[]>([]);
  const [inited, setInited] = useState(false);

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);

  useEffect(() => {
    setIsLoading(true);
    const getTargetTypes = service.get("/automated-rules/target-types");
    const getMetrics = service.get("/automated-rules/metrics");
    const getCurrency = service.get("/exchange-rate");

    Promise.all([getTargetTypes, getMetrics, getCurrency]).then(
      (res: any) => {
        setIsLoading(false);
        setTargetTypes(getGroupData(res[0].results));
        setMetrics(res[1].results);

        const crcData = getGroupData(res[2].results, "currency");
        setCurrencies(crcData);
        setActivedCrc([crcData[0]?.value]);
        setInited(true);
      },
      () => setIsLoading(false)
    );
  }, []);

  useEffect(() => {
    if (!inited || !data?.id) return;
    const {
      name,
      networks,
      target,
      currency,
      condition,
      actions,
      executionFrequency,
      checkScheduled,
    } = data;
    const targetType = target?.targetType;

    let initedData: any = { name, networks };
    let newConditions: any = [];

    if (targetType) {
      setActivedType([targetType]);
      initedData = { ...initedData, target: [targetType] };
    }

    if (condition) {
      const { dataFrom, dataTo, metricConditions } = condition;
      setActivedConditionTime([-dataFrom, -dataTo]);

      if (metricConditions?.length) {
        metricConditions.forEach((obj, id) => {
          const { metric, comparator, selfCompare, value, dataFrom, dataTo } =
            obj;
          const compareObj = selfCompare
            ? COMPARISON_IDS.selfCompare
            : COMPARISON_IDS.value;

          newConditions.push({
            id,
            metric,
            operator: comparator,
            compareObj,
            dates: [-dataFrom, -dataTo],
            value,
          });
          initedData = {
            ...initedData,
            [DYN_METRIC + id]: metric,
            [DYN_OPERATOR + id]: comparator,
            [DYN_COMPARISON_OBJ + id]: compareObj,
            [DYN_VALUE + id]: value,
          };
        });
      }
    }

    if (actions?.length) {
      let listActions: any = [];
      let bidData;
      let budgetData;

      actions.forEach((obj) => {
        listActions.push(obj.actionType);
        if (obj.actionType === ACTION_IDS.editBid) {
          bidData = obj;
        } else if (obj.actionType === ACTION_IDS.editBudget) {
          budgetData = obj;
        }
      });

      setActivedAction(listActions);
      if (bidData) {
        const { adjustmentType, adjustmentValue, limitValue } = bidData;
        initedData = {
          ...initedData,
          bidEditMode: adjustmentType,
          bidValue: adjustmentValue,
          maxBid: limitValue,
        };
      }
      if (budgetData) {
        const { adjustmentType, adjustmentValue, limitValue } = budgetData;
        initedData = {
          ...initedData,
          budgetEditMode: adjustmentType,
          budgetValue: adjustmentValue,
          maxBudget: limitValue,
        };
      }
    }

    if (executionFrequency) {
      const { value, type } = executionFrequency;
      initedData = { ...initedData, frequency: value, timeUnit: type };
    }

    let newSchedules: any = [];
    if (checkScheduled) {
      const { frequency, specificTimes } = checkScheduled;
      setActivedFrequency([frequency]);

      if (specificTimes?.length) {
        specificTimes.forEach((timeObj, id) => {
          const { time, dayOfWeek, day, dateTime } = timeObj;
          newSchedules.push({ id });
          let hourTime;
          if (time) {
            hourTime = {
              [frequency + DYN_HOUR + id]: moment("1970-01-01 " + time + ":00"),
            };
          }

          switch (frequency) {
            case FREQUENCY_IDS.daily:
              initedData = { ...initedData, ...hourTime };
              break;
            case FREQUENCY_IDS.weekly:
              initedData = {
                ...initedData,
                ...hourTime,
                [DYN_DAY_IN_WEEK + id]: dayOfWeek,
              };
              break;
            case FREQUENCY_IDS.monthly:
              initedData = {
                ...initedData,
                ...hourTime,
                [DYN_DAY_IN_MONTH + id]: day,
              };
              break;
            case FREQUENCY_IDS.custom:
              if (dateTime) {
                initedData = {
                  ...initedData,
                  ...hourTime,
                  [DYN_CUSTOM_DAY + id]: moment(dateTime),
                };
              }
              break;

            case FREQUENCY_IDS.hourly:
            default:
              break;
          }
        });
      }
    }

    setActivedCrc([currency]);
    newConditions.length && setConditionGroup(newConditions);
    newSchedules.length && setScheduleGroup(newSchedules);

    form.setFieldsValue(initedData);
  }, [inited, data]);

  const updateScheduleFrequency = (value) => {
    let oldFields: any = [];
    scheduleGroup.map((el) => {
      const { id } = el;
      const newFields = [
        {
          name: activedFrequency + DYN_HOUR + id,
          value: undefined,
          errors: [],
        },
        { name: DYN_DAY_IN_WEEK + id, value: undefined, errors: [] },
        { name: DYN_DAY_IN_MONTH + id, value: undefined, errors: [] },
        { name: DYN_CUSTOM_DAY + id, value: undefined, errors: [] },
        { name: SCHEDULE_FORM, value: FAKED, errors: [] },
      ];
      oldFields = [...oldFields, ...newFields];
    });
    form.setFields(oldFields);

    setActivedFrequency(value);
    setScheduleGroup(DEFAULT_GROUPS);
  };

  const onAddConditionGroup = () => {
    const lastGroup = conditionGroup[conditionGroup.length - 1];
    const newId = lastGroup.id + 1;

    const newGroups = [
      ...conditionGroup,
      { ...DEFAULT_CONDITION_GROUPS[0], id: newId },
    ];
    setConditionGroup(newGroups);
    setFormErrs([]);
    form.setFields([{ name: CONDITION_FORM, value: FAKED, errors: [] }]);
  };

  const maxWidthClass = "max-w-[500px]";
  const titleClass = "font-semibold text-base mb-4";
  const sessionWrapperClass = "lg:ml-2";
  const hasError = formErrs?.some((el) => el.name?.[0] === CONDITION_FORM);

  return (
    <>
      <div className={titleClass}>Basic info</div>
      <div className={sessionWrapperClass}>
        <Form.Item
          name="name"
          label="Rule name"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <AntInput
            allowClear
            placeholder="Enter a name"
            className={maxWidthClass}
          />
        </Form.Item>

        <Form.Item
          name="networks"
          label="Networks"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <SelectNetwork
            listNetwork={listAdNetwork}
            classNames={maxWidthClass}
          />
        </Form.Item>

        <Form.Item
          name="target"
          label="Target type"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <ButtonGroup
            data={targetTypes}
            actived={activedType}
            setActived={(v) => {
              setActivedAction([ACTION_IDS.noti]);
              setActivedType(v);
              form.setFields([{ name: "target", value: v, errors: [] }]);
            }}
          />
        </Form.Item>

        <Form.Item
          name="currency"
          label="Currency"
          rules={[getBtnGroupRule(activedCrc)]}
        >
          <ButtonGroup
            data={currencies}
            actived={activedCrc}
            setActived={setActivedCrc}
          />
        </Form.Item>
      </div>
      <Divider />

      <div className={titleClass}>Conditions</div>
      <div className={sessionWrapperClass}>
        <Form.Item label="Date time">
          <DateAgoPicker
            value={activedConditionTime}
            onChange={setActivedConditionTime}
          />
        </Form.Item>

        <Form.Item
          name={CONDITION_FORM}
          label="Conditions"
          required
          rules={[
            {
              message: "Please select a metric",
              validator: (rule, value, callback) => {
                return new Promise((resolve, reject) => {
                  conditionGroup.forEach((el) => {
                    const data = form.getFieldValue(DYN_METRIC + el.id);
                    if (!data) return reject();
                  });
                  resolve("");
                });
              },
            },
            {
              message: "The value must be greater than 0",
              validator: (rule, value, callback) => {
                return new Promise((resolve, reject) => {
                  conditionGroup.forEach((el) => {
                    const data = form.getFieldValue(DYN_VALUE + el.id);
                    if (!data) return reject();
                  });
                  resolve("");
                });
              },
            },
          ]}
        >
          <div>
            {conditionGroup.map((group: ConditionGroup, idx) => {
              const crrMetrics = getMetricGroup(conditionGroup, idx, metrics);

              return (
                <ConditionForm
                  data={data}
                  key={idx}
                  idx={idx}
                  group={group}
                  form={form}
                  metrics={crrMetrics}
                  conditionGroup={conditionGroup}
                  setConditionGroup={setConditionGroup}
                  hasError={hasError}
                  setFormErrs={setFormErrs}
                />
              );
            })}
            <div
              className="text-link inline-block mt-2"
              onClick={onAddConditionGroup}
            >
              Add
            </div>
          </div>
        </Form.Item>
      </div>
      <Divider />

      <div className={titleClass}>Actions</div>
      <div className={sessionWrapperClass}>
        <ActionsForm
          form={form}
          data={data}
          activedType={activedType}
          activedAction={activedAction}
          setActivedAction={setActivedAction}
        />
      </div>
      <Divider />

      <div className={titleClass}>Execution frequency</div>
      <div className="lg:ml-3">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:space-x-2">
          <span>
            If the monitored object meets the conditions in multiple checks, the
            action will be executed only once in
            {window.innerWidth > 1536 ? "" : ":"}
          </span>
          <div className="flex items-center space-x-2 mt-0.5 2xl:mt-0">
            <Form.Item label={<></>} noStyle name="frequency">
              <InputNumber
                min={1}
                step={1}
                className="!w-[40px] !text-xs2 input-number-center !rounded-[4px]"
                size="small"
                controls={false}
              />
            </Form.Item>
            <Form.Item label={<></>} noStyle name="timeUnit">
              <TimeUnit />
            </Form.Item>
          </div>
        </div>
      </div>
      <Divider />

      <div className={titleClass}>Schedule</div>
      <div className={sessionWrapperClass}>
        <Form.Item
          name="scheduleLabel"
          label="Check frequency"
          className="!mb-2"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <Space direction="vertical">
            <Form.Item noStyle name="scheduleFrequency" label={<></>}>
              <ButtonGroup
                data={FREQUENCIES}
                actived={activedFrequency}
                setActived={updateScheduleFrequency}
              />
            </Form.Item>
            <ScheduleForm
              form={form}
              activedFrequency={activedFrequency}
              scheduleGroup={scheduleGroup}
              setScheduleGroup={setScheduleGroup}
            />
          </Space>
        </Form.Item>
      </div>
    </>
  );
}
