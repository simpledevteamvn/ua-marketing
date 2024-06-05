import React from "react";
import { Resizable } from "react-resizable";

export const ResizableTitle = (props) => {
  const {
    minConstraints,
    maxConstraints,
    onResize,
    width,
    transformScale,
    ...restProps
  } = props;

  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={0}
      axis="x"
      minConstraints={minConstraints}
      maxConstraints={maxConstraints}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      // https://github.com/react-grid-layout/react-resizable/blob/master/examples/ExampleLayout.js
      transformScale={transformScale || 1.5}
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

const handleResize =
  (index, columns, setColumns) =>
  (_, { size }) => {
    const newColumns = [...columns];
    newColumns[index] = {
      ...newColumns[index],
      width: size.width,
    };
    setColumns(newColumns);
  };

export const getResizableColumns = (columns, setColumns) => {
  return columns.map((col, index) => ({
    ...col,
    onHeaderCell: (column) => {
      return {
        width: column.width,
        onResize: handleResize(index, columns, setColumns),
        minConstraints: [column.minWidth || 60, 0],
        maxConstraints: [column.maxWidth || 400, 0],
        transformScale: column.transformScale,
      };
    },
  }));
};
