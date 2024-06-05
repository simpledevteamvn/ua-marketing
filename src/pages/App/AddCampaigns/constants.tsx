import React from "react";
import ExclamationCircleOutlined from "@ant-design/icons/lib/icons/ExclamationCircleOutlined";
import Tooltip from "antd/lib/tooltip";

export const formClass = "max-w-3xl";
export const bulkLink =
  "mt-1 text-antPrimary hover:text-antPrimary/80 cursor-pointer inline-block";

export const defaultGroups = [{ id: 0 }];
export const defaultGroupIds = [defaultGroups[0].id];

export const ALL_AREA = "all-area";
export const SPECIAL_AREA = "special-area";
export const AREA_OPTIONS = [
  { label: "All Area", value: ALL_AREA },
  { label: "Special Area", value: SPECIAL_AREA },
];

/**
 * Mintegral
 */
export const MintegralSteps = [
  { title: "Input Basic Info" },
  { title: "Fulfill Targeting Info" },
  { title: "Set Bid Rate & Budget" },
  { title: "Upload Creatives" },
];

export const SHARED = "Shared";
export const SEPARATED = "Separated";
export const BudgetGroupOpts = [
  { label: "Shared", value: SHARED },
  { label: "Separated", value: SEPARATED },
];

export const LONG_TIME = "longTime";
export const TIME_DISTANCE = "timeDistance";
export const DeliveryOpts = [
  {
    label: (
      <Tooltip
        title="If you prefer to manually stop the offer, please select long-term delivery."
        color="white"
        overlayClassName="tooltip-light"
        overlayInnerStyle={{ minWidth: 270 }}
      >
        Long-term <ExclamationCircleOutlined className="text-xs" />
      </Tooltip>
    ),
    value: LONG_TIME,
  },
  { label: "Configure start and end time", value: TIME_DISTANCE },
];

/**
 * Unity
 */
export const UnitySteps = [
  { title: "Input Basic Info" },
  { title: "Set Bid Rate & Budget" },
  { title: "Upload Creatives" },
];

export const AUTOMATED = "automated";

/**
 * Applovin
 */
export const ApplovinSteps = [
  { title: "Input Basic Info" },
  { title: "Fulfill Targeting Info" },
  { title: "Set Bid Rate & Budget" },
];

// Type để tạo campaign
export const ROAS_AD_BASED = "ROAS_AD_BASED";
