import React from "react";
import {
  COL_IDS,
  CohortSetting2,
  RetentionSetting,
  SigmaRetentionSetting,
  WRAPPER_COL_IDS,
} from "../../CampaignCenter/CampaignIntel/constants";
import Tooltip from "antd/es/tooltip";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";

export const minifiedAdNetworkCols = [
  { title: "Cost", key: COL_IDS.cost },
  { title: "Non-Organic Installs", key: COL_IDS.nonOrganicInstall },
  { title: "eCPI", key: COL_IDS.ecpi },
  { title: "Impressions", key: COL_IDS.impression },
  { title: "Clicks", key: COL_IDS.click },
  { title: "CVR", key: COL_IDS.cvr },
];

export const TREE_COLS = [
  { title: "Name", key: COL_IDS.name },
  {
    title: "Ad Network",
    key: WRAPPER_COL_IDS.adNetworkLv,
    children: [
      ...minifiedAdNetworkCols,
      { title: "Billable cost", key: COL_IDS.billableCost },
      { title: "Billable install", key: COL_IDS.billableInstall },
      { title: "Billable eCpi", key: COL_IDS.billableECpi },
    ],
  },
  {
    title: "LTV",
    key: WRAPPER_COL_IDS.ltvLv,
    fullName: true,
    children: [
      { title: "ARPDAU", key: COL_IDS.arpdau },
      {
        settingName: "Lastest ARPDAU",
        title: (
          <div className="flex items-center">
            Lastest ARPDAU
            <Tooltip
              title="ARPDAU for a specified period of time."
              color="white"
              overlayClassName="tooltip-light"
            >
              <AiOutlineQuestionCircle size={16} className="ml-1 mb-0.5" />
            </Tooltip>
          </div>
        ),
        titleData: "Lastest ARPDAU",
        key: COL_IDS.latestArpdau,
      },
      { title: "Revenue", key: COL_IDS.rev },
      { title: "DAU", key: COL_IDS.dau },
      { title: "LTV D1", key: COL_IDS.ltvD1 },
      { title: "LTV D3", key: COL_IDS.ltvD3 },
      { title: "LTV D7", key: COL_IDS.ltvD7 },
      { title: "LTV D14", key: COL_IDS.ltvD14 },
      { title: "LTV D30", key: COL_IDS.ltvD30 },
    ],
  },
  CohortSetting2,
  RetentionSetting,
  SigmaRetentionSetting,
  {
    title: "MMP metrics",
    key: WRAPPER_COL_IDS.attrLv,
    fullName: true,
    children: [
      { title: "Cost", key: COL_IDS.attributeCost },
      { title: "Installs", key: COL_IDS.attributeInstall },
      { title: "eCPI", key: COL_IDS.attributeECpi },
      {
        title: "Activity Revenue (af_ad_revenue)",
        key: COL_IDS.attributeRevenueAdEvent,
      },
      {
        title: "Activity Revenue (af_purchase)",
        key: COL_IDS.attributeRevenuePurchaseEvent,
      },
      { title: "LTV Revenue", key: COL_IDS.attributeRevenue },
      { title: "Session", key: COL_IDS.attributeSession },
      { title: "Impressions", key: COL_IDS.attributeImpression },
      { title: "Clicks", key: COL_IDS.attributeClick },
    ],
  },
  {
    title: "SKAN", // Khi enable SKAN data -> đây là các column có thể có
    key: WRAPPER_COL_IDS.skanLv,
    fullName: true,
    children: [
      { title: "Cost", key: COL_IDS.skanCost },
      { title: "Installs", key: COL_IDS.skanInstall },
      { title: "Non-Organic Installs", key: COL_IDS.skanNonOrganicInstall },
      { title: "Organic Installs", key: COL_IDS.skanOrganicInstall },
    ],
  },
  {
    title: "SKAN", // SKAN page (của app IOS) sẽ có các cột này thay vì SKAN bên trên
    key: WRAPPER_COL_IDS.skanOverviewLv,
    fullName: true,
    children: [
      { title: "Cost", key: COL_IDS.cost },
      { title: "Non-Organic Installs", key: COL_IDS.nonOrganicInstall },
      { title: "Installs", key: COL_IDS.install },
      { title: "Impressions", key: COL_IDS.impression },
      { title: "Clicks", key: COL_IDS.click },
      { title: "Click-through installs", key: COL_IDS.clickThroughInstall },
      { title: "View-through installs", key: COL_IDS.viewThoughInstall },
      { title: "Null conversion value rate", key: COL_IDS.nullConversionRate },
      { title: "Click-to-install rate", key: COL_IDS.clickToInstallRate },
      { title: "Total revenue (modeled)", key: COL_IDS.totalRevenueModel },
      { title: "Total revenue", key: COL_IDS.totalRevenue },
    ],
  },
];
