export const ASSET_MODE = {
  files: "files",
  systemAssets: "systemAssetIds",
  assetFromNetwork: "assetIds",
};
export const ASSET_OPTIONS = [
  { label: "Upload files", value: ASSET_MODE.files },
  { label: "System assets", value: ASSET_MODE.systemAssets },
  { label: "Assets from network", value: ASSET_MODE.assetFromNetwork },
];
export const ASSET_MOBILE_OPTIONS = [
  { label: "Upload", value: ASSET_MODE.files },
  { label: "System", value: ASSET_MODE.systemAssets },
  { label: "Network", value: ASSET_MODE.assetFromNetwork },
];
