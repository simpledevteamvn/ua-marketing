import {
  capitalizeWord,
  getCountryNameFromCode,
  getDecimalCount,
  getLabelFromCamelCaseStr,
  roundNumber,
} from "../../utils/Helpers";
import { numberWithCommas } from "../../utils/Utils";
import { CALC_TYPES } from "./components/DroppableArea";

interface TableData {
  totalSameData?: number; // phục vụ tính count || average
  treeLv?: number; // node cành
  id?: string; // node lá
  name?: string;
  children?: any;
}

export const groupByFields = (
  data, // data đang thêm vào
  listFields, // pivot rows hiện tại
  arr: TableData[], // list data hiện tại
  treeLv, // level trong tree
  crrId, // id duy nhất theo thứ tự rawdata
  pivotData, // pivot
  isGetCol = false
) => {
  const field = listFields[0];
  const fieldData = data?.[field];
  const listValues = pivotData.values || [];
  const listFilters = pivotData.filters || [];

  if (!fieldData && fieldData !== 0) {
    if (isGetCol) return [...arr];
    return arr?.length ? [...arr] : undefined;
  }

  if (listFields?.length === 1) {
    let newArr = arr.length ? [...arr] : [];
    const newData = { ...data, tableLabel: fieldData };

    // check id of leaf level
    let index = arr?.findIndex((el) => el[field] === fieldData);
    if (isGetCol) {
      index = arr?.findIndex((el) => el.id === fieldData);
    }

    if (index > -1) {
      let isMergeData = false;

      if (listFilters?.length) {
        isMergeData = listFilters.some((filterName) => {
          const existValue = arr[index][filterName];
          return data[filterName] !== existValue;
        });
      }

      if (!isMergeData) {
        newArr.push({ ...newData, totalSameData: 1 });
      } else {
        // Cùng 1 filter -> gộp data
        const totalSameData = newArr[index].totalSameData || 1;
        newArr[index].totalSameData = totalSameData + 1;

        listValues?.forEach((valueConfig) => {
          const valueField = valueConfig.name;
          const type = valueConfig.function;
          const oldValue = Number(newArr[index][valueField]);
          const commingValue = Number(data[valueField]);

          let newValue = calcData(oldValue, commingValue, type);
          if (type === CALC_TYPES.average) {
            newValue = calcData(oldValue * totalSameData, commingValue, type);
          }

          if (type === CALC_TYPES.count) {
            newValue = totalSameData + 1;
          } else if (type === CALC_TYPES.average) {
            newValue = roundNumber(
              newValue / newArr[index].totalSameData!,
              false
            );
          }

          newArr[index][valueField] = newValue;
        });
      }
    } else {
      if (isGetCol) {
        newArr.push({
          id: fieldData,
          name: fieldData,
          treeLv,
          // cann't resize => not show icon resize (cursor-???)
          // width: 60,
          // transformScale: 2.5,
          children: [newData],
        });
      } else {
        newArr.push({ ...newData, totalSameData: 1 });
      }
    }
    return newArr;
  }

  const newListFields = [...listFields];
  newListFields.shift();

  // check id of wrapper level
  const index = arr?.findIndex((el) => el.id === fieldData);

  if (index > -1) {
    return arr.map((el, idx) => {
      if (index !== idx) return el;

      return {
        ...el,
        children: groupByFields(
          data,
          newListFields,
          el.children || [],
          treeLv + 1,
          idx + "," + String(crrId + 1),
          pivotData,
          isGetCol
        ),
      };
    });
  } else {
    return [
      ...arr,
      {
        // Wrapper element
        tableId: String(crrId) + "," + fieldData,
        treeLv,
        id: fieldData,
        name: fieldData,
        width: 100,
        transformScale: 2.5,
        children: groupByFields(
          data,
          newListFields,
          [],
          treeLv + 1,
          crrId,
          pivotData,
          isGetCol
        ),
      },
    ];
  }
};

const calcData = (oldValue, value, type) => {
  // gộp data ở node lá -> cần tính lại theo function (sum/max/min...)
  const newValue = Number(value);
  const d1 = getDecimalCount(oldValue);
  const d2 = getDecimalCount(newValue);
  let results = oldValue;

  switch (type) {
    case CALC_TYPES.max:
      results = Math.max(results, newValue);
      break;
    case CALC_TYPES.min:
      results = Math.min(results, newValue);
      break;
    case CALC_TYPES.count:
      results = 1;
      break;

    case CALC_TYPES.average:
    case CALC_TYPES.sum:
    default:
      results += newValue;
      break;
  }

  return roundNumber(results, false, Math.max(d1, d2));
};

const getTotal = (totalData, value, type) => {
  const newValue = Number(value);
  let newData = totalData.data;
  const d1 = getDecimalCount(newData);
  const d2 = getDecimalCount(newValue);

  switch (type) {
    case CALC_TYPES.max:
      newData = Math.max(newData, newValue);
      break;
    case CALC_TYPES.min:
      newData = Math.min(newData, newValue);
      break;
    case CALC_TYPES.count:
      newData += 1;
      break;
    case CALC_TYPES.average:
      newData += newValue;
      totalData.count += 1;
      break;

    case CALC_TYPES.sum:
    default:
      newData += newValue;
      break;
  }

  totalData.data = roundNumber(newData, false, Math.max(d1, d2));
  return totalData;
};

export const getTotalData = (
  list,
  columnConfigs,
  parentKeys,
  leafField,
  type, // Function: sum/max/min...
  isFormat
) => {
  const totalObj = { data: 0, count: 0 };
  let hasData = false;

  const getValue = (list) => {
    list.forEach((el) => {
      if (!el.children?.length) {
        const isHidden = parentKeys.some((fieldData, idx) => {
          const field = columnConfigs[idx];

          return el[field] !== fieldData;
        });

        if (isHidden) return;
        if (!hasData) {
          hasData = true;
        }
        return getTotal(totalObj, el[leafField], type);
      }

      getValue(el.children);
    });
  };

  getValue(list);

  if (hasData && totalObj.count && type === CALC_TYPES.average) {
    return roundNumber(totalObj.data / totalObj.count, true);
  }

  const results = isFormat ? numberWithCommas(totalObj.data) : totalObj.data;
  return hasData ? results : "";
};

const getRecordData = (rd, el, columnConfigs, parentKeys, isFormat = true) => {
  const field = el.field;
  const renderedData =
    el.function === CALC_TYPES.count
      ? numberWithCommas(rd.totalSameData || rd[field])
      : numberWithCommas(rd[field]);

  if (rd.children?.length) {
    return getTotalData(
      rd.children,
      columnConfigs,
      parentKeys,
      field,
      el.function,
      isFormat
    );
  }

  const isHidden = parentKeys.some((fieldData, idx) => {
    const field = columnConfigs[idx];

    return rd[field] !== fieldData;
  });

  return isHidden ? "" : renderedData;
};

export const getColumns = (
  arr,
  valueCols,
  columnConfigs,
  countryIdx,
  parentKeys: any = []
) => {
  const hasChild = arr.some((el) => el.children?.length);

  if (!hasChild)
    return valueCols.map((el) => {
      const onGetField = (rd) =>
        getRecordData(rd, el, columnConfigs, parentKeys);

      return {
        ...el,
        render: onGetField,
        /**
         * Logic cũ tính lại data để sort không hợp lý
         * => update sort bằng cách check onChange của table (onChangeTable)
         */
        sorter: (a, b) => 0,
      };
    });

  return arr.map((el: any) => {
    const { name, children, treeLv } = el;
    if (!children?.length) {
      return { title: name, dataIndex: name, parentKeys };
    }

    const newKeys = [...parentKeys, name];
    const newChildren = getColumns(
      children,
      valueCols,
      columnConfigs,
      countryIdx,
      newKeys
    );
    let title = name;

    if (countryIdx > -1 && countryIdx === treeLv) {
      const countryName = getCountryNameFromCode(name);
      if (countryName !== name) {
        title = countryName + " (" + name + ")";
      }
    }

    return {
      ...el,
      title,
      dataIndex: name,
      parentKeys,
      children: newChildren,
    };
  });
};

export const getTreeLabel = (str) => {
  let results = str;
  if (typeof str === "string") {
    if (str.toUpperCase() === str) {
      results = capitalizeWord(str);
    } else {
      results = getLabelFromCamelCaseStr(str, false);
    }
  }
  return results;
};
