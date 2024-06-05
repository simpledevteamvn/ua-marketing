import React from "react";
// import { AiOutlineInteraction } from "@react-icons/all-files/ai/AiOutlineInteraction";
import { AiOutlineDashboard } from "@react-icons/all-files/ai/AiOutlineDashboard";
import { AiOutlineAppstore } from "@react-icons/all-files/ai/AiOutlineAppstore";
import { AiOutlineNodeIndex } from "@react-icons/all-files/ai/AiOutlineNodeIndex";
import { AiOutlineSetting } from "@react-icons/all-files/ai/AiOutlineSetting";
import { AiOutlineUsergroupAdd } from "@react-icons/all-files/ai/AiOutlineUsergroupAdd";
import { AiOutlineRocket } from "@react-icons/all-files/ai/AiOutlineRocket";
import { AiOutlineTool } from "@react-icons/all-files/ai/AiOutlineTool";
import { AiOutlineForm } from "@react-icons/all-files/ai/AiOutlineForm";
import { AiOutlineFileExcel } from "@react-icons/all-files/ai/AiOutlineFileExcel";
import { AiOutlineBulb } from "@react-icons/all-files/ai/AiOutlineBulb";
import { AiOutlineBuild } from "@react-icons/all-files/ai/AiOutlineBuild";
import { AiOutlineNotification } from "@react-icons/all-files/ai/AiOutlineNotification";
import { BiPhotoAlbum } from "@react-icons/all-files/bi/BiPhotoAlbum";
import { AiOutlineFileImage } from "@react-icons/all-files/ai/AiOutlineFileImage";
// import { AiOutlineProject } from "@react-icons/all-files/ai/AiOutlineProject";
import { FaAppStore } from "@react-icons/all-files/fa/FaAppStore";

export const SidebarConfigs = [
  {
    id: 0,
    url: "/",
    label: "Dashboard",
    iconEl: <AiOutlineDashboard size={20} />,
    preload: () => import("../../pages/Dashboard/Dashboard"),
  },
  {
    id: 1,
    url: "/apps",
    label: "Apps",
    iconEl: <AiOutlineAppstore size={20} />,
    preload: () => import("../../pages/Apps/AppMainPage"),
  },
  {
    id: 3,
    url: "/rules",
    subUrl: ["/add-rules"],
    label: "Rules",
    iconEl: <AiOutlineForm size={20} />,
    preload: () => import("../../pages/BidFormulas/BidRules"),
  },
  // {
  //   id: 4,
  //   url: "/account-report",
  //   label: "Account Report",
  //   iconEl: <AiOutlineProject size={20} />,
  // },
  {
    id: 5,
    url: "/connectors",
    label: "Data Connectors",
    iconEl: <AiOutlineNodeIndex size={20} />,
    preload: () => import("../../pages/DataConnectors/DataConnectors"),
  },
  // {
  //   id: 6,
  //   url: "/networks",
  //   label: "Networks",
  //   checkAdmin: true,
  //   iconEl: <AiOutlineInteraction size={20} />,
  //   preload: () => import("../../pages/NetworkConfig/NetworkConfig"),
  // },
  {
    id: 7,
    url: "/assets",
    label: "Assets",
    iconEl: <BiPhotoAlbum size={20} />,
    preload: () => import("../../pages/Assets/Assets"),
  },
  {
    id: 8,
    url: "/bid-csv",
    label: "Bid CSV",
    iconEl: <AiOutlineFileExcel size={20} />,
    preload: () => import("../../pages/CSVManagement/CSVManagement"),
  },
  {
    id: 9,
    url: "/pivot",
    label: "Pivot",
    iconEl: <AiOutlineBuild size={20} />,
    preload: () => import("../../pages/Pivot/Pivot"),
  },
  {
    id: 10,
    url: "/members",
    label: "Members",
    checkAdmin: true,
    iconEl: <AiOutlineUsergroupAdd size={20} />,
    preload: () => import("../../pages/Members/Members"),
  },
  {
    id: 11,
    url: "/settings",
    label: "Settings",
    iconEl: <AiOutlineTool size={20} />,
    children: [
      {
        url: "/settings/account",
        label: "Account",
        preload: () => import("../../pages/Settings/Account"),
      },
      {
        url: "/settings/currencies",
        label: "Currencies",
        preload: () =>
          import("../../pages/Settings/CurrencyConfig/CurrencyConfig"),
      },
      {
        url: "/settings/notifications",
        label: "Notifications",
        preload: () =>
          import("../../pages/Settings/Notifications/Notifications"),
      },
    ],
  },
];

export const SidebarAppConfigs = [
  {
    id: 0,
    url: "/overview",
    label: "Overview",
    iconEl: <AiOutlineDashboard size={20} />,
    preload: () => import("../../pages/App/overview/Overview"),
  },
  {
    id: 1,
    url: "/skadnetwork",
    label: "SKAN Overview",
    iconEl: <FaAppStore size={20} />,
    checkIOS: true,
    preload: () => import("../../pages/App/Skan/SkanOverview"),
  },
  {
    id: 2,
    url: "/campaign-management",
    label: "Campaign Management",
    iconEl: <AiOutlineRocket size={20} />,
    preload: () => import("../../pages/App/CampaignCenter/CampaignCenter"),
  },
  {
    id: 3,
    url: "/campaign-control",
    label: "Campaign Control",
    iconEl: <AiOutlineNotification size={20} />,
    preload: () => import("../../pages/App/CampaignControl/CampaignControl"),
  },
  {
    id: 4,
    url: "/creative",
    label: "Creative Center",
    iconEl: <AiOutlineBulb size={20} />,
    preload: () => import("../../pages/App/Creative/index"),
  },
  {
    id: 5,
    url: "/assets",
    label: "Assets",
    iconEl: <AiOutlineFileImage size={20} />,
    preload: () => import("../../pages/App/AssetByNetwork/AssetByNetwork"),
  },
  {
    id: 6,
    url: "/settings",
    label: "Settings",
    iconEl: <AiOutlineSetting size={20} />,
    preload: () => import("../../pages/App/setting/Settings"),
  },
];
