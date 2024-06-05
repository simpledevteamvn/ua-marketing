import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import Dropdown from "antd/lib/dropdown";
import classNames from "classnames";
import React, { memo, FC } from "react";
import { useDrop } from "react-dnd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { reorder } from "../../../utils/Helpers";

export const CALC_TYPES = {
  sum: "sum",
  max: "max",
  min: "min",
  count: "count",
  average: "average",
};

export const DroppableArea: FC<any> = memo(function DroppableArea({
  accept,
  listData,
  onDrop,
  onRemoveFilter,
  minHeight,
  isValues = false,
  onChangeFunc,
  handleDragEnd,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // item does not change position
    if (result.source.index === result.destination.index) return;

    const orderedData = reorder(
      listData,
      result.source.index,
      result.destination.index
    );

    handleDragEnd(orderedData);
  };

  const onClickMenu = ({ key }, idx) => {
    onChangeFunc(key, idx);
  };

  const isActive = isOver && canDrop;
  const items = Object.keys(CALC_TYPES).map((el) => {
    return { label: el.toUpperCase(), key: el };
  });

  return (
    <div
      ref={drop}
      style={{ minHeight }}
      className={classNames(
        "px-3 py-4 rounded-b border border-slate-200 border-t-0 grow",
        canDrop ? "bg-sky-50" : ""
      )}
    >
      {!listData?.length && (
        <>
          {isActive ? "Release to drop" : "Drag the fields on the left here."}
        </>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="PivotConfigDroppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {listData?.length > 0 && (
                <div className="grid grid-cols-1">
                  {listData.map((fieldData, idx) => (
                    <Draggable
                      key={idx}
                      draggableId={fieldData.name || String(idx)}
                      index={idx}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex justify-between items-center bg-slate-100 border-t border-slate-100 rounded shadow-[0_1px_1px_0_rgba(0,0,0,0.1)] pl-2.5 pr-2 py-1 my-1"
                        >
                          <div className="flex items-center truncate">
                            <div className="truncate cursor-grab">
                              {isValues ? fieldData.name : fieldData}
                            </div>

                            {isValues && (
                              <Dropdown
                                menu={{
                                  items,
                                  onClick: (data) => onClickMenu(data, idx),
                                }}
                                trigger={["click"]}
                              >
                                <div className="ml-2 lg:ml-2.5 uppercase text-xs text-indigo-500 cursor-pointer">
                                  {fieldData.function}
                                </div>
                              </Dropdown>
                            )}
                          </div>

                          <CloseOutlined
                            className="text-xs2 cursor-pointer ml-0.5"
                            onClick={() => onRemoveFilter(idx, fieldData)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});
