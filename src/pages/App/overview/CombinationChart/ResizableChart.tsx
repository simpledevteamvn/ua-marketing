import _ from "lodash";
import React, { useEffect, useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { useSelector } from "react-redux";
import { useWindowSize } from "../../../../partials/sidebar/Sidebar";
import { RootState } from "../../../../redux/store";
import CombinationChart from "./CombinationChart";

const ResponsiveGridLayout = WidthProvider(Responsive);

function ResizableChart({
  recallApi,
  getHeaderFilter,
  onCloneChart,
  onDeleteChart,
  cloneData,
  totalChart,
  configCharts,
  setConfigCharts,
  totalInitChart,
  listTemplate,
  isSkanPage,
}) {
  const [width] = useWindowSize();
  const expanded = useSelector((state: RootState) => state.sidebar.expanded);

  // By chartContainer, not screen
  // Ex: screen 1320px = chart 1048px -> "sm" screen
  const defaultBP = { lg: 1400, md: 1050, sm: 768, xs: 480 };

  const [layout, setLayout] = useState([]);
  const [isInit, setIsInit] = useState(true);
  const [chartKey, setChartKey] = useState(1);
  const [screenCode, setScreenCode] = useState();

  useEffect(() => {
    if (!width) return;

    const pageWidth = document
      .getElementById("OverviewPage")
      ?.getBoundingClientRect().width!;
    const chartWidth = pageWidth + 16 * 2; // -m-4 = 16px
    let newBp;

    if (chartWidth >= defaultBP.lg) {
      newBp = "lg";
    } else if (chartWidth >= defaultBP.md) {
      newBp = "md";
    } else if (chartWidth >= defaultBP.sm) {
      newBp = "sm";
    } else if (chartWidth >= defaultBP.xs) {
      newBp = "xs";
    } else {
      newBp = screenCode;
    }

    if (newBp !== screenCode) {
      setScreenCode(newBp);
    }
  }, [width]);

  useEffect(() => {
    const newLayout = configCharts.map((el) => el.layout);
    setLayout(newLayout);

    const needInitLayout = configCharts.some((el) => el.initLayout);
    if (needInitLayout) {
      setChartKey(chartKey + 1);
    }
  }, [configCharts]);

  const onLayoutChange = (layout, layouts) => {
    if (isInit) {
      // Library init with layout = []
      return setIsInit(false);
    }

    if (!screenCode || !layouts[screenCode]) {
      // Fix init with incorrect layout data
      return;
    }

    const newConfig = configCharts.map((el, idx) => {
      let newLayout;
      if (el.initLayout && listTemplate?.length) {
        const checkFieldNotNull = (field) => {
          const fieldValue = el.layout?.[field];
          return fieldValue === 0 ? true : !!fieldValue;
        };

        newLayout = {
          ...layout[idx],
          x: checkFieldNotNull("x") ? el.layout?.x : 0,
          y: checkFieldNotNull("y") ? el.layout?.y : 0,
          w: checkFieldNotNull("w") ? el.layout?.w : 12,
        };
      } else {
        newLayout = layout[idx];
      }
      return { ...el, layout: newLayout, initLayout: false };
    });

    if (compareTwoLayout(configCharts, newConfig)) {
      setConfigCharts && setConfigCharts(newConfig);
    }
  };

  const compareTwoLayout = (obj1, obj2) => {
    //  Return true if two array is different
    if (
      !Array.isArray(obj1) ||
      !Array.isArray(obj2) ||
      obj1.length !== obj2.length
    ) {
      return true;
    }

    const isNotEqual = obj1.some(
      (el, idx) => !_.isEqual(el.layout, obj2[idx].layout)
    );
    return isNotEqual;
  };

  useEffect(() => {
    // https://github.com/react-grid-layout/react-grid-layout/issues/933
    window.dispatchEvent(new Event("resize"));
  }, [expanded]);

  const onSetChartFilter = (chartId, newFilters, chartName) => {
    const newConfigs = configCharts.map((el) => {
      if (el.chartId === chartId) {
        return {
          ...el,
          chartFilter: {
            ...el.chartFilter,
            ...newFilters,
            chartName: chartName || el.chartFilter?.chartName,
          },
        };
      }
      return el;
    });
    setConfigCharts(newConfigs);
  };

  const generateLayout = () => {
    return configCharts.map((configObj, idx) => {
      const { chartFilter, chartId, layout, init } = configObj;
      const x = layout?.x || 0;
      const y = layout?.y || idx;
      const w = layout?.w || 12;

      return {
        x,
        y,
        w,
        h: 1,
        idx: chartId,
        maxH: 1,
        minW: 3,
        chartFilter,
        init,
      };
    });
  };

  const generateDOM = (classNames = "") => {
    // Generate items with properties from the layout, rather than pass the layout directly
    const layout = generateLayout();

    return layout.map((l) => (
      <div key={l.idx} data-grid={l} className={classNames}>
        <CombinationChart
          showDelete={configCharts.length > 1}
          chartId={l.idx}
          recallApi={recallApi}
          getHeaderFilter={getHeaderFilter}
          onClone={onCloneChart}
          onDelete={onDeleteChart}
          cloneData={cloneData}
          totalChart={totalChart}
          totalInitChart={totalInitChart}
          configCharts={configCharts}
          onSetChartFilter={onSetChartFilter}
          isSkanPage={isSkanPage}
        />
      </div>
    ));
  };

  if (!configCharts?.length) return <></>;
  if (window.innerWidth <= 768) {
    return generateDOM("mt-3");
  }

  return (
    <div className="custom-resizable" id="OverviewResizableCharts">
      <ResponsiveGridLayout
        key={chartKey}
        className="-m-4 -mt-3"
        isDraggable
        isResizable
        items={3}
        rowHeight={485}
        margin={[16, 16]}
        layout={layout}
        breakpoints={defaultBP}
        cols={{ lg: 12, md: 9, sm: 6, xs: 3 }}
        onLayoutChange={onLayoutChange}
        draggableCancel={".noDrag"}
      >
        {generateDOM()}
      </ResponsiveGridLayout>
    </div>
  );
}

ResizableChart.propTypes = {};

export default ResizableChart;
