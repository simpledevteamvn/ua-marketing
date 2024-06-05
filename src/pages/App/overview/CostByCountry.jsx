import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { tailwindConfig } from "../../../utils/Utils";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import { Bar } from "react-chartjs-2";

import { MEASUREMENT_OPTIONS } from "../../../constants/constants";
import { CountryTooltip } from "../../../utils/chart/BarTooltip";
import SwitchTableAndChart from "../../../partials/common/SwitchTableAndChart";

export const countryData = [
  {
    code: "BR",
    name: "Brazil",
    value: 800,
  },
  {
    code: "MX",
    name: "Mexico",
    value: 1600,
  },
  {
    code: "US",
    name: "United States",
    name2: "United States of America", // Name in geo library
    value: 900,
  },
  {
    code: "VN",
    name: "Vietnam",
    value: 1300,
  },
  {
    code: "IN",
    name: "India",
    value: 1950,
  },
  {
    code: "AR",
    name: "Argentina",
    value: 1200,
  },
  {
    code: "CL",
    name: "Chile",
    value: 600,
  },
  {
    code: "PE",
    name: "Peru",
    value: 200,
  },
  {
    code: "IT",
    name: "Italy",
    value: 1300,
  },
  {
    code: "EC",
    name: "Ecuador",
    value: 450,
  },
];

const fakeData1 = [
  {
    label: "Last 7 days",
    data: [1800, 1200, 500, 1100, 1250, 1800, 1200, 500, 1100, 1250],
    isFormatValue: true,
  },
  {
    label: "Preceding period",
    data: [1900, 2600, 1350, 1800, 2200, 500, 200, 1200, 1200, 1650],
    isFormatValue: true,
  },
];

const fakeData2 = [
  {
    label: "Last 7 days",
    data: countryData.map((el) => el.value),
    isFormatValue: false,
  },
  {
    label: "Preceding period",
    data: [900, 1600, 1650, 1400, 1200, 1800, 1200, 500, 1100, 1250],
    isFormatValue: false,
  },
];

const getBarChartData = (list = fakeData2) => {
  const labels = countryData.map((el) => el.code);
  const datasets = list.map((data, idx) => {
    // @ts-ignore
    const color1 = tailwindConfig().theme.colors.blue[400];
    // @ts-ignore
    const hoverColor1 = tailwindConfig().theme.colors.blue[600];
    // @ts-ignore
    const color2 = tailwindConfig().theme.colors.indigo[500];
    // @ts-ignore
    const hoverColor2 = tailwindConfig().theme.colors.indigo[900];

    return Object.assign({}, data, {
      backgroundColor: idx ? color1 : color2,
      hoverBackgroundColor: idx ? hoverColor1 : hoverColor2,
      barPercentage: 0.8,
      categoryPercentage: 0.66,
    });
  });

  return { labels, datasets };
};

function CostByCountry(props) {
  const { width, height } = props;
  const [selectedCost, setSelectedCost] = useState(MEASUREMENT_OPTIONS[1].key);
  const [chartData, setChartData] = useState({});
  const [isTableModeView, setIsTableModeView] = useState(true);

  useEffect(() => {
    setChartData(getBarChartData());
  }, []);

  const onChageMenu = (item) => {
    // change data
    setChartData(getBarChartData(item.key % 2 === 0 ? fakeData1 : fakeData2));
    setSelectedCost(item.key);
  };

  const menu = (
    <Menu
      selectable
      onSelect={(item) => onChageMenu(item)}
      defaultSelectedKeys={[selectedCost]}
      items={MEASUREMENT_OPTIONS}
    />
  );

  const activedCost =
    MEASUREMENT_OPTIONS.find((el) => el.key === selectedCost) ||
    MEASUREMENT_OPTIONS[0];

  const options = {
    layout: {
      padding: {
        top: 12,
        bottom: 16,
        left: 20,
        right: 20,
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        enabled: false,
        external: CountryTooltip,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
      axis: "x",
    },
  };

  return (
    <div className="overview-section">
      <header className="section-header">
        <h2 className="flex font-bold text-slate-800 mb-0 text-xl">
          <Dropdown overlay={menu} trigger={["click"]}>
            <div className="flex items-center cursor-pointer">
              {activedCost.label}
              <DownOutlined className="ml-2" />
            </div>
          </Dropdown>
          <div className="ml-3">by Country</div>
        </h2>

        <SwitchTableAndChart
          isTableModeView={isTableModeView}
          onViewTable={() => setIsTableModeView(!isTableModeView)}
          onViewChart={() => setIsTableModeView(!isTableModeView)}
        />
      </header>

      <div>
        {
          // @ts-ignore
          chartData?.datasets?.length && (
            <Bar
              // @ts-ignore
              options={options}
              // @ts-ignore
              data={chartData}
              width={width}
              height={height}
            />
          )
        }
      </div>
    </div>
  );
}

CostByCountry.defaultProps = {
  width: 595,
  height: 300,
};

CostByCountry.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CostByCountry;
