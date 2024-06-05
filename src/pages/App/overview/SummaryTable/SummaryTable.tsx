import React from "react";
import {
  DATE_RANGE_FORMAT,
  getLTVDay,
  onClickRangePickerFooter,
} from "../../../../partials/common/Forms/RangePicker";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { getSummaryTableFilter } from "../../../../api/overview/overview";
import { useState } from "react";
import { useEffect } from "react";
import Dropdown from "antd/lib/dropdown";
import { BsArrowReturnRight } from "@react-icons/all-files/bs/BsArrowReturnRight";
import {
  GET_STORE_APP_BY_ID,
  OVERVIEW_TABLE_FILTERS,
} from "../../../../api/constants.api";
import service from "../../../../partials/services/axios.config";
import Radio from "antd/lib/radio";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import TableWrapper, {
  TableSettingState,
} from "../../../../partials/common/Table/TableWrapper";
import getTableColumns from "./ColumnConfig";
import Switch from "antd/lib/switch";
import {
  deepFilterData,
  getColSettings,
  getInitedSettings,
  setRangeValue,
} from "../../../../utils/helper/TableHelpers";
import {
  COL_IDS,
  WRAPPER_COL_IDS,
} from "../../CampaignCenter/CampaignIntel/constants";
import { TREE_COLS, minifiedAdNetworkCols } from "./ColumnConstants";
import { getDynamicDays } from "../../CampaignCenter/CampaignIntel/Helper";
import { EXTRA_FOOTER, STORE } from "../../../../constants/constants";
import Tag from "antd/lib/tag";
import { disabledDate } from "../../../../utils/Helpers";
import DatePicker from "antd/lib/date-picker";
import moment from "moment";
import { useDevice } from "../../../../utils/hooks/CustomHooks";
import { useParams } from "react-router-dom";
import { getStoreAppById } from "../../../../api/common/common.api";

interface TableFilter {
  filter: string;
  subFilter: string;
  listFilter: any[];
  listSubFilter: any[];
}

const tableId = "SummaryTable";
const ListPageSize = [25, 50, 100, -1];

function SummaryTable(props) {
  const urlParams = useParams();
  const isMobile = useDevice();
  const {
    getHeaderFilter,
    recallApi,
    isSkanPage,
    isAllApp,
    initTableState,
    setInitTableState,
    dateRange,
  } = props;

  const defaultChartFilter: TableFilter = {
    filter: "",
    subFilter: "",
    listFilter: [],
    listSubFilter: [],
  };
  const [tableFilter, setTableFilter] =
    useState<TableFilter>(defaultChartFilter);

  const [isLoading, setIsLoading] = useState(false);
  const [storedFilter, setStoredFilter] = useState<any>();
  const [tableData, setTableData] = useState([]);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});

  const [isInit, setIsInit] = useState(true);
  // Prevent updating twice times when has the template state (Changed field: filter and subFilter)
  const [isGetTempStateDone, setIsGetTempStateDone] = useState(false);
  const [isClear, setIsClear] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange2, setDateRange2] = useState<any>(getLTVDay());
  // Khi dateRange2 thay đổi thì có thể call api nhiều lần (chạy hàm updateTableData) nên dùng state dưới để control chỉ call 1 lần
  const [countUpdateRange2, setCountUpdateRange2] = useState(0);

  const adNetworkKeys = minifiedAdNetworkCols.map((el) => el.key);
  const initedColumns = isSkanPage
    ? [COL_IDS.name, WRAPPER_COL_IDS.skanOverviewLv]
    : [COL_IDS.name, ...adNetworkKeys];
  const [colSettings, setColSettings] = useState<TableSettingState>(
    getInitedSettings(TREE_COLS, initedColumns)
  );
  const [treeColumns, setTreeColumns] = useState<any>([]);

  const [isShowSkanCols, setIsShowSkanCols] = useState();
  const [isShowAttrCols, setIsShowAttrCols] = useState();
  const [isShowCohortCols, setIsShowCohortCols] = useState();
  const [isIosApp, setIsIosApp] = useState(false);
  const [updateWhenChangeSwitch, setUpdateWhenChangeSwitch] = useState(true);
  const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
  const [columns, setColumns] = useState([]);
  const [tablePageSize, setTablePageSize] = useState<number>(ListPageSize[0]);
  const { filter, subFilter, listFilter, listSubFilter } = tableFilter;

  const { data: filterResponse } = useQuery({
    queryKey: [OVERVIEW_TABLE_FILTERS, isAllApp, isSkanPage],
    queryFn: getSummaryTableFilter,
    staleTime: 20 * 60000,
  });

  const { data: storeAppRes } = useQuery({
    queryKey: [GET_STORE_APP_BY_ID, urlParams.appId],
    queryFn: getStoreAppById,
    staleTime: 5 * 60000,
    enabled: !!urlParams.appId,
  });
  const { appId } = useParams();
  useEffect(() => {
    const removedKeys = isSkanPage
      ? [
          WRAPPER_COL_IDS.cohort,
          WRAPPER_COL_IDS.adNetworkLv,
          WRAPPER_COL_IDS.skanLv,
          WRAPPER_COL_IDS.attrLv,
        ]
      : [WRAPPER_COL_IDS.skanOverviewLv];
    if (!isIosApp) {
      // isSkanPage luôn = false -> cần bỏ nốt WRAPPER_COL_IDS.skanLv
      removedKeys.push(WRAPPER_COL_IDS.skanLv);
    }
    const treeColumns = TREE_COLS.filter((el) => !removedKeys.includes(el.key));
    setTreeColumns(treeColumns);
  }, [isSkanPage, isIosApp]);

  useEffect(() => {
    if (storeAppRes?.results?.store === STORE.apple.name) {
      setIsIosApp(true);
    }
  }, [storeAppRes]);

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  useEffect(() => {
    service.get("/campaign-report-setting/" + appId).then((res: any) => {
      if (isSkanPage == true) {
        setColSettings(
          res.results?.summaryTableSKANSettingDetails == null
            ? colSettings
            : res.results?.summaryTableSKANSettingDetails
        );
      } else {
        setColSettings(
          res.results?.summaryTableOverviewSettingDetails == null
            ? colSettings
            : res.results?.summaryTableOverviewSettingDetails
        );
      }
    });
  }, []);

  useEffect(() => {
    if (initTableState === undefined || isGetTempStateDone) return;

    const isExistFilter = listFilter.some(
      (el) => el.key === initTableState?.filter
    );
    const newFilter = isExistFilter
      ? initTableState?.filter
      : listFilter[0]?.key;

    const newListSubFilter = listFilter.filter((el) => el.key !== newFilter);
    const isExistSubFilter = newListSubFilter.some(
      (el) => el.key === initTableState?.subFilter
    );
    const newSubFilter = isExistSubFilter
      ? initTableState?.subFilter
      : newListSubFilter[0]?.key;

    const newTop = ListPageSize.includes(initTableState?.top)
      ? initTableState?.top
      : ListPageSize[0];

    setIsGetTempStateDone(true);
    setTableFilter({
      ...tableFilter,
      filter: newFilter,
      subFilter: isClear ? "" : newSubFilter,
      listSubFilter: newListSubFilter,
    });
    setTablePageSize(newTop);
  }, [initTableState]);

  useEffect(() => {
    const filterData = filterResponse?.results;

    if (!filterData?.length) return;

    setTableFilter({
      filter: initTableState?.filter || filterData[0].key,
      subFilter: initTableState?.subFilter || filterData[1].key,
      listFilter: filterData,
      listSubFilter: filterData.slice(1),
    });
    setStoredFilter(filterData);
  }, [filterResponse]);

  const updateTableData = () => {
    if (!dateRange2 || dateRange2.length < 2) return;

    const headerFilter = getHeaderFilter();
    let url = "/dashboard/overview/dimension-table";

    if (isSkanPage) {
      url = "/dashboard/skan/dimension-table";
    }

    setIsLoading(true);
    service
      .get(url, {
        params: {
          ...headerFilter,
          firstDimension: filter,
          secondDimension: subFilter,
          limit: tablePageSize,
          containSkanReport: isShowSkanCols,
          containAttributeReport: isShowAttrCols,
          containCohortReport: isShowCohortCols,
          arpdauStartRange: moment(dateRange2[0]).format(DATE_RANGE_FORMAT),
          arpdauEndRange: moment(dateRange2[1]).format(DATE_RANGE_FORMAT),
        },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          const newTableData = res?.results?.map((el, lv1Id) => {
            if (!el.subDimension?.length) {
              return { ...el, key: lv1Id, isEmptyChildren: true };
            }

            // Lấy parentId vì khi filter === DATE_DIMENSION, ở cấp con không có thông tin date (el.id) của cấp cha
            const newSubDimension = el.subDimension.map((sub, lv2Id) => {
              return { ...sub, key: lv1Id + "," + lv2Id, parentId: el.id };
            });
            return { ...el, key: lv1Id, children: newSubDimension };
          });

          setTableData(newTableData || []);
        },
        () => setIsLoading(false)
      );
  };

  useEffect(() => {
    if (isInit) {
      return setIsInit(false);
    }
    if (!filter || !isGetTempStateDone) return;

    if (!updateWhenChangeSwitch) {
      return setUpdateWhenChangeSwitch(true);
    }

    updateTableData();
  }, [
    recallApi,
    tablePageSize,
    tableFilter,
    isShowSkanCols,
    isShowAttrCols,
    isShowCohortCols,
    countUpdateRange2, // dùng thay cho dateRange2,
  ]);

  const getMenuList = (listData) => {
    return (
      listData?.map((el) => {
        return { key: el.key, label: el.name };
      }) || []
    );
  };

  const handleSetTableFilter = (newFilters) => {
    setTableFilter(newFilters);
    setInitTableState({ ...initTableState, ...newFilters });
  };

  const handleSetPageSize = (e) => {
    setTablePageSize(e.target.value);
    setInitTableState({ ...initTableState, top: e.target.value });
  };

  const onChangeFilter = (itemKey, isSubFilter = false) => {
    let newListSubFilter = [...listSubFilter];
    let newSubFilter = isSubFilter ? itemKey : subFilter;

    if (!isSubFilter) {
      newListSubFilter = storedFilter.filter((el) => el.key !== itemKey);

      if (itemKey === subFilter) {
        newSubFilter = "";
      }
    } else {
      isClear && setIsClear(false);
    }

    handleSetTableFilter({
      ...tableFilter,
      filter: isSubFilter ? filter : itemKey,
      subFilter: newSubFilter,
      listSubFilter: newListSubFilter,
    });
  };

  const onClearSubFilter = () => {
    setIsClear(true);
    handleSetTableFilter({ ...tableFilter, subFilter: "" });
  };

  const onExpand = (expanded, record) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.key]);
    } else {
      const newKeys = expandedKeys.filter((el) => el !== record.key);
      setExpandedKeys(newKeys);
    }
  };

  const onClickName = (record) => {
    const isExpanded = expandedKeys.includes(record.key);
    onExpand(!isExpanded, record);
  };

  const updateColumns = () => {
    const columns = getTableColumns({
      isSkanPage,
      onClickName,
      tableData,
      storedFilter,
      filter,
      subFilter,
      searchText,
      onSearchText,
      dateRange,
      dateRange2,
      isMobile,
      onFilterTable,
    });

    const newCols = getColSettings(columns, colSettings);
    setColumns(newCols);
  };

  const onSearchText = (text) => {
    setSearchText(text);
  };

  useEffect(() => {
    updateColumns();
  }, [
    tableData,
    colSettings,
    storedFilter,
    filter,
    subFilter,
    expandedKeys,
    searchText,
    isShowSkanCols,
    isShowAttrCols,
    isShowCohortCols,
    isMobile,
  ]);

  const onToggleAttrData = (value) => {
    if (!value) {
      setUpdateWhenChangeSwitch(false);
    }
    setIsShowAttrCols(value);
  };

  const onToggleCohortData = (value) => {
    if (!value) {
      setUpdateWhenChangeSwitch(false);
    }
    setIsShowCohortCols(value);
  };

  const onToggleSkanData = (value) => {
    if (!value) {
      setUpdateWhenChangeSwitch(false);
    }
    setIsShowSkanCols(value);
  };

  const onChangeRangePicker = (values) => {
    setDateRange2(values);
  };

  const onOpenChange = (value) => {
    setIsOpenDateRange(value);
    if (!value) {
      setCountUpdateRange2(countUpdateRange2 + 1);
    }
  };

  const activedFilter = storedFilter?.find((el) => el.key === filter);
  const activedSubFilter = listSubFilter?.find((el) => el.key === subFilter);

  let scrollWidth;
  if (columns?.length) {
    scrollWidth = (columns.length - 1) * 180 + 300;
  }

  const tableLeftEl = (
    <div className="px-5 mb-4">
      <div className="flex flex-col xl:flex-row xl:items-center xl:space-x-10 xl:h-8 mb-2.5">
        <div className="flex items-center space-x-2">
          <div className="hidden xs:block">Group by</div>
          <Dropdown
            className="!ml-0 xs:!ml-2"
            menu={{
              selectable: true,
              selectedKeys: [filter],
              items: getMenuList(listFilter),
              onClick: (item) => onChangeFilter(item.key),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light min-w-[70px]">
              {activedFilter?.name || "Choose"}
            </button>
          </Dropdown>
          <BsArrowReturnRight size={20} className="mt-1.5" />
          <Dropdown
            menu={{
              selectable: true,
              selectedKeys: [subFilter],
              items: getMenuList(listSubFilter),
              onClick: (item) => onChangeFilter(item.key, true),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light min-w-[70px]">
              {activedSubFilter?.name || "Choose"}
            </button>
          </Dropdown>
          <CloseOutlined
            className="ml-1.5 hover:text-slate-800 text-xs2"
            onClick={onClearSubFilter}
          />
        </div>

        {isShowCohortCols && (
          <div className="flex items-center mt-3 xl:mt-0">
            <div className="flex">
              ARPDAU
              <span className="hidden xs:inline-block ml-1">'s time range</span>
              <span>:</span>
            </div>
            <DatePicker.RangePicker
              className="!ml-2 !my-0"
              open={isOpenDateRange}
              onOpenChange={onOpenChange}
              value={dateRange2}
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
                        onClickRangePickerFooter(obj.value, setDateRange2, () =>
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
          </div>
        )}
      </div>
      {!isSkanPage && (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-sm mb-1">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="mr-2">
                MMP<span className="hidden xs:inline-block ml-1">data:</span>
              </div>
              <Switch
                size="small"
                title="MMP data"
                checked={isShowAttrCols}
                onChange={onToggleAttrData}
              />
            </div>
            {isIosApp && (
              <div className="flex items-center">
                <div className="mr-2">
                  Skan<span className="hidden xs:inline-block ml-1">data:</span>
                </div>
                <Switch
                  size="small"
                  title="Skan data"
                  checked={isShowSkanCols}
                  onChange={onToggleSkanData}
                />
              </div>
            )}
            <div className="flex items-center">
              <div className="mr-2">
                Cohort
                <span className="hidden xs:inline-block ml-1">data:</span>
              </div>
              <Switch
                size="small"
                title="Cohort data"
                checked={isShowCohortCols}
                onChange={onToggleCohortData}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-2 text-gray-800 text-sm">
        <span className="text-black font-bold">Note:</span> Cohort ROAS and LTV
        columns are 2 days behind (partial data); Cohort Revenue, Retention and
        Sigma Retention columns are 1 day behind.
      </div>
    </div>
  );

  const filteredData = deepFilterData(filterByMaxMin, tableData);

  return (
    <div className="overview-section pt-4">
      <TableWrapper
        isModalSetting
        treeColumns={treeColumns}
        dateRange={dateRange}
        settingClassNames="mr-4 mb-3"
        initialColumns={columns}
        leftEl={tableLeftEl}
        setColumns={setColumns}
        dataSource={filteredData}
        expandedRowKeys={[...expandedKeys]}
        onExpand={onExpand}
        bordered
        id={tableId}
        isSkanPage={isSkanPage}
        getPopupContainer={() => document.getElementById(tableId)!}
        loading={isLoading}
        colSettings={colSettings}
        setColSettings={setColSettings}
        rowKey={(record: any) => record.key}
        pagination={false}
        scroll={{ x: scrollWidth, y: 500 }}
      />

      <div className="flex justify-end m-3">
        <Radio.Group
          value={tablePageSize}
          onChange={handleSetPageSize}
          size={isMobile ? "small" : "middle"}
        >
          {ListPageSize.map((el) => (
            <Radio.Button key={el} value={el}>
              {el === -1 ? <>Unlimit</> : <>Top {el}</>}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
    </div>
  );
}

SummaryTable.propTypes = {
  getHeaderFilter: PropTypes.func,
  recallApi: PropTypes.bool,
  isAllApp: PropTypes.bool,
  isSkanPage: PropTypes.bool,
  initTableState: PropTypes.object,
  setInitTableState: PropTypes.func,
  dateRange: PropTypes.array,
};

export default SummaryTable;
