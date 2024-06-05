import React, { useEffect, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import Segmented from "antd/lib/segmented";
import { Dimension } from "../CampaignInterface";
import service, {
  OG_CODE_HEADER,
} from "../../../../partials/services/axios.config";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../../partials/common/Forms/RangePicker";
import TableWrapper, {
  TableSettingState,
} from "../../../../partials/common/Table/TableWrapper";
import { getTableColumns } from "./TableColumns";
import {
  ALL_AD_GROUP_OPTION,
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_KEYWORD_OPTION,
  ALL_NETWORK_OPTION,
  ALL_SITE_ID_OPTION,
  APP_PATH,
  CAMPAIGN_SEGMENTED,
  EDITABLE_STAT_IDS,
  LIST_CAMPAIGN_STATUS,
  ORGANIZATION_PATH,
} from "../../../../constants/constants";
import { LIST_DIMENSION } from "../../../../constants/dropdowns";
import { getSelectMultipleParams } from "../../../../utils/Helpers";
import { Client } from "@stomp/stompjs";
import ModalEdit from "./ModalEdit";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import classNames from "classnames";
import ModalEditMultiple from "./ModalEditMultiple";
import { useParams } from "react-router-dom";
import Switch from "antd/lib/switch";
import { useWindowSize } from "../../../../partials/sidebar/Sidebar";
import {
  getChildrenCheckbox,
  getDynamicDays,
  getSummaryData,
  reCalculateData,
  updateListFromData,
} from "./Helper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import {
  resetReportTable,
  updateReportTable,
} from "../../../../redux/socket/socketSlice";
import {
  deepFilterData,
  getColSettings,
  getInitedSettings,
  setRangeValue,
} from "../../../../utils/helper/TableHelpers";
import { convertData } from "./convertData";
import {
  COL_IDS,
  TREE_COLS,
  WRAPPER_COL_IDS,
  minifiedAdNetworkCols,
} from "./constants";

export const SITE_ID_LABEL = "Site Ids";
const OFFSET_TABLE_HEADER = 104;

// @ts-ignore
const SOCKET_URL = `${import.meta.env.VITE_WS_HOST}/ws-falcon-ua-api`;
function ReportTable(props) {
  const urlParams = useParams();
  const dispatch = useDispatch();
  const [width] = useWindowSize();
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );
  const listRealtimeData = useSelector(
    (state: RootState) => state.socket.reportTable
  );

  const {
    isLoading,
    setIsLoading,
    setRecallApi,
    recallApi,
    dateRange,
    dateRange2,
    filters,
    getAttrData,
    getSkanData,
    getCohortData,
  } = props;

  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const defaultPageSize = 20;
  const defaultFirstColName = "Network, App, Campaign, Country";
  const defaultSegmented = LIST_CAMPAIGN_STATUS.all.label;
  const storageSegmented = "report_table_segmented";

  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [segmented, setSegmented] = useState(defaultSegmented);
  const [listData, setListData] = useState([]);
  const [storedListData, setStoredListData] = useState<any>([]);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [countUpdateRT, setCountUpdateRT] = useState<any>([]);
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [columns, setColumns] = useState<any>([]);
  const [firstColName, setFirstColName] = useState(defaultFirstColName);
  const [expandedKeys, setExpandedKeys] = useState<any>([]);
  const [hasFixedCol, setHasFixedCol] = useState(true);

  const adNetworkKeys = minifiedAdNetworkCols.map((el) => el.key);
  const [colSettings, setColSettings] = useState<TableSettingState>(
    getInitedSettings(TREE_COLS, [
      COL_IDS.name,
      COL_IDS.bid,
      COL_IDS.budget,
      ...adNetworkKeys,
    ])
  );

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editedBid, setEditedBid] = useState({});
  const [editedSpecifyBid, setEditedSpecifyBid] = useState<any>({});

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isOpenEditMultipleModal, setIsOpenEditMultipleModal] = useState(false);
  const [editedCellData, setEditedCellData] = useState<any>(defaultCellData);
  const [isShowCheckbox, setIsShowCheckbox] = useState(false);
  const { appId } = useParams();
  const orgUrl = ORGANIZATION_PATH + "/" + organizationCode;
  const appUrl = APP_PATH + "/" + urlParams.appId;
  const baseUrl = orgUrl + appUrl;

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  useEffect(() => {
    if (!width) return;
    if (width < 768 && hasFixedCol) {
      return setHasFixedCol(false);
    }
    if (width >= 768 && !hasFixedCol) {
      return setHasFixedCol(true);
    }
  }, [width]);

  useEffect(() => {
    if (!recallApi) return;
    if (recallApi) setRecallApi(false);
    service.get("/campaign-report-setting/" + appId).then((res: any) => {
      setColSettings(
        res.results?.reportTableSettingDetails == null
          ? colSettings
          : res.results?.reportTableSettingDetails
      );
    });
  }, []);

  useEffect(() => {
    if (!dateRange?.length || !recallApi) return;

    const { dimension } = filters;
    const countries: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.country
    );
    const networks: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.adNetwork
    );
    const campaigns: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.campaign
    );
    const adGroups: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.adGroup
    );
    const adGroupsStatus: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.adGroupStatus
    );
    const keywords: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.keyword
    );
    const siteIds: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.siteId
    );
    const campaignTypes: Dimension = dimension?.find(
      (el) => el.activedDimension === LIST_DIMENSION.campaignType
    );

    let arpdauStartRange = "";
    let arpdauEndRange = "";
    if (dateRange2?.length === 2) {
      arpdauStartRange = moment(dateRange2[0]).format(DATE_RANGE_FORMAT);
      arpdauEndRange = moment(dateRange2[1]).format(DATE_RANGE_FORMAT);
    }

    const params = {
      containSkanReport: getSkanData,
      containAttributeReport: getAttrData,
      containCohortReport: getCohortData,
      storeAppId: urlParams.appId,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      arpdauStartRange,
      arpdauEndRange,
      adGroupStatus: adGroupsStatus?.activedFilters?.join(","),
      networks: getSelectMultipleParams(
        networks?.activedFilters,
        ALL_NETWORK_OPTION
      ).join(","),
      campaignIds: getSelectMultipleParams(
        campaigns?.activedFilters,
        ALL_CAMPAIGNS_OPTION
      ).join(","),
      countries: getSelectMultipleParams(
        countries?.activedFilters,
        ALL_COUNTRIES_OPTION
      ).join(","),
      rawAdGroupIds: getSelectMultipleParams(
        adGroups?.activedFilters,
        ALL_AD_GROUP_OPTION
      ).join(","),
      keywords: getSelectMultipleParams(
        keywords?.activedFilters,
        ALL_KEYWORD_OPTION
      ).join(","),
      siteIds: getSelectMultipleParams(
        siteIds?.activedFilters,
        ALL_SITE_ID_OPTION
      ).join(","),
      campaignTypes: campaignTypes?.activedFilters?.join(","),
    };

    setIsLoading(true);
    service.get("/report/campaign", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setRecallApi(false);
        if (!res.results?.length) {
          updateColumns([]);
          onSetListData([]);
          return;
        }

        const { hasAdGroup, hasKeyword, hasSiteId, newListData } = convertData(
          res.results
        );
        const listDataWithBidFlag = updateListFromData(newListData);
        const listDataWithFlag = updateListFromData(
          listDataWithBidFlag,
          {},
          EDITABLE_STAT_IDS.budget
        );

        updateColumns(listDataWithFlag);
        onSetListData(listDataWithFlag, segmented);

        let newFirstColName = defaultFirstColName;
        if (hasSiteId) {
          newFirstColName = "Network, App, Campaign, Country, Site id";
        }
        if (hasAdGroup) {
          newFirstColName = hasKeyword
            ? "Network, App, Campaign, Ad Group, Keyword, Country"
            : "Network, App, Campaign, Ad Group, Country";
          if (hasSiteId) {
            newFirstColName += ", Site id";
          }
        }
        newFirstColName !== firstColName && setFirstColName(newFirstColName);
      },
      () => {
        setRecallApi(false);
        setIsLoading(false);
      }
    );
  }, [recallApi]);

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    const onConnected = () => {
      const headers = { [OG_CODE_HEADER]: organizationCode };
      client.subscribe(
        `/topic/${organizationCode}/campaign-center/${urlParams.appId}`,

        function (msg) {
          if (msg.body) {
            const jsonBody = JSON.parse(msg.body);

            if (!jsonBody) return;

            console.log("jsonBody :>> ", jsonBody);
            const { data, event, updatedBy } = jsonBody;
            const isBid = event === "batch_bid";
            const field = isBid
              ? EDITABLE_STAT_IDS.bid
              : EDITABLE_STAT_IDS.budget;

            let newData = data;
            if (data?.length) {
              newData = data.map((el) => ({ ...el, updatedBy }));
            }
            dispatch(updateReportTable({ data: newData, field }));
          }
        },
        headers
      );
    };
    const onDisconnected = () => {};

    const client = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: onConnected,
      onDisconnect: onDisconnected,
    });

    client.activate();

    return () => {
      client.deactivate();
      dispatch(resetReportTable({}));
    };
  }, []);

  useEffect(() => {
    let newUpdatedData: any = [];
    let statName;

    if (!countUpdateRT?.length) {
      listRealtimeData.forEach((updatedEl) => {
        if (updatedEl.data.length) {
          statName = updatedEl.type;
          newUpdatedData = newUpdatedData.length
            ? [...newUpdatedData, ...updatedEl.data]
            : [...updatedEl.data];
        }
      });
    } else {
      listRealtimeData.forEach((updatedEl) => {
        const totalUpdated = updatedEl.data.length;

        if (totalUpdated) {
          const activedState = countUpdateRT.find(
            (el) => el.type === updatedEl.type
          );
          const totalUpdatedData = activedState
            ? activedState?.data?.length
            : 0;
          const hasNewData = totalUpdated > totalUpdatedData;

          if (hasNewData) {
            statName = updatedEl.type;
            const updatedData = updatedEl.data.slice(
              totalUpdatedData - totalUpdated
            );
            newUpdatedData = newUpdatedData.length
              ? [...newUpdatedData, ...updatedData]
              : updatedData;
          }
        }
      });
    }

    onUpdateRealTime(newUpdatedData, statName === EDITABLE_STAT_IDS.bid);
    setCountUpdateRT(listRealtimeData);
  }, [listRealtimeData]);

  const onUpdateRealTime = (
    newData: any[] = [],
    isBidField = true,
    isPushHistory = true
  ) => {
    const isBid = isBidField;
    const stat = isBid ? EDITABLE_STAT_IDS.bid : EDITABLE_STAT_IDS.budget;
    const listUpdatedData = newData;

    if (!listUpdatedData?.length) return;

    let newList = [...storedListData];
    listUpdatedData.forEach((realtimeData) => {
      newList = updateListFromData(
        newList,
        realtimeData,
        stat,
        realtimeData.updatedBy,
        "",
        isPushHistory
      );
    });

    const storedSeg = localStorage.getItem(storageSegmented);
    onSetListData(newList, JSON.parse(storedSeg || "{}"));
  };

  const getTableId = (listLvlId: any = []) => {
    return { tableId: listLvlId.join() };
  };

  const getDateLevel = (
    dataObj,
    networkData,
    startArr: any = [],
    onlyDate = false
  ) => {
    const dateLevel = dataObj.dates.map((el) => {
      const date = el.date ? moment(el.date)?.format("YYYY-MM-DD") : "";
      return Object.assign({}, el, {
        network: networkData,
        tableId: startArr?.join() + "," + date,
      });
    });

    if (onlyDate) return dateLevel;

    return {
      ...dataObj,
      network: networkData,
      tableId: startArr?.join(),
      children: [...dateLevel],
    };
  };

  useLayoutEffect(() => {
    const reportTable = document
      .getElementById("report-table")
      ?.getElementsByClassName("ant-table-tbody")?.[0];

    if (reportTable) {
      reportTable.addEventListener("contextmenu", (event) =>
        event.preventDefault()
      );
    }
  }, []);

  useEffect(() => {
    updateColumns();
  }, [
    colSettings,
    searchText,
    segmented,
    listData,
    storedListData,
    expandedKeys,
    hasFixedCol,
    currenciesConfigs,
  ]);

  const updateColumns = (data: any[] = listData) => {
    const columns = getTableColumns({
      baseUrl,
      listData: data,
      onUpdateCountry: (data, isBidField) =>
        onUpdateRealTime([data], isBidField, false),
      searchText,
      onSearchText,
      onClickName,
      onEditSpecifyBid,
      onEditCell,
      getRowKey,
      onFilterTable,
      setIsLoading,
      firstColName,
      hasFixedCol,
      currenciesConfigs,
      dateRange,
      dateRange2,
    });

    const newCols = getColSettings(columns, colSettings);
    setColumns(newCols);
  };

  const onEditCell = (record, fieldName, currentData) => {
    setEditedCellData({
      editedField: fieldName,
      crrValue: currentData,
      cellData: record,
    });
    setIsOpenEditMultipleModal(true);
  };

  const getListAppWithCampaignStatus = (listData, status = segmented) => {
    if (!listData?.length) return [];
    const campaignStatus = getSegmentedValue(status);

    if (campaignStatus === LIST_CAMPAIGN_STATUS.all.value) {
      return listData;
    }

    const results = listData.map((networkObj) => {
      if (!networkObj.children?.length) return networkObj;

      const newNetworkChildren = networkObj.children.map((networkApp) => {
        if (!networkApp.children?.length) return networkApp;

        const newCampChildren = networkApp.children.filter(
          (camp) => camp.campaign?.status === campaignStatus
        );

        return { ...networkApp, children: newCampChildren };
      });
      return {
        ...networkObj,
        children: newNetworkChildren.filter((el) => el.children?.length),
      };
    });

    return results.filter((el) => el.children?.length);
  };

  const onSetListData = (newListData: any = [], activedSegment = segmented) => {
    onSearchText(searchText, activedSegment, newListData);
    setStoredListData(newListData);
  };

  const onChangeSegmented = (value) => {
    if (isLoading) return;
    localStorage.setItem(storageSegmented, JSON.stringify(value));
    setSegmented(value);
    onSearchText(searchText, value);
  };

  const getSegmentedValue = (label) => {
    const activedSegmanted = Object.keys(LIST_CAMPAIGN_STATUS).find(
      (status) => LIST_CAMPAIGN_STATUS[status].label === label
    );

    return activedSegmanted
      ? LIST_CAMPAIGN_STATUS[activedSegmanted].value
      : LIST_CAMPAIGN_STATUS.all.value; // defaultSegmented -> value
  };

  const onSearchText = (
    text,
    campaignStatus = segmented,
    storeList = storedListData
  ) => {
    setSearchText(text);

    const newList = getListAppWithCampaignStatus(storeList, campaignStatus);
    const newListData = newList.map((networkObj: any) => {
      const { children } = networkObj;

      if (!children?.length) {
        return;
      }

      const newNetworkChildren = children.map((networkApp) => {
        if (!networkApp.children?.length) return networkApp;

        let newCampChildren;
        if (!text) {
          newCampChildren = networkApp.children;
        } else {
          newCampChildren = networkApp.children.filter(
            (campaignObj) =>
              campaignObj.campaign?.name &&
              campaignObj.campaign?.name
                .toLowerCase()
                .includes(text?.toLowerCase())
          );
        }
        const appDataObj = calcData(newCampChildren);
        return {
          ...networkApp,
          children: newCampChildren,
          data: { ...appDataObj },
        };
      });

      const newNetworks = text
        ? newNetworkChildren.filter((el) => el.children?.length)
        : newNetworkChildren;
      const networkDataObj = calcData(newNetworks);
      return {
        ...networkObj,
        children: newNetworks,
        data: { ...networkDataObj },
      };
    });
    const results = text
      ? newListData.filter((el) => el.children?.length)
      : newListData;
    setListData(results);
  };

  const calcData = (list) => {
    const resultObj: any = getSummaryData(list);
    resultObj.networkCode = list[0]?.network?.code;
    reCalculateData(resultObj);
    return resultObj;
  };

  const onExpand = (expanded, record) => {
    if (expanded) {
      setExpandedKeys([...expandedKeys, record.tableId]);
    } else {
      const newKeys = expandedKeys.filter((el) => el !== record.tableId);
      setExpandedKeys(newKeys);
    }
  };

  const onClickName = (record, e) => {
    const isExpanded = expandedKeys.includes(record.tableId);

    if (e.type === "contextmenu") {
      let listKeys: string[] = [];
      const getKey = (el) => {
        if (
          !el.children?.length ||
          el.dates?.length ||
          el.keywords?.length ||
          el.siteId === SITE_ID_LABEL ||
          listKeys.length > 200
        ) {
          return;
        }

        listKeys.push(el.tableId);
        el.children.forEach((child) => {
          getKey(child);
        });
      };

      getKey(record);

      if (listKeys.length) {
        if (!isExpanded) {
          setExpandedKeys([...expandedKeys, ...listKeys]);
        } else {
          const newKeys = expandedKeys.filter((el) => !listKeys.includes(el));
          setExpandedKeys(newKeys);
        }
      }
      return;
    }
    onExpand(!isExpanded, record);
  };

  const onEditSpecifyBid = (data, record) => {
    setEditedSpecifyBid(record);
    setEditedBid(data || {});
    setIsOpenEditModal(true);
  };

  const getRowKey = (record) => {
    return record.tableId;
  };

  const onCloseModalMultipleEdit = () => {
    setIsOpenEditMultipleModal(false);
    setSelectedRecords([]);
  };

  const onClickSettingEdit = () => {
    if (!selectedRecords.length) return;
    setIsOpenEditMultipleModal(true);
    setEditedCellData(defaultCellData);
  };

  const tableLeftEl = (
    <div className="flex items-center space-x-2 md:space-x-4">
      <div className="flex items-center">
        <div className="hidden md:block mr-2">Campaign:</div>
        <Segmented
          size="small"
          options={CAMPAIGN_SEGMENTED}
          value={segmented}
          onChange={onChangeSegmented}
        />
      </div>

      <div className="flex items-center">
        <div className="hidden md:block mr-2">Checkbox:</div>
        <Switch
          size="small"
          checked={isShowCheckbox}
          onChange={setIsShowCheckbox}
        />
        <Tooltip title="Edit records">
          <AiOutlineEdit
            size={20}
            className={classNames(
              "ml-2",
              selectedRecords.length && "cursor-pointer text-antPrimary",
              !isShowCheckbox && "hidden"
            )}
            onClick={onClickSettingEdit}
          />
        </Tooltip>
      </div>
    </div>
  );

  const rowSelection = {
    selectedRowKeys: selectedRecords,
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      const listIds = getChildrenCheckbox(record);
      let newListIds: any = [...selectedRecords];

      if (selected) {
        if (listIds.length) {
          listIds.forEach((rowKey) => {
            if (!newListIds.includes(rowKey)) {
              newListIds.push(rowKey);
            }
          });
        }
      } else {
        newListIds = newListIds.filter((el) => el !== record.tableId);
      }
      setSelectedRecords(newListIds);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      let listIds = [];
      if (selected) {
        listIds = selectedRows.map((el) => el.tableId);
      }
      setSelectedRecords(listIds);
    },
  };

  if (!columns?.length) return <></>;

  const filteredData = deepFilterData(filterByMaxMin, listData);

  return (
    <>
      <TableWrapper
        headerSticky
        isModalSetting
        dateRange={dateRange}
        isSkanPage={false}
        initialColumns={columns}
        setColumns={setColumns}
        treeColumns={TREE_COLS}
        colSettings={colSettings}
        setColSettings={setColSettings}
        leftEl={tableLeftEl}
        id="report-table"
        className="mt-1"
        rowClassName="custom-row-hover"
        size="small"
        tableLayout="fixed"
        // @ts-ignore
        getPopupContainer={() => document.getElementById("report-table")}
        bordered
        loading={isLoading}
        rowKey={getRowKey}
        sticky={{ offsetHeader: OFFSET_TABLE_HEADER }}
        scroll={{ x: 800, y: 800 }}
        dataSource={filteredData}
        expandedRowKeys={[...expandedKeys]}
        onExpand={onExpand}
        pagination={listData?.length < defaultPageSize ? false : { pageSize }}
        onChange={(pagination) => {
          pagination?.pageSize && setPageSize(pagination?.pageSize);
        }}
        rowSelection={isShowCheckbox ? { ...rowSelection } : undefined}
      />

      <ModalEdit
        isOpen={isOpenEditModal}
        editedBid={editedBid}
        onClose={() => setIsOpenEditModal(false)}
        record={editedSpecifyBid}
        listData={storedListData}
        setListData={onSetListData}
        networkCode={editedSpecifyBid?.network?.code}
      />

      <ModalEditMultiple
        isOpen={isOpenEditMultipleModal}
        onClose={onCloseModalMultipleEdit}
        selectedRecords={selectedRecords}
        listData={storedListData}
        editedCellData={editedCellData}
        setListData={onSetListData}
        currenciesConfigs={currenciesConfigs}
      />
    </>
  );
}

ReportTable.propTypes = {
  isLoading: PropTypes.bool,
  setIsLoading: PropTypes.func,
  setRecallApi: PropTypes.func,
  dateRange: PropTypes.array,
  dateRange2: PropTypes.array,
  recallApi: PropTypes.bool,
  getAttrData: PropTypes.bool,
  getSkanData: PropTypes.bool,
  getCohortData: PropTypes.bool,
  filters: PropTypes.object,
};

export default ReportTable;
