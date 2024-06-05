import moment from "moment";
import { numberWithCommas } from "../Utils";

// Ref: https://github.com/chartjs/Chart.js/blob/master/docs/samples/tooltip/html.md
// or: https://www.chartjs.org/docs/latest/configuration/tooltip.html
export const externalTooltipHandler = (
  context,
  dayDistance = 0,
  prefix = "",
  suffix = ""
) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    // const titleLines = tooltip.title || [];
    const { dataPoints } = tooltip;
    const parsedDatas = dataPoints.map((data) => data.parsed);

    const tableHead = document.createElement("thead");

    // titleLines.forEach((title) => {
    //   const tr = document.createElement("tr");
    //   tr.style.borderWidth = 0;

    //   const th = document.createElement("th");
    //   th.style.borderWidth = 0;
    //   const text = document.createTextNode(title);

    //   th.appendChild(text);
    //   tr.appendChild(th);
    //   tableHead.appendChild(tr);
    // });

    const tableBody = document.createElement("tbody");
    parsedDatas.forEach((coor, i) => {
      const colors = tooltip.labelColors[i];

      // Line 1: Converted time
      const formatedTime = "-ddd, MMM D YYYY";
      let time = moment(coor.x).format(formatedTime);
      const trTime = document.createElement("tr");
      const tdTime = document.createElement("td");

      if (i) {
        tdTime.style.paddingTop = "8px";
        time = moment(coor.x)
          .subtract(dayDistance, "days")
          .format(formatedTime);
      }
      tdTime.style.fontSize = "13px";
      tdTime.style.fontWeight = "700";

      tdTime.appendChild(document.createTextNode(time));
      trTime.appendChild(tdTime);
      tableBody.appendChild(trTime);

      // Line 2: span + value
      const span = document.createElement("span");
      span.style.background = colors.backgroundColor;
      span.style.marginRight = "10px";
      span.style.height = "11px";
      span.style.width = "11px";
      span.style.display = "inline-block";

      const tr = document.createElement("tr");
      tr.style.backgroundColor = "inherit";
      tr.style.borderWidth = "0";

      const td = document.createElement("td");
      td.style.borderWidth = "0";
      td.style.fontSize = "12px";

      const data = prefix + numberWithCommas(coor.y) + suffix;
      const text = document.createTextNode(data);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const oldWidth = tooltip.width - 3 * tooltip.options.padding + "px";
  tooltipEl.style.minWidth = oldWidth;

  styleTooltipEl(tooltipEl, context);
};

export const getOrCreateTooltip = (chart) => {
  // Note: Wrap chart component into a div
  let tooltipEl = chart.canvas.parentNode.querySelector("div");

  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.style.border = "1px solid #d1d5db";
    tooltipEl.style.background = "white";
    tooltipEl.style.borderRadius = "3px";
    tooltipEl.style.color = "black";
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = "none";
    tooltipEl.style.position = "absolute";
    tooltipEl.style.transform = "translate(-50%, -100%)";
    tooltipEl.style.transition = "all .1s ease";

    const table = document.createElement("table");
    table.style.margin = "0px";

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

export const styleTooltipEl = (tooltipEl, context, customStyles = []) => {
  const { chart, tooltip } = context;
  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + "px";
  tooltipEl.style.display = "inline-block";
  tooltipEl.style.zIndex = "1170";

  const hiddenArea = tooltip.width / 2 - positionX - tooltip.caretX;
  if (hiddenArea > 0) {
    // Element hidden on the left
    tooltipEl.style.left = positionX + tooltip.caretX + hiddenArea + "px";
  }

  const halfTooltipWidth = tooltip.width / 2;
  const chartLeftCoor = chart.canvas.getBoundingClientRect().left;
  const scrollbarWidth = 18; // default scrollbar width can range anywhere from 12px to 17px
  // Element hidden on the right
  // This logic is incorrect when the width of new tooltip is much different from the old one
  if (
    chartLeftCoor + tooltip.caretX + halfTooltipWidth >=
    window.innerWidth - scrollbarWidth
  ) {
    tooltipEl.style.left = positionX + tooltip.caretX - halfTooltipWidth + "px";
  }

  tooltipEl.style.top = positionY + tooltip.caretY + "px";
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + "px " + tooltip.options.padding + "px";

  if (customStyles.length) {
    customStyles.forEach(
      (styleObj) =>
        (tooltipEl.style[Object.keys(styleObj)[0]] = Object.values(styleObj)[0])
    );
  }
};

export const ColorTooltip = (context, chartType = "") => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const { dataPoints } = tooltip;

    // Table header
    const tableHead = document.createElement("thead");
    const label = dataPoints[0].label;
    const tr = document.createElement("tr");
    tr.style.fontWeight = "600";

    tr.appendChild(document.createTextNode(label));
    tableHead.appendChild(tr);

    // Table body
    const tableBody = document.createElement("tbody");
    tableBody.style.fontSize = "12px";
    dataPoints.forEach((el) => {
      const { dataset, dataIndex } = el;
      const { backgroundColor, borderColor } = dataset;

      let bgColor = backgroundColor;
      if (Array.isArray(backgroundColor)) {
        // Type: Pie chart
        bgColor = backgroundColor[dataIndex];
      }
      if (chartType === "line") {
        // Type: Line chart
        bgColor = borderColor;
      }

      // td1: span + label
      const span = document.createElement("span");
      span.style.background = bgColor;
      span.style.marginRight = "8px";
      span.style.height = "8px";
      span.style.width = "8px";
      span.style.display = "inline-block";

      const span2 = document.createElement("span");
      span2.style.marginRight = "4px";

      const td = document.createElement("td");
      td.style.display = "flex";
      td.style.alignItems = "center";
      td.appendChild(span);
      td.appendChild(document.createTextNode(dataset.label + ":"));
      td.appendChild(span2);

      // td2: value
      const td2 = document.createElement("td");
      const data = numberWithCommas(el.raw);
      const text = document.createTextNode(data);
      td2.style.textAlign = "end";
      td2.appendChild(text);

      const tr = document.createElement("tr");
      tr.appendChild(td);
      tr.appendChild(td2);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const oldWidth = tooltip.width + 2 * tooltip.options.padding + "px";
  tooltipEl.style.minWidth = oldWidth;
  styleTooltipEl(tooltipEl, context);
};

export const SmallTooltip = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  if (tooltip.body) {
    const { dataPoints } = tooltip;

    // Table header
    const tableHead = document.createElement("thead");
    const label = dataPoints[0].label;
    const tr = document.createElement("tr");
    tr.style.fontWeight = "600";

    tr.appendChild(document.createTextNode(label));
    tableHead.appendChild(tr);

    // Table body
    const tableBody = document.createElement("tbody");
    tableBody.style.fontSize = "12px";
    tableBody.style.textAlign = "center";
    dataPoints.forEach((el) => {
      // tr: value
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      const data = numberWithCommas(el.raw);
      td.appendChild(document.createTextNode(data));
      tr.appendChild(td);

      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector("table");

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const oldWidth = tooltip.width + 2 * tooltip.options.padding + "px";
  tooltipEl.style.minWidth = oldWidth;
  styleTooltipEl(tooltipEl, context, [{ paddingBottom: "3px" }]);
};
