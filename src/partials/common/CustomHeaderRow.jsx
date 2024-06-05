import React from "react";
import classNames from "classnames";
import { AiFillFilter } from "@react-icons/all-files/ai/AiFillFilter";
import { AiOutlineCaretDown } from "@react-icons/all-files/ai/AiOutlineCaretDown";
import { AiOutlineCaretUp } from "@react-icons/all-files/ai/AiOutlineCaretUp";

const CustomHeaderRow = (props) => {
  // console.log("props :>> ", props);

  return (
    <tr {...props}>
      {props.children.map((el, columnId) => {
        const columnProps = el.props;
        const { title, handleFilter, handleSort } = columnProps.column;
        const iconClass = "hover:text-gray-400/80 cursor-pointer";

        return (
          <th
            className={classNames(
              `${columnProps.prefixCls}-cell`,
              columnProps.className
            )}
            key={columnId}
          >
            <div className="flex justify-between items-center">
              <span>{title}</span>
              <div className="flex items-center text-gray-400/60">
                {handleSort && (
                  <div>
                    <AiOutlineCaretUp size={12} className={iconClass} />
                    <AiOutlineCaretDown size={12} className={iconClass} />
                  </div>
                )}
                {handleFilter && (
                  <AiFillFilter
                    size={16}
                    className={`${iconClass} mb-0.5 ml-1.5`}
                    onClick={() => handleFilter(columnProps.column, columnId)}
                  />
                )}
              </div>
            </div>
          </th>
        );
      })}
    </tr>
  );
};

export default CustomHeaderRow;
