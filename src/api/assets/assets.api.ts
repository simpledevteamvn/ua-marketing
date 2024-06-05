import service from "../../partials/services/axios.config";
import { QueryFunc } from "../common/common.api";

export const getAssetsByFolder: QueryFunc = async ({ queryKey }) => {
  const rootFolder = queryKey[1];
  const listData = queryKey[2]?.length ? queryKey[2] : [];
  const assetFolderIds = listData.filter((el) => el !== rootFolder).join(",");

  return await service.get("/system-asset", {
    params: { assetFolderIds },
  });
};

export const getConfigsForUploadingAsset: QueryFunc = async ({ queryKey }) => {
  const networkCode = queryKey[1];

  return await service.get("/asset/config", {
    params: { networkCode },
  });
};
