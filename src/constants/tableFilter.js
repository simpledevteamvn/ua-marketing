import { ROLES } from "./constants";

export const STATUS_FILTER = [
  {
    text: "Failure",
    value: "Failure",
  },
  {
    text: "Success",
    value: "Success",
  },
];

export const STATUS_FILTER_2 = [
  {
    text: "Active",
    value: "ACTIVE",
  },
  {
    text: "Paused",
    value: "PAUSED",
  },
];

export const STATUS_FILTER_3 = [
  {
    text: "Running",
    value: "RUNNING",
  },
  {
    text: "Paused",
    value: "PAUSED",
  },
];

export const STATUS_FILTER_4 = [
  { text: "Active", value: "ACTIVE" },
  { text: "Paused", value: "PAUSED" },
  { text: "Unknow", value: "UNKNOWN" },
];

export const ROLE_FILTER = [
  {
    text: "Admin",
    value: ROLES.admin,
  },
  {
    text: "User",
    value: ROLES.user,
  },
];
