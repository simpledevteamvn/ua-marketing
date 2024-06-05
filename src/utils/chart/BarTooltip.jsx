import { getCountryNameFromCode } from "../Helpers";
import { formatValue } from "../Utils";
import { getOrCreateTooltip, styleTooltipEl } from "./ExternalTooltip";

export const CountryTooltip = (context) => {
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

    const tableHead = document.createElement("thead");

    titleLines.forEach((title) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.classList.add("text-left", "font-[13px]", "flex", "items-center");

      const countryName = getCountryNameFromCode(title);
      const text = document.createTextNode(countryName);
      const span = document.createElement("span");
      span.classList.add(
        "fi",
        `fi-${title.toLowerCase()}`,
        "mr-1",
        "w-5",
        "h-3"
      );
      // https://github.com/lipis/flag-icons

      th.appendChild(span);
      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement("tbody");
    dataPoints.forEach((dataPoint) => {
      const { label, backgroundColor, isFormatValue } = dataPoint.dataset;

      const tr = document.createElement("tr");
      tr.style.color = backgroundColor;
      tr.style.fontSize = "12px";

      const value = isFormatValue
        ? formatValue(dataPoint.raw)
        : dataPoint.formattedValue;
      const line = label + ": " + value;
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

  styleTooltipEl(tooltipEl, context);
};
