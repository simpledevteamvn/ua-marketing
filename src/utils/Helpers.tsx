import moment from "moment";
import React from "react";
import {
  AD_NETWORK_TYPE,
  ALL_COUNTRIES_OPTION,
  EDIT_NUMBER_MODE,
  MAXIMUM_INC_PERCENTAGE,
  ORGANIZATION_PATH,
  TABLE_COLUMN_COLOR,
  USD,
} from "../constants/constants";
// @ts-ignore
import defaultImg from "../images/common/default.png";
import { numberWithCommas, pSBC } from "./Utils";
import classNames from "classnames";
import { BID_ADJUSTMENT } from "../partials/common/Dropdowns/Dropdowns";

export const getCountryNameFromCode = (code = "VN") => {
  try {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames
    const regionNamesInEnglish = new Intl.DisplayNames(["en"], {
      type: "region",
    });
    return regionNamesInEnglish.of(code.toUpperCase()) || code;
  } catch (error) {
    return code;
  }
};

export const getCountryEl = (record, fullData = true) => {
  if (!record.country) return "";
  if (record.country === ALL_COUNTRIES_OPTION) {
    return "All Countries";
  }
  if (getCountryNameFromCode(record.country) === record.country) {
    return record.country;
  }

  if (!fullData) {
    return getCountryNameFromCode(record.country);
  }

  return (
    <div className="whitespace-nowrap md:whitespace-normal">
      <span className={`fi fi-${record.country?.toLowerCase()} w-5 h-3 mr-1`} />
      {`${getCountryNameFromCode(record.country)} (${record.country})`}
    </div>
  );
};

export const getCountriesEl = (record) => {
  if (!record.countries?.length || !Array.isArray(record.countries)) return "";

  if (
    record.countries.length === 1 &&
    record.countries[0] === ALL_COUNTRIES_OPTION
  ) {
    return "All Countries";
  }

  const countryNames = record.countries.join(", ");

  return (
    <div className="line-clamp-3" title={countryNames}>
      {countryNames}
    </div>
  );
};

export const getValueWithCurrency = (value, currency, currenciesConfigs) => {
  if (
    value === "" ||
    (typeof value !== "number" && typeof value !== "string")
  ) {
    return "";
  }
  if (typeof value === "string" && value.length) {
    let check = value.split("").some((char) => !"0123456789.$".includes(char));
    if (check) return value;
  }

  const crc = getCurrency(currency);
  if (crc === "$") {
    return crc + numberWithCommas(value);
  }

  let exchangeResults = "";
  if (currenciesConfigs?.length) {
    const activedCrc = currenciesConfigs.find((el) => el.currency === currency);
    if (activedCrc) {
      const totalUSD =
        Math.round((Number(value) * 1000) / activedCrc.rate) / 1000;
      exchangeResults = " ($" + numberWithCommas(totalUSD) + ")";
    }
  }

  return crc + numberWithCommas(value) + exchangeResults;
};

export const getCurrency = (currency) => {
  if (!currency || currency === USD) return "$";
  if (typeof currency === "string") return currency.toUpperCase() + " ";

  return "$";
};

export const isNumeric = (value, acceptZero = false) => {
  const acceptedChars = "0123456789.";

  if (acceptZero && value === 0) return true;
  if (!value) return false;

  if (typeof value === "string") {
    return !value.split("").some((char) => !acceptedChars.includes(char));
  }
  if (typeof value === "number") return true;

  return false;
};

export function capitalizeWord(str) {
  return !str ? str : str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getLabelFromCamelCaseStr(str, toUpper = true) {
  if (!str) return str;

  let results = "";
  let i = 0;
  while (i < str.length) {
    const character = str.charAt(i);
    if (!i) {
      results += character.toUpperCase();
    } else if ("0123456789".includes(character)) {
      results += character;
    } else if (character === character.toUpperCase()) {
      const newChar = toUpper ? character : character.toLowerCase();
      results = results + " " + newChar;
    } else {
      results += character;
    }
    i++;
  }
  return results;
}

export const getLabelFromStr = (str) => {
  if (typeof str !== "string") return str;

  let result = str;
  if (str.toUpperCase() === str) {
    result = capitalizeWord(str);

    if (result.includes("_")) {
      // @ts-ignore
      result = result.replaceAll("_", " ");
    }
  } else {
    result = getLabelFromCamelCaseStr(str, false);
  }

  return result;
};

export const sortNumberWithNullable = (a, b, getField) => {
  const el1 = getField(a);
  const el2 = getField(b);
  const aData = el1 === 0 ? 0 : el1 || -1;
  const bData = el2 === 0 ? 0 : el2 || -1;
  return aData - bData;
};

export function sortByString(attr) {
  if (!attr) {
    return () => 1; // keep position of current data
  }

  // https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
  return (a, b) => ("" + a[attr]).localeCompare(b[attr]);
}

export function sortByDate(field) {
  return (a, b) => {
    const aDate = a[field] ? moment(a[field]).valueOf() : -1;
    const bDate = b[field] ? moment(b[field]).valueOf() : -1;
    return aDate - bDate;
  };
}

export function sortByBool(attr) {
  if (!attr) {
    return () => { };
  }

  return (a, b) => Number(a[attr]) - Number(b[attr]);
}

export const getTotalChildrenStr = (record, field = "children") => {
  const children = record[field];
  return children?.length ? ` (${children.length})` : "";
};

export function filterColumn(value, record, field, getField: any = null) {
  if ((!field && !getField) || !record) return false;

  const data = getField ? getField(record) : record[field];
  if (typeof data !== "string" || !data) return false;

  if (Array.isArray(data)) {
    if (!data.length) return false;
    return data.some((str) => {
      if (typeof str !== "string" || !str) {
        return false;
      }
      return str.toLowerCase().includes(value.toLowerCase());
    });
  }

  return data.toLowerCase().includes(value.toLowerCase());
}

export function getSubOrganizationUrl(pathname: string = "") {
  if (!pathname) return pathname;

  let subPaths = pathname.split("/").slice(1);
  if (subPaths.length > 2 && "/" + subPaths[0] === ORGANIZATION_PATH) {
    subPaths.splice(0, 2);
  }
  const result = subPaths.join("/");
  return "/" + result;
}

export function getLastSlug(pathname: string = "") {
  if (!pathname) return pathname;

  let subPaths = pathname.split("/");
  return subPaths[subPaths.length - 1];
}

export function handleErrorImage(e) {
  if (!e.target) return;

  e.target.src = defaultImg;
}

export const getShadeColor = (
  value,
  maxValue = 100,
  color = TABLE_COLUMN_COLOR[0]
) => {
  if (value === undefined) return;

  if (!maxValue) return undefined; // không được set màu
  if (value > maxValue) return color;

  const minOpacity = 0.2;
  const opc = value / maxValue;
  const opacityStat = opc < minOpacity ? minOpacity : opc;

  return pSBC(1 - opacityStat, color);
};

export const checkNumberValue = (dataValue) => {
  if (dataValue === 0 || dataValue === "0") return true;
  return !!dataValue;
};

export const getColumnNumber = (dataValue, prefix = "", suffix = "") => {
  if (dataValue === 0 || dataValue === "0") return prefix + 0 + suffix;
  if (!dataValue) return "";
  return prefix + numberWithCommas(dataValue) + suffix;
};

export const getTableCellBg = (
  record,
  fieldName,
  max = 100,
  getData: any = null,
  borderDashed = false
) => {
  const currentData = getData ? getData(record) : record[fieldName];
  if (!max || currentData === undefined) {
    return { className: classNames("!p-0", borderDashed && "custom-dashed") };
  }

  const bgPer = Math.round((currentData * 1000) / max) / 10;
  const customWidth = bgPer > 100 ? 100 : bgPer;

  return {
    className: classNames("table-cell-bg", borderDashed && "custom-dashed"),
    ["style"]: {
      backgroundImage: `linear-gradient(to right, #dbedfa ${customWidth}%, white 0%)`,
    },
  };
};

export const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getDecimalCount = (num) => {
  const decimalCount = num?.toString()?.split(".")?.[1]?.length || 0;
  return decimalCount;
};

export function findFirstDigitIndex(str) {
  // Tạo một biểu thức chính quy để tìm ký tự số đầu tiên trong chuỗi
  const regex = /\d/;
  // Sử dụng indexOf() để tìm vị trí của ký tự số đầu tiên trong chuỗi
  const index = str.search(regex);
  return index;
}

export function canBeConvertedToNumber(str) {
  // Sử dụng parseInt() hoặc parseFloat() để chuyển đổi chuỗi thành số
  // Nếu hàm trả về NaN (Not-a-Number), tức là không thể chuyển đổi thành số
  return !isNaN(parseInt(str)) || !isNaN(parseFloat(str));
}

export const getDay = (str) => {
  const idx = findFirstDigitIndex(str);
  if (idx > -1) {
    const day = str.slice(idx);
    if (canBeConvertedToNumber(day)) {
      return day;
    }
  }
  return -1;
};

export const roundNumber = (
  input: number,
  format: Boolean = false,
  decimal: number = 2
) => {
  if (typeof input !== "number") return input;
  if (!input) return 0;

  const num = Math.pow(10, decimal);
  const result = Math.round(Number(input) * num) / num;

  if (!format) return result;
  return numberWithCommas(result);
};

export function formatBytes(bytes, decimals = 2) {
  // https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const onSelectGroup = (listData, allOption, onChange) => {
  const lastValue = listData[listData.length - 1];

  let newSelectedData = [...listData];
  if (listData.includes(allOption)) {
    if (lastValue === allOption) {
      newSelectedData = [allOption];
    } else {
      newSelectedData = listData.filter((el) => el !== allOption);
    }
  }
  onChange(newSelectedData);
};

export const onSelectWithAllOpt = (
  newValues,
  listOpts,
  allOption,
  values,
  onChange
) => {
  const lastValue = newValues[newValues.length - 1];
  const hasAllOpt = values?.includes(allOption);
  const needAllOpt = newValues?.includes(allOption);

  let newSelectedData;
  if (lastValue === allOption) {
    newSelectedData = [allOption, ...listOpts];
  } else {
    if (newValues.length > listOpts.length) {
      newSelectedData = [allOption, ...listOpts];
    } else if (newValues.length === listOpts.length) {
      if (hasAllOpt && !needAllOpt) {
        newSelectedData = [];
      } else if (!hasAllOpt && !needAllOpt) {
        newSelectedData = [allOption, ...listOpts];
      } else {
        newSelectedData = newValues.filter((el) => el !== allOption);
      }
    } else {
      newSelectedData = newValues.filter((el) => el !== allOption);
    }
  }
  onChange(newSelectedData);
};

export const getSelectMultipleParams = (selectedData, allOption) => {
  if (!selectedData?.length || selectedData?.includes(allOption)) {
    return [];
  } else {
    return selectedData;
  }
};

export const filterSelect = (input, option: any) => {
  return option.children?.toLowerCase().includes(input.toLowerCase());
};

export const filterSelectGroup = (input, option: any) => {
  // Note: Use as Default
  // <Option value={data.id} key={idx}>{data.name}</Option>
  // https://github.com/ant-design/ant-design/issues/22918
  if (option.children) {
    return option.children.toLowerCase().includes(input.toLowerCase());
  } else if (option.label) {
    return option.label.toLowerCase().includes(input.toLowerCase());
  } else {
    return false;
  }
};

export const filterSelectGroupByKey = (input, option: any) => {
  // <Option key={nameForSearch}> <div>...</div> </Option>
  // E.g. nameForSearch = data.storeId + data.name
  return option.key?.toLowerCase()?.includes(input.toLowerCase());
};

export const filterSelectByDOM = (input, option: any, index: number = -1) => {
  const filterData = (value) =>
    value?.toLowerCase().includes(input.toLowerCase());
  const getOptData = (children) => {
    const firstStrIdx = children.findIndex((el) => typeof el === "string");
    const startIndex = index > -1 ? index : firstStrIdx;
    return children.slice(startIndex)?.join("");
  };

  if (option.options?.length) return false; // OptGroup label

  if (option.children) {
    if (Array.isArray(option.children)) {
      return filterData(getOptData(option.children));
    }
    if (typeof option.children === "string") {
      return filterData(option.children);
    }
    if (option.children.props?.children?.length) {
      return filterData(getOptData(option.children.props.children));
    }
  }

  if (option.value && typeof option.value === "string") {
    return filterData(option.value);
  }
  return false;
};

export const getBeforeTime = (
  time,
  suffix = false,
  format = "MMM D, YYYY [at] hh:mm A"
) => {
  if (!time || typeof time !== "string") return "";

  const date = moment().subtract(1, "days");
  const isShowTime = time && moment(time).isAfter(date);

  return isShowTime
    ? moment(time).fromNow(suffix)
    : moment(time)?.format(format);
};

export const disabledDate = (current) => {
  return current && moment(current).isAfter(moment());
};

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const checkMaximumValue = (
  newValue,
  oldValue = 0,
  editMode = EDIT_NUMBER_MODE.percentage
) => {
  const min = 100 - MAXIMUM_INC_PERCENTAGE;
  const max = 100 + MAXIMUM_INC_PERCENTAGE;
  let check;

  if (editMode === EDIT_NUMBER_MODE.percentage) {
    check = newValue >= max || newValue <= min;
  } else if (editMode === EDIT_NUMBER_MODE.value) {
    const countDecimal = getDecimalCount(oldValue) + 1;

    const minValue = roundNumber(
      (Number(oldValue) * min) / 100,
      false,
      countDecimal
    );
    const maxValue = roundNumber(
      (Number(oldValue) * max) / 100,
      false,
      countDecimal
    );
    check = newValue >= maxValue || newValue <= minValue;
  } else {
    check = false;
  }

  return check;
};

export const getPercentDiff = (oldValue, newValue) => {
  let percentDiff;

  if (oldValue === 0) return 0;

  if (oldValue && newValue) {
    const per = Math.abs(1 - newValue / oldValue) * 100;
    percentDiff = roundNumber(per, false, 1);
  }

  return percentDiff;
};

export const isConfirmValue = (oldValue, newValue) => {
  let percentUpdate;

  if (oldValue === 0) return false;

  if (oldValue && newValue) {
    const per = Math.abs(1 - newValue / oldValue) * 100;
    percentUpdate = roundNumber(per, false, 1);
  }

  return checkMaximumPercentage(percentUpdate);
};

export const checkMaximumPercentage = (percentUpdate) => {
  return percentUpdate >= MAXIMUM_INC_PERCENTAGE;
};

export const getAppFromAdNetwork = (apps) => {
  if (!apps?.length || !Array.isArray(apps)) return [];
  return apps.filter(
    (el) => el.networkConnector?.network?.networkType?.type === AD_NETWORK_TYPE
  );
};

export const EDIT_PERCENTAGE_TOOLTIP = (
  <div>
    <div>Ex: To increase 10% - enter 110</div>
    <div className="pl-6">To decrease 10% - enter 90</div>
  </div>
);

export const DESCRIPTION_TOOLTIP = (
  <div>
    <div>* Only CPI Bid</div>
  </div>
);

export const SELECT_COUNTRIES_TOOLTIP = (
  <div>
    Tip: You can type string "in, jp" then press "Enter" from keyboard to get
    India and Japan countries.
  </div>
);

export const SELECT_FOLDER_TOOLTIP = (
  <div>Tip: Use Ctrl + Click or Shift + Click to select multiple folders.</div>
);
