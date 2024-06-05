import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getStoreAppsWithDetailData: QueryFunc = async () => {
  return await service.get("/store-app", { params: { constantData: true } });
};

export const getStoreApps: QueryFunc = async () => {
  return await service.get("/store-app");
};
