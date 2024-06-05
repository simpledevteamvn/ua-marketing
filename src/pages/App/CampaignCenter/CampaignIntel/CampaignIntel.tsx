import React, { useEffect, useState } from "react";
import Button from "antd/lib/button";
import DatePicker from "antd/lib/date-picker";
import Select from "antd/lib/select";
import Tag from "antd/lib/tag";
import {
  DIMENSION_SUFFIX,
  METRIC_SUFFIX,
  DimensionDrd,
} from "../../../../partials/common/Dropdowns/Dropdowns";
import { MinusIcon, PlusIcon } from "../../../../partials/common/Forms/Icons";
import classNames from "classnames";
import { FilterStates } from "../CampaignInterface";
import {
  ALL_AD_GROUP_OPTION,
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_KEYWORD_OPTION,
  EXTRA_FOOTER,
  MESSAGE_DURATION,
  STORE,
} from "../../../../constants/constants";
import moment from "moment";
import {
  DATE_RANGE_FORMAT,
  getLTVDay,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../../partials/common/Forms/RangePicker";
import ReportTable from "./ReportTable";
import EditStatsModal from "./EditStatsModal";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import {
  ADGROUP_STATUS,
  DIMENSION_OPTIONS,
  LIST_DIMENSION,
} from "../../../../constants/dropdowns";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import CalculatorOutlined from "@ant-design/icons/lib/icons/CalculatorOutlined";
import SelectAdGroup from "../../../../partials/common/Forms/SelectAdGroup";
import SelectKeyword from "../../../../partials/common/Forms/SelectKeyword";
import { useQuery } from "@tanstack/react-query";
import {
  getListAdNetwork,
  getStoreAppById,
} from "../../../../api/common/common.api";
import {
  GET_STORE_APP_BY_ID,
  LIST_AD_NETWORK,
  LIST_CAMPAIGN_TYPE,
} from "../../../../api/constants.api";
import { getListCampaignType } from "../../../../api/campaign-center/campaign-center.api";
import {
  capitalizeWord,
  disabledDate,
  filterSelect,
} from "../../../../utils/Helpers";
import SelectSiteId from "../../../../partials/common/Forms/SelectSiteId";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import { useParams } from "react-router-dom";
import Checkbox from "antd/lib/checkbox";
import message from "antd/lib/message";
import { DATE_RANGE_REQUIRED } from "../../../../constants/formMessage";
import PerformanceChart from "../../overview/CombinationChart/PerformanceChart";
import LineChartOutlined from "@ant-design/icons/lib/icons/LineChartOutlined";
import Tooltip from "antd/lib/tooltip";

const { RangePicker } = DatePicker;
const { Option } = Select;

function CampaignIntel() {
  const urlParams = useParams();

  const defaultDimension = {
    activedDimension: undefined,
    dimensionOpts: DIMENSION_OPTIONS,
    dimensionSuffix: DIMENSION_SUFFIX.includes,
    filterOpts: [],
    activedFilters: [],
  };
  const defaultMetric = {
    activedMetric: undefined,
    metricSuffix: METRIC_SUFFIX.between,
    minValue: undefined,
    maxValue: undefined,
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isIosApp, setIsIosApp] = useState(false);
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<moment.Moment[]>(getLast7Day());
  const [filters, setFilters] = useState<FilterStates>({
    dimension: [defaultDimension],
    metric: [defaultMetric],
  });
  const [currentDimensionOpts, setCurrentDimensionOpts] =
    useState(DIMENSION_OPTIONS);
  const [getAttrData, setGetAttrData] = useState(true);
  const [getSkanData, setGetSkanData] = useState();
  const [getCohortData, setGetCohortData] = useState(true);
  const [dateRange2, setDateRange2] = useState<any>(getLTVDay());
  const [isOpenDateRange2, setIsOpenDateRange2] = useState(false);

  const [listAdNetwork, setListAdNetwork] = useState([]);

  const [isShowTable, setIsShowTable] = useState(false);
  const [recallApi, setRecallApi] = useState(false);
  const [isOpenEditStatsModal, setIsOpenEditStatsModal] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const [listCampaignType, setListCampaignType] = useState([]);

  const { data: listNetwork, isLoading: isLoadingApi } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);
  const { data: listCampaignTypeRes } = useQuery({
    queryKey: [LIST_CAMPAIGN_TYPE],
    queryFn: getListCampaignType,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListCampaignType(listCampaignTypeRes?.results);
  }, [listCampaignTypeRes]);

  const { data: storeAppRes } = useQuery({
    queryKey: [GET_STORE_APP_BY_ID, urlParams.appId],
    queryFn: getStoreAppById,
    staleTime: 5 * 60000,
    enabled: !!urlParams.appId,
  });

  useEffect(() => {
    if (storeAppRes?.results?.store === STORE.apple.name) {
      setIsIosApp(true);
    }
  }, [storeAppRes]);

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const onChangeRangePicker2 = (values) => {
    setDateRange2(values);
  };

  const onMinusFilter = (idx, isDimension = true) => {
    const filterName = isDimension ? "dimension" : "metric";
    const newData = filters[filterName];

    if (!isDimension) {
      newData.splice(idx, 1);
      return setFilters({ ...filters, [filterName]: newData });
    }
    updateDimensionOpts(idx, true);
  };

  const onPlusFilter = (
    listFilter = filters,
    opts = currentDimensionOpts,
    isDimension = true
  ) => {
    const { dimension, metric } = listFilter;

    if (isDimension) {
      const newDimension = {
        ...defaultDimension,
        dimensionOpts: opts,
      };

      const dimensionData = dimension.length
        ? [...dimension, newDimension]
        : [newDimension];
      return setFilters({
        ...listFilter,
        dimension: dimensionData,
      });
    }
    setFilters({
      ...listFilter,
      metric: [...metric, defaultMetric],
    });
  };

  const updateDimensionOpts = (filterId, isMinus = false, list = filters) => {
    // This function will run in two case: minus filter and update dimensionOpts when change PrimaryDrd
    const listActivedDimension = list.dimension.map((el, idx) =>
      filterId === idx && isMinus ? "" : el.activedDimension
    );
    const newDimensionOpt = DIMENSION_OPTIONS.filter(
      (el) => !listActivedDimension.includes(el.value)
    );
    const newDimensionFilters = list.dimension.map((el, idx) => {
      if (idx === filterId) {
        const crrOpts = DIMENSION_OPTIONS.filter(
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
      const currentOpts = DIMENSION_OPTIONS.filter(
        (el) => !currentDimensionsForDrd.includes(el.value)
      );

      return { ...el, dimensionOpts: currentOpts };
    });
    let newFilters = list;

    setCurrentDimensionOpts(newDimensionOpt);
    if (isMinus) {
      // Mode: minus filter -> remove filterId
      newDimensionFilters.splice(filterId, 1);
    }
    newFilters.dimension = newDimensionFilters;

    if (!newDimensionFilters.length) {
      return onPlusFilter(newFilters, newDimensionOpt);
    }
    setFilters(newFilters);
  };

  const onChangePrimaryDrd = (id, value, isDimension = true) => {
    if (!isDimension) {
      return handleUpdateDetailState(id, value, "metric", "activedMetric");
    }

    let newListOpt;
    let activedFilters;
    switch (value) {
      case LIST_DIMENSION.country:
        newListOpt = [];
        activedFilters = [ALL_COUNTRIES_OPTION];
        break;
      case LIST_DIMENSION.campaign:
        newListOpt = [];
        activedFilters = [ALL_CAMPAIGNS_OPTION];
        break;
      case LIST_DIMENSION.adGroup:
        newListOpt = [];
        activedFilters = [ALL_AD_GROUP_OPTION];
        break;
      case LIST_DIMENSION.adGroupStatus:
        newListOpt = ADGROUP_STATUS;
        activedFilters = [];
        break;
      case LIST_DIMENSION.keyword:
        newListOpt = [];
        activedFilters = [ALL_KEYWORD_OPTION];
        break;
      case LIST_DIMENSION.campaignType:
        newListOpt = listCampaignType;
        activedFilters = [];
        break;
      case LIST_DIMENSION.siteId:
        newListOpt = [];
        activedFilters = [];
        break;

      case LIST_DIMENSION.adNetwork:
      default:
        newListOpt = [];
        activedFilters = [];
        break;
    }

    const fieldObj = {
      activedDimension: value,
      filterOpts: newListOpt,
      activedFilters,
      dimensionOpts: currentDimensionOpts, // Isn't incorrect data -> Need runing handleUpdateDetailState function
    };
    handleUpdateDetailState(id, null, "dimension", null, fieldObj, true);
  };

  const handleUpdateDetailState = (
    id,
    value,
    filterName,
    fieldName,
    fieldObj = {},
    isUpdate = false
  ) => {
    const newData = filters[filterName].map((item, idx) => {
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

    const newFilters: any = { ...filters, [filterName]: newData };
    if (!isUpdate) {
      return setFilters(newFilters);
    }

    updateDimensionOpts(id, false, newFilters);
  };

  const onSelectDimensionFilter = (filterId, optValue) => {
    handleUpdateDetailState(filterId, optValue, "dimension", "activedFilters");
  };

  const onRunReport = () => {
    if (!dateRange?.length)
      return message.error(DATE_RANGE_REQUIRED, MESSAGE_DURATION);

    !isShowTable && setIsShowTable(true);
    !recallApi && setRecallApi(true);
  };

  const onChangeAttData = (e) => {
    setGetAttrData(e.target.checked);
  };

  const onChangeCohortData = (e) => {
    setGetCohortData(e.target.checked);
  };

  const onChangeSkanData = (e) => {
    setGetSkanData(e.target.checked);
  };

  const adNetworkFilter = filters.dimension.find(
    (el) => el.activedDimension === LIST_DIMENSION.adNetwork
  );
  const campaignFilter = filters.dimension.find(
    (el) => el.activedDimension === LIST_DIMENSION.campaign
  );
  const countryFilter = filters.dimension.find(
    (el) => el.activedDimension === LIST_DIMENSION.country
  );
  const adGroupFilter = filters.dimension.find(
    (el) => el.activedDimension === LIST_DIMENSION.adGroup
  );

  const getChartFilter = () => {
    const getData = (filterData) => filterData?.activedFilters?.join(",");

    return {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      storeAppIds: urlParams.appId,
      networks: getData(adNetworkFilter),
      campaignIds: getData(campaignFilter),
      countries: getData(countryFilter),
    };
  };

  return (
    <div>
      <div className="flex flex-col-reverse sm:flex-row">
        <div className="flex-1">
          <div className="grid grid-cols-12 gap-2">
            <div className="form-filter-left">Date Range</div>
            <div className="form-filter-right">
              <RangePicker
                open={isOpenDateRange}
                onOpenChange={(open) => setIsOpenDateRange(open)}
                // @ts-ignore
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
                          onClickRangePickerFooter(
                            obj.value,
                            setDateRange,
                            () => setIsOpenDateRange(false)
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
              {filters.dimension.map((item, idx) => {
                const listDimesion = item.dimensionOpts;
                const dimensionLength = filters.dimension.length;
                const maxDimesion = defaultDimension.dimensionOpts?.length - 1;
                const firstActivedDimension =
                  filters.dimension[0].activedDimension;

                return (
                  <div
                    className={classNames(
                      "dynamic-filters",
                      idx && "mt-3 xs:mt-2"
                    )}
                    key={idx}
                  >
                    <DimensionDrd
                      options={listDimesion}
                      value={item.activedDimension}
                      onChange={(value) => onChangePrimaryDrd(idx, value)}
                    />
                    {/* <DimensionSuffixDrd
                      value={item.dimensionSuffix}
                      onChange={(value) => onChangeSuffixDrd(idx, value)}
                    /> */}

                    {item.filterOpts?.length > 0 && (
                      <Select
                        className="w-full md:max-w-sm"
                        placeholder="Select filters"
                        mode="multiple"
                        allowClear
                        value={item.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                        showSearch
                        maxTagCount="responsive"
                        filterOption={filterSelect}
                      >
                        {item.filterOpts.map((data) => {
                          let formattedData;
                          if (typeof data === "string") {
                            formattedData = capitalizeWord(data);
                          }

                          return <Option key={data}>{formattedData}</Option>;
                        })}
                      </Select>
                    )}

                    {item.activedDimension === LIST_DIMENSION.adNetwork && (
                      <SelectNetwork
                        classNames="md:max-w-sm"
                        listNetwork={listAdNetwork}
                        value={item.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.country && (
                      <SelectCountry
                        classNames="md:max-w-sm"
                        value={item.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.campaign && (
                      <SelectCampaignByNetwork
                        classNames="md:max-w-sm"
                        value={item.activedFilters}
                        networkData={adNetworkFilter?.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.adGroup && (
                      <SelectAdGroup
                        classNames="md:max-w-sm"
                        value={item.activedFilters}
                        networkData={adNetworkFilter?.activedFilters}
                        campaignIds={campaignFilter?.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.keyword && (
                      <SelectKeyword
                        classNames="md:max-w-sm"
                        value={item.activedFilters}
                        networkData={adNetworkFilter?.activedFilters}
                        campaignIds={campaignFilter?.activedFilters}
                        rawAdGroupIds={adGroupFilter?.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.siteId && (
                      <SelectSiteId
                        classNames="md:max-w-sm"
                        value={item.activedFilters}
                        networkData={adNetworkFilter?.activedFilters}
                        campaignData={campaignFilter?.activedFilters}
                        countryData={countryFilter?.activedFilters}
                        onChange={(value) =>
                          onSelectDimensionFilter(idx, value)
                        }
                      />
                    )}

                    {item.activedDimension === LIST_DIMENSION.ltvDate && (
                      <DatePicker.RangePicker
                        open={isOpenDateRange2}
                        onOpenChange={(open) => setIsOpenDateRange2(open)}
                        value={dateRange2}
                        onChange={onChangeRangePicker2}
                        disabledDate={disabledDate}
                        renderExtraFooter={() => (
                          <div className="flex py-2.5">
                            {EXTRA_FOOTER.map((obj, idx) => (
                              <Tag
                                key={idx}
                                color="blue"
                                className="cursor-pointer"
                                onClick={() =>
                                  onClickRangePickerFooter(
                                    obj.value,
                                    setDateRange2,
                                    () => setIsOpenDateRange2(false)
                                  )
                                }
                              >
                                {obj.label}
                              </Tag>
                            ))}
                          </div>
                        )}
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
          <div className="grid grid-cols-12 gap-2 mt-4">
            <div className="form-filter-left">Include</div>
            <div className="form-filter-right">
              <div className="flex items-center space-x-4">
                <div>
                  <Checkbox checked={getAttrData} onChange={onChangeAttData}>
                    MMP
                    <span className="hidden xs:inline-block ml-1">data</span>
                  </Checkbox>
                </div>
                {isIosApp && (
                  <div>
                    <Checkbox checked={getSkanData} onChange={onChangeSkanData}>
                      Skan
                      <span className="hidden xs:inline-block ml-1">data</span>
                    </Checkbox>
                  </div>
                )}
                <div>
                  <Checkbox
                    checked={getCohortData}
                    onChange={onChangeCohortData}
                  >
                    Cohort
                    <span className="hidden xs:inline-block ml-1">data</span>
                  </Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-gray-800 text-sm max-w-md">
            <span className="text-black font-bold">Note:</span> Cohort ROAS and
            LTV columns are 2 days behind (partial data), Cohort Revenue columns
            is 1 day behind.
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<CalculatorOutlined />}
            onClick={() => setIsOpenEditStatsModal(true)}
          >
            Batch edit
          </Button>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Button type="primary" onClick={onRunReport} loading={recallApi}>
          Run Report
        </Button>
        <Tooltip
          title="Toggle the button to display a chart based on your selected filters"
          color="white"
          overlayClassName="tooltip-light"
        >
          <Button
            className={classNames(showChart && "custom-btn-outline")}
            icon={<LineChartOutlined />}
            onClick={() => setShowChart(!showChart)}
          >
            Chart
          </Button>
        </Tooltip>
      </div>

      {showChart && (
        <div className="mt-3">
          <PerformanceChart getHeaderFilter={getChartFilter} />
        </div>
      )}

      {isShowTable && (
        <ReportTable
          isLoading={isLoading || isLoadingApi}
          setIsLoading={setIsLoading}
          dateRange={dateRange}
          dateRange2={dateRange2}
          recallApi={recallApi}
          setRecallApi={setRecallApi}
          filters={filters}
          getAttrData={getAttrData}
          getSkanData={getSkanData}
          getCohortData={getCohortData}
        />
      )}

      <EditStatsModal
        isOpen={isOpenEditStatsModal}
        onClose={() => setIsOpenEditStatsModal(false)}
        onSubmit={() => {}}
      />
    </div>
  );
}

CampaignIntel.propTypes = {};

export default CampaignIntel;
