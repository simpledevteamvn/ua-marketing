import React, { useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

const labels = ["2022-10-08", "2022-10-09", "2022-10-10", "2022-10-11"];
const data = {
  labels: labels,
  datasets: [
    {
      data: [65, 59, 80, 81],
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

function MiniChart(props) {
  const { width, height } = props;
  const [chartData, setChartData] = useState(data);

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div>
      <div>
        {
          // @ts-ignore
          chartData?.datasets?.length && (
            <Line
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

MiniChart.defaultProps = {
  width: 350,
  height: 130,
};

MiniChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default MiniChart;
