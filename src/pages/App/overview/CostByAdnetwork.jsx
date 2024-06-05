import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { formatValue, tailwindConfig } from "../../../utils/Utils";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import { Bar } from "react-chartjs-2";

import { MEASUREMENT_OPTIONS } from "../../../constants/constants";

const fakeData1 = [
  {
    label: "Last 7 days",
    data: [800, 1600, 900, 1300, 1950],
  },
  {
    label: "Preceding period",
    data: [1900, 2600, 1350, 1800, 2200],
  },
];

const fakeData2 = [
  {
    label: "Last 7 days",
    data: [1800, 1200, 500, 1100, 1250],
  },
  {
    label: "Preceding period",
    data: [900, 1600, 1650, 1400, 1200],
  },
];

const getBarChartData = (list = fakeData1) => {
  const labels = ["Google", "Mintegral", "Applovin", "Unity", "IronSource"];
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

function CostByAdnetwork(props) {
  const { width, height } = props;
  const [selectedCost, setSelectedCost] = useState(MEASUREMENT_OPTIONS[0].key);
  const [chartData, setChartData] = useState({});

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
        callbacks: {
          label: (context) => {
            const label = context.dataset.label;
            let value = context.formattedValue;

            if (selectedCost === MEASUREMENT_OPTIONS[0].key) {
              value = formatValue(context.parsed.x);
            }
            return label + ": " + value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
      axis: "y",
    },
    indexAxis: "y",
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
          <div className="ml-3">by Adnetwork</div>
        </h2>
      </header>

      {chartData?.datasets?.length && (
        // @ts-ignore
        <Bar options={options} data={chartData} width={width} height={height} />
      )}
    </div>
  );
}

CostByAdnetwork.defaultProps = {
  width: 595,
  height: 300,
};

CostByAdnetwork.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CostByAdnetwork;
