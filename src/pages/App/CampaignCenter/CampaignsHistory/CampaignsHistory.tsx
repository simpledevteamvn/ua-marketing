import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
  EXTRA_FOOTER,
} from "../../../../constants/constants";
import Tag from "antd/lib/tag";
import moment from "moment";
import Select from "antd/lib/select";
import { getListAdNetwork } from "../../../../api/common/common.api";
import { useQuery } from "@tanstack/react-query";
import { getUserByApp } from "../../../../api/campaign-center/campaign-center.api";
import Table from "antd/lib/table";
import { historyColumns } from "../CampaignCenter";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import { HISTORY_OPTIONS, LIST_HISTORY } from "../../../../constants/dropdowns";
import { DimensionDrd } from "../../../../partials/common/Dropdowns/Dropdowns";
import classNames from "classnames";
import { MinusIcon, PlusIcon } from "../../../../partials/common/Forms/Icons";
import Button from "antd/lib/button/button";
import {
  disabledDate,
  filterSelect,
  getSelectMultipleParams,
} from "../../../../utils/Helpers";
import service from "../../../../partials/services/axios.config";
import { Dimension } from "../CampaignInterface";
import {
  LIST_AD_NETWORK,
  LIST_EMAIL_BY_APP,
} from "../../../../api/constants.api";
import { useParams } from "react-router-dom";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";

function CampaignsHistory(props) {
  const urlParams = useParams();
  const { isBudget } = props;

  const defaultPageSize = 20;
  const [tableFilters, setTableFilters] = useState({
    size: defaultPageSize,
    page: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);

  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  const [bidHistories, setBidHistories] = useState<any>([]);
  const [listUser, setListUser] = useState([]);

  const defaultDimension: Dimension = {
    activedDimension: undefined,
    dimensionOpts: HISTORY_OPTIONS,
    filterOpts: [],
    activedFilters: [],
    filterValue: "",
    filterLabel: "",
  };
  const [dimensionFilters, setDimensionFilters] = useState<Dimension[]>([
    defaultDimension,
  ]);
  const [currentDimensionOpts, setCurrentDimensionOpts] =
    useState(HISTORY_OPTIONS);

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

  useEffect(() => {
    onSearchData();
  }, [tableFilters]);

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
      },
      () => {}
    );
  }, []);

  const getQueryParams = () => {
    const networks: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_HISTORY.adNetwork
    );
    const campaigns: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_HISTORY.campaign
    );
    const countries: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_HISTORY.country
    );
    const emails: Dimension | undefined = dimensionFilters?.find(
      (el) => el.activedDimension === LIST_HISTORY.email
    );

    return {
      storeAppId: urlParams.appId,
      emails: emails?.activedFilters?.join(","),
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
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      page: tableFilters.page,
      size: tableFilters.size,
    };
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;
    setTableFilters({ size: pageSize, page: current - 1 });
  };

  const onChangeDimension = (id, value) => {
    let newListOpt;
    let activedFilters;
    let filterLabel;
    let filterValue;
    switch (value) {
      case LIST_HISTORY.country:
        newListOpt = [];
        activedFilters = [ALL_COUNTRIES_OPTION];
        break;
      case LIST_HISTORY.campaign:
        newListOpt = [];
        activedFilters = [ALL_CAMPAIGNS_OPTION];
        break;
      case LIST_HISTORY.email:
        newListOpt = listUser;
        activedFilters = [];
        filterLabel = "email";
        filterValue = "email";
        break;

      case LIST_HISTORY.adNetwork:
      default:
        newListOpt = [];
        activedFilters = [];
        break;
    }

    const fieldObj = {
      activedDimension: value,
      dimensionOpts: currentDimensionOpts, // Isn't incorrect data -> Need runing handleUpdateDetailState function
      filterOpts: newListOpt,
      activedFilters,
      filterValue,
      filterLabel,
    };
    handleUpdateDetailState(id, null, null, fieldObj, true);
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

  const updateDimensionOpts = (
    filterId,
    isMinus = false,
    list = dimensionFilters
  ) => {
    const listActivedDimension = list.map((el, idx) =>
      filterId === idx && isMinus ? "" : el.activedDimension
    );
    const newDimensionOpt = HISTORY_OPTIONS.filter(
      (el) => !listActivedDimension.includes(el.value)
    );
    const newDimensionFilters = list.map((el, idx) => {
      if (idx === filterId) {
        const crrOpts = HISTORY_OPTIONS.filter(
          (dOpt) =>
            !listActivedDimension.includes(dOpt.value) ||
            dOpt.value === el.activedDimension
        );
        return { ...el, dimensionOpts: crrOpts };
      }
      if (!el.activedDimension) {
        return { ...el, dimensionOpts: newDimensionOpt };
      }

      // Update old dropdown
      const currentDimensionsForDrd = listActivedDimension.filter(
        (dimensionId) => el.activedDimension !== dimensionId
      );
      const currentOpts = HISTORY_OPTIONS.filter(
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

  const onSelectDimensionFilter = (filterId, optValue) => {
    handleUpdateDetailState(filterId, optValue, "activedFilters");
  };

  const onSearchData = () => {
    const params = getQueryParams();
    const fieldName = isBudget ? "budget" : "bid";

    setIsLoading(true);
    service.get(`/history/${fieldName}`, { params }).then(
      (res: any) => {
        setBidHistories(res.results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const pagination = {
    pageSize: tableFilters.size,
    current: tableFilters.page + 1,
    total: bidHistories?.totalElements,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  const adNetworkFilter = dimensionFilters.find(
    (el) => el.activedDimension === LIST_HISTORY.adNetwork
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

                {item.activedDimension === LIST_HISTORY.adNetwork && (
                  <SelectNetwork
                    classNames="md:max-w-sm"
                    listNetwork={listAdNetwork}
                    value={item.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  />
                )}

                {item.activedDimension === LIST_HISTORY.campaign && (
                  <SelectCampaignByNetwork
                    classNames="md:max-w-sm"
                    value={item.activedFilters}
                    networkData={adNetworkFilter?.activedFilters}
                    onChange={(value) => onSelectDimensionFilter(idx, value)}
                  />
                )}

                {item.activedDimension === LIST_HISTORY.country && (
                  <SelectCountry
                    classNames="md:max-w-sm"
                    value={item.activedFilters}
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
        rowKey={(record: any) => record.id}
        // @ts-ignore
        columns={historyColumns(currenciesConfigs)}
        dataSource={bidHistories?.content}
        scroll={{ x: 600 }}
        pagination={pagination}
        onChange={(pagination, filters) => onChange(pagination, filters)}
      />
    </div>
  );
}

CampaignsHistory.propTypes = {
  isBudget: PropTypes.bool,
};

export default CampaignsHistory;
