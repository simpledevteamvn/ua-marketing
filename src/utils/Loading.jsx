import Spin from "antd/lib/spin";
import classNames from "classnames";
import React from "react";

function Loading(props) {
  const { isFixed = true, size = "large" } = props;

  return (
    <div
      className={classNames(
        "top-0 left-0 h-full w-full flex items-center justify-center",
        isFixed
          ? "fixed bg-slate-200/50 z-1190"
          : "absolute bg-slate-200/30 z-10"
      )}
    >
      <Spin size={size} />
    </div>
  );
}

export default Loading;
