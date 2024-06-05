import React, { memo, FC, useContext, useEffect, useState } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import { NameColumn } from "../../App/Creative/Helpers";
import { capitalizeWord, getBeforeTime } from "../../../utils/Helpers";
import { showListData } from "../../../utils/helper/UIHelper";
import { TAGGING_COLORS } from "../constants";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
// @ts-ignore
import emptyImg from "../../../images/common/empty.png";
import { DroppableData } from "../interface";
import { PositionContext } from "../Assets";
import classNames from "classnames";

// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_ts/01-dustbin/multiple-targets?from-embed=&file=/src/Container.tsx:2079-2094
export const DraggableAsset: FC<any> = memo(function DraggableAsset({
  type,
  el,
  setPreviewData,
  setImgPreview,
  selectedAssets,
  onClickAsset,
  fullFeature,
}) {
  const setPosData = useContext(PositionContext)?.setPosData;
  const item: DroppableData = {
    id: el.id,
    name: el.name,
    selectedAssets: selectedAssets,
  };
  const isActived = selectedAssets?.some((asset) => asset.id === el.id);
  let canDrag = isActived && selectedAssets.length > 0;

  const [{ opacity, mousePosition }, drag, preview] = useDrag(
    () => ({
      type,
      item,
      collect: (monitor) => ({
        opacity: monitor.isDragging() && selectedAssets?.length === 1 ? 0.4 : 1,
        mousePosition: monitor.getClientOffset(),
      }),
      canDrag,
    }),
    [el.id, type, selectedAssets]
  );

  useEffect(() => {
    setPosData && setPosData(mousePosition);
  }, [mousePosition]);

  const { lastModifiedBy, lastModifiedDate, marks } = el;
  const tooltip = lastModifiedBy
    ? "This creative was updated by " + lastModifiedBy
    : "";
  const time = (
    <span className="line-clamp-2 text-xs2">
      {getBeforeTime(lastModifiedDate, false, "DD/MM/YYYY hh:mm A")}
    </span>
  );
  const tagEl = (
    <div className="flex justify-center">
      {marks.length > 0 &&
        marks.map((tag, idx) => {
          const totalColor = TAGGING_COLORS.length;
          const colorIdx = idx < totalColor - 1 ? idx : idx % totalColor;
          return (
            <Tag
              color={TAGGING_COLORS[colorIdx]}
              key={tag}
              title={tag}
              className="truncate"
            >
              {tag}
            </Tag>
          );
        })}
    </div>
  );
  let dimension = "";
  if (el.width && el.height) {
    dimension = el.width + " x " + el.height;
  }

  return (
    <>
      <DragPreviewImage connect={preview} src={emptyImg} />
      <div
        ref={drag}
        style={{ opacity }}
        className={classNames(
          "flex items-center flex-1 truncate ml-3",
          canDrag && "cursor-grab"
        )}
        onClick={(e) => onClickAsset(e, el)}
      >
        <div className="flex justify-between items-center flex-1 truncate">
          <div className="mr-2 truncate">
            {NameColumn(el, setPreviewData, setImgPreview)}
          </div>
          <div className="shrink-0 hidden md:flex text-center">
            <div className="w-24">{dimension}</div>
            <div
              className={classNames(
                "text-xs2 lg:text-sm",
                fullFeature ? "w-20 2xl:w-28" : "w-12 2xl:w-24 truncate"
              )}
              title={capitalizeWord(el.type)}
            >
              {capitalizeWord(el.type)}
            </div>
            <div className="w-28 2xl:w-44">
              {marks.length > 2 ? (
                <>{showListData(marks, "tag", 1, "top", TAGGING_COLORS)}</>
              ) : (
                <>{tagEl}</>
              )}
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-neutral-500 text-xs2 lg:text-sm shrink-0 w-[140px] text-center">
          {tooltip ? (
            <Tooltip
              title={tooltip}
              color="white"
              overlayClassName="tooltip-light"
            >
              {time}
            </Tooltip>
          ) : (
            <>{time}</>
          )}
        </div>
      </div>
    </>
  );
});
