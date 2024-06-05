import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getCampaignConfig: QueryFunc = async ({ queryKey }) => {
  const networkCode = queryKey[1];
  return await service.get("/campaign/config", { params: { networkCode } });
};
