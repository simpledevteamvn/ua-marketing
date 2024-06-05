import React, { memo } from "react";
import memoize from "memoize-one";
import { FixedSizeList as List, areEqual } from "react-window";
import classNames from "classnames";
import { DRAGGABLE_ASSETS } from "../constants";
import { DraggableAsset } from "../components/DraggableAsset";
import Checkbox from "antd/lib/checkbox";

// https://github.com/bvaughn/react-virtualized#pure-components
// https://react-window.vercel.app/#/examples/list/memoized-list-items
// https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/memoized-list-items?file=/index.js
export const Row = memo(({ data, index, style }: any) => {
  const {
    items,
    selectedAssets,
    onClickAsset,
    onChangeCheckbox,
    setPreviewData,
    setImgPreview,
    fullFeature,
  } = data;
  const el = items[index];
  const isActived = selectedAssets?.some((asset) => asset.id === el.id);

  return (
    <div
      style={style}
      className={classNames(
        "pr-4 pl-0 flex items-center py-2 border border-t-0 first:rounded-t last:rounded-b sm:min-w-[400px] md:min-w-[750px]",
        isActived ? "bg-sky-100" : "hover:bg-sky-50/30"
      )}
    >
      <Checkbox
        className="!px-3 border-r"
        checked={isActived}
        onChange={(e) => onChangeCheckbox(e, el)}
      />
      <DraggableAsset
        type={DRAGGABLE_ASSETS}
        el={el}
        onClickAsset={onClickAsset}
        setPreviewData={setPreviewData}
        setImgPreview={setImgPreview}
        selectedAssets={selectedAssets}
        fullFeature={fullFeature}
      />
    </div>
  );
}, areEqual);

const createItemData = memoize(
  (
    items,
    selectedAssets,
    onClickAsset,
    onChangeCheckbox,
    setPreviewData,
    setImgPreview,
    fullFeature
  ) => ({
    items,
    selectedAssets,
    onClickAsset,
    onChangeCheckbox,
    setPreviewData,
    setImgPreview,
    fullFeature,
  })
);

export function AssetItem({
  height,
  filteredAssets,
  selectedAssets,
  onClickAsset,
  onChangeCheckbox,
  setPreviewData,
  setImgPreview,
  fullFeature,
}) {
  const itemData = createItemData(
    filteredAssets,
    selectedAssets,
    onClickAsset,
    onChangeCheckbox,
    setPreviewData,
    setImgPreview,
    fullFeature
  );

  return (
    <List
      height={height - 295}
      itemCount={filteredAssets?.length}
      itemData={itemData}
      itemSize={60}
    >
      {Row}
    </List>
  );
}
