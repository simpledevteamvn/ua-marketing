import React from "react";
import TableSettings from "./TableSettings";
import Table, { TableProps } from "antd/lib/table";
import { getResizableColumns, ResizableTitle } from "./ResizeTitle";
import { numberWithCommas } from "../../../utils/Utils";
import { NOT_A_NUMBER } from "../../../constants/constants";
import classNames from "classnames";
import { DataNode } from "antd/es/tree";
import { Moment } from "moment";
import { roundNumber } from "../../../utils/Helpers";

interface Setting {
  orderData?: string[];
  totalFixedLeft?: number;
  totalFixedRight?: number;
}

export interface TableSettingState extends Setting {
  [key: string]: boolean | any;
}

interface TableWrapperProps extends TableProps<any> {
  /**
   * Để resize table: thêm "initialColumns" và "setColumns" thuộc tính
   * và trong file cấu hình table đảm bảo tất cả các columns đều có thuộc tính width
   * Note: có thể cấu hình minWidth || maxWidth || transformScale khi resize column
   */
  initialColumns: any;
  setColumns: (any) => any;
  /**
   * treeColumns: Chứa các column để khởi tạo cho bảng Settings.
   * Note: nên khởi tạo biến này trước với các columns động/đặc biệt:
   *  - Các columns được gom chung thành một nhóm (Tree metrics)
   *  - Các column đặc biệt mà có thể có logic ẩn hiện (khi khởi tạo có thể có column chưa có trong biến initialColumns)
   *  - Các column với tên column (title) là động -> hardcode lại tên nếu muốn (hoặc dùng biến "settingName")
   */
  treeColumns?: DataNode[]; // Gộp chung một số cột thành một node của tree để dễ chọn
  dateRange?: Moment[];
  leftEl?: React.ReactNode;
  dataSource: any;
  isShowSettings?: boolean;
  isShowSummary?: boolean;
  isSkanPage?: boolean;
  additionalSetting?: React.ReactNode;
  headerSticky?: boolean;
  settingClassNames?: string;
  handleDownloadCSV?: (any) => any;
  /**
   * Để lưu settings thì truyền 2 tham số bên dưới và
   * trong file ColumnConfig của table define tham số "columnId" cho mỗi column
   * E.g. SummaryTable.tsx
   */
  setColSettings?: (any) => any;
  /**
   * colSettings: Lưu thứ tự order và logic ẩn hiện column
   * E.g. { bid: true, cost: false, orderData: ["name", "bid", "budget", "cost"]}
   * Khi isModalSetting = true (hiển thị setting kiểu mới) -> có thể đổi cấu trúc về dạng mảng. Tuy nhiên để đồng nhất thì vẫn giữ nguyên
   */
  colSettings?: TableSettingState;
  isModalSetting?: boolean;
}

function TableWrapper(props: TableWrapperProps) {
  const {
    setColumns,
    leftEl,
    initialColumns,
    dataSource,
    className,
    isShowSettings = true,
    isShowSummary = true,
    additionalSetting,
    headerSticky,
    settingClassNames,
    handleDownloadCSV,
    setColSettings,
    colSettings,
    treeColumns,
    dateRange,
    isModalSetting = false,
    isSkanPage,
  } = props;

  const resizableColumns = getResizableColumns(initialColumns, setColumns);

  const getSummaryTable = (pageData) => {
    if (!isShowSummary || !dataSource?.length) return <></>;

    const hasCheckbox = Object.keys(props.rowSelection || {}).length > 0;
    let columns = [...initialColumns];

    if (hasCheckbox) {
      columns = ["checkboxSummary", ...initialColumns];
    }

    return (
      <Table.Summary fixed="top">
        <Table.Summary.Row>
          {hasCheckbox ? (
            <>
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={1}>Summary</Table.Summary.Cell>
            </>
          ) : (
            <Table.Summary.Cell index={0}>Summary</Table.Summary.Cell>
          )}
          {columns.map((columnConfig, idx) => {
            const {
              isShowSummary,
              checked,
              isSummaryEmpty,
              summaryPrefix,
              calc,
              summaryValue,
            } = columnConfig;

            // Don't calculate TotalCell
            if (!idx || checked === false) return;
            if (idx === 1 && hasCheckbox) return;

            if (isSummaryEmpty || isShowSummary === false) {
              return <Table.Summary.Cell index={idx} key={idx} />;
            }

            if (
              Object.keys(columnConfig).includes("summaryValue") &&
              summaryValue !== undefined
            ) {
              return (
                <Table.Summary.Cell index={idx} key={idx}>
                  {summaryValue}
                </Table.Summary.Cell>
              );
            }

            if (calc) {
              const calculatedTotal = calculateSummary(pageData, columnConfig);
              return (
                <Table.Summary.Cell index={idx} key={idx}>
                  {calculatedTotal !== "" && calc.preffix}
                  {calculatedTotal}
                  {calculatedTotal !== "" && calc.suffixStr}
                </Table.Summary.Cell>
              );
            }

            return (
              <Table.Summary.Cell index={idx} key={idx}>
                {summaryPrefix}
                {getTotalDataByField(pageData, columnConfig)}
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  const getTotalDataByField = (
    listData,
    columnConfig,
    initialValue = 0,
    isFormat = true
  ) => {
    const { summaryIndex, getSummaryField, decimal } = columnConfig;
    if (!summaryIndex && !getSummaryField) return 0;

    const result = listData.reduce((preValue, currValue) => {
      let currentValue = getSummaryField
        ? getSummaryField(currValue)
        : currValue[summaryIndex];

      if (!currentValue || currentValue === NOT_A_NUMBER) {
        currentValue = 0;
      }

      return roundNumber(preValue + Number(currentValue), false, decimal || 0);
    }, initialValue);

    if (isFormat) {
      return numberWithCommas(result);
    }

    return result;
  };

  const calculateSummary = (listData, columnConfig) => {
    const { calc } = columnConfig;
    const { numerator, denominator, per, maxDecimal } = calc;
    const decimal = maxDecimal === 0 ? 0 : maxDecimal || 2;

    let numeratorValue;
    if (typeof numerator === "function") {
      numeratorValue = getTotalDataByField(
        listData,
        { getSummaryField: numerator, decimal },
        0,
        false
      );
    } else {
      const numeratorIdx = initialColumns.findIndex(
        (el) => el.columnId === numerator
      );

      if (numeratorIdx === -1) return "";

      numeratorValue = getTotalDataByField(
        listData,
        initialColumns[numeratorIdx],
        0,
        false
      );
    }

    let denominatorValue;
    if (typeof denominator === "function") {
      denominatorValue = getTotalDataByField(
        listData,
        { getSummaryField: denominator, decimal },
        0,
        false
      );
    } else {
      const denominatorIdx = initialColumns.findIndex(
        (el) => el.columnId === denominator
      );

      if (denominatorIdx === -1) return "";

      denominatorValue = getTotalDataByField(
        listData,
        initialColumns[denominatorIdx],
        0,
        false
      );
    }

    if (!denominatorValue) {
      return "";
    }

    const num = Math.pow(10, decimal);
    const perValue = per || 1;
    const result =
      Math.round((numeratorValue / denominatorValue) * num * perValue) / num;
    return numberWithCommas(result);
  };

  return (
    <div id={`TableWrapper--${props.id}`} className={className}>
      <div
        className={classNames(
          "flex justify-between items-center",
          headerSticky && "TableWrapper-header sticky top-16 z-10 py-2 bg-white"
        )}
      >
        <div>{leftEl}</div>

        {isShowSettings && (
          <TableSettings
            classNames={settingClassNames}
            columns={[...initialColumns]}
            setColumns={setColumns}
            setColSettings={setColSettings}
            colSettings={colSettings}
            dataSource={props.dataSource}
            id={props.id}
            isSkanPage={isSkanPage}
            additionalSetting={additionalSetting}
            handleDownloadCSV={handleDownloadCSV}
            treeColumns={treeColumns}
            dateRange={dateRange}
            isModalSetting={isModalSetting}
          />
        )}
      </div>

      <Table
        {...props}
        columns={resizableColumns.filter((el) => el.checked !== false)}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        summary={getSummaryTable}
      />
    </div>
  );
}

export default TableWrapper;
