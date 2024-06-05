import React from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import Tooltip from "antd/lib/tooltip";
import Popover from "antd/lib/popover";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { BiLinkExternal } from "@react-icons/all-files/bi/BiLinkExternal";
import {
  BATCH_UPDATE_STATUS,
  BID_RETENSION_TYPE,
  BID_RETENTION_GOAL_TYPE,
  BID_ROAS_TYPE,
  EDITABLE_STATUS,
  EDITABLE_STAT_IDS,
  NOT_A_NUMBER,
  USD,
} from "../../../constants/constants";
import { capitalizeWord, checkNumberValue } from "../../../utils/Helpers";
import { createSearchParams, useNavigate } from "react-router-dom";
import { CampaignTabs } from "../../../pages/App/CampaignCenter/CampaignCenter";
import moment from "moment";
import { numberWithCommas } from "../../../utils/Utils";
import classNames from "classnames";
import SyncOutlined from "@ant-design/icons/lib/icons/SyncOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/lib/icons/ExclamationCircleOutlined";
import Button from "antd/lib/button/button";
import { SITE_ID_LABEL } from "../../../pages/App/CampaignCenter/CampaignIntel/ReportTable";
import { SpecifyBidCell } from "./Helper";
import { getDataObj } from "../../../pages/App/CampaignCenter/CampaignIntel/Helper";
import Progress from "antd/lib/progress";

export const historyColumns = (currency = "$") => [
  {
    title: "Value",
    render: (record) => (
      <div>
        {currency}
        {record.value}
      </div>
    ),
  },
  { title: "Email", dataIndex: "email" },
  { title: "Date", dataIndex: "date" },
];

export const getBidData = (record) => {
  let currentData;
  let editableStatus;
  let status;
  let bidType;
  let data;

  // Campaign level
  if (record.campaignId || record.campaign?.id) {
    currentData = record.campaign.defaultBid?.bid;
    status = record.campaign.defaultBid?.status;
    bidType = record.campaign.defaultBid?.type;
    data = record.campaign.defaultBid || {};
    editableStatus = record.network?.defaultBidAccess;
  }
  // AdGroup level
  if (record.adGroup?.id) {
    currentData = record.adGroup.bid?.bid;
    status = record.adGroup.bid?.status;
    data = record.adGroup.bid || {};
    bidType = record.adGroup.bid?.type; // Titok có thể có RETENTION_GOAL
    editableStatus = record.network?.adGroupBidAccess;
  }
  // Keyword level
  // Level Keyword và SiteId hiện tại (22/5/2023) chưa có type (bidType) đặc biệt
  if (record.keyword?.text) {
    currentData = record.keyword.bid?.bid;
    status = record.keyword.bid?.status;
    data = record.keyword.bid || {};
    editableStatus = EDITABLE_STATUS.readWrite;
  }
  // Country level
  if (record.location) {
    currentData = record.bid?.bid;
    status = record.bid?.status;
    editableStatus = record.network?.countryBidAccess;
    bidType = record.bid?.type;
    data = record.bid || {};
  }
  // Site_id level
  if (record.siteId) {
    currentData = record.bid?.bid;
    status = record.bid?.status;
    data = record.bid || {};
    editableStatus = EDITABLE_STATUS.readWrite;

    if (record.siteId === SITE_ID_LABEL) {
      editableStatus = EDITABLE_STATUS.readOnly;
    }
  }

  return { currentData, editableStatus, status, bidType, data };
};

export const getBudgetData = (record) => {
  let currentData;
  let editableStatus;
  let status;
  let data;

  if (record.campaignId || record.campaign?.id) {
    currentData = record.campaign.defaultBudget?.dailyBudget;
    status = record.campaign.defaultBudget?.status;
    data = record.campaign.defaultBudget || {};
    editableStatus = record.network?.defaultBudgetAccess;
  }
  if (record.adGroup?.id) {
    currentData = record.adGroup.budget?.dailyBudget;
    status = record.adGroup.budget?.status;
    data = record.adGroup.budget || {};
    editableStatus = record.network?.adGroupBudgetAccess;
  }
  if (record.keyword?.text) {
    currentData = record.keyword.budget?.dailyBudget;
    status = record.keyword.budget?.status;
    data = record.keyword.budget || {};
    editableStatus = EDITABLE_STATUS.none; // Level Keyword không có budget
  }
  if (record.location) {
    currentData = record.budget?.dailyBudget;
    status = record.budget?.status;
    data = record.budget || {};
    editableStatus = record.network?.countryBudgetAccess;
  }

  return { currentData, editableStatus, status, data };
};

export const getDataByKey = (newListData, rowKey) => {
  const listLvlId = String(rowKey)?.split(",");
  let activedDataObj;

  try {
    for (let i = 0; i < listLvlId.length; i++) {
      if (!i) {
        activedDataObj = newListData[listLvlId[i]];
      } else {
        activedDataObj = activedDataObj.children[listLvlId[i]];
      }
    }
  } catch (error) {
    console.log("error", error);
  }
  return activedDataObj || {};
};

export const getCrrData = (record, fieldName) => {
  if (fieldName === EDITABLE_STAT_IDS.bid) {
    return getBidData(record)?.currentData;
  }
  return getBudgetData(record)?.currentData;
};

export const getAndSetRecordData = ({
  recordData,
  value,
  fieldName = "bid",
  isSetData = false,
  isPushHistory = true,
  historyField = "bidHistory",
  emailName = "",
  name = "",
  status = "",
}) => {
  const newValue = Number(value);
  let propData;

  switch (fieldName) {
    case "bid":
      // Campaign level
      if (Object.keys(recordData.campaign || {})?.length) {
        if (Number(recordData.campaign.defaultBid?.bid) !== newValue) {
          propData = { ...recordData.campaign.defaultBid, bid: newValue };
        }
        if (isSetData) {
          recordData.campaign.defaultBid.bid = newValue;
          if (status) {
            recordData.campaign.defaultBid.status = status;
          }
        }
      }
      // Location level
      if (recordData.location || Object.keys(recordData.bid || {})?.length) {
        if (Number(recordData.bid?.bid) !== newValue) {
          propData = { ...recordData.bid, bid: newValue };
        }
        if (isSetData) {
          recordData.bid.bid = newValue;
          if (status) {
            recordData.bid.status = status;
          }
        }
      }
      // AdGroup level
      if (Object.keys(recordData.adGroup || {})?.length) {
        if (Number(recordData.adGroup.bid?.bid) !== newValue) {
          propData = { ...recordData.adGroup.bid, bid: newValue };
        }
        if (isSetData) {
          recordData.adGroup.bid.bid = newValue;
          if (status) {
            recordData.adGroup.bid.status = status;
          }
        }
      }
      // Keyword level
      if (Object.keys(recordData.keyword || {})?.length) {
        if (Number(recordData.keyword.bid?.bid) !== newValue) {
          propData = { ...recordData.keyword.bid, bid: newValue };
        }
        if (isSetData) {
          recordData.keyword.bid.bid = newValue;
          if (status) {
            recordData.keyword.bid.status = status;
          }
        }
      }
      break;
    case "budget":
      if (Object.keys(recordData.campaign || {})?.length) {
        if (
          Number(recordData.campaign.defaultBudget?.dailyBudget) !== newValue
        ) {
          propData = {
            ...recordData.campaign.defaultBudget,
            dailyBudget: newValue,
          };
        }
        if (isSetData) {
          recordData.campaign.defaultBudget.dailyBudget = newValue;
          if (status) {
            recordData.campaign.defaultBudget.status = status;
          }
        }
      }
      if (recordData.location || Object.keys(recordData.budget || {})?.length) {
        if (Number(recordData.budget?.dailyBudget) !== newValue) {
          propData = { ...recordData.budget, dailyBudget: newValue };
        }
        if (isSetData) {
          recordData.budget.dailyBudget = newValue;
          if (status) {
            recordData.budget.status = status;
          }
        }
      }
      if (Object.keys(recordData.adGroup || {})?.length) {
        if (Number(recordData.adGroup.budget?.dailyBudget) !== newValue) {
          propData = { ...recordData.adGroup.budget, dailyBudget: newValue };
        }
        if (isSetData) {
          recordData.adGroup.budget.dailyBudget = newValue;
          if (status) {
            recordData.adGroup.budget.status = status;
          }
        }
      }
      // Keyword level has EditStatus = "None"
      break;
    default:
      if (recordData[fieldName] !== newValue) {
        propData = recordData;
      }
      if (isSetData) {
        recordData[fieldName] = newValue;
        if (status) {
          recordData.status = status;
        }
      }
      break;
  }

  if (
    isSetData &&
    isPushHistory &&
    status !== BATCH_UPDATE_STATUS.updating &&
    status !== BATCH_UPDATE_STATUS.updateFailure
  ) {
    let newHistoryData = recordData[historyField] || [];
    newHistoryData.push({
      id: recordData[historyField]?.length || 0,
      name,
      email: emailName,
      date: moment().format("YYYY-MM-DD hh:mm A"),
      value: newValue,
    });
    recordData[historyField] = newHistoryData;
  }

  return propData;
};

export const getRecordCurrency = (record) => {
  const recordCurrency = record?.campaign?.currency || "";
  let currencyStr = "$";

  if (recordCurrency && recordCurrency.toUpperCase() !== USD) {
    currencyStr = recordCurrency + " ";
  }

  return currencyStr;
};

export const getCurrency = (record) => {
  const recordCurrency = record?.campaign?.currency || USD;
  return recordCurrency.toUpperCase();
};

function EditNumberCell(props) {
  const {
    record,
    fieldName,
    NATooltip,
    historyField,
    onClickHistoryLink,
    getRowKey,
    onEditCell,
    onConfirmUpdateFailure,
    onEditSpecifyBid,
    currenciesConfigs,
  } = props;
  const navigate = useNavigate();

  let currentData = record[fieldName];
  const currencyStr = getRecordCurrency(record);

  const onGetRowKey = (rowData) => {
    return getRowKey ? String(getRowKey(rowData)) : rowData.id;
  };

  let editableStatus;
  let fieldStatus;
  let bidType;
  let bidData;

  switch (fieldName) {
    case "bid":
      const bidDataObj = getBidData(record);
      currentData = bidDataObj.currentData;
      fieldStatus = bidDataObj.status;
      editableStatus = bidDataObj.editableStatus;
      bidType = bidDataObj.bidType;
      bidData = bidDataObj.data;
      break;
    case "budget":
      const budgetDataObj = getBudgetData(record);
      currentData = budgetDataObj.currentData;
      editableStatus = budgetDataObj.editableStatus;
      fieldStatus = budgetDataObj.status;
      break;

    default:
      break;
  }
  const isRoasBid = bidType === BID_ROAS_TYPE;
  const isRetentionBid = bidType === BID_RETENSION_TYPE;
  const isRetentionGoalBid = bidType === BID_RETENTION_GOAL_TYPE;
  const handleClickSpecifyBid = () =>
    onEditSpecifyBid && onEditSpecifyBid(bidData, record);

  if (isRoasBid) {
    return (
      <SpecifyBidCell
        bidData={bidData}
        type="Roas"
        field1="goal"
        field2="maxBid"
        fieldName2="Max bid"
        onClick={handleClickSpecifyBid}
      />
    );
  }
  if (isRetentionBid) {
    return (
      <SpecifyBidCell
        bidData={bidData}
        type="Retention"
        field1="baseBid"
        fieldName1="Base bid"
        field2="maxBid"
        fieldName2="Max bid"
        onClick={handleClickSpecifyBid}
      />
    );
  }
  if (isRetentionGoalBid) {
    return (
      <SpecifyBidCell
        bidData={bidData}
        type="Retention Goal"
        field1="goal"
        field2="bid"
        onClick={handleClickSpecifyBid}
      />
    );
  }

  const handleConfirmFailedData = () => {
    const data = getDataObj(record, fieldName)?.data;
    onConfirmUpdateFailure(data, fieldName);
  };

  const onClickHistoryTitle = () => {
    if (onClickHistoryLink) {
      return onClickHistoryLink();
    }

    navigate({
      search: createSearchParams({
        tab: CampaignTabs[2]?.tabUrl, // Bid History page
      }).toString(),
    });
  };

  const isUpdating = fieldStatus === BATCH_UPDATE_STATUS.updating;
  const isUpdateFailure = fieldStatus === BATCH_UPDATE_STATUS.updateFailure;

  const isEditable = editableStatus === EDITABLE_STATUS.readWrite;
  let cellEl;
  if (!currentData && currentData !== 0) {
    cellEl = "";
  } else {
    let check = false;
    if (typeof currentData === "string") {
      check = currentData
        .split("")
        .some((char) => !"0123456789.".includes(char));
    }
    cellEl = check ? currentData : currencyStr + numberWithCommas(currentData);
  }

  const recordCurrency = getCurrency(record);
  let exchangeResults;
  if (recordCurrency !== USD) {
    const activedCurrency = currenciesConfigs.find(
      (el) => el.currency === recordCurrency
    );
    const rate = activedCurrency?.rate || 1;
    const totalUSD = Math.round((currentData * 1000) / rate) / 1000;

    exchangeResults = "$" + numberWithCommas(totalUSD);
  }

  // Show icon for Networks and campaigns level
  let isShowIconUpdate;
  let isShowIconWraning;

  const listFlag = record[`${fieldName}Flag`];
  if (listFlag && listFlag.length > 0) {
    isShowIconUpdate = listFlag.includes(BATCH_UPDATE_STATUS.updating);
    isShowIconWraning = listFlag.includes(BATCH_UPDATE_STATUS.updateFailure);
  }

  const listIconEl = (
    <>
      {(isUpdating || isShowIconUpdate) && (
        <SyncOutlined
          spin
          className={isUpdating ? "!text-antPrimary" : "!text-orange-400"}
        />
      )}
      {isShowIconWraning && !isUpdateFailure && (
        <ExclamationCircleOutlined className="!text-orange-400" />
      )}
      {isUpdateFailure && onConfirmUpdateFailure && (
        <Popover
          title={
            <div className="text-center">Batch edit {fieldName} failed</div>
          }
          content={
            <div className="flex justify-center">
              <Button
                size="small"
                className="custom-btn-outline-primary"
                onClick={handleConfirmFailedData}
              >
                Confirm
              </Button>
            </div>
          }
        >
          <ExclamationCircleOutlined className="!text-antDanger" />
        </Popover>
      )}
    </>
  );

  if (editableStatus === EDITABLE_STATUS.none) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span>{NOT_A_NUMBER}</span>
          {NATooltip && (
            <Tooltip title={NATooltip}>
              <AiOutlineQuestionCircle size={20} className="ml-1 pb-0.5" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center space-x-1.5">{listIconEl}</div>
      </div>
    );
  }

  return (
    <div className="truncate">
      <div className="flex items-center justify-between truncate">
        <div className="flex items-center truncate">
          <div className={classNames("pt-0.5", cellEl && "truncate")}>
            <div title={cellEl} className="truncate">
              {cellEl}
            </div>
            {exchangeResults && (
              <div className="text-xs2">{exchangeResults}</div>
            )}
          </div>

          {isEditable && !(cellEl === "" && fieldName === "budget") && (
            <Tooltip title={`Edit ${capitalizeWord(fieldName)}`}>
              <AiOutlineEdit
                size={16}
                className={classNames(
                  "ml-2 shrink-0",
                  isUpdating 
                    ? "text-antPrimary/30 hover:text-antPrimary/30 cursor-not-allowed"
                    : "text-antPrimary/80 hover:text-antPrimary cursor-pointer"
                )}
                onClick={() =>
                  !isUpdating &&
                  onEditCell(record, fieldName, currentData || 0)
                }
              />
            </Tooltip>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {historyField && record[historyField]?.length > 0 && (
            <Popover
              content={
                <HistoryTable
                  data={record[historyField]}
                  columns={historyColumns(currencyStr)}
                />
              }
              title={
                <div
                  className="flex items-center cursor-pointer"
                  onClick={onClickHistoryTitle}
                >
                  <span>{capitalizeWord(fieldName)} history</span>
                  <BiLinkExternal size={14} className="text-antPrimary ml-1" />
                </div>
              }
            >
              <AiOutlineHistory size={16} className="text-orange-400" />
            </Popover>
          )}
          {listIconEl}
        </div>
      </div>

      {fieldName === EDITABLE_STAT_IDS.budget &&
        checkNumberValue(record.budgetSpendRatio) && (
          <div className="-mt-2 pr-5">
            <Progress size="small" percent={record.budgetSpendRatio} />
          </div>
        )}
    </div>
  );
}

EditNumberCell.defaultProps = {};

EditNumberCell.propTypes = {
  record: PropTypes.any,
  NATooltip: PropTypes.string,
  fieldName: PropTypes.string,
  currenciesConfigs: PropTypes.array,
  historyField: PropTypes.string,
  onClickHistoryLink: PropTypes.func,
  getRowKey: PropTypes.func,
  onEditCell: PropTypes.func,
  onConfirmUpdateFailure: PropTypes.func,
  onEditSpecifyBid: PropTypes.func,
};

export default EditNumberCell;

const HistoryTable = ({ data, columns }) => {
  return (
    <Table
      size="small"
      className="px-2 mb-3"
      columns={columns}
      dataSource={[...data]}
      pagination={false}
      rowKey={(record) => record.id}
    />
  );
};
