import React from "react";
import { bulkLink } from "../../../constants";
import Collapse from "antd/lib/collapse";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import classNames from "classnames";
import {
  PlusIcon,
  getGroupBudgetLocation,
  getGroupCountries,
} from "../../../Helpers";
import { RequiredMark } from "../../../../../../utils/helper/UIHelper";
import FormItem, { DYNAMIC_BUDGET, DYNAMIC_BUDGET_COUNTRIES } from "./FormItem";

function DailyBudgetGroup(props) {
  const {
    form,
    allCountries,
    budgetGroups,
    setBudgetGroups,
    activeKey,
    setActiveKey,
  } = props;

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
    const budget = form.getFieldValue(DYNAMIC_BUDGET + activedKey);

    if (!group?.countries?.length || !budget) {
      return form.validateFields([
        DYNAMIC_BUDGET_COUNTRIES + activedKey,
        DYNAMIC_BUDGET + activedKey,
      ]);
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
      },
      (err) => {}
    );
  };

  const onDeleteGroup = (event, groupId) => {
    event.stopPropagation();
    setBudgetGroups(budgetGroups.filter((el) => el.id !== groupId));
    form.setFieldsValue({
      [DYNAMIC_BUDGET_COUNTRIES + groupId]: undefined,
      [DYNAMIC_BUDGET + groupId]: undefined,
    });
  };

  const getGroupName = (id) => {
    const budget = form.getFieldValue(DYNAMIC_BUDGET + id);
    return " ($" + budget + ")";
  };

  return (
    <div className="border p-5 shadow-md rounded mb-6 max-w-3xl">
      <div className="mb-2">{RequiredMark} Budget by location</div>
      <Collapse
        className="!bg-transparent max-w-3xl not-custom-header-font"
        bordered={false}
        activeKey={activeKey}
        onChange={onChangeCollapse}
      >
        {budgetGroups?.map((budgetGroup) => {
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
            title += getGroupName(id);
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
              <FormItem
                budgetGroup={budgetGroup}
                listCountries={listCountries}
                onChangeGroup={onChangeCountriesInGroup}
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>
      <div className={bulkLink} onClick={onPlusGroup}>
        {PlusIcon}
        <span>Add budget by location</span>
      </div>
    </div>
  );
}

export default DailyBudgetGroup;
