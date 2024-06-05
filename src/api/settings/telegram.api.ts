import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getAllTeleGroupType: QueryFunc = async () => {
  return await service.get("/telegram/type");
};
