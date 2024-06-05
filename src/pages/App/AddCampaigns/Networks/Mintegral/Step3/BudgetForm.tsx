import React from "react";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import {
  ALL_AREA,
  AREA_OPTIONS,
  SHARED,
  bulkLink,
  defaultGroups,
} from "../../../constants";
import Radio from "antd/lib/radio";
import Collapse from "antd/lib/collapse";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import BudgetGroup, {
  DYNAMIC_BUDGET_COUNTRIES,
  DYNAMIC_BUDGET_TYPE,
} from "../../../components/BudgetGroup";
import classNames from "classnames";
import {
  PlusIcon,
  getGroupBudgetName,
  getGroupBudgetLocation,
  resetDynamicFields,
  getGroupCountries,
} from "../../../Helpers";
import { RequiredMark } from "../../../../../../utils/helper/UIHelper";
import DailyAndTotalBudgetForm, {
  DAILY_BUDGET,
  DAILY_CB,
  DYNAMIC_DAILY_BUDGET,
  DYNAMIC_DAILY_BUDGET_OPEN,
  DYNAMIC_TOTAL_BUDGET,
  DYNAMIC_TOTAL_BUDGET_OPEN,
  TOTAL_BUDGET,
  TOTAL_CB,
} from "../../../components/DailyAndTotalBudgetForm";

function BudgetForm(props) {
  const {
    form,
    formBudgetMode,
    allCountries,
    budgetGroups,
    setBudgetGroups,
    activeKey,
    setActiveKey,
  } = props;

  const onChangeDailyMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: DAILY_BUDGET, value: "", errors: [] },
      { name: DAILY_CB, value: checked },
    ]);
  };

  const onChangeTotalMode = (e) => {
    const { checked } = e.target;

    form.setFields([
      { name: TOTAL_BUDGET, value: "", errors: [] },
      { name: TOTAL_CB, value: checked },
    ]);
  };

  const onChangeBudgetMode = (e) => {
    // Init lại budget form
    if (e.target.value === ALL_AREA) {
      onChangeTotalMode({ target: { checked: true } });
    } else {
      // BudgetMode = SPECIAL_AREA: Luôn có ít nhất 1 group
      form.setFieldsValue({
        [DYNAMIC_BUDGET_TYPE + "0"]: SHARED,
        [DYNAMIC_DAILY_BUDGET_OPEN + "0"]: false,
        [DYNAMIC_TOTAL_BUDGET_OPEN + "0"]: true,
      });

      resetDynamicFields(form, [
        DYNAMIC_BUDGET_COUNTRIES,
        DYNAMIC_DAILY_BUDGET,
        DYNAMIC_TOTAL_BUDGET,
      ]);

      setBudgetGroups(defaultGroups);
      setActiveKey([defaultGroups[0].id]);
    }
  };

  const onChangeCountriesInGroup = (groupId, value) => {
    const newGroup = budgetGroups.map((el) => {
      if (el.id !== groupId) return el;
      return { ...el, countries: value };
    });
    setBudgetGroups(newGroup);
  };

  const onChangeCollapse = async (newStrKeys) => {
    const newKeys = newStrKeys.map((groupId) => Number(groupId));
    const setKey = () => {
      if (!newKeys.length) {
        setActiveKey([]);
      } else {
        setActiveKey(newKeys);
      }
    };

    if (newKeys.length < activeKey.length) {
      // Collapse action: ko cho collapse khi data đang rỗng (form error)
      const activedKey = activeKey.find((key) => !newKeys.includes(key));
      const activedGroup = budgetGroups.find((el) => el.id === activedKey);

      return checkFormErr(activedGroup).then((res) => {
        setKey();
      });
    }

    setKey();
  };

  const checkFormErr = async (group) => {
    const activedKey = group.id;
    const dailyCb = form.getFieldValue(DYNAMIC_DAILY_BUDGET_OPEN + activedKey);
    const totalCb = form.getFieldValue(DYNAMIC_TOTAL_BUDGET_OPEN + activedKey);
    const daily = form.getFieldValue(DYNAMIC_DAILY_BUDGET + activedKey);
    const total = form.getFieldValue(DYNAMIC_TOTAL_BUDGET + activedKey);

    if (
      !group?.countries?.length ||
      (!totalCb && !total) ||
      (!dailyCb && !daily)
    ) {
      const validatedFields = [
        DYNAMIC_BUDGET_COUNTRIES + activedKey,
        DYNAMIC_DAILY_BUDGET + activedKey,
        DYNAMIC_TOTAL_BUDGET + activedKey,
      ];
      return form.validateFields(validatedFields);
    }
  };

  const onPlusGroup = async () => {
    const lastGroup = budgetGroups[budgetGroups.length - 1];
    const newId = lastGroup.id + 1;

    const listPromises: any = [];
    budgetGroups.forEach((group) => {
      listPromises.push(checkFormErr(group));
    });
    Promise.all(listPromises).then(
      (res) => {
        setBudgetGroups([...budgetGroups, { id: newId }]);
        setActiveKey([newId]);
        form.setFieldsValue({
          [DYNAMIC_BUDGET_TYPE + newId]: SHARED,
          [DYNAMIC_DAILY_BUDGET_OPEN + newId]: false,
          [DYNAMIC_TOTAL_BUDGET_OPEN + newId]: true,
        });
      },
      (err) => {}
    );
  };

  const onDeleteGroup = (event, groupId) => {
    event.stopPropagation();
    setBudgetGroups(budgetGroups.filter((el) => el.id !== groupId));
    form.setFieldsValue({
      [DYNAMIC_BUDGET_TYPE + groupId]: undefined,
      [DYNAMIC_BUDGET_COUNTRIES + groupId]: undefined,
      [DYNAMIC_TOTAL_BUDGET_OPEN + groupId]: undefined,
      [DYNAMIC_DAILY_BUDGET_OPEN + groupId]: undefined,
      [DYNAMIC_DAILY_BUDGET + groupId]: undefined,
      [DYNAMIC_TOTAL_BUDGET + groupId]: undefined,
    });
  };

  return (
    <>
      <Form.Item
        label="Budget"
        name="budgetEl"
        rules={[{ required: true }]}
        className="!h-0 !mb-0"
      >
        <Select className="!hidden" />
      </Form.Item>
      <Form.Item
        name="budgetMode"
        label={<></>}
        colon={false}
        className="!mb-4 max-w-3xl"
        labelCol={{ sm: { span: 4 }, xs: { span: 8 } }}
        wrapperCol={{ sm: { span: 20 }, xs: { span: 16 } }}
      >
        <Radio.Group onChange={onChangeBudgetMode}>
          {AREA_OPTIONS.map((el) => (
            <Radio.Button value={el.value} key={el.value}>
              {el.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      <div className="border p-5 shadow-md rounded mb-6 max-w-3xl">
        {formBudgetMode === ALL_AREA ? (
          <DailyAndTotalBudgetForm
            form={form}
            onChangeDailyMode={onChangeDailyMode}
            onChangeTotalMode={onChangeTotalMode}
          />
        ) : (
          <>
            {budgetGroups?.length > 0 && (
              <>
                <div className="mb-2">{RequiredMark} Budget by location</div>
                <Collapse
                  className="!bg-transparent max-w-3xl not-custom-header-font"
                  bordered={false}
                  activeKey={activeKey}
                  onChange={onChangeCollapse}
                >
                  {budgetGroups.map((budgetGroup) => {
                    const { id, countries } = budgetGroup;
                    const isShowCollapsedData = !activeKey?.includes(id);
                    const listCountries = getGroupCountries(
                      budgetGroups,
                      id,
                      allCountries
                    );

                    let title = "Group";
                    let locationText = "";
                    if (isShowCollapsedData) {
                      title += getGroupBudgetName(form, id);
                      locationText = getGroupBudgetLocation(countries);
                    }

                    return (
                      <Collapse.Panel
                        forceRender
                        key={id}
                        header={title}
                        className={classNames(
                          "!border-0 !bg-gray-100/60 !rounded last:!mb-1",
                          id && "!mt-1.5"
                        )}
                        extra={
                          <>
                            {isShowCollapsedData && locationText}
                            {budgetGroups.length > 1 && (
                              <CloseOutlined
                                className="pl-2"
                                title="Delete group"
                                onClick={(e) => onDeleteGroup(e, id)}
                              />
                            )}
                          </>
                        }
                      >
                        <BudgetGroup
                          form={form}
                          budgetGroup={budgetGroup}
                          listCountries={listCountries}
                          onChangeCountriesInGroup={onChangeCountriesInGroup}
                        />
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </>
            )}
            <div className={bulkLink} onClick={onPlusGroup}>
              {PlusIcon}
              <span>Add budget by location</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default BudgetForm;
