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
import {
  BarIcon,
  ChartIds,
  LineIcon,
  StackBarIcon,
} from "../../../../partials/common/Switcher/ChartSwitcher";
import { ChartFilter } from "./CombinationChart";

const ListFilterId = {
  geo: "geo",
};

function PerformanceChart(props) {
  const { getHeaderFilter, height } = props;
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

  const { data: chartFilterData, isLoading: isLoadingFilters } = useQuery({
    queryKey: [OVERVIEW_CHART_FILTERS, false],
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

    setIsLoading(true);
    service.get(url, { params }).then(
      (res: any) => {
        setChartData(res?.results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const handleChangeSelectedChart = (newChartName) => {
    setSelectedChart(newChartName);
  };

  useEffect(() => {
    const filterData = chartFilterData?.results;
    if (!filterData?.length) return;

    setStoredFilter(filterData);
    onFilter(filterData);
  }, [chartFilterData]);

  useEffect(() => {
    if (isInit) {
      // The parent will call twice, so on the first render this page should not do anything
      return setIsInit(false);
    }
    if (!filter) return;

    updateChartData();
  }, [chartFilter]);

  const onFilter = (storedList = storedFilter, idx = 0) => {
    const newListSubFilter = storedList[idx]?.subFilter;

    const isCorrectSubFilter = newListSubFilter?.some(
      (el) => el.key === subFilter
    );
    const newSubFilter = isCorrectSubFilter
      ? subFilter
      : newListSubFilter?.[0]?.key;

    setChartFilter({
      filter: storedList[idx].key,
      subFilter: newSubFilter,
      listFilter: storedList,
      listSubFilter: newListSubFilter,
    });
    onUpdateChart(newListSubFilter?.[0]?.chart || []);
  };

  const onChangeFilters = (filterKey = filter, subFilterKey = subFilter) => {
    const activedIdx = storedFilter.findIndex((el) => el.key === filterKey);

    if (filterKey !== filter && activedIdx !== -1) {
      return onFilter(storedFilter, activedIdx);
    }

    if (subFilterKey !== subFilter && activedIdx !== -1) {
      setChartFilter({ ...chartFilter, subFilter: subFilterKey });

      const activedSubFilter = listSubFilter?.find(
        (el) => el.key === subFilterKey
      );
      if (activedSubFilter) {
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
    <div className="overview-section !shadow-none !rounded">
      <header className="section-header">
        <div className="flex items-center space-x-2">
          <div className="hidden xs:block">Show top</div>
          <Dropdown
            className="!ml-0 xs:!ml-2"
            menu={{
              selectable: true,
              selectedKeys: [filter],
              items: getMenuList(listFilter),
              onClick: (item) => onChangeFilters(item.key),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light">
              {activedFilter?.name || defaultFilterName || "Choose"}
            </button>
          </Dropdown>

          <div>by</div>
          <Dropdown
            menu={{
              selectable: true,
              selectedKeys: [subFilter],
              items: getMenuList(listSubFilter),
              onClick: (item) => onChangeFilters(filter, item.key),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light">
              {activedSubFilter?.name || defaultSubFilterName || "Choose"}
            </button>
          </Dropdown>
        </div>

        <Dropdown
          menu={{
            selectable: true,
            selectedKeys: [selectedChart],
            items: chartsWithAction,
            onClick: (item) => onChangeChart(item.key),
          }}
          trigger={["click"]}
          align={{ offset: [-94, 4] }}
        >
          <button className="btn-light icon !px-1.5 !py-2">
            <MoreOutlined />
          </button>
        </Dropdown>
      </header>

      <div className="" style={{ height }}>
        {chartEl}
      </div>
    </div>
  );
}

PerformanceChart.defaultProps = {
  height: 380,
};

PerformanceChart.propTypes = {
  getHeaderFilter: PropTypes.func,
  height: PropTypes.number,
};

export default PerformanceChart;
