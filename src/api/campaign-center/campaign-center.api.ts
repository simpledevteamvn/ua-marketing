import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getUserByApp: QueryFunc = async ({ queryKey }) => {
  const { storeAppId } = queryKey[1];
  return await service.get("/user/store-app", { params: { storeAppId } });
};

export const getListBidType: QueryFunc = async () => {
  return await service.get("/bid/type");
};

export const getListCampaignType: QueryFunc = async () => {
  return await service.get("/campaign/type");
};

export const getListSiteId: QueryFunc = async ({ queryKey }) => {
  const params = queryKey[1] || {};
  const { storeAppId, storeAppIds } = params;

  if (!storeAppId && !storeAppIds?.length) return Promise.resolve({});

  return await service.post("/bid/site-id-get-store-apps", params);
};
