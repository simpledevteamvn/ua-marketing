import React, { useEffect, useState } from "react";
import DatePicker from "antd/lib/date-picker";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../../partials/common/Forms/RangePicker";
import {
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_NETWORK_OPTION,
  EDITABLE_STAT_IDS,
  EXTRA_FOOTER,
} from "../../../../constants/constants";
import Tag from "antd/lib/tag";
import moment from "moment";
import Select from "antd/lib/select";
import { getListAdNetwork } from "../../../../api/common/common.api";
import { useQuery } from "@tanstack/react-query";
import { getUserByApp } from "../../../../api/campaign-center/campaign-center.api";
import Table from "antd/lib/table/Table";
import DetailHistory from "./DetailHistory";
import {
  capitalizeWord,
  disabledDate,
  filterSelect,
  getCountriesEl,
  getSelectMultipleParams,
} from "../../../../utils/Helpers";
import Button from "antd/lib/button/button";
import service from "../../../../partials/services/axios.config";
import { Dimension } from "../CampaignInterface";
import {
  BATCH_HISTORY_OPTIONS,
  LIST_BATCH_HISTORY,
} from "../../../../constants/dropdowns";
import classNames from "classnames";
import { DimensionDrd } from "../../../../partials/common/Dropdowns/Dropdowns";
import { MinusIcon, PlusIcon } from "../../../../partials/common/Forms/Icons";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import {
  LIST_AD_NETWORK,
  LIST_EMAIL_BY_APP,
} from "../../../../api/constants.api";
import { useParams } from "react-router-dom";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import StatusCol from "../../../../partials/common/Table/Columns/StatusCol";
import { getDateCol } from "../../../../partials/common/Table/Helper";
import { AiOutlineCaretDown } from "@react-icons/all-files/ai/AiOutlineCaretDown";
import { AiOutlineCaretUp } from "@react-icons/all-files/ai/AiOutlineCaretUp";
import { toast } from "react-toastify";
import Popconfirm from "antd/lib/popconfirm";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import { numberWithCommas } from "../../../../utils/Utils";

const EditableStats = [
  { name: "All", value: EDITABLE_STAT_IDS.all },
  { name: "Bid", value: EDITABLE_STAT_IDS.bid },
  {
    name: "Budget",
    value: EDITABLE_STAT_IDS.budget,
  },
];

type Filter = { page: number; size: number };
type ExpandedData = { [id: number]: Filter };

function BatchHistory(props) {
  const urlParams = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  const [listUser, setListUser] = useState([]);
  const [bidHistories, setBidHistories] = useState<any>({});
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);

  const defaultDimension: Dimension = {
    activedDimension: undefined,
    dimensionOpts: BATCH_HISTORY_OPTIONS,
    filterOpts: [],
    activedFilters: [],
    filterValue: "",
    filterLabel: "",
  };
  const [dimensionFilters, setDimensionFilters] = useState<Dimension[]>([
    defaultDimension,
  ]);
  const [currentDimensionOpts, setCurrentDimensionOpts] = useState(
    BATCH_HISTORY_OPTIONS
  );

  // Filters in BE
  const defaultPageSize = 20;
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });

  // Filters in FE
  const defaultDetailFilters: Filter = {
    page: 0,
    size: 10,
  };
  const [filters, setFilters] = useState<ExpandedData>({});

  const { data: listNetwork, isLoading: isLoadingNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results || []);
  }, [listNetwork]);

  const { data: listUserByApp } = useQuery({
    queryKey: [LIST_EMAIL_BY_APP, { storeAppId: urlParams.appId }],
    queryFn: getUserByApp,
    staleTime: 30 * 60000,
  });

  useEffect(() => {
    setListUser(listUserByApp?.results || []);
  }, [listUserByApp]);

  const getQueryParams = () => {
    const type: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_BATCH_HISTORY.type
    );
    const networks: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_BATCH_HISTORY.adNetwork
    );
    const countries: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_BATCH_HISTORY.country
    );
    const campaigns: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_BATCH_HISTORY.campaign
    );
    const emails: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_BATCH_HISTORY.email
    );

    const activedType = type?.activedFilters;
    const typeParams = activedType === EDITABLE_STAT_IDS.all ? "" : activedType;
    return {
      storeAppId: urlParams.appId,
      emails: emails?.activedFilters?.join(","),
      networks: getSelectMultipleParams(
        networks?.activedFilters,
        ALL_NETWORK_OPTION
      ).join(","),
      rawCampaignIds: getSelectMultipleParams(
        campaigns?.activedFilters,
        ALL_CAMPAIGNS_OPTION
      ).join(","),
      countries: getSelectMultipleParams(
        countries?.activedFilters,
        ALL_COUNTRIES_OPTION
      ).join(","),
      type: typeParams,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      page: tableFilters.page,
      size: tableFilters.size,
    };
  };

  useEffect(() => {
    onSearchData();
  }, [tableFilters]);

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
      },
      () => { }
    );
  }, []);

  const onSearchData = () => {
    const params = getQueryParams();

    setIsLoading(true);
    service.get("/history/batch", { params }).then(
      (res: any) => {
        setBidHistories(res.results || {});
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const expandedRowRender = (record, idx, indent, expanded) => {
    if (!expanded || !record.histories?.length) return <></>;

    return (
      <DetailHistory
        recordIdx={idx}
        data={record.histories}
        currenciesConfigs={currenciesConfigs}
        tableFilters={filters[idx] || defaultDetailFilters}
        onChange={onChangeDetail}
        onChangeBatchHistory={setNewBatchHistory}
        setIsLoading={setIsLoading}
        revertedBy={record.revertedBy}
        batchType={record.type}
        batchHistoryId={record.id}
      />
    );
  };

  const onChangeDetail = (recordIdx, pagination) => {
    const { pageSize, current } = pagination;
    setFilters({
      ...filters,
      [recordIdx]: { size: pageSize, page: current - 1 },
    });
  };

  const onExpand = (expanded, record) => {
    if (!expanded || !record.histories?.length) return;

    const activedIdx = bidHistories?.content.findIndex(
      (el) => el.id === record.id
    );
    if (activedIdx !== -1 && !filters[activedIdx]) {
      setFilters({ ...filters, [activedIdx]: defaultDetailFilters });
    }
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;

    if (pageSize !== tableFilters.size || current - 1 !== tableFilters.page) {
      setTableFilters({ size: pageSize, page: current - 1 });
    }
  };

  const onPlusFilter = (
    listFilter = dimensionFilters,
    opts = currentDimensionOpts
  ) => {
    const newDimension = {
      ...defaultDimension,
      dimensionOpts: opts,
    };

    if (!listFilter.length) return setDimensionFilters([newDimension]);
    setDimensionFilters([...listFilter, newDimension]);
  };

  const onMinusFilter = (idx) => {
    updateDimensionOpts(idx, true);
  };

  const onChangeDimension = (id, value) => {
    let newListOpt;
    let activedFilters;
    let filterLabel;
    let filterValue;
    switch (value) {
      case LIST_BATCH_HISTORY.country:
        newListOpt = [];
        activedFilters = [ALL_COUNTRIES_OPTION];
        break;
      case LIST_BATCH_HISTORY.campaign:
        newListOpt = [];
        activedFilters = [ALL_CAMPAIGNS_OPTION];
        break;
      case LIST_BATCH_HISTORY.type:
        newListOpt = [];
        activedFilters = [];
        break;
      case LIST_BATCH_HISTORY.email:
        newListOpt = listUser;
        activedFilters = [];
        filterLabel = "email";
        filterValue = "email";
        break;

      case LIST_BATCH_HISTORY.adNetwork:
      default:
        newListOpt = [];
        activedFilters = [];
        break;
    }

    const fieldObj = {
      activedDimension: value,
      dimensionOpts: currentDimensionOpts,
      filterOpts: newListOpt,
      activedFilters,
      filterValue,
      filterLabel,
    };
    handleUpdateDetailState(id, null, null, fieldObj, true);
  };

  const handleUpdateDetailState = (
    id,
    value,
    fieldName,
    fieldObj = {},
    isUpdate = false
  ) => {
    const newFilter = dimensionFilters.map((item, idx) => {
      if (idx !== id) return item;
      if (!Object.keys(fieldObj)?.length) {
        return {
          ...item,
          [fieldName]: value,
        };
      }

      return {
        ...item,
        ...fieldObj,
      };
    });

    if (!isUpdate) {
      return setDimensionFilters(newFilter);
    }
    updateDimensionOpts(id, false, newFilter);
  };

  const updateDimensionOpts = (
    filterId,
    isMinus = false,
    list = dimensionFilters
  ) => {
    const listActivedDimension = list.map((el, idx) =>
      filterId === idx && isMinus ? "" : el.activedDimension
    );
    const newDimensionOpt = BATCH_HISTORY_OPTIONS.filter(
      (el) => !listActivedDimension.includes(el.value)
    );
    const newDimensionFilters = list.map((el, idx) => {
      if (idx === filterId) return el;
      if (!el.activedDimension) {
        return { ...el, dimensionOpts: newDimensionOpt };
      }

      // Update old dropdown
      const currentDimensionsForDrd = listActivedDimension.filter(
        (dimensionId) => el.activedDimension !== dimensionId
      );
      const currentOpts = BATCH_HISTORY_OPTIONS.filter(
        (el) => !currentDimensionsForDrd.includes(el.value)
      );
      return { ...el, dimensionOpts: currentOpts };
    });

    setCurrentDimensionOpts(newDimensionOpt);
    if (isMinus) {
      // Mode: minus filter -> remove filterId
      newDimensionFilters.splice(filterId, 1);
    }

    if (!newDimensionFilters.length) {
      return onPlusFilter([], newDimensionOpt);
    }
    setDimensionFilters(newDimensionFilters);
  };

  const onSelectDimensionFilter = (filterId, optValue) => {
    handleUpdateDetailState(filterId, optValue, "activedFilters");
  };

  const revertBatch = (rd) => {
    setIsLoading(true);
    service
      .put("/bid/revert", null, { params: { batchHistoryId: rd.id } })
      .then(
        (res: any) => {
          setNewBatchHistory(rd.id, res.results);
          toast(res.message, { type: "success" });
          setIsLoading(false);
        },
        () => setIsLoading(false)
      );
  };

  const setNewBatchHistory = (batchHistoryId, newBatchHistory) => {
    const newTableData = bidHistories.content?.map((el) => {
      if (el.id === batchHistoryId) {
        return {
          ...el,
          revertedBy: newBatchHistory.revertedBy,
          histories: newBatchHistory.histories,
          status: newBatchHistory.status
        };
      }

      return el;
    });

    setBidHistories({ ...bidHistories, content: newTableData });
  }

  const isDisableRevertBtn = (status) => {
    return status === "Failure" || status === "Processing";
  }

  const columns = [
    {
      title: "Date",
      render: getDateCol,
      width: 240
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      width: 240
    },
    {
      title: "Networks",
      render: (record) => {
        if (!record.networks?.length) return "All";
        return record.networks?.join(", ");
      },
      width: 145
    },
    {
      title: "Country",
      render: (record) => {
        if (Array.isArray(record.countries) && !record.countries?.length) {
          return "All Countries";
        }
        return getCountriesEl(record);
      },
      width: 150
    },
    {
      title: "Type",
      render: (record) => capitalizeWord(record.type),
      width: 120
    },
    {
      title: "Adjustment",
      render: (record) => {
        const { value, increaseValue, decreaseValue, percentage } = record;

        if (!percentage && !value && !increaseValue && !decreaseValue) return "";

        let iconEl, showUpValue;
        if (value) {
          showUpValue = "$ " + numberWithCommas(value);
        } else {
          if (percentage > 100 || increaseValue) {
            iconEl = <AiOutlineCaretUp size={16} className="text-green-500" />;
            showUpValue = percentage ? percentage - 100 + '%' : increaseValue;
          } else {
            iconEl = <AiOutlineCaretDown size={16} className="text-red-400" />;
            showUpValue = percentage ? 100 - percentage + '%' : decreaseValue;
          }
        }

        return (
          <div className="flex items-center space-x-0.5" style={{ paddingLeft: value ? '6px' : '0px' }}>
            {iconEl}
            <span>{showUpValue}</span>
          </div>
        );
      },
      width: 140
    },
    {
      ...StatusCol,
      width: 140
    },
    {
      title: "Action",
      render: (record) => {
        if (record.type === "budget") return "";
        if (record.revertedBy) return "Reverted by " + record.revertedBy;

        return (
          <Popconfirm
            placement="left"
            title="Are you sure to revert this action?"
            onConfirm={() => revertBatch(record)}
            okText="Yes"
            cancelText="No"
            disabled={isDisableRevertBtn(record.status)}
          >
            <button disabled={isDisableRevertBtn(record.status)} className="btn-info btn-sm whitespace-nowrap">
              Revert
            </button>
          </Popconfirm>
        );
      },
    },
  ];

  const pagination = {
    pageSize: tableFilters.size,
    current: tableFilters.page + 1,
    total: bidHistories?.totalElements,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  const adNetworkFilter = dimensionFilters.find(
    (el) => el.activedDimension === LIST_BATCH_HISTORY.adNetwork
  );

  return (
    <div>
      <div className="grid grid-cols-12 gap-2">
        <div className="form-filter-left">Date Range</div>
        <div className="form-filter-right">
          <DatePicker.RangePicker
            open={isOpenDateRange}
            onOpenChange={(open) => setIsOpenDateRange(open)}
            value={dateRange}
            onChange={setDateRange}
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
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-5">
        <div className="form-filter-left">Filters</div>
        <div className="form-filter-right">
          {dimensionFilters.map((item, idx) => {
            const listDimesion = item.dimensionOpts;
            const dimensionLength = dimensionFilters.length;
            const maxDimesion = defaultDimension.dimensionOpts?.length - 1;
            const firstActivedDimension = dimensionFilters[0].activedDimension;

            return (
              <div
                className={classNames("dynamic-filters", idx && "mt-3 xs:mt-2")}
                key={idx}
              >
                <DimensionDrd
                  options={listDimesion}
                  value={item.activedDimension}
                  onChange={(value) => onChangeDimension(idx, value)}
                />

                {item.filterOpts?.length > 0 && (
                  <Select
                    className="w-full md:max-w-sm"
                    placeholder="Select filters"
                    mode="multiple"
                    allowClear
                    value={item.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                    showSearch
                    maxTagCount="responsive"
                    filterOption={filterSelect}
                  >
                    {item.filterOpts.map((data) => (
                      <Select.Option key={data[item.filterValue!]}>
                        {data[item.filterLabel!]}
                      </Select.Option>
                    ))}
                  </Select>
                )}

                {item.activedDimension === LIST_BATCH_HISTORY.adNetwork && (
                  <SelectNetwork
                    classNames="md:max-w-sm"
                    listNetwork={listAdNetwork}
                    value={item.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  />
                )}

                {item.activedDimension === LIST_BATCH_HISTORY.type && (
                  <Select
                    className="w-full md:max-w-sm"
                    placeholder="Select type"
                    value={item.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  >
                    {EditableStats.map((statObj, idx) => (
                      <Select.Option value={statObj.value} key={idx}>
                        {statObj.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}

                {item.activedDimension === LIST_BATCH_HISTORY.country && (
                  <SelectCountry
                    classNames="md:max-w-sm"
                    value={item.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  />
                )}

                {item.activedDimension === LIST_BATCH_HISTORY.campaign && (
                  <SelectCampaignByNetwork
                    isGetRawId
                    classNames="md:max-w-sm"
                    value={item.activedFilters}
                    networkData={adNetworkFilter?.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  />
                )}

                <div className="flex xs:!ml-3">
                  <MinusIcon
                    onClick={() => onMinusFilter(idx)}
                    classNames={classNames(
                      dimensionLength === 1 &&
                      !firstActivedDimension &&
                      "disabled"
                    )}
                  />
                  {idx === dimensionLength - 1 && idx < maxDimesion && (
                    <PlusIcon onClick={onPlusFilter} classNames="!ml-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button type="primary" className="mt-5 md:mt-4" onClick={onSearchData}>
        Search
      </Button>

      <Table
        className="mt-6"
        loading={isLoading || isLoadingNetwork}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={bidHistories?.content || []}
        scroll={{ x: 600 }}
        expandable={{
          expandedRowRender,
          rowExpandable: () => true,
          onExpand,
        }}
        pagination={pagination}
        onChange={(pagination, filters) => onChange(pagination, filters)}
      />
    </div>
  );
}

BatchHistory.propTypes = {};

export default BatchHistory;
