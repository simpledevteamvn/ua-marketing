import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { hexToRGB } from "../../../utils/Utils";
import Info from "../../../utils/Info";
import Dropdown from "antd/lib/dropdown";
import Menu from "antd/lib/menu";
import { Bar } from "react-chartjs-2";
import { AiFillQuestionCircle } from "@react-icons/all-files/ai/AiFillQuestionCircle";

import { MEASUREMENT_OPTIONS } from "../../../constants/constants";
import { StackBarTooltip } from "../../../utils/chart/StackBarTooltip";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";

const fakeData1 = [
  {
    label: "Google",
    data: [400, 200], // Meaning: Unknown: 200; tCPI: 300
    stack: "Last 7 days",
  },
  {
    label: "Mintegral",
    data: [200, 300],
    stack: "Last 7 days",
  },
  {
    label: "Applovin",
    data: [400, 100],
    stack: "Last 7 days",
  },
  {
    label: "IronSource",
    data: [900, 600],
    stack: "Last 7 days",
  },
  {
    label: "Unity",
    data: [600, 100],
    stack: "Last 7 days",
  },
];

const fakeData2 = [
  {
    label: "Google",
    data: [100, 800],
    stack: "Preceding period",
  },
  {
    label: "Mintegral",
    data: [100, 700],
    stack: "Preceding period",
  },
  {
    label: "Applovin",
    data: [200, 500],
    stack: "Preceding period",
  },
  {
    label: "IronSource",
    data: [300, 400],
    stack: "Preceding period",
  },
  {
    label: "Unity",
    data: [500, 600],
    stack: "Preceding period",
  },
];

const totalAdnetwork = fakeData1.length;
const fakeData = [...fakeData1, ...fakeData2].map((el) =>
  Object.assign({}, el, { isFormatValue: true })
);

const getBarChartData = (list = fakeData) => {
  const labels = ["Unknown", "tCPI"];
  const colors = [
    "#22aa99",
    "#60a5fa",
    "#6366f1",
    "#66aa00",
    "#316395",
    "#67e8f9",
  ];

  const datasets = list.map((item, idx) => {
    let color;
    if (idx < totalAdnetwork) {
      color = colors[idx];
    } else {
      color = `rgba(${hexToRGB(colors[idx - totalAdnetwork])}, 0.5)`;
    }

    return Object.assign({}, item, {
      backgroundColor: color,
      hoverBackgroundColor: color,
      barPercentage: 0.6,
      categoryPercentage: 0.4,
    });
  });

  return { labels, datasets };
};

function CostByCampaign(props) {
  const { width, height } = props;
  const [selectedCost, setSelectedCost] = useState(MEASUREMENT_OPTIONS[0].key);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    setChartData(getBarChartData());
  }, []);

  const onChageMenu = (item) => {
    // change data
    const changedFakeData = fakeData2.map((el) =>
      Object.assign({}, el, { isFormatValue: false })
    );
    setChartData(
      getBarChartData(item.key % 2 === 0 ? fakeData : changedFakeData)
    );
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
      x: { stacked: true },
      y: {
        stacked: true,
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Last 7 days vs Preceding period",
        position: "bottom",
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: StackBarTooltip,
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
          <div className="ml-3">by Campaign Target Type</div>
        </h2>

        <Info
          className=""
          containerClassName="min-w-60"
          icon={<AiFillQuestionCircle size={20} />}
        >
          <ul className="list-disc mt-1 pl-3 space-y-1">
            <li>
              tCPA: UAC In-app actions Campaign of Google Ads and App Events
              Optimisation of Facebook Ads
            </li>
            <li>tCPI: Installs Campaign of Unity Ads and Google Ads </li>
            <li>
              tROAS: UAC In-app action value Campaign of Google Ads and ROAS
              Campaign of Unity Ads
            </li>
            <li>tRetention: Retention Campaign of Unity Ads</li>
            <li>
              UNKNOWN: Campaign of ironSource, Applovin and Apple Search Ads
            </li>
          </ul>
        </Info>
      </header>

      <div>
        {/* Add a div tag to wrap the customed tooltip */}
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

CostByCampaign.defaultProps = {
  width: 595,
  height: 310,
};

CostByCampaign.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CostByCampaign;
