import Form from "antd/lib/form";
import React, { useEffect, useState } from "react";
import ButtonGroup, {
  getBtnGroupRule,
} from "../../../../partials/common/ButtonGroup/ButtonGroup";
import { ACTIONS, ACTION_IDS, TARGET_TYPE_IDS } from "../constants";
import { Space } from "antd";
import {
  BID_ADJUSTMENT,
  AdjustmentDrd,
  ADJUSTMENT_IDS,
} from "../../../../partials/common/Dropdowns/Dropdowns";
import { VALUE_REQUIRED } from "../../../../constants/formMessage";
import InputNumber from "antd/lib/input-number";
import {
  DEFAULT_BID_STEP,
  DEFAULT_BUDGET_STEP,
} from "../../../../constants/constants";
import classNames from "classnames";

export const DEFAULT_EDIT_MODE = ADJUSTMENT_IDS.inc;

export default function ActionsForm(props) {
  const { form, activedAction, setActivedAction, data, activedType } = props;

  useEffect(() => {
    if (!data?.id || !data?.actions?.length) return;
    const { actions } = data;

    const initedBid = actions.find(
      (el) => el.actionType === ACTION_IDS.editBid
    )?.adjustmentType;
    const initedBudget = actions.find(
      (el) => el.actionType === ACTION_IDS.editBudget
    )?.adjustmentType;

    if (initedBid) {
      const activedData = BID_ADJUSTMENT.find((el) => el.id === initedBid);
      const newData = activedData || BID_ADJUSTMENT[0];
      setBidData(newData);
    }
    if (initedBudget) {
      const activedData = BID_ADJUSTMENT.find((el) => el.id === initedBudget);
      const newData = activedData || BID_ADJUSTMENT[0];
      setBudgetData(newData);
    }
  }, [data]);

  const [bidData, setBidData] = useState<any>({});
  const [budgetData, setBudgetData] = useState<any>({});

  const onChangeBidMode = (newValue) => {
    const activedData = BID_ADJUSTMENT.find((el) => el.id === newValue);
    const newData = activedData || BID_ADJUSTMENT[0];
    setBidData(newData);

    form.setFieldsValue({
      bidEditMode: newValue,
      bidValue: newData.bidDefaultValue,
      maxBid: undefined,
    });
  };

  const onChangeBudgetMode = (newValue) => {
    const activedData = BID_ADJUSTMENT.find((el) => el.id === newValue);
    const newData = activedData || BID_ADJUSTMENT[0];
    setBudgetData(newData);

    form.setFieldsValue({
      budgetEditMode: newValue,
      budgetValue: newData.budgetDefaultValue,
      maxBudget: undefined,
    });
  };

  return (
    <>
      <Form.Item
        name="action"
        label="Actions"
        rules={[getBtnGroupRule(activedAction)]}
      >
        <Space direction="vertical" className="w-full">
          <ButtonGroup
            multiple
            data={getActions(activedType)}
            actived={activedAction}
            setActived={(newActions) => {
              setActivedAction(newActions);
              if (
                newActions?.includes(ACTION_IDS.editBid) &&
                !activedAction.includes(ACTION_IDS.editBid)
              ) {
                onChangeBidMode(DEFAULT_EDIT_MODE);
              }
              if (
                newActions?.includes(ACTION_IDS.editBudget) &&
                !activedAction.includes(ACTION_IDS.editBudget)
              ) {
                onChangeBudgetMode(DEFAULT_EDIT_MODE);
              }
            }}
          />

          {activedAction?.includes(ACTION_IDS.editBid) && (
            <div className="p-1 border border-dashed rounded mt-1">
              <div className="bg-neutral-100 p-3 pt-2.5 w-full">
                <div className="font-medium">Bid configuration</div>
                <div className="flex flex-wrap items-center -mx-1">
                  <Form.Item name="bidEditMode" noStyle>
                    <AdjustmentDrd
                      onChange={onChangeBidMode}
                      classNames={classNames(
                        "!mx-1 !mt-1",
                        data?.id ? "md:!w-[220px]" : "md:!w-[300px]"
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name="bidValue"
                    noStyle
                    rules={[{ required: true, message: VALUE_REQUIRED }]}
                  >
                    <InputNumber
                      min={0}
                      step={bidData?.bidStep}
                      addonAfter={bidData?.icon}
                      className="!max-w-[130px] !mx-1 !mt-1 custom-input-margin"
                      onPressEnter={(e) => e.preventDefault()}
                      controls={false}
                    />
                  </Form.Item>

                  <div className="!mx-1 !mt-1">
                    and the new Bid will be no more than
                  </div>
                  <Form.Item name="maxBid" noStyle>
                    <InputNumber
                      min={0}
                      step={DEFAULT_BID_STEP}
                      addonAfter="$"
                      className="!max-w-[110px] !mx-1 !mt-1 custom-input-margin"
                      onPressEnter={(e) => e.preventDefault()}
                      controls={false}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {activedAction?.includes(ACTION_IDS.editBudget) && (
            <div className="p-1 border border-dashed rounded mt-1">
              <div className="bg-neutral-100 p-3 pt-2.5 w-full">
                <div className="font-medium">Budget configuration</div>
                <div className="flex flex-wrap items-center -mx-1">
                  <Form.Item name="budgetEditMode" noStyle>
                    <AdjustmentDrd
                      onChange={onChangeBudgetMode}
                      classNames={classNames(
                        "!mx-1 !mt-1",
                        data?.id ? "md:!w-[220px]" : "md:!w-[300px]"
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    name="budgetValue"
                    noStyle
                    rules={[{ required: true, message: VALUE_REQUIRED }]}
                  >
                    <InputNumber
                      min={0}
                      step={budgetData?.budgetStep}
                      addonAfter={budgetData?.icon}
                      className="!max-w-[130px] !mx-1 !mt-1 custom-input-margin"
                      onPressEnter={(e) => e.preventDefault()}
                      controls={false}
                    />
                  </Form.Item>

                  <div className="!mx-1 !mt-1">
                    and the new Budget will be no more than
                  </div>
                  <Form.Item name="maxBudget" noStyle>
                    <InputNumber
                      min={0}
                      step={DEFAULT_BUDGET_STEP}
                      addonAfter="$"
                      className="!max-w-[110px] !mx-1 !mt-1 custom-input-margin"
                      onPressEnter={(e) => e.preventDefault()}
                      controls={false}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}
        </Space>
      </Form.Item>
    </>
  );
}

const getActions = (activedType) => {
  if (!activedType?.length) return ACTIONS;

  let actionIds: string[] = [ACTION_IDS.noti];
  switch (activedType[0]) {
    case TARGET_TYPE_IDS.campaigns:
    case TARGET_TYPE_IDS.sourceAndSite:
      actionIds = [
        ...actionIds,
        ACTION_IDS.run,
        ACTION_IDS.pause,
        // ACTION_IDS.editBid,
        // ACTION_IDS.editBudget,
      ];
      break;

    case TARGET_TYPE_IDS.geo:
      // actionIds = [...actionIds, ACTION_IDS.editBid, ACTION_IDS.editBudget];
      break;

    case TARGET_TYPE_IDS.adgroup:
      actionIds = [...actionIds, ACTION_IDS.run, ACTION_IDS.pause];
      break;

    case TARGET_TYPE_IDS.apps:
    default:
      break;
  }

  return ACTIONS.filter((el) => actionIds.includes(el.value));
};
