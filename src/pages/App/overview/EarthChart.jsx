import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as ChartGeo from "chartjs-chart-geo";
import { Chart } from "react-chartjs-2";
import axios from "axios";
import { countryData } from "./CostByCountry";

const getDataFromCountryName = (countryName) => {
  const activedCountry = countryData.find(
    (el) => el.name === countryName || el.name2 === countryName
  );

  return activedCountry ? activedCountry.value : 0;
};

// https://github.com/sgratzl/chartjs-chart-geo
// https://github.com/topojson/world-atlas
function EarthChart(props) {
  const { width, height } = props;
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    axios.get("https://unpkg.com/world-atlas/countries-110m.json").then(
      (res) => {
        const { data } = res;
        initData(data);
      },
      (err) => {
        console.log(">>>ERR: ", err);
        import("../../../../dist/earth/countries-50m.json").then(
          (earthData) => {
            initData(earthData);
          }
        );
      }
    );
  }, []);

  const initData = (data) => {
    const countries = ChartGeo.topojson.feature(
      data,
      data.objects.countries
      // @ts-ignore
    ).features;

    // const listCountry = countries.map((el) => el.properties.name);
    // console.log("listCountry", listCountry);

    // Check mapping of the list country in geo library and the list country in real data
    // const checkedData = [];
    // countries.map((el) => {
    //   const countryName = el.properties.name;

    //   const numb = getDataFromCountryName(countryName);
    //   if (numb) {
    //     checkedData.push(numb);
    //   }
    // });
    // console.log("checkedData :>> ", checkedData);

    const chartData = {
      labels: countries.map((d) => d.properties.name),
      datasets: [
        {
          label: "Countries",
          data: countries.map((d) => {
            const countryName = d.properties.name;
            return {
              feature: d,
              value: getDataFromCountryName(countryName),
            };
          }),
        },
      ],
    };

    setChartData(chartData);
  };

  const options = {
    layout: {
      padding: {
        right: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      xy: {
        projection: "equalEarth",
      },
    },
  };

  return (
    <div className="overview-section">
      {
        // @ts-ignore
        chartData?.datasets?.length && (
          <Chart
            type="choropleth"
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
  );
}

EarthChart.defaultProps = {
  width: 595,
  height: 300,
};

EarthChart.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default EarthChart;
