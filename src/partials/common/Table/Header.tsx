import React from "react";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import Tooltip from "antd/lib/tooltip";

export const getTableTitleWithTooltip = (
  title,
  tooltip = "",
  classNames = ""
) => {
  const content = (
    <div className={`flex items-center ${classNames}`}>
      {title}
      <AiOutlineQuestionCircle size={20} className="ml-1 pb-0.5" />
    </div>
  );

  if (!tooltip) return content;
  return <Tooltip title={tooltip}>{content}</Tooltip>;
};

export const getTitleWith2Lines = (
  line1,
  line2,
  icon = false,
  classNames = ""
) => {
  return (
    <div className={`flex items-center ${classNames}`}>
      <div>
        <div className="italic font-semibold text-[0.84rem] text-gray-700/90">
          {line1}
        </div>
        <div className="flex items-center">{line2}</div>
      </div>
      {icon && <AiOutlineQuestionCircle size={20} className="ml-1 pb-0.5" />}
    </div>
  );
};
