import classNames from "classnames";
import React from "react";
import {
  BID_RETENSION_TYPE,
  BID_RETENTION_GOAL_TYPE,
  BID_ROAS_TYPE,
  EDITABLE_STATUS,
  LIST_CAMPAIGN_STATUS,
  NOT_A_NUMBER,
} from "../../../constants/constants";
import {
  capitalizeWord,
  getValueWithCurrency,
  sortNumberWithNullable,
} from "../../../utils/Helpers";
import { SpecifyBidCell } from "../../../partials/common/Table/Helper";
import Dropdown from "antd/lib/dropdown";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import CopyOutlined from "@ant-design/icons/lib/icons/CopyOutlined";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import MoreOutlined from "@ant-design/icons/lib/icons/MoreOutlined";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import Popover from "antd/lib/popover";
import Table from "antd/lib/table";
import { historyColumns } from "../../../partials/common/Table/EditNumberCell";
import searchMaxMinValue from "../../../partials/common/Table/SearchMaxMinValue";
import { BsBoxArrowInRight } from "@react-icons/all-files/bs/BsBoxArrowInRight";
import { BsBoxArrowLeft } from "@react-icons/all-files/bs/BsBoxArrowLeft";

export const getStatus = (status) => {
  if (!status) return "";

  const statusName = capitalizeWord(status);
  if (status === LIST_CAMPAIGN_STATUS.running.value) {
    return <span className="text-green-500">{statusName}</span>;
  } else if (status === LIST_CAMPAIGN_STATUS.paused.value) {
    return <span className="text-stone-400">{statusName}</span>;
  } else return statusName;
};

export const Field = (props) => {
  const { name, value, border, classData = "" } = props;

  return (
    <div
      className={classNames(
        "flex items-center justify-end px-5 py-3",
        border && "border-b",
        classData
      )}
    >
      <div className="basis-1/3">{name}</div>
      <div className="basis-2/3 line-clamp-6 break-words">{value}</div>
    </div>
  );
};

export const getBidData = (record) => {
  let bidData = record.defaultBid || {};
  if (!Object.keys(record).includes("defaultBid")) {
    bidData = record;
  }

  return bidData;
};

export const BidColumn = (
  onFilterTable,
  currenciesConfigs = [],
  campaignData,
  alwayAccess = false,
  sorter: any = null
) => {
  const width = campaignData?.id ? undefined : 80;

  return {
    title: "Bid",
    width,
    render: (record) => {
      const bidData = getBidData(record);
      const { type, bid, history } = bidData;
      const isRoasBid = type === BID_ROAS_TYPE;
      const isRetentionBid = type === BID_RETENSION_TYPE;
      const isRetentionGoalBid = type === BID_RETENTION_GOAL_TYPE;

      let currency = record.currency;
      let bidAccess = record?.network?.defaultBidAccess;
      if (campaignData?.id) {
        currency = campaignData.currency;
        bidAccess = campaignData.network?.countryBidAccess;
      }
      const isNABid = !alwayAccess && bidAccess === EDITABLE_STATUS.none;
      const bidStr = getValueWithCurrency(bid, currency, currenciesConfigs);

      if (isNABid) {
        return NOT_A_NUMBER;
      }

      if (isRoasBid) {
        return (
          <SpecifyBidCell
            bidData={bidData}
            type="Roas"
            field1="goal"
            field2="maxBid"
            fieldName2="Max bid"
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
          />
        );
      }
      return (
        <div className="flex justify-between">
          <span>{bidStr}</span>
          {history?.length > 0 && (
            <Popover
              content={
                <Table
                  size="small"
                  className="px-2 mb-3"
                  columns={historyColumns()}
                  dataSource={history}
                  pagination={false}
                  rowKey={(record) => record.id}
                />
              }
              title="History"
            >
              <AiOutlineHistory size={16} className="text-orange-400" />
            </Popover>
          )}
        </div>
      );
    },
    ...searchMaxMinValue({
      dataIndex: "bid",
      placeholderSuffix: " ",
      onFilterTable,
    }),
    sorter: sorter
      ? sorter
      : (a, b) => sortNumberWithNullable(a, b, (el) => getBidData(el)?.bid),
  };
};

export const MORE_ACTION_KEY = {
  add: "Add",
  pause: "Pause",
  run: "Run",
};

export const ACTION_KEY = {
  add: "add",
  edit: "edit",
  delete: "delete",
};

export const listAction = [
  { key: ACTION_KEY.add, label: "Add countries", icon: <PlusOutlined /> },
  { key: ACTION_KEY.edit, label: "Batch edit", icon: <EditOutlined /> },
  { key: ACTION_KEY.delete, label: "Batch delete", icon: <DeleteOutlined /> },
];

export const CREATIVE_PACK_ACTION = {
  add: "add",
  assign: "assign",
  unassign: "unassign",
  clone: "clone",
};

export const creativePackAction = [
  {
    key: CREATIVE_PACK_ACTION.add,
    label: "Add a pack",
    icon: <PlusOutlined />,
  },
  {
    key: CREATIVE_PACK_ACTION.clone,
    label: "Clone pack",
    icon: <CopyOutlined />,
  },
  {
    key: CREATIVE_PACK_ACTION.assign,
    label: "Assign",
    icon: <BsBoxArrowInRight size="14" />,
  },
  {
    key: CREATIVE_PACK_ACTION.unassign,
    label: "Unassign",
    icon: <BsBoxArrowLeft size="14" />,
  },
];

export const SettingEl = ({ onClickAction, items = listAction }) => {
  if (!items?.length) return <></>;

  return (
    <Dropdown
      menu={{
        selectable: true,
        items,
        selectedKeys: [],
        onClick: (item) => onClickAction(item.key),
      }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <button className="btn-light icon !px-1.5 !py-2 !bg-slate-100/80 hover:!bg-slate-200/40">
        <MoreOutlined className="text-lg" />
      </button>
    </Dropdown>
  );
};
