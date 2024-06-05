import { getCountryNameFromCode } from "../Helpers";
import { getCurrentNode } from "./TreeHelpers";

const getFixedStatus = (colSettings, newCols) => {
  const { totalFixedLeft, totalFixedRight } = colSettings;
  const listSettings = Object.keys(colSettings || {});

  if (totalFixedLeft === undefined && totalFixedRight === undefined) {
    return newCols;
  }

  return newCols.map((col, idx) => {
    let newCol = col;
    let fixed = col.fixed;

    if (totalFixedLeft || totalFixedLeft === 0) {
      if (idx < totalFixedLeft) {
        fixed = "left";
        // @ts-ignore
      } else if (idx >= newCols.length - totalFixedRight) {
        fixed = "right";
      } else {
        fixed = "";
      }
    }

    if (
      listSettings.includes(col.columnId) &&
      colSettings[col.columnId] === false
    ) {
      newCol = { ...newCol, checked: false };
    }
    return { ...newCol, fixed };
  });
};

/**
 * Dùng khi setting table bằng Popover
 */
export const getNewColSettings = (columns, colSettings) => {
  const listSettings = Object.keys(colSettings || {});
  let newCols: any = columns;
  if (listSettings.length) {
    const { orderData, totalFixedLeft, totalFixedRight } = colSettings;
    if (orderData?.length) {
      newCols = orderData.map((colId) => {
        return newCols.find((el) => el.columnId === colId);
      });
    }

    newCols = newCols.map((col, idx) => {
      let newCol = col;
      let fixed = col.fixed;

      if (totalFixedLeft || totalFixedLeft === 0) {
        if (idx < totalFixedLeft) {
          fixed = "left";
          // @ts-ignore
        } else if (idx >= newCols.length - totalFixedRight) {
          fixed = "right";
        } else {
          fixed = "";
        }
      }

      if (
        listSettings.includes(col.columnId) &&
        colSettings[col.columnId] === false
      ) {
        newCol = { ...newCol, checked: false };
      }
      return { ...newCol, fixed };
    });
  }

  return newCols;
};

/**
 * Dùng khi setting table bằng Modal
 */
export const getColSettings = (columns, colSettings) => {
  const listSettings = Object.keys(colSettings || {});
  if (!listSettings?.length) return columns;

  let newCols: any = columns;
  // orderData luôn không có mà dùng thứ tự trực tiếp của listSettings
  const { orderData, totalFixedLeft, totalFixedRight } = colSettings;

  newCols = listSettings
    .map((colId) => {
      return columns.find((el) => el.columnId === colId);
    })
    .filter((el) => colSettings[el.columnId]);

  return newCols;
  // Todo: check xử lý fixed
  // return getFixedStatus(colSettings, newCols)
};

/**
 * Dùng khi setting table bằng Modal
 * @returns setting config để init table columns (VD: { bid: false, cost: false })
 */
export const getInitedSettings = (
  treeCols,
  listFields: string[] = [],
  value = true
) => {
  const results = {};

  if (!listFields.length || !treeCols?.length) return results;

  const initedKey: any = [];
  const getLeafKey = (treeNode) => {
    if (!treeNode?.children?.length) {
      initedKey.push(treeNode.key);
    } else {
      treeNode.children.forEach((node) => {
        getLeafKey(node);
      });
    }
  };

  listFields.forEach((key) => {
    const treeNode = getCurrentNode(key, treeCols);
    if (!treeNode) return initedKey.push(key); // Không có trong tree thì vẫn giữ
    getLeafKey(treeNode);
  });

  for (const key of initedKey) {
    results[key] = value;
  }

  return results;
};

export const checkContainText = (searchData, record, fullCountry = false) => {
  let isContainText = true;
  const listFieldText = Object.keys(searchData || {});

  if (listFieldText.length) {
    isContainText = !listFieldText.some((field) => {
      const text = searchData[field];
      let recordData = record[field];

      if (!text) return false;

      if (fullCountry && field === "country") {
        recordData =
          getCountryNameFromCode(recordData) + " (" + recordData + ")";
      }

      // Cẩn thận khi thêm mới vì đây là logic common
      if (field === "dimension") {
        recordData = record.rawCreative?.dimension;
      }
      // Lấy các field từ string dạng "network.name"
      if (field.includes(".")) {
        const listSubFields = field.split(".");
        recordData = record;
        listSubFields.forEach((subField) => {
          recordData = recordData?.[subField];
        });
      }
      return !recordData?.toLowerCase()?.includes(text?.toLowerCase());
    });
  }

  return isContainText;
};

export const checkRangeValue = (filters, record) => {
  const listField = Object.keys(filters || {});
  if (!listField.length) return true;

  return !listField.some((field) => {
    const { min, max, getField } = filters[field];
    const fieldValue = getField ? getField(record) : record[field];
    const searchMin = Number(min);
    const searchMax = Number(max);

    if (min === "" && max === "") return false;
    if (min === "") return fieldValue === undefined || fieldValue > searchMax;
    if (max === "") return fieldValue === undefined || fieldValue < searchMin;

    if (fieldValue < searchMin || fieldValue > searchMax) return true;

    return false;
  });
};

export const deepFilterData = (filters, records = []) => {
  if (!records?.length) return records;

  const listField = Object.keys(filters || {});
  if (!listField.length) return records;

  const filterFunc = (list) => {
    const filteredList = list.filter((record) =>
      checkRangeValue(filters, record)
    );

    const results = filteredList.map((el) => {
      if (!el.children?.length) {
        return el;
      }
      return { ...el, children: filterFunc(el.children) };
    });

    return results;
  };

  return filterFunc(records);
};

export const setRangeValue = (data, filters, setFilters) => {
  if (!Object.keys(data || {}).length) return;

  const field = data?.field || "";

  if (filters?.[field]) {
    const { min, max } = filters[field];

    if (min === data.min && max === data.max) {
      return;
    }
  }

  setFilters({ ...filters, [field]: { ...data } });
};

export const getColTitle = (el) => el.settingName || el.title;
