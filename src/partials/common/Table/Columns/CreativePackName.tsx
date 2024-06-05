import React from "react";
import Tooltip from "antd/lib/tooltip";
import { getTotalChildrenStr } from "../../../../utils/Helpers";
import classNames from "classnames";

export const getCreativePackName = (rd, onClickName: any = null) => {
  let totalChildren = getTotalChildrenStr(rd, "creatives");
  if (!rd.creatives?.length && rd.assets?.length) {
    totalChildren = getTotalChildrenStr(rd, "assets");
  }

  const name = rd.name + totalChildren;
  const hasCreative = rd.creatives?.length || rd.assets?.length;

  return (
    <Tooltip title={name}>
      <div
        className={classNames(
          "truncate",
          hasCreative &&
            "cursor-pointer text-antPrimary hover:text-antPrimary/90"
        )}
        onClick={() => onClickName && onClickName(rd)}
        title={hasCreative && onClickName ? "Click to view list creatives" : ""}
      >
        {name}
      </div>
    </Tooltip>
  );
};
