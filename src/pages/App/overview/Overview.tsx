import PropTypes from "prop-types";
import Select from "antd/lib/select";
import Tag from "antd/lib/tag";
import Button from "antd/lib/button";
import DatePicker from "antd/lib/date-picker";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_NETWORK_OPTION,
} from "../../../constants/constants";
import CompareTwoNumber from "../../../partials/common/CompareTwoNumber";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  getSkanDay,
  onClickRangePickerFooter,
} from "../../../partials/common/Forms/RangePicker";
import SelectCampaignByNetwork from "../../../partials/common/Forms/SelectCampaignByNetwork";
import SelectCountry from "../../../partials/common/Forms/SelectCountry";
import service from "../../../partials/services/axios.config";
import Page from "../../../utils/composables/Page";
import SummaryCard from "./SummaryCard";
import { useQuery } from "@tanstack/react-query";
import { getListAdNetwork, QueryFunc } from "../../../api/common/common.api";
import SummaryTable from "./SummaryTable/SummaryTable";
import { LIST_AD_NETWORK } from "../../../api/constants.api";
import ResizableChart from "./CombinationChart/ResizableChart";
import GamePlatformIcon from "../../../partials/common/GamePlatformIcon";
import { useParams } from "react-router-dom";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import SelectTemplate from "./SelectTemplate";
import CaretDownOutlined from "@ant-design/icons/lib/icons/CaretDownOutlined";
import {
  disabledDate,
  filterSelectGroupByKey,
  getSelectMultipleParams,
  roundNumber,
} from "../../../utils/Helpers";
import {
  clicks,
  clickToInstall,
  ConfigCharts,
  EXTRA_FOOTER,
  getListDateStr,
  impressions,
  listAttributeFields,
  StatInfos,
  TableState,
  TouchpointsChartKey,
} from "./constant";
import ClickToInstallChart from "./AdditionalCharts/ClickToInstallChart";
import SaveOutlined from "@ant-design/icons/lib/icons/SaveOutlined";
import { saveTemplate } from "./Helpers";
import { maxTagPlaceholder } from "../../../partials/common/Forms/MaxTagPlaceholder";

function Overview(props) {
  const { isAllApp, isSkanPage } = props;
  const { RangePicker } = DatePicker;
  const urlParams = useParams();

  const defaultRangeDate = isSkanPage ? getSkanDay() : getLast7Day();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingAttStats, setIsLoadingAttStats] = useState(false);
  const [recallApi, setRecallApi] = useState(false);
  const [activedApp, setActivedApp] = useState<string[]>([]);
  const [activedNetwork, setActivedNetwork] = useState([]);
  const [activedCampaign, setActivedCampaign] = useState([]);
  const [activedCountry, setActivedCountry] = useState([]);
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(defaultRangeDate);

  const [isOpenAllTemplate, setIsOpenAllTemplate] = useState(false);
  const [listTemplate, setListTemplate] = useState<any>([]);
  const [activedTemplate, setActivedTemplate] = useState<number>(0);
  const [isAddNew, setIsAddNew] = useState(false);
  const [activedTouchpointChart, setActivedTouchpointChart] =
    useState(TouchpointsChartKey);

  const [listStat, setListStat] = useState<any>([]);
  const [listAdNetwork, setListAdNetwork] = useState([]);
  const [allStoreApp, setAllStoreApp] = useState<any>([]);
  const [isShowMore, setIsShowMore] = useState(false);
  const [clickToInstallData, setClickToInstallData] = useState<any>([]);

  const [configCharts, setConfigCharts] = useState<ConfigCharts[]>([]);
  const [totalChart, setTotalChart] = useState(1);
  const [totalInitChart, setTotalInitChart] = useState(1);
  const [cloneData, setCloneData] = useState({});

  // Table init state from API
  const [initTableState, setInitTableState] = useState<TableState>();
  const storeAppId = isAllApp ? "" : urlParams.appId;
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    if (isInit) {
      return setIsInit(false);
    }
    window.location.reload();
  }, [urlParams.appId]);

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);

  const getHeaderFilter = () => {
    let storeAppIds = urlParams.appId;
    if (isAllApp) {
      const listApp =
        allStoreApp?.filter((el) =>
          activedApp.includes(el.storeId + el.name)
        ) || [];
      storeAppIds = listApp.map((el: any) => el.id)?.join(",") || "";
    }

    return {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      storeAppIds,
      campaignIds: getSelectMultipleParams(
        activedCampaign,
        ALL_CAMPAIGNS_OPTION
      ).join(","),
      countries: getSelectMultipleParams(
        activedCountry,
        ALL_COUNTRIES_OPTION
      ).join(","),
      networks: getSelectMultipleParams(
        activedNetwork,
        ALL_NETWORK_OPTION
      ).join(","),
    };
  };

  useEffect(() => {
    if (!isAllApp) return;

    service.get("/store-app").then(
      (res: any) => {
        setAllStoreApp(res.results);
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getStatsData();
    service
      .get("/dashboard-customizes", {
        params: { storeAppId, isSKAN: isSkanPage },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          const tempRes = res.results;
          if (tempRes?.length) {
            setListTemplate(tempRes);
            const defaultTempIdx = tempRes.findIndex((el) => el.isDefault);
            if (defaultTempIdx !== -1) {
              setActivedTemplate(defaultTempIdx);
            }
          }
        },
        () => setIsLoading(false)
      );
  }, []);

  const getStatsData = () => {
    const params = getHeaderFilter();
    let url = "/dashboard/overview/stats";

    if (isSkanPage) {
      url = "/dashboard/skan/stats";
    }

    let crrStats: any = [];
    const setStats = (
      resData,
      isAttr = false,
      listData = StatInfos,
      isUpdate = false
    ) => {
      const newList = listData.map((el) => {
        const isAttrEl = listAttributeFields.includes(el.field);
        const check = isAttr ? !isAttrEl : isAttrEl;

        if (check) return isUpdate ? el : { ...el, data: {} };
        return { ...el, data: { ...resData[el.field] } };
      });

      if (!isUpdate) {
        crrStats = newList;
      }
      setListStat(newList);
    };

    setIsLoadingStats(true);
    service
      .get(url, {
        params: { ...params, containAttributeReport: false },
      })
      .then(
        (res: any) => {
          setIsLoadingStats(false);
          const resData = res.results || {};

          if (!Object.keys(resData).length) return;

          if (!crrStats?.length) {
            setStats(resData);
          } else {
            setStats(resData, false, crrStats, true);
          }

          if (isSkanPage) {
            setClickToInstallData([
              resData[impressions],
              resData[clicks],
              resData[clickToInstall],
            ]);
          }
        },
        () => setIsLoadingStats(false)
      );

    setIsLoadingAttStats(true);
    service
      .get(url, {
        params: { ...params, containNetworkReport: false },
      })
      .then(
        (res: any) => {
          setIsLoadingAttStats(false);
          const resData = res.results || {};

          if (!Object.keys(resData).length) return;
          if (!crrStats?.length) {
            setStats(resData, true);
          } else {
            setStats(resData, true, crrStats, true);
          }
        },
        () => setIsLoadingAttStats(false)
      );
  };

  const getListData = (el) => {
    const thisPeriodData = el.data?.thisPeriod?.data;
    const lastPeriodData = el.data?.thisPeriod?.data;

    if (thisPeriodData?.length) {
      return thisPeriodData;
    }
    return lastPeriodData?.length ? lastPeriodData : [];
  };

  useEffect(() => {
    // Update getHeaderFilter() with initial values
    setRecallApi(!recallApi);
  }, []);

  useEffect(() => {
    if (!listTemplate?.length) return;
    const resData = listTemplate[activedTemplate];

    let listConfigWithId;
    if (Array.isArray(resData?.chart)) {
      listConfigWithId = resData?.chart?.map((el, id) => {
        return { ...el, chartId: id, initLayout: true };
      });
    } else {
      listConfigWithId = [{ chartId: 0, initLayout: true, layout: [] }];
    }

    if (Object.keys(resData.additionalCharts || {}).length) {
      setActivedTouchpointChart(
        resData.additionalCharts.clickToInstall?.filter || TouchpointsChartKey
      );
    }

    setIsShowMore(resData?.showMore);
    setConfigCharts(listConfigWithId);
    setTotalInitChart(resData?.chart?.length || 1);
    setTotalChart(resData?.chart?.length || 1);
    setInitTableState(resData?.table || {});
  }, [listTemplate, activedTemplate]);

  const onCloneChart = (chartData, chartId) => {
    const activedConfig = configCharts.find((el) => el.chartId === chartId);

    const oldY = activedConfig?.layout?.y;
    const oldW = activedConfig?.layout?.w;
    const layout = !activedConfig ? {} : { w: oldW, y: oldY + 1 };

    const newConfigCharts = [...configCharts];
    const newConfig = {
      chartId: totalChart,
      layout,
      chartFilter: {
        ...chartData.chartFilter,
        chartName: chartData.selectedChart,
      },
      isClone: true,
    };
    newConfigCharts.splice(chartId + 1, 0, newConfig);

    setConfigCharts(newConfigCharts);
    setTotalChart(totalChart + 1);
    setCloneData(chartData);
  };

  const onDeleteChart = (chartId) => {
    const newConfigCharts = configCharts.filter((el) => el.chartId !== chartId);
    setConfigCharts(newConfigCharts);
  };

  const onApply = () => {
    getStatsData();
    setRecallApi(!recallApi);
  };

  const onOpenChange = (value) => {
    setIsOpenAllTemplate(value);
  };

  const onSaveTemplate = () => {
    if (listTemplate[activedTemplate]?.title) {
      setIsAddNew(true);
      return setIsOpenAllTemplate(true);
    }

    saveTemplate({
      isDefault: null,
      editData: listTemplate[activedTemplate],
      isGetNewState: true,

      getTemplateState,
      isSkanPage,
      setListTemplate,
      listTemplate,
      setActivedTemplate,
      activedTemplate,
    });
  };

  const getTemplateState = () => {
    return {
      showMore: isShowMore,
      storeAppId,
      chart: configCharts,
      table: initTableState,
      additionalCharts: {
        clickToInstall: { filter: activedTouchpointChart },
      },
    };
  };

  const openAllTemplate = () => {
    !isOpenAllTemplate && setIsOpenAllTemplate(true);
  };

  const totalChartsInit = 4;
  const skeletonStats = Array.from(
    Array(listStat.length || totalChartsInit).keys()
  );
  const renderedStats = listStat.length ? listStat : skeletonStats;
  const sortedStats =
    !isShowMore && renderedStats.length > totalChartsInit
      ? renderedStats.slice(0, totalChartsInit)
      : renderedStats;

  const listApp =
    allStoreApp?.filter((el) => activedApp.includes(el.storeId + el.name)) ||
    [];
  const listStoreId = listApp?.map((el: any) => el.id) || [];

  const templateName = listTemplate[activedTemplate]?.name;
  const maxWidth = isSkanPage
    ? window.innerWidth - 240
    : window.innerWidth - 166;

  return (
    <Page>
      <div className="mb-4" id="OverviewPage">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center mb-2">
          <div className="flex-1 flex justify-between">
            <div className="page-title">
              <div className="flex items-center space-x-1">
                <div>
                  {isSkanPage && "SKAN "}
                  Overview
                </div>

                {!isLoading && templateName && (
                  <>
                    <div>/</div>
                    <div
                      className="text-sky-700 flex items-center cursor-pointer !bg-transparent hover:!bg-slate-200 rounded"
                      id="SelectTemplateId"
                    >
                      <SelectTemplate
                        open={isOpenAllTemplate}
                        isSkanPage={isSkanPage}
                        listTemplate={listTemplate}
                        isAddNew={isAddNew}
                        setIsAddNew={setIsAddNew}
                        onOpenChange={onOpenChange}
                        setListTemplate={setListTemplate}
                        getTemplateState={getTemplateState}
                        setIsLoading={setIsLoading}
                        activedTemplate={activedTemplate}
                        setActivedTemplate={setActivedTemplate}
                      />
                      <div
                        className="truncate"
                        style={{ maxWidth }}
                        onClick={openAllTemplate}
                      >
                        {templateName}
                      </div>
                      <CaretDownOutlined className="text-xs2 ml-1" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end mb-2 xs:mb-0">
            <Button
              icon={<SaveOutlined />}
              onClick={onSaveTemplate}
              title="Save changes"
            >
              Save
            </Button>
          </div>
        </div>

        <div className="lg:sticky top-16 shadow z-10 bg-white p-4 pt-1 rounded-sm">
          <div className="flex items-center flex-wrap -mx-1 2xl:-mx-2">
            {isAllApp && (
              <Select
                className="w-full xs:w-[255px] !mx-1 2xl:!mx-2 !mt-3"
                placeholder="App name / Package name"
                mode="multiple"
                allowClear
                value={activedApp}
                onChange={setActivedApp}
                showSearch
                maxTagCount="responsive"
                maxTagPlaceholder={(v) =>
                  maxTagPlaceholder(v, activedApp, setActivedApp)
                }
                filterOption={filterSelectGroupByKey}
              >
                {allStoreApp.map((data, idx) => (
                  <Select.Option key={data.storeId + data.name} size="large">
                    <div className="flex items-center">
                      {data.icon && (
                        <GamePlatformIcon app={data} inputSize={true} />
                      )}
                      {data.name}
                    </div>
                  </Select.Option>
                ))}
              </Select>
            )}

            <SelectNetwork
              classNames="xs:w-[180px] !mx-1 2xl:!mx-2 !mt-3"
              listNetwork={listAdNetwork}
              value={activedNetwork}
              onChange={setActivedNetwork}
            />

            <SelectCampaignByNetwork
              classNames="xs:w-[220px] !mx-1 2xl:!mx-2 !mt-3"
              storeAppIds={listStoreId}
              value={activedCampaign}
              networkData={activedNetwork}
              onChange={setActivedCampaign}
            />

            <SelectCountry
              classNames="xs:w-[180px] !mx-1 2xl:!mx-2 !mt-3"
              value={activedCountry}
              onChange={setActivedCountry}
            />

            <RangePicker
              className="w-full xs:w-auto !mx-1 2xl:!mx-2 !mt-3"
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
            <Button
              type="primary"
              onClick={onApply}
              className="mx-1 2xl:!mx-2 mt-3"
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="relative pb-[3.25rem]">
          <div className="grid grid-cols-12 gap-6 mt-6">
            {sortedStats.map((el, idx) => {
              let isUpdateStats = false;
              if (listAttributeFields.includes(el.field)) {
                isUpdateStats = isLoadingAttStats;
              }

              const { rounded } = el;
              const labels = getListDateStr(getListData(el));
              const thisPeriod = el.data?.thisPeriod;
              const lastPeriod = el.data?.lastPeriod;

              const volatility = CompareTwoNumber(
                thisPeriod?.total,
                lastPeriod?.total,
                true,
                true
              );

              const thisPeriodData = thisPeriod?.data.map((el) => el.total);
              const lastPeriodData = lastPeriod?.data.map((el) => el.total);
              const total = rounded
                ? roundNumber(thisPeriod?.total, false, 0)
                : thisPeriod?.total;
              const daily = rounded
                ? roundNumber(thisPeriod?.daily, false, 0)
                : thisPeriod?.daily;

              const dataObj = typeof el === "number" ? {} : el;

              return (
                <SummaryCard
                  key={idx}
                  labels={labels}
                  dataObj={dataObj}
                  total={total}
                  daily={daily}
                  volatility={volatility}
                  thisPeriod={thisPeriodData}
                  lastPeriod={lastPeriodData}
                  isLoading={isLoadingStats}
                  isUpdateStats={isUpdateStats}
                />
              );
            })}
          </div>

          <div className="absolute bottom-0 right-0 mb-2">
            <button
              className="btn-light icon !py-1.5 !bg-transparent hover:!bg-slate-200 hover:shadow-custom1"
              onClick={() => setIsShowMore(!isShowMore)}
            >
              Show {isShowMore ? "less" : "more"}
            </button>
          </div>
        </div>

        {isSkanPage && (
          <>
            <ClickToInstallChart
              isLoading={isLoadingStats}
              data={clickToInstallData}
              activedChart={activedTouchpointChart}
              setActivedChart={setActivedTouchpointChart}
            />
          </>
        )}

        <ResizableChart
          recallApi={recallApi}
          getHeaderFilter={getHeaderFilter}
          onCloneChart={onCloneChart}
          onDeleteChart={onDeleteChart}
          cloneData={cloneData}
          totalChart={totalChart}
          configCharts={configCharts}
          setConfigCharts={setConfigCharts}
          totalInitChart={totalInitChart}
          listTemplate={listTemplate}
          isSkanPage={isSkanPage}
        />

        <div className="mt-6">
          <SummaryTable
            getHeaderFilter={getHeaderFilter}
            isAllApp={isAllApp}
            isSkanPage={isSkanPage}
            recallApi={recallApi}
            initTableState={initTableState}
            setInitTableState={setInitTableState}
            dateRange={dateRange}
          />
        </div>
      </div>
    </Page>
  );
}

Overview.propTypes = {
  isAllApp: PropTypes.bool,
  isSkanPage: PropTypes.bool,
};

export default Overview;
