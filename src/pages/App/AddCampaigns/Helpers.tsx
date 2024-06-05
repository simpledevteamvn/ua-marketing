import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Button from "antd/lib/button/button";
import React, { useEffect, useState } from "react";
import { DYNAMIC_BUDGET_TYPE } from "./components/BudgetGroup";
import {
  DYNAMIC_DAILY_BUDGET,
  DYNAMIC_DAILY_BUDGET_OPEN,
} from "./components/DailyAndTotalBudgetForm";
import Select from "antd/lib/select";
import { DATE_RANGE_FORMAT } from "../../../partials/common/Forms/RangePicker";
import moment from "moment";
import { DYNAMIC_BUDGET } from "./Networks/Applovin/DailyBudgetGroup/FormItem";

export const PlusIcon = <PlusOutlined className="mr-1 !font-light !text-xs2" />;

export const getControlBtns = ({ current, steps, prev }) => (
  <div className="flex space-x-4 mb-1">
    {current > 0 && (
      <Button className="min-w-[120px]" onClick={prev}>
        {/* Todo: confirm not saved */}
        Previous
      </Button>
    )}
    {current <= steps.length - 1 && (
      <Button
        type="primary"
        className="min-w-[120px]"
        htmlType="submit"
        form={"FormStep" + (current + 1)}
      >
        {current === steps.length - 1 ? "Create" : "Next"}
      </Button>
    )}
  </div>
);

export const getGroupBudgetName = (form, id) => {
  const budgetType = form.getFieldValue(DYNAMIC_BUDGET_TYPE + id);
  const dailyBudget = form.getFieldValue(DYNAMIC_DAILY_BUDGET + id);
  const isOpenDailyBudget = form.getFieldValue(DYNAMIC_DAILY_BUDGET_OPEN + id);
  let title = ` (${budgetType}; Daily: `;

  if (dailyBudget) {
    title += "$" + dailyBudget + ")";
  } else if (isOpenDailyBudget) {
    title += "Open budget)";
  }
  return title;
};

export const getGroupBudgetLocation = (countries) => {
  let locationText = "";
  if (countries?.length) {
    locationText = "Location: " + countries.slice(0, 5).join(",");
    if (countries.length > 5) {
      locationText += "...";
    }
  }
  return locationText;
};

export const getGroupCountries = (groupData, id, allCountries) => {
  let listCountries = allCountries || [];
  groupData.forEach((group) => {
    const gCountries = group.countries || [];
    if (!gCountries?.length || id === group.id) return;
    listCountries = listCountries.filter((el) => !gCountries?.includes(el));
  });
  return listCountries;
};

export const getNetworkConnector = (list) => {
  return (
    <>
      {list?.length > 0 &&
        list.map((data: any, idx) => {
          const networkConnectorName = data.networkConnector?.name;
          const appName = data.name;
          const imgUrl = data.networkConnector?.network?.imageUrl;

          return (
            <Select.Option value={data.id} key={idx}>
              <div className="flex items-center">
                {imgUrl && (
                  <img src={imgUrl} alt=" " className="h-5 w-5 mr-1.5" />
                )}
                {networkConnectorName} - {appName}
              </div>
            </Select.Option>
          );
        })}
    </>
  );
};

export const getEndDate = (endDate) =>
  endDate ? moment(endDate).format(DATE_RANGE_FORMAT) : undefined;

export const backActionHook = (
  form,
  onPrev,
  countBackAction,
  additionalStates: any = {}
) => {
  const [crrCountPrev, setCrrCountPrev] = useState(countBackAction);

  useEffect(() => {
    if (countBackAction > crrCountPrev) {
      const stepData = { ...form.getFieldsValue(true), ...additionalStates };
      onPrev(stepData);
      setCrrCountPrev(countBackAction);
    }
  }, [countBackAction]);
};

export const resetDynamicFields = (form, targetedFields) => {
  const listFileds = form.getFieldsValue(true);
  const dynamicFields = Object.keys(listFileds || {}).filter((field) =>
    targetedFields.some((dField) => {
      if (!field.startsWith(dField)) return false;
      const restStr = field.slice(dField.length);
      return !isNaN(Number(restStr));
    })
  );

  if (dynamicFields?.length) {
    dynamicFields.forEach((field) => {
      form.setFieldValue(field, undefined);
    });
  }
};

export const getDynamicFieldFromGroup = (
  group,
  dynamicNames: string[] = []
) => {
  if (!group?.length || !dynamicNames?.length) return {};

  const groupIds = group.map((el) => el.id);
  const dynamicFields = {};

  groupIds.forEach((groupId) => {
    dynamicNames.forEach((field) => {
      dynamicFields[field + groupId] = undefined;
    });
  });

  return dynamicFields;
};

// Chỉ lấy một budget là dailyBudget
// Networks: Applovin
export const getCountriesBudget = (stepData, groupData) => {
  const countriesBudget: any = [];

  if (groupData?.length) {
    for (let i = 0; i < groupData.length; i++) {
      const getField = (dynamicText) =>
        stepData[dynamicText + groupData[i]?.id];

      const countries = groupData[i].countries || [];
      countries.forEach((country) => {
        countriesBudget.push({
          dailyBudget: getField(DYNAMIC_BUDGET),
          country,
        });
      });
    }
  }

  return countriesBudget?.length ? countriesBudget : undefined;
};
