import moment from "moment";
import { DATE_MILESTONES } from "../../../constants/constants";

export const DATE_RANGE_FORMAT = "YYYY-MM-DD";

export function getDateRange(date: moment.Moment = moment()) {
  return date.format(DATE_RANGE_FORMAT);
}

export function getSkanDay() {
  return [moment().subtract(10, "days"), moment().subtract(3, "days")];
}

export function getLTVDay() {
  return [moment().subtract(4, "days"), moment().subtract(2, "days")];
}

export function getLast3Day() {
  return [moment().subtract(3, "days"), moment()];
}

export function getLast7Day() {
  return [moment().subtract(7, "days"), moment()];
}

export function getLast14Day() {
  return [moment().subtract(14, "days"), moment()];
}

export function getLast30Day() {
  return [moment().subtract(30, "days"), moment()];
}

export function getThisWeek() {
  // Returns 1-7 where 1 is Monday and 7 is Sunday
  const dayOfWeek = moment().isoWeekday();
  const startDate = moment().subtract(dayOfWeek - 1, "days");
  const endDate = moment().add(7 - dayOfWeek, "days");

  return [startDate, endDate];
}

export function getThisMonth() {
  // Accepts numbers from 1 to 31
  const dayOfMonth = moment().date();
  const totalDaysInMonth = moment().daysInMonth();

  const startDate = moment().subtract(dayOfMonth - 1, "days");
  const endDate = moment().add(totalDaysInMonth - dayOfMonth, "days");

  return [startDate, endDate];
}

export function getLastWeek() {
  const dayOfWeek = moment().isoWeekday();
  const startDate = moment().subtract(dayOfWeek + 6, "days");
  const endDate = moment().subtract(dayOfWeek, "days");

  return [startDate, endDate];
}

export function getLastMonth() {
  const dayOfMonth = moment().date();
  const totalDaysInLastMonth = moment().subtract(1, "month").daysInMonth();

  const startDate = moment().subtract(
    dayOfMonth + totalDaysInLastMonth - 1,
    "days"
  );
  const endDate = moment().subtract(dayOfMonth, "days");

  return [startDate, endDate];
}

export const onClickRangePickerFooter = (
  timeValue,
  setDateRange,
  callback = () => {}
) => {
  switch (timeValue) {
    case DATE_MILESTONES.last3Days:
      setDateRange(getLast3Day());
      break;
    case DATE_MILESTONES.last7Days:
      setDateRange(getLast7Day());
      break;
    case DATE_MILESTONES.last14Days:
      setDateRange(getLast14Day());
      break;
    case DATE_MILESTONES.last30Days:
      setDateRange(getLast30Day());
      break;
    case DATE_MILESTONES.thisWeek:
      setDateRange(getThisWeek());
      break;
    case DATE_MILESTONES.thisMonth:
      setDateRange(getThisMonth());
      break;
    case DATE_MILESTONES.lastWeek:
      setDateRange(getLastWeek());
      break;
    case DATE_MILESTONES.lastMonth:
      setDateRange(getLastMonth());
      break;

    default:
      break;
  }
  callback();
};
