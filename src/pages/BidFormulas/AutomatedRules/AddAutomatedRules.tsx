import React, { useState } from "react";
import Page from "../../../utils/composables/Page";
import Button from "antd/lib/button";
import Breadcrumb from "antd/lib/breadcrumb/Breadcrumb";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  ALL_NETWORK_OPTION,
  DEFAULT_GROUPS,
  FAKED,
  ORGANIZATION_PATH,
  USD,
} from "../../../constants/constants";
import Form from "antd/lib/form";
import FormAdd from "./FormAdd";
import Loading from "../../../utils/Loading";
import { TIME_UNIT_IDS } from "../../../partials/common/Dropdowns/TimeUnit";
import { ConditionGroup, ScheduleGroup } from "./interface";
import {
  ACTION_IDS,
  COMPARISON_IDS,
  DEFAULT_CONDITION_GROUPS,
  DYN_CUSTOM_DAY,
  DYN_DAY_IN_MONTH,
  DYN_DAY_IN_WEEK,
  DYN_HOUR,
  FREQUENCY_IDS,
} from "./constants";
import { ActivedType } from "../../../partials/common/ButtonGroup/ButtonGroup";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../partials/common/Forms/RangePicker";
import { RuleTabIds } from "../Rules";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import classNames from "classnames";
import Modal from "antd/lib/modal";
import { getSelectMultipleParams } from "../../../utils/Helpers";
import { DEFAULT_EDIT_MODE } from "./DynamicForms/ActionsForm";

export const FormAddAutomateRule = "FormAddAutomateRule";

function AddAutomatedRules(props) {
  const { data, isOpen, onClose, updateCb } = props;
  const isEdit = !!onClose;

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const [isLoading, setIsLoading] = useState(false);
  const [conditionGroup, setConditionGroup] = useState<ConditionGroup[]>(
    DEFAULT_CONDITION_GROUPS
  );
  const [scheduleGroup, setScheduleGroup] =
    useState<ScheduleGroup[]>(DEFAULT_GROUPS);
  const [formErrs, setFormErrs] = useState([]);

  const [activedCrc, setActivedCrc] = useState<ActivedType[]>([USD]);
  const [activedType, setActivedType] = useState<ActivedType[]>([]);
  const [activedAction, setActivedAction] = useState<ActivedType[]>([
    ACTION_IDS.noti,
  ]);
  const [activedFrequency, setActivedFrequency] = useState<ActivedType[]>([
    FREQUENCY_IDS.hourly,
  ]);
  const defaultTimes = [0, 0];
  const [activedConditionTime, setActivedConditionTime] =
    useState<ActivedType[]>(defaultTimes);

  const initialValues = {
    scheduleLabel: FAKED,
    frequency: 1,
    timeUnit: TIME_UNIT_IDS.hour,
    bidEditMode: DEFAULT_EDIT_MODE,
    budgetEditMode: DEFAULT_EDIT_MODE,
  };
  const RulePagePath = `${ORGANIZATION_PATH}/${organizationCode}/rules?tab=${RuleTabIds.automatedRules}`;

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      onResetPage();
    }, 300);
  };

  const onResetPage = () => {
    form.resetFields();
    setConditionGroup(DEFAULT_CONDITION_GROUPS);
    setScheduleGroup(DEFAULT_GROUPS);
    setActivedCrc([USD]);
    setActivedType([]);
    setActivedAction([ACTION_IDS.noti]);
    setActivedFrequency([FREQUENCY_IDS.hourly]);
    setActivedConditionTime(defaultTimes);
  };

  const onFinish = (values) => {
    const { name, target, networks, frequency, timeUnit } = values;

    const metricConditions = conditionGroup.map((group: ConditionGroup) => ({
      metric: group.metric,
      comparator: group.operator,
      value: group.value,
      selfCompare: group.compareObj === COMPARISON_IDS.selfCompare,
      dataFrom: Math.abs(group.dates![0]),
      dataTo: Math.abs(group.dates![1]),
    }));
    const condition = {
      dataFrom: Math.abs(Number(activedConditionTime[0])),
      dataTo: Math.abs(Number(activedConditionTime[1])),
      metricConditions,
    };

    const params = {
      name,
      networks: getSelectMultipleParams(networks, ALL_NETWORK_OPTION),
      targetType: target[0],
      currency: activedCrc[0],
      condition,
      actions: getActions(values),
      checkScheduled: getCheckSchedule(values),
      executionFrequency: {
        value: frequency,
        type: timeUnit,
      },
    };

    setIsLoading(true);
    if (isEdit) {
      service.put(`/automated-rules/${data.id}`, params).then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });
          onCloseModal();
          updateCb && updateCb(res.results);
        },
        () => setIsLoading(false)
      );
    } else {
      service.post("/automated-rules", params).then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });

          onResetPage();
          // setTimeout(() => {
          //   navigate(RulePagePath);
          // }, 1500);
        },
        () => setIsLoading(false)
      );
    }
  };

  const onFinishFailed = ({ values, errorFields, outOfDate }) => {
    setFormErrs(errorFields);
  };

  const getActions = (values) => {
    const {
      bidEditMode,
      bidValue,
      maxBid,
      budgetEditMode,
      budgetValue,
      maxBudget,
    } = values;
    const actions: any = [];

    activedAction.forEach((actionType: any) => {
      if (actionType === ACTION_IDS.editBid) {
        return actions.push({
          actionType: ACTION_IDS.editBid,
          adjustmentType: bidEditMode,
          adjustmentValue: bidValue,
          limitValue: maxBid,
        });
      }
      if (actionType === ACTION_IDS.editBudget) {
        return actions.push({
          actionType: ACTION_IDS.editBudget,
          adjustmentType: budgetEditMode,
          adjustmentValue: budgetValue,
          limitValue: maxBudget,
        });
      }

      return actions.push({ actionType: actionType });
    });

    return actions;
  };

  const getCheckSchedule = (values) => {
    const frequency = activedFrequency[0];
    let specificTimes: any = [];

    const getHour = (gId) => {
      const time = values[frequency + DYN_HOUR + gId];
      return time ? moment(time).hour() : "";
    };
    const getMinutes = (gId) => {
      const time = values[frequency + DYN_HOUR + gId];
      return time ? moment(time).minutes() : "";
    };
    const getCustomDate = (gId) => {
      const date = values[DYN_CUSTOM_DAY + gId];
      return date ? moment(date).format(DATE_RANGE_FORMAT) : "";
    };

    scheduleGroup.forEach((group) => {
      const minute = getMinutes(group.id);
      const hour = getHour(group.id);
      const dayOfWeek = values[DYN_DAY_IN_WEEK + group.id];
      const day = values[DYN_DAY_IN_MONTH + group.id];
      const date = getCustomDate(group.id);

      switch (frequency) {
        case FREQUENCY_IDS.daily:
          specificTimes.push({ minute, hour });
          break;
        case FREQUENCY_IDS.weekly:
          specificTimes.push({ minute, hour, dayOfWeek });
          break;
        case FREQUENCY_IDS.monthly:
          specificTimes.push({ minute, hour, day });
          break;
        case FREQUENCY_IDS.custom:
          specificTimes.push({ minute, hour, date });
          break;

        case FREQUENCY_IDS.hourly:
        default:
          specificTimes = undefined;
          break;
      }
    });

    return { frequency, specificTimes };
  };

  const btnClass = "xs:min-w-[100px] lg:min-w-[130px]";
  let labelCol = { xs: { span: 6 }, lg: { span: 4 }, xxl: { span: 3 } };
  let wrapperCol = { xs: { span: 18 }, lg: { span: 20 }, xxl: { span: 21 } };

  if (isEdit) {
    labelCol = { xs: { span: 8 }, lg: { span: 6 }, xxl: { span: 4 } };
    wrapperCol = { xs: { span: 16 }, lg: { span: 18 }, xxl: { span: 20 } };
  }

  const contentEl = (
    <>
      {isLoading && <Loading />}
      {!isEdit && (
        <div className="page-breadcrum">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to={RulePagePath}>Automated rules</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create automated rule</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      )}

      <div
        className={classNames(
          "flex-1",
          !isEdit && "px-4 sm:px-6 lg:px-8 py-4 mb-4"
        )}
      >
        {!isEdit && <div className="page-title">Create automated rule</div>}
        <div
          className={classNames(!isEdit && "bg-white rounded p-4 mt-3 shadow")}
        >
          <Form
            id={FormAddAutomateRule}
            labelAlign="left"
            colon={false}
            form={form}
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={initialValues}
          >
            <FormAdd
              setIsLoading={setIsLoading}
              form={form}
              conditionGroup={conditionGroup}
              setConditionGroup={setConditionGroup}
              setScheduleGroup={setScheduleGroup}
              scheduleGroup={scheduleGroup}
              activedCrc={activedCrc}
              setActivedCrc={setActivedCrc}
              activedType={activedType}
              setActivedType={setActivedType}
              activedAction={activedAction}
              setActivedAction={setActivedAction}
              activedFrequency={activedFrequency}
              setActivedFrequency={setActivedFrequency}
              activedConditionTime={activedConditionTime}
              setActivedConditionTime={setActivedConditionTime}
              data={data}
              isOpen={isOpen}
              formErrs={formErrs}
              setFormErrs={setFormErrs}
            />
          </Form>
        </div>
      </div>

      {!isEdit && (
        <div className="sticky bottom-0 left-0 right-0 lg:left-64 bg-white p-2 md:p-2.5 2xl:p-4 border-t z-40">
          <div className="flex justify-center space-x-3 xs:space-x-4 lg:space-x-6">
            <Link to={RulePagePath}>
              <Button className={btnClass}>Cancel</Button>
            </Link>
            {/* <Button type="dashed" className={btnClass}>
              Draft
            </Button> */}
            <Button
              type="primary"
              className={btnClass}
              key="submit"
              htmlType="submit"
              form={FormAddAutomateRule}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </>
  );

  if (!isEdit) return <Page>{contentEl}</Page>;

  return (
    <Modal
      title={`Edit ${data?.name}`}
      width={1000}
      open={isOpen}
      onCancel={onCloseModal}
      // "data" props không update -> ko re-init được form
      // cần dùng "key={data?.id}" or "destroyOnClose" để reload modal
      destroyOnClose
      footer={[
        <Button key="back" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          form={FormAddAutomateRule}
        >
          Save
        </Button>,
      ]}
    >
      {contentEl}
    </Modal>
  );
}

AddAutomatedRules.defaultProps = {
  data: {},
};

AddAutomatedRules.propTypes = {
  data: PropTypes.object,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  updateCb: PropTypes.func,
};

export default AddAutomatedRules;
