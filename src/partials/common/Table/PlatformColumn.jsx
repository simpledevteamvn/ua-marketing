import React from "react";
import { AiFillAndroid } from "@react-icons/all-files/ai/AiFillAndroid";
import { AiFillApple } from "@react-icons/all-files/ai/AiFillApple";
import { PLATFORMS, PLATFORMS_FILTER } from "../../../constants/constants";
import {
  capitalizeWord,
  filterColumn,
  sortByString,
} from "../../../utils/Helpers";
import { filterIcon } from "./Helper";

const PlatformColumn = (isSortWithApi = false, title) => {
  return {
    title: title || "Type",
    filters: PLATFORMS_FILTER,
    filterIcon: filterIcon,
    onFilter: isSortWithApi
      ? () => true
      : (value, record) => filterColumn(value, record, "platform"),
    sorter: isSortWithApi ? () => {} : sortByString("platform"),
    render: (record) => {
      const isPlatformIOS = record.platform === PLATFORMS.ios;
      const isPlatformAndroid = record.platform === PLATFORMS.android;

      let platformName = capitalizeWord(record.platform);
      if (isPlatformIOS) {
        platformName = "iOS";
      }

      return (
        <div className="flex items-center">
          {isPlatformIOS && (
            <AiFillApple size="20" className="text-slate-300 mr-0.5 mb-0.5" />
          )}
          {isPlatformAndroid && (
            <AiFillAndroid size="20" className="text-green-700 mr-0.5 mb-0.5" />
          )}
          <div>{platformName}</div>
        </div>
      );
    },
  };
};

export default PlatformColumn;
