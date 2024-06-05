import React, { useEffect, useState } from "react";
// @ts-ignore
// import logo from "../../images/logo/logo.svg";
// @ts-ignore
import bg from "../../images/bg.svg";
import CheckOutlined from "@ant-design/icons/lib/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import classNames from "classnames";
import Modal from "antd/lib/modal";
import Popover from "antd/lib/popover";
import {
  checkMaximumPercentage,
  checkNumberValue,
  getCurrency,
  roundNumber,
  sortNumberWithNullable,
} from "../Helpers";
import {
  BID_RETENSION_TYPE,
  BID_RETENTION_GOAL_TYPE,
  BID_ROAS_TYPE,
  MAXIMUM_INC_PERCENTAGE,
} from "../../constants/constants";
import { numberWithCommas } from "../Utils";
import searchMaxMinValue from "../../partials/common/Table/SearchMaxMinValue";
import Tag from "antd/lib/tag";
import Badge from "antd/lib/badge";
// @ts-ignore
// import turnOffAdblock from "../../videos/turnOffAdblock.mp4";

export const RequiredMark = <span className="text-red-500">*</span>;

export const Logo = () => {
  return <></>;
};

export const PageBg = () => {
  return (
    <div className="hidden md:flex basis-5/12 shadow-custom3 page-bg">
      <img
        src={bg}
        alt=" "
        className="w-full h-full max-h-[500px] bg-contain m-auto"
      />
    </div>
  );
};

export const getTotalSelected = (selectedRecords) => (
  <div className="font-semibold text-sm2">
    Total selected:{" "}
    <Badge
      count={selectedRecords?.length}
      showZero
      color="#71717a"
      overflowCount={Infinity}
    />
  </div>
);

export const FromCol = (currenciesConfigs, onFilterTable: any = undefined) => {
  const colObj = {
    title: "From",
    render: (record) => {
      const { previousValue, type, currency } = record;
      if (!checkNumberValue(previousValue)) return previousValue;
      if (
        [BID_ROAS_TYPE, BID_RETENSION_TYPE, BID_RETENTION_GOAL_TYPE].includes(
          type
        )
      ) {
        return previousValue;
      }

      return getUsdValue(previousValue, currenciesConfigs, currency);
    },
  };

  if (!onFilterTable) return colObj;

  return {
    ...colObj,
    sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.previousValue),
    ...searchMaxMinValue({
      dataIndex: "from",
      placeholderSuffix: " ",
      getField: (r) => r.previousValue,
      onFilterTable,
    }),
  };
};

export const ToCol = (
  currenciesConfigs,
  getField: any = undefined,
  onFilterTable: any = undefined,
) => {
  const colObj = {
    title: "To",
    render: (record) => {
      const { value, type, currency } = record;
      const dataValue = getField ? getField(record) : value;

      if (!checkNumberValue(dataValue)) return dataValue;
      if (
        [BID_ROAS_TYPE, BID_RETENSION_TYPE, BID_RETENTION_GOAL_TYPE].includes(
          type
        )
      ) {
        return dataValue;
      }

      return getUsdValue(dataValue, currenciesConfigs, currency);
    },
  };

  if (!onFilterTable) return colObj;

  const getData = (el) => (getField ? getField(el) : el.value);
  return {
    ...colObj,
    sorter: (a, b) => sortNumberWithNullable(a, b, getData),
    ...searchMaxMinValue({
      dataIndex: "to",
      placeholderSuffix: " ",
      getField: getData,
      onFilterTable,
    }),
  };
};

const getUsdValue = (value, currenciesConfigs, currency) => {
  const crc = getCurrency(currency);
  let exchangeResults;

  if (crc !== "$") {
    const activedCrc = currenciesConfigs.find((el) => el.currency === currency);
    if (activedCrc) {
      const totalUSD = Math.round((value * 1000) / activedCrc.rate) / 1000;
      exchangeResults = "$" + numberWithCommas(totalUSD);
    }
  }

  return (
    <>
      <div>{crc + numberWithCommas(value)}</div>
      {exchangeResults && <div className="text-xs2">{exchangeResults}</div>}
    </>
  );
};

export const showListData = (
  listData,
  fieldName = "data",
  maxDataForDisplay = 1,
  placement: any = "bottom",
  tagColors: any = [],
  classNames = "",
  limitData = Infinity
) => {
  const totalData = listData?.length;
  if (!totalData) return;
  if (totalData <= maxDataForDisplay) {
    return <div className="line-clamp-6">{listData.join(", ")}</div>;
  }

  const getName = (totalEl) => {
    const variantName = totalEl === 1 ? fieldName : fieldName + "s";
    return fieldName === "data" ? "data" : variantName;
  };

  let items: any = [];
  if (totalData > limitData) {
    const newList = listData.slice(0, limitData);
    const totalRemain = totalData - limitData;

    items = newList.map((el) => {
      return { label: el, key: el };
    });
    items.push({
      label: "+" + totalRemain + " " + getName(totalRemain),
      key: "remainedData",
    });
  } else {
    items = listData.map((el) => {
      return { label: el, key: el };
    });
  }

  const content = (
    <div className="flex flex-col space-y-1 popover-custom-zIndex">
      {items.map((el, idx) => {
        if (!tagColors?.length) {
          return <div key={idx}>{el.label}</div>;
        }

        const totalColor = tagColors.length;
        const colorIdx = idx < totalColor - 1 ? idx : idx % totalColor;
        return (
          <div key={idx} className="">
            <Tag color={tagColors[colorIdx]} className="text-center !m-0">
              {el.label}
            </Tag>
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={content}
      title=""
      placement={placement}
      className={classNames}
    >
      {totalData} {getName(totalData)} included
    </Popover>
  );
};

export const confirmValue = (onOk) => {
  Modal.confirm({
    title: "Confirm value",
    content: `You have changed more than ${MAXIMUM_INC_PERCENTAGE}% of the previous value.`,
    okText: "Confirm",
    onOk,
  });
};

export const confirmValueWithPercentageChanged = (percentage, onOk) => {
  Modal.confirm({
    title: "Confirm value",
    content: `You have changed more than ${percentage}% of the previous value.`,
    okText: "Confirm",
    onOk,
  });
};

export const confirmValueWithChanged = (oldValue, targetValue, onOk) => {
  let changedPer;

  if (oldValue === 0) return;
  if (oldValue && targetValue) {
    const per = Math.abs(1 - targetValue / oldValue) * 100;
    changedPer = roundNumber(per, false, 1);
  }

  Modal.confirm({
    title: "Confirm value",
    content: (
      <>
        The new value is {targetValue}
        <span>{changedPer && ` (${changedPer}% changed)`}</span>. Confirm this
        change?
      </>
    ),
    okText: "Confirm",
    onOk,
  });
};

export const checkPasswordStr: (x: string, y?: boolean) => any = (
  password,
  getBool = true
) => {
  // https://stackoverflow.com/questions/1559751/regex-to-make-sure-that-the-string-contains-at-least-one-lower-case-char-upper
  const bool1 = password.length >= 8 && password.length <= 20;
  const bool2 = /\d/g.test(password);
  const bool3 = /.*[A-Z].*/g.test(password);
  const bool4 = /.*\W.*/g.test(password);

  if (getBool) {
    return bool1 && bool2 && bool3 && bool4;
  }

  return [bool1, bool2, bool3, bool4];
};

export const CheckPassword = ({
  password,
  acceptEmpty = true,
  className = "",
}) => {
  const checkedList = [
    { label: "Use 8 to 20 characters." },
    { label: "At least one number." },
    { label: "At least one uppercase letter." },
    { label: "At least one symbol." },
  ];
  const [passedList, setPassedList] = useState<any>(
    Array(checkedList.length).fill(false)
  );
  const [isPassAll, setIsPassAll] = useState(false);

  useEffect(() => {
    if (typeof password !== "string") return;

    const newCheckedList = checkPasswordStr(password, false);
    const isSetPass = !newCheckedList.some((isPass) => !isPass);

    if (isSetPass) {
      setTimeout(() => {
        setIsPassAll(true);
      }, 1500);
    } else {
      isPassAll && setIsPassAll(false);
    }
    setPassedList(newCheckedList);
  }, [password]);

  if (acceptEmpty && (!password || isPassAll)) return <></>;

  return (
    <ul className={`text-sm m-0 ${className}`}>
      {checkedList.map((el, idx) => (
        <li
          key={idx}
          className={classNames(
            "flex items-center",
            passedList[idx] ? "text-green-500" : "text-red-400"
          )}
        >
          {passedList[idx] ? (
            <CheckOutlined className="mr-1" />
          ) : (
            <CloseOutlined className="mr-1" />
          )}
          {el.label}
        </li>
      ))}
    </ul>
  );
};

const showWarning = () => {
  Modal.warning({
    title: "Adblock Detected!",
    // width: 600,
    centered: true,
    content: (
      <div>
        <div>It looks like you're using an adblocker.</div>
        <div>Please support our site by whitelisting us.</div>

        {/* <video
          className="w-full mt-3"
          src={turnOffAdblock}
          autoPlay
          playsInline
          loop
        /> */}
      </div>
    ),
  });
};

export const detectAdBlock = async () => {
  if (!window.navigator.onLine) return;
  // https://stackoverflow.com/questions/4869154/how-to-detect-adblock-on-my-website
  // https://code-boxx.com/detect-adblockers-javascript/

  const getAds = new Request(
    // "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "https://cdn-lb.vungle.com/zen/a40bed6fef7a6caa4e8e3fdfaad01443.mp4-250x300-h264-Q2.mp4",
    // "https://static.ads-twitter.com/uwt.js",
    { method: "HEAD", mode: "no-cors" }
  );

  return await fetch(getAds)
    .then((res) => {
      return false;
    })
    .catch((err) => {
      showWarning();
      return true;
    });
};

export const checkAdsBlock = () => {
  // The element with the id "detectAds" is in the file "index.html".
  if (document.getElementById("detectAds")?.clientHeight === 0) {
    showWarning();
  }
};
