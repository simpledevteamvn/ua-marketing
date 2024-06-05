import { AD_NETWORK_TYPE, EDITABLE_STAT_IDS } from "../../constants/constants";
import service from "../../partials/services/axios.config";

export type ResponseAPI = {
  message?: string;
  results?: any;
};

export const BATCH_EDIT_TYPES = {
  country: "COUNTRY",
  campaign: "CAMPAIGN",
};

export type QueryFunc = (queryKey) => Promise<ResponseAPI>;

export const getListNetworkType: QueryFunc = async () => {
  return await service.get("/network-type");
};

export const getListAdNetworkByTypeId: QueryFunc = async ({ queryKey }) => {
  const { typeId } = queryKey;
  return await service.get("/network", { params: { typeId } });
};

export const getCampaigns: QueryFunc = async ({ queryKey }) => {
  const { params } = queryKey[1];
  return await service.get("/campaign", { params });
};

export const getStoreAppById: QueryFunc = async ({ queryKey }) => {
  const appId = queryKey[1];

  if (!appId) {
    return Promise.resolve({});
  }
  return await service.get(`/store-app/${appId}`);
};

export const getListAdNetwork: QueryFunc = async ({ queryKey }) => {
  const listNetworkType: any = await service.get("/network-type");

  const data = listNetworkType?.results;
  if (!data?.length) {
    return Promise.resolve({});
  }

  const adNetwork = data?.find((el) => el.type === AD_NETWORK_TYPE);
  let params: any = { typeId: adNetwork.id };

  const batchType = queryKey[2];
  if (queryKey[1] === EDITABLE_STAT_IDS.bid) {
    if (batchType === BATCH_EDIT_TYPES.country) {
      params = { ...params, onlyBatchBidEdit: true };
    } else {
      params = { ...params, onlyBatchCampaignBidEdit: true };
    }
  } else if (queryKey[1] === EDITABLE_STAT_IDS.budget) {
    if (batchType === BATCH_EDIT_TYPES.country) {
      params = { ...params, onlyBatchBudgetEdit: true };
    } else {
      params = { ...params, onlyBatchCampaignBudgetEdit: true };
    }
  }

  return await service.get("/network", { params });
};

export const getCurrency: QueryFunc = async () => {
  return await service.get("/rule-config/currency");
};
