import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import { useParams } from "react-router";
import Breadcrumb from "antd/lib/breadcrumb";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  EXTRA_FOOTER,
  MESSAGE_DURATION,
  OFFSET_TABLE_HEADER,
  ORGANIZATION_PATH,
} from "../../../constants/constants";
import { Link } from "react-router-dom";
import service, {
  baseURL,
  checkResponseStatus,
  LIST_ERROR_CODE,
  OG_CODE_HEADER,
} from "../../../partials/services/axios.config";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../partials/common/Forms/RangePicker";
import {
  capitalizeWord,
  disabledDate,
  filterSelect,
  getCountryNameFromCode,
  getTotalChildrenStr,
  sortNumberWithNullable,
} from "../../../utils/Helpers";
import Tag from "antd/lib/tag";
import DatePicker from "antd/lib/date-picker";
import moment from "moment";
import Button from "antd/lib/button/button";
import { getColumns, getTreeLabel, groupByFields } from "../Helpers";
import DownloadOutlined from "@ant-design/icons/lib/icons/DownloadOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import ModalAddAndEdit from "../ModalAddAndEdit";
import { useQuery } from "@tanstack/react-query";
import { LIST_STORE_APPS } from "../../../api/constants.api";
import { getStoreApps } from "../../../api/apps/apps.api";
import axios from "axios";
import Select from "antd/lib/select";
import classNames from "classnames";
import TableWrapper from "../../../partials/common/Table/TableWrapper";
import SaveOutlined from "@ant-design/icons/lib/icons/SaveOutlined";
import { toast } from "react-toastify";
import message from "antd/lib/message";
import Loading from "../../../utils/Loading";
import SelectCountryFromList from "../../../partials/common/Forms/SelectCountryFromList";

interface FilterData {
  listField: string[];
  actived: string[];
}

interface FilterState {
  [field: string]: FilterData;
}

const COUNTRY_CODE = "country";

function DetailPivot(props) {
  const urlParams = useParams();
  const token = useSelector((state: RootState) => state.account.token);
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );
  const pivotUrl = ORGANIZATION_PATH + "/" + organizationCode + "/pivot";

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
  const [listStoreApps, setListStoreApps] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [editedData, setEditedData] = useState<any>({});
  const [pivotData, setPivotData] = useState<any>({});
  const [listFilters, setListFilters] = useState<FilterState>({});
  const [hasFilters, setHasFilters] = useState(false);
  const [isInitedFilter, setIsInitedFilter] = useState(false);

  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());
  const [rawData, setRawData] = useState([]);
  const [tableData, setTableData] = useState<any>([]);
  const [columns, setColumns] = useState<any>([]);

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  useEffect(() => {
    service.get(`/pivot-table/${urlParams.pivotId}`).then(
      (res: any) => {
        initPivot(res.results);
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    getTableData();
  }, []);

  const getTableData = () => {
    const params = {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      pivotTableId: urlParams.pivotId,
    };

    setIsLoading(true);
    service.get("/pivot-table/data", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setRawData(res.results?.rawData);
      },
      () => setIsLoading(false)
    );
  };

  const filterRawData = (newFilters) => {
    return rawData.filter((data) => {
      let isRemove = false;
      Object.keys(newFilters).forEach((field) => {
        if (isRemove) return;

        const listActived = newFilters[field]?.actived || [];
        if (listActived.length && !listActived.includes(data[field])) {
          isRemove = true;
        }
      });

      return !isRemove;
    });
  };

  const updateTableData = (newFilters) => {
    const newList = filterRawData(newFilters);
    const rows = pivotData.rows || [];
    let newTableData: any = [];

    newList.forEach((data, idx) => {
      newTableData = groupByFields(data, rows, newTableData, 0, idx, pivotData);
    });

    console.log("data :>> ", newList.length, newTableData);
    setTableData(newTableData);
  };

  const initPivot = (newData) => {
    setPivotData(newData || {});
    setEditedData(newData);
    if (newData?.filters?.length) {
      let newFilter = {};
      newData?.filters.forEach((field) => {
        newFilter = { ...newFilter, [field]: undefined };
      });
      setListFilters(newFilter);
      !hasFilters && setHasFilters(true);
    } else {
      hasFilters && setHasFilters(false);
    }
  };

  const initFilter = () => {
    const { filterData } = pivotData;
    let newFilters: FilterState = listFilters;

    rawData.forEach((data) => {
      Object.keys(listFilters).forEach((field) => {
        const dataValue = data[field];
        if (data[field] && !newFilters[field]?.listField?.includes(dataValue)) {
          const newList = newFilters[field]?.listField || [];
          newList.push(dataValue);

          let actived = [];
          if (filterData?.length) {
            const initedFilter = filterData.find((el) => el.key === field);
            if (initedFilter) {
              actived = initedFilter.values || [];
            }
          }

          newFilters = {
            ...newFilters,
            [field]: { listField: newList, actived },
          };
        }
      });
    });

    !isInitedFilter && setIsInitedFilter(true);
    setListFilters(newFilters);
    updateTableData(newFilters);
  };

  useEffect(() => {
    if (!rawData?.length || !Object.keys(pivotData || {}).length) {
      return;
    }

    const values = pivotData.values || [];
    const columns = pivotData.columns || [];

    const valueCols: any = [];
    values.forEach((colData) => {
      valueCols.push({
        title: capitalizeWord(colData.name),
        width: 100,
        maxWidth: 600,
        transformScale: 2.5,
        field: colData.name,
        function: colData.function,
      });
    });

    let columnsData = [];
    rawData.forEach((data, idx) => {
      columnsData = groupByFields(
        data,
        columns,
        columnsData,
        0,
        idx,
        pivotData,
        true
      );
    });

    const countryIdx = getCountryIdx(false);
    const newCols = getColumns(columnsData, valueCols, columns, countryIdx);
    const colDimension = columns.length || 1;
    const maxCol = colDimension > 1 ? 1000 : 2000;

    if (newCols.length > maxCol) {
      return message.error(
        "Too much data to display. Please limit it.",
        MESSAGE_DURATION
      );
    }

    setColumns([getNameCol(), ...newCols]);
    initFilter();
  }, [rawData, pivotData]);

  const getNameCol = () => {
    return {
      title: "Name",
      width: 300,
      transformScale: 2.5,
      render: (rd) => {
        const { tableLabel, name, treeLv } = rd;
        const totalChildren = getTotalChildrenStr(rd);
        const countryIdx = getCountryIdx();
        const rowLength = pivotData?.rows?.length || 0;

        let label = tableLabel || name;
        let countryCode;
        let hasFlag = false;

        if (
          countryIdx > -1 &&
          (countryIdx === treeLv ||
            (countryIdx === rowLength - 1 && rd[COUNTRY_CODE]))
        ) {
          if (countryIdx === treeLv) {
            countryCode = label;
          } else {
            countryCode = rd[COUNTRY_CODE];
          }

          const countryName = getCountryNameFromCode(countryCode);
          if (countryName !== countryCode) {
            hasFlag = true;
            label = countryName + " (" + countryCode + ")";
          }
        }

        const recordName = label + totalChildren;

        return (
          <div
            title={recordName}
            className={classNames(
              "truncate",
              totalChildren && "cursor-pointer"
            )}
            onClick={() => totalChildren && onClickName(rd)}
          >
            {hasFlag && (
              <span
                className={`fi fi-${countryCode.toLowerCase()} w-5 h-3 mr-1`}
              />
            )}
            {recordName}
          </div>
        );
      },
      sorter: (a, b) => {
        const aData = a.tableLabel || a.name;
        const bData = b.tableLabel || b.name;
        return ("" + aData).localeCompare(bData);
      },
    };
  };

  const getCountryIdx = (targetRow = true) => {
    const rows = pivotData?.rows || [];
    const columns = pivotData?.columns || [];
    const checkList = targetRow ? rows : columns;

    const countryIdx = checkList.findIndex((el) => el === COUNTRY_CODE);
    return countryIdx;
  };

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const handleDownload = () => {
    const params = {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      pivotTableId: urlParams.pivotId,
    };

    setPageLoading(true);
    axios
      .get(`${baseURL}/pivot-table/file`, {
        params,
        headers: { Authorization: token, [OG_CODE_HEADER]: organizationCode },
        responseType: "blob",
      })
      .then(
        (res: any) => {
          setPageLoading(false);

          if (!res.data) return;
          if (LIST_ERROR_CODE.includes(res.data.code)) {
            return checkResponseStatus(res);
          }

          const href = URL.createObjectURL(
            new Blob([res.data], {
              type: "application/octet-stream",
            })
          );
          const link = document.createElement("a");
          const filename =
            res.headers["content-disposition"].split("filename=")[1];

          link.href = href;
          link.setAttribute("download", filename || pivotData.name + ".xlsx");
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          URL.revokeObjectURL(href);
        },
        () => setPageLoading(false)
      );
  };

  const editCallback = (newPivotData) => {
    initPivot(newPivotData);
    getTableData();
  };

  const onCloseModal = () => {
    setIsOpenModalEdit(false);
  };

  const handleEdit = () => {
    setIsOpenModalEdit(true);
    setEditedData(pivotData);
  };

  const onSaveFilters = () => {
    const filterData: any = [];
    Object.keys(listFilters).forEach((field) => {
      const listActived = listFilters[field]?.actived;
      if (!listActived?.length) return;

      filterData.push({ key: field, values: listActived });
    });

    setIsLoading(true);
    service({
      method: "put",
      url: "/pivot-table/filter",
      data: {
        id: pivotData.id,
        filterData,
      },
    }).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const onChangeFilter = (values, field) => {
    const newFilters: FilterState = {
      ...listFilters,
      [field]: {
        ...listFilters[field],
        actived: values,
      },
    };

    setListFilters(newFilters);
    updateTableData(newFilters);
  };

  const onChangeTable = (pagination, filters, sorter, extra) => {
    const field = sorter.column?.field;
    const order = sorter.order;
    const sortedData = extra.currentDataSource;

    if (order === "ascend") {
      sortedData.sort((a, b) =>
        sortNumberWithNullable(a, b, (el) => el[field])
      );
      setTableData(sortedData);
    } else if (order === "descend") {
      sortedData.sort((a, b) =>
        sortNumberWithNullable(b, a, (el) => el[field])
      );
      setTableData(sortedData);
    }
  };

  useEffect(() => {
    if (!columns?.length) return;

    const restCols = [...columns];
    restCols.shift();
    setColumns([getNameCol(), ...restCols]);
  }, [expandedKeys]);

  const onExpand = (expanded, record) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.tableId]);
    } else {
      const newKeys = expandedKeys.filter((el) => el !== record.tableId);
      setExpandedKeys(newKeys);
    }
  };

  const onClickName = (record) => {
    const isExpanded = expandedKeys.includes(record.tableId);
    onExpand(!isExpanded, record);
  };

  const listButtons = (
    <>
      <Button
        onClick={handleEdit}
        icon={<EditOutlined />}
        // Todo: show in mobile
        className="!hidden sm:!block"
      >
        <span className="">Edit</span>
      </Button>
      <Button onClick={handleDownload} icon={<DownloadOutlined />}>
        <span className="">Download file</span>
      </Button>
    </>
  );
  const maxHeight = window.innerHeight - 200;
  const tableHeight = maxHeight > 700 ? maxHeight : 700;

  return (
    <Page>
      <div className="page-breadcrum">
        {pageLoading && <Loading />}

        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to={pivotUrl}>Pivot</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{pivotData?.name}</Breadcrumb.Item>
        </Breadcrumb>

        {rawData && (
          <div className="hidden sm:flex justify-end space-x-2">
            {listButtons}
          </div>
        )}
      </div>

      {rawData && (
        <div className="flex sm:hidden justify-end space-x-2 pr-4 mt-4">
          {listButtons}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="page-filter rounded-sm !mt-0 sm:!mt-2">
          <DatePicker.RangePicker
            className="w-full xs:w-auto filter-item"
            open={isOpenDateRange}
            onOpenChange={(open) => setIsOpenDateRange(open)}
            value={dateRange}
            onChange={onChangeRangePicker}
            disabledDate={disabledDate}
            renderExtraFooter={() => (
              <div className="flex py-2.5">
                {EXTRA_FOOTER.map((obj, idx) => (
                  <Tag
                    key={idx}
                    color="blue"
                    className="cursor-pointer"
                    onClick={() =>
                      onClickRangePickerFooter(obj.value, setDateRange, () =>
                        setIsOpenDateRange(false)
                      )
                    }
                  >
                    {obj.label}
                  </Tag>
                ))}
              </div>
            )}
          />

          <Button type="primary" className="filter-item" onClick={getTableData}>
            Search
          </Button>
        </div>

        <div
          className={classNames(
            !isInitedFilter || !hasFilters ? "mb-6" : "mb-3"
            // "mb-3",
            // isInitedFilter && !hasFilters && "mb-6"
          )}
        >
          {isInitedFilter && hasFilters && (
            <div className="flex items-start justify-between mt-4">
              <div className="flex flex-wrap items-center -mx-1 md:!-mx-2">
                <div className="mt-2 font-semibold text-base !mx-1 md:!ml-2">
                  Filters:
                </div>

                {Object.keys(listFilters || {}).map((field, idx) => {
                  const { listField, actived } = listFilters[field] || {};
                  const itemClass = "!mt-2 w-[240px] !mx-1 md:!mx-2";

                  if (field === COUNTRY_CODE) {
                    return (
                      <SelectCountryFromList
                        key={idx}
                        classNames={itemClass}
                        value={actived}
                        listCountries={listField}
                        onChange={(value) => onChangeFilter(value, field)}
                      />
                    );
                  }

                  return (
                    <Select
                      key={idx}
                      className={itemClass}
                      placeholder={`Select ${getTreeLabel(
                        field
                      )?.toLowerCase()}`}
                      mode="multiple"
                      allowClear
                      value={actived}
                      onChange={(value) => onChangeFilter(value, field)}
                      showSearch
                      maxTagCount="responsive"
                      filterOption={filterSelect}
                    >
                      {listField?.map((data) => (
                        <Select.Option key={data}>{data}</Select.Option>
                      ))}
                    </Select>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-end mb-2 xs:mb-0">
                <Button
                  icon={<SaveOutlined />}
                  onClick={onSaveFilters}
                  title="Save filters"
                />
              </div>
            </div>
          )}
        </div>

        <div className="">
          <TableWrapper
            isShowSettings={false}
            isShowSummary={false}
            initialColumns={columns}
            setColumns={setColumns}
            dataSource={tableData}
            tableLayout="fixed"
            expandedRowKeys={[...expandedKeys]}
            onExpand={onExpand}
            sticky={{ offsetHeader: OFFSET_TABLE_HEADER }}
            loading={isLoading}
            rowKey={(record: any) => record.tableId || record.id}
            scroll={{
              x: 800,
              y: tableData?.length < 20 ? undefined : tableHeight,
            }}
            onChange={onChangeTable}
            pagination={false}
            bordered
          />
          <div className="my-1 md:mr-3 text-end">
            {tableData?.length > 0 && <>Total: {tableData?.length} items</>}
          </div>
        </div>
      </div>

      <ModalAddAndEdit
        editedData={editedData}
        isOpen={isOpenModalEdit}
        onClose={onCloseModal}
        listStoreApps={listStoreApps}
        editCallback={editCallback}
      />
    </Page>
  );
}

DetailPivot.propTypes = {};

export default DetailPivot;
