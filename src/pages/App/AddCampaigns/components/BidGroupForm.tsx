import React from "react";
import Collapse from "antd/lib/collapse";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import classNames from "classnames";
import { RequiredMark } from "../../../../utils/helper/UIHelper";
import BidRateGroup, {
  DYNAMIC_BASE_BID,
  DYNAMIC_BID,
  DYNAMIC_COUNTRIES,
  DYNAMIC_GOAL,
  DYNAMIC_MAX_BID,
} from "./BidRateGroup";
import { bulkLink } from "../constants";
import { PlusIcon, getGroupCountries } from "../Helpers";
import {
  BID_RETENSION_TYPE,
  BID_ROAS_TYPE,
} from "../../../../constants/constants";
import { BidGroup } from "../interface";

export const resetBidGroupForm = (form, groupId) => {
  form.setFieldsValue({
    [DYNAMIC_COUNTRIES + groupId]: undefined,
    [DYNAMIC_BID + groupId]: undefined,
    [DYNAMIC_GOAL + groupId]: undefined,
    [DYNAMIC_BASE_BID + groupId]: undefined,
    [DYNAMIC_MAX_BID + groupId]: undefined,
  });
};

export const onPlusGroup = ({
  type,
  bidGroups,
  setBidGroups,
  setActiveKey,
}) => {
  if (!bidGroups?.length) {
    setBidGroups([{ id: 0 }]);
    setActiveKey([0]);
    return;
  }

  const lastGroup = bidGroups[bidGroups.length - 1];
  const newId = lastGroup.id + 1;
  const hasErrForm = bidGroups.some((group) => {
    if (!group.countries?.length) return true;
    if (type === BID_ROAS_TYPE) return !group.goal || !group.maxBid;
    if (type === BID_RETENSION_TYPE) return !group.baseBid || !group.maxBid;
    return !group.bid;
  });
  if (hasErrForm) return;

  setBidGroups([...bidGroups, { id: newId }]);
  setActiveKey([newId]);
};

export const addBidGroupLink = (params: any = {}) => (
  <div className={bulkLink} onClick={() => onPlusGroup(params)}>
    {PlusIcon}
    <span>Add bid rate by location</span>
  </div>
);

function BidGroupForm(props) {
  const {
    type,
    form,
    className,
    activeKey,
    setActiveKey,
    bidGroups,
    setBidGroups,
    allCountries = [],
    title = "Bid by location",
  } = props;

  const onChangeGroup = (bidGroup, value, field = "countries") => {
    const newGroup = bidGroups.map((el) => {
      if (el.id !== bidGroup.id) return el;
      return { ...el, [field]: value };
    });
    setBidGroups(newGroup);
  };

  const onDeleteGroup = (event, groupId) => {
    event.stopPropagation();
    setBidGroups(bidGroups.filter((el) => el.id !== groupId));
    resetBidGroupForm(form, groupId);
  };

  const onChangeCollapse = (newStrKeys) => {
    const newKeys = newStrKeys.map((groupId) => Number(groupId));

    if (newKeys.length < activeKey.length) {
      // Collapse action: ko cho collapse khi data đang rỗng (form error)
      const activedKey = activeKey.find((key) => !newKeys.includes(key));
      const activedGroup = bidGroups.find((el) => el.id === activedKey);

      if (!activedGroup?.countries?.length) return;
      if (
        type === BID_ROAS_TYPE &&
        !activedGroup?.goal &&
        !activedGroup?.maxBid
      ) {
        return;
      }
      if (
        type === BID_RETENSION_TYPE &&
        !activedGroup?.baseBid &&
        !activedGroup?.maxBid
      ) {
        return;
      }
      // type = BID_CPI_TYPE || type = undefined
      if (!activedGroup?.bid) return;
    }

    if (!newKeys.length) {
      setActiveKey([]);
    } else {
      setActiveKey(newKeys);
    }
  };

  const getBidText = (bidGroup: BidGroup) => {
    const { bid, goal, baseBid, maxBid } = bidGroup;

    if (type === BID_ROAS_TYPE && goal && maxBid) {
      return " (goal: $" + goal + ", max bid: $" + maxBid + ")";
    }
    if (type === BID_RETENSION_TYPE && baseBid && maxBid) {
      return " (base bid: $" + baseBid + ", max bid: $" + maxBid + ")";
    }
    if (bid) {
      return " ($" + bid + ")";
    }
    return "";
  };

  return (
    <div
      className={classNames(
        "border p-5 shadow-md rounded mb-6 max-w-3xl",
        className
      )}
    >
      <div className="mb-2">
        {RequiredMark} {title}
      </div>
      <Collapse
        className="!bg-transparent max-w-3xl not-custom-header-font"
        bordered={false}
        activeKey={activeKey}
        onChange={onChangeCollapse}
      >
        {bidGroups.map((bidGroup: BidGroup, idx) => {
          const { id, countries } = bidGroup;
          const isShowCollapsedData = !activeKey?.includes(id);
          const listCountries = getGroupCountries(bidGroups, id, allCountries);

          let title = "Group";
          let locationText = "";

          if (isShowCollapsedData) {
            title += getBidText(bidGroup);
            if (countries?.length) {
              locationText = "Location: " + countries.slice(0, 5).join(",");
              if (countries.length > 5) {
                locationText += "...";
              }
            }
          }

          return (
            <Collapse.Panel
              forceRender
              header={title}
              key={id}
              className={classNames(
                "!border-0 !bg-gray-100/60 !rounded last:!mb-1",
                id && "!mt-1.5"
              )}
              extra={
                <>
                  {isShowCollapsedData && locationText}
                  <CloseOutlined
                    className="pl-2"
                    title="Delete group"
                    onClick={(e) => onDeleteGroup(e, id)}
                  />
                </>
              }
            >
              <div className="ml-6">
                <BidRateGroup
                  type={type}
                  bidGroup={bidGroup}
                  onChangeGroup={onChangeGroup}
                  listCountries={listCountries}
                />
              </div>
            </Collapse.Panel>
          );
        })}
      </Collapse>
      {addBidGroupLink({ type, bidGroups, setBidGroups, setActiveKey })}
    </div>
  );
}

export default BidGroupForm;
