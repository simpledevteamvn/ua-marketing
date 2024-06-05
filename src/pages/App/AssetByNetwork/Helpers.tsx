import { UNITY_ASSET_TYPE } from "../../../constants/asset";
import { NETWORK_CODES } from "../../../constants/constants";

export const PORTRAIT_IMG_SIZE = "600 x 800";
export const ACCEPTED_SIZES = {
  [NETWORK_CODES.unity]: {
    [UNITY_ASSET_TYPE.endCardPair]: [PORTRAIT_IMG_SIZE, "800 x 600"],
  },
};

interface RESULTS_DATA {
  isValid: Boolean;
  sizes: string[];
}

export const checkAssetSize = (
  filesSizes,
  network = NETWORK_CODES.unity,
  type = UNITY_ASSET_TYPE.endCardPair
) => {
  const acceptedSizes = ACCEPTED_SIZES[network]?.[type];
  let results: RESULTS_DATA = { isValid: false, sizes: acceptedSizes };

  if (filesSizes?.length && acceptedSizes?.length === filesSizes?.length) {
    // Nếu size là rỗng (playable hoặc file không lấy được size) thì vẫn coi là valided data
    const cleanedSizes = filesSizes.filter((el) => !!el);
    const isValid = !cleanedSizes.some((size) => !acceptedSizes.includes(size));

    results.isValid = isValid;
  }

  return results;
};
