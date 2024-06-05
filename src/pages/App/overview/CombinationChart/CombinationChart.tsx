import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Dropdown from "antd/lib/dropdown";
import MoreOutlined from "@ant-design/icons/lib/icons/MoreOutlined";
import PieChartOutlined from "@ant-design/icons/lib/icons/PieChartOutlined";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import StackbarChart from "./StackbarChart";
import service from "../../../../partials/services/axios.config";
import { useQuery } from "@tanstack/react-query";
import { getOverviewChartFilter } from "../../../../api/overview/overview";
import { OVERVIEW_CHART_FILTERS } from "../../../../api/constants.api";
import { BsPlus } from "@react-icons/all-files/bs/BsPlus";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { ChartActions } from "../constant";
import {
  BarIcon,
  ChartIds,
  LineIcon,
  StackBarIcon,
} from "../../../../partials/common/Switcher/ChartSwitcher";

const ListFilterId = {
  geo: "geo",
};

export interface ChartFilter {
  filter: string;
  subFilter: string;
  listFilter?: any[];
  listSubFilter?: any[];
  chartName?: string;
}

function CombinationChart(props) {
  const {
    getHeaderFilter,
    onClone,
    onDelete,
    recallApi,
    showDelete,
    chartId,
    totalChart, // tổng chart (CombinationChart) bao gồm chart được clone
    totalInitChart, // tổng chart (CombinationChart) từ Api
    cloneData,
    configCharts,
    onSetChartFilter,
    isSkanPage,
  } = props;
  const [storedFilter, setStoredFilter] = useState<any>();

  const defaultChartFilter: ChartFilter = {
    filter: "",
    subFilter: "",
    listFilter: [],
    listSubFilter: [],
  };
  const [chartFilter, setChartFilter] =
    useState<ChartFilter>(defaultChartFilter);
  const { filter, subFilter, listFilter, listSubFilter } = chartFilter;
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any>([]);
  const [isInit, setIsInit] = useState(true);

  const defaultCharts = [ChartIds.stackedBar, ChartIds.line, ChartIds.pie]; // default for Skan page
  const [listChart, setListChart] = useState<any>([...defaultCharts]);
  const [selectedChart, setSelectedChart] = useState<string>("");

  // State for the chart copy action
  const [oldTotalChart, setOldTotalChart] = useState(totalInitChart);
  const [initCloneChart, setInitCloneChart] = useState(false);
  // Cho phép giới hạn call một lần (lấy state từ api) cho 1 component
  const [initChartWithAPI, setInitChartWithAPI] = useState(false);

  const activedConfig = configCharts?.find((el) => el.chartId === chartId);

  const { data: chartFilterData, isLoading: isLoadingFilters } = useQuery({
    queryKey: [OVERVIEW_CHART_FILTERS, isSkanPage],
    queryFn: getOverviewChartFilter,
    staleTime: 20 * 60000,
  });

  const updateChartData = () => {
    const headerFilter = getHeaderFilter();
    const params = {
      ...headerFilter,
      breakdown: filter,
      metric: subFilter,
    };
    let url = "/dashboard/overview/trend-chart";

    if (isSkanPage) {
      url = "/dashboard/skan/trend-chart";
      delete params.metric;
    }

    setIsLoading(true);
    service.get(url, { params }).then(
      (res: any) => {
        setChartData(res?.results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const handleChangeFilter = (newFilters) => {
    setChartFilter(newFilters);
    onSetChartFilter(chartId, newFilters);
  };

  const handleChangeSelectedChart = (newChartName) => {
    setSelectedChart(newChartName);
    onSetChartFilter(chartId, {}, newChartName);
  };

  useEffect(() => {
    if (chartId === totalChart - 1 && oldTotalChart < totalChart) return;

    const filterData = chartFilterData?.results;
    if (!filterData?.length) return;

    setStoredFilter(filterData);
    onFilter(filterData);
  }, [chartFilterData]);

  useEffect(() => {
    if (isInit) {
      // Hanlde Clone chart
      // Khi oldTotalChart nhỏ hơn totalChart tức có chart mới được clone, chart clone ở vị trí cuối (totalChart - 1)
      if (chartId === totalChart - 1 && oldTotalChart < totalChart) {
        const {
          chartFilter,
          storedFilter,
          selectedChart,
          listChart,
          chartData,
        } = cloneData;

        handleChangeFilter(chartFilter);
        setStoredFilter(storedFilter);
        setListChart(listChart);
        handleChangeSelectedChart(selectedChart);
        setChartData(chartData);
        setOldTotalChart(totalChart);
        setInitCloneChart(true);
      }

      // The parent will call twice, so on the first render this page should not do anything
      return setIsInit(false);
    }
    if (!filter) return;
    if (initCloneChart && chartId === totalChart - 1) {
      // In the chart copy action, the "chartFilter" dependency updated (from api of react-query), so the api still calls
      return setInitCloneChart(false);
    }

    updateChartData();
  }, [recallApi, chartFilter]);

  const onFilter = (storedList = storedFilter, idx = 0) => {
    const newListSubFilter = storedList[idx]?.subFilter;

    const isCorrectSubFilter = newListSubFilter?.some(
      (el) => el.key === subFilter
    );
    const newSubFilter = isCorrectSubFilter
      ? subFilter
      : newListSubFilter?.[0]?.key;

    let newSelectedChart =
      activedConfig?.chartFilter?.chartName || selectedChart;
    if (isSkanPage && !newSelectedChart) {
      newSelectedChart = ChartIds.stackedBar;
    }

    if (activedConfig && !activedConfig.isClone && !initChartWithAPI) {
      const initFilter = activedConfig.chartFilter?.filter;
      const initSubFilter = activedConfig.chartFilter?.subFilter;

      setChartFilter({
        ...chartFilter,
        filter: initFilter || storedList[idx].key,
        subFilter: initSubFilter || newSubFilter,
        listFilter: storedList,
        listSubFilter: newListSubFilter,
      });
      setInitChartWithAPI(true);
      setSelectedChart(newSelectedChart);
    } else {
      handleChangeFilter({
        filter: storedList[idx].key,
        subFilter: newSubFilter,
        listFilter: storedList,
        listSubFilter: newListSubFilter,
      });
    }

    if (!isSkanPage) {
      const newListChart = newListSubFilter?.[0]?.chart || [];
      onUpdateChart(newListChart, newSelectedChart);
    }
  };

  const onChangeChartFilter = (
    filterKey = filter,
    subFilterKey = subFilter
  ) => {
    const activedIdx = storedFilter.findIndex((el) => el.key === filterKey);

    if (filterKey !== filter && activedIdx !== -1) {
      return onFilter(storedFilter, activedIdx);
    }

    if (subFilterKey !== subFilter && activedIdx !== -1) {
      handleChangeFilter({ ...chartFilter, subFilter: subFilterKey });

      const activedSubFilter = listSubFilter?.find(
        (el) => el.key === subFilterKey
      );
      if (activedSubFilter && !isSkanPage) {
        onUpdateChart(activedSubFilter.chart);
      }
      return;
    }
  };

  const onUpdateChart = (newListChart: any = [], chartName = selectedChart) => {
    setListChart(newListChart);

    if (!newListChart.includes(chartName)) {
      handleChangeSelectedChart(newListChart[0]);
    }
  };

  const onChangeChart = (chartKey) => {
    if (chartKey === ChartActions.clone) {
      return (
        onClone &&
        onClone(
          { chartFilter, storedFilter, selectedChart, listChart, chartData },
          chartId
        )
      );
    }
    if (chartKey === ChartActions.delete) {
      return onDelete && onDelete(chartId);
    }

    handleChangeSelectedChart(chartKey);
  };

  const getMenuList = (listData) => {
    return (
      listData?.map((el) => {
        return { key: el.key, label: el.name };
      }) || []
    );
  };

  const SupportedCharts = [
    {
      key: ChartIds.pie,
      label: (
        <div className="flex items-center">
          <PieChartOutlined className="mr-1.5 mb-0.5" /> Pie
        </div>
      ),
    },
    {
      key: ChartIds.bar,
      label: (
        <div className="flex items-center">
          <BarIcon
            isActive={selectedChart === ChartIds.bar}
            classNames="w-[17px] h-[17px] mr-1 mb-0.5"
          />
          Bar
        </div>
      ),
    },
    {
      key: ChartIds.stackedBar,
      label: (
        <div className="flex items-center">
          <StackBarIcon
            isActive={selectedChart === ChartIds.stackedBar}
            classNames="w-[17px] h-[17px] mr-1 mb-0.5"
          />
          Stacked bar
        </div>
      ),
    },
    {
      key: ChartIds.line,
      label: (
        <div className="flex items-center">
          <LineIcon
            isActive={selectedChart === ChartIds.line}
            classNames="w-[16px] h-[16px] mr-1 mb-0.5"
          />
          Line
        </div>
      ),
    },
  ];

  const listActivedChart = SupportedCharts.filter((el) =>
    listChart?.includes(el.key)
  );
  const chartsWithAction = [...listActivedChart];
  // @ts-ignore
  chartsWithAction.push({ type: "divider" });
  chartsWithAction.push({
    label: (
      <div className="flex items-center">
        <BsPlus size={16} className="mr-0.5 mb-0.5" />
        Clone chart
      </div>
    ),
    key: ChartActions.clone,
  });

  if (showDelete) {
    chartsWithAction.push({
      label: (
        <div className="flex items-center">
          <DeleteOutlined className="mr-1 pl-0.5 mb-0.5 text-xs2" />
          Delete
        </div>
      ),
      key: ChartActions.delete,
    });
  }

  let isCountry = false;
  if (filter === ListFilterId.geo) {
    isCountry = true;
  }

  const chartProps = {
    isLoading: isLoadingFilters || isLoading,
    isCountry,
    data: chartData,
  };
  let chartEl;

  switch (selectedChart) {
    case ChartIds.pie:
      chartEl = <PieChart {...chartProps} />;
      break;
    case ChartIds.line:
      chartEl = <LineChart {...chartProps} />;
      break;
    case ChartIds.bar:
      chartEl = <BarChart {...chartProps} />;
      break;
    case ChartIds.stackedBar:
      chartEl = <StackbarChart {...chartProps} />;
      break;

    default:
      chartEl = <BarChart {...chartProps} />;
      break;
  }

  const activedFilter = storedFilter?.find((el) => el.key === filter);
  const activedSubFilter = listSubFilter?.find((el) => el.key === subFilter);
  const defaultFilterName = storedFilter?.[0]?.name;
  const defaultSubFilterName = storedFilter?.[0]?.subFilter?.[0]?.name;

  return (
    <div className="overview-section">
      <header className="section-header">
        <div className="flex items-center space-x-2">
          <div className="hidden xs:block">Show top</div>
          <Dropdown
            className="!ml-0 xs:!ml-2 noDrag"
            menu={{
              selectable: true,
              selectedKeys: [filter],
              items: getMenuList(listFilter),
              onClick: (item) => onChangeChartFilter(item.key),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light">
              {activedFilter?.name || defaultFilterName || "Choose"}
            </button>
          </Dropdown>

          {!isSkanPage && (
            <>
              <div>by</div>
              <Dropdown
                menu={{
                  selectable: true,
                  selectedKeys: [subFilter],
                  items: getMenuList(listSubFilter),
                  onClick: (item) => onChangeChartFilter(filter, item.key),
                }}
                trigger={["click"]}
                className="noDrag"
              >
                <button className="custom-btn-light">
                  {activedSubFilter?.name || defaultSubFilterName || "Choose"}
                </button>
              </Dropdown>
            </>
          )}
        </div>

        <Dropdown
          menu={{
            selectable: true,
            selectedKeys: [selectedChart],
            items: chartsWithAction,
            onClick: (item) => onChangeChart(item.key),
          }}
          trigger={["click"]}
          className="noDrag"
        >
          <button className="btn-light icon !px-1.5 !py-2">
            <MoreOutlined />
          </button>
        </Dropdown>
      </header>

      <div className="h-[420px]">{chartEl}</div>
    </div>
  );
}

CombinationChart.propTypes = {
  getHeaderFilter: PropTypes.func,
  onClone: PropTypes.func,
  onDelete: PropTypes.func,
  cloneData: PropTypes.object,
  totalChart: PropTypes.number,
  totalInitChart: PropTypes.number,
  chartId: PropTypes.number,
  recallApi: PropTypes.bool,
  showDelete: PropTypes.bool,
  configCharts: PropTypes.array,
  onSetChartFilter: PropTypes.func,
  isSkanPage: PropTypes.bool,
};

export default CombinationChart;
