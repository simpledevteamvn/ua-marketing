export interface TreeNode {
  key: string;
  title: string;
  id?: string;
  name?: string;
  parentFolderId?: string;
}

export interface Asset {
  id: string;
  name?: string;
  lastModifiedDate: string;
  lastModifiedBy?: string;
  type?: string;
  url?: string;
  marks?: string[];
  assetFolderId?: string;
}

export interface MovedAssets {
  assets?: Asset[];
  folder?: TreeNode;
}

export interface DroppableData {
  id: string; // moved asset id
  name?: string;
  selectedAssets: Asset[]; // all selected assets
}
