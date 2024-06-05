import classNames from "classnames";
import React, { memo, FC } from "react";
import { useDrop } from "react-dnd";

export const DroppableArea: FC<any> = memo(function DroppableArea({
  accept,
  onDrop,
  name,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={classNames(
        "inline-block w-[calc(100%-24px)]",
        isActive && "bg-sky-50 custom-tree-bg"
      )}
    >
      {name}
    </div>
  );
});
