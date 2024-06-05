import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getOverviewChartFilter: QueryFunc = async ({ queryKey }) => {
  const isSkanPage = queryKey[1];
  const url = isSkanPage
    ? "/dashboard/skan/trend-chart-filter"
    : "/dashboard/overview/trend-chart-filter";

  return await service.get(url);
};

export const getSummaryTableFilter: QueryFunc = async ({ queryKey }) => {
  const isAllApp = queryKey[1];
  const isSkanPage = queryKey[2];
  let url = "/dashboard/overview/dimension-table-filter";

  if (isSkanPage) {
    url = "/dashboard/skan/dimension-table-filter";
  }

  return await service.get(url, {
    params: { isDashboard: isAllApp },
  });
};

export const getOverviewConfig: QueryFunc = async ({ queryKey }) => {
  const storeAppId = queryKey[1];
  return await service.get("/dashboard-customize", { params: { storeAppId } });
};
