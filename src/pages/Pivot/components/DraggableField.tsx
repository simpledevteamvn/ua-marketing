import React, { memo, FC } from "react";

import { useDrag } from "react-dnd";

// https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_ts/01-dustbin/multiple-targets?from-embed=&file=/src/Container.tsx:2079-2094
export const DraggableField: FC<any> = memo(function DraggableField({
  name,
  type,
}) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type,
      item: { name },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [name, type]
  );

  return (
    <div ref={drag} style={{ opacity }} className="flex items-center">
      {name}
    </div>
  );
});
