import { formatValue } from "../Utils";
import { getOrCreateTooltip, styleTooltipEl } from "./ExternalTooltip";

export const StackBarTooltip = (context) => {
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const { dataPoints } = tooltip;
    const sortedDataPoints = sortDataByFirstStackAndValue(dataPoints);

    const tableHead = document.createElement("thead");
    titleLines.forEach((title) => {
      const tr = document.createElement("tr");
      tr.style.borderWidth = "0";

      const th = document.createElement("th");
      th.style.borderWidth = "0";
      th.style.textAlign = "start";
      th.style.fontSize = "13px";
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement("tbody");
    sortedDataPoints.forEach((dataPoint) => {
      const { stack, label, backgroundColor, isFormatValue } =
        dataPoint.dataset;

      const tr = document.createElement("tr");
      tr.style.backgroundColor = "inherit";
      tr.style.borderWidth = "0";
      tr.style.color = backgroundColor;
      tr.style.fontSize = "12px";

      const value = isFormatValue
        ? formatValue(dataPoint.raw)
        : dataPoint.formattedValue;
      const line = label + " - " + stack + ": " + value;
      const text = document.createTextNode(line);

      tr.appendChild(text);
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

  styleTooltipEl(tooltipEl, context, [{ minWidth: "200px" }]);
};

function sortDataByFirstStackAndValue(listData = []) {
  const listStack = [];
  listData.forEach((el) => {
    const stackName = el.dataset.stack;
    if (!listStack.includes(stackName)) {
      listStack.push(stackName);
    }
  });

  // Important note: The sum of elements of each stack in the listStack is the same.
  const sortedDataByFirstStack = listData
    .filter((el) => el.dataset.stack === listStack[0])
    .sort((a, b) => b.raw - a.raw);

  let results = [];
  sortedDataByFirstStack.forEach((data) => {
    results.push(data);
    const activedLabel = data.dataset.label;
    const activedStack = data.dataset.stack;

    for (let i = 1; i < listStack.length; i++) {
      listData.forEach((el) => {
        if (
          el.dataset.label === activedLabel &&
          el.dataset.stack !== activedStack
        ) {
          results.push(el);
        }
      });
    }
  });

  return results;
}
