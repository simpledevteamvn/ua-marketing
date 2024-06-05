import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table";
import Tooltip from "antd/lib/tooltip";
import {
  capitalizeWord,
  sortByDate,
  sortByString,
} from "../../../utils/Helpers";
import PlatformColumn from "../../../partials/common/Table/PlatformColumn";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { AiOutlineSync } from "@react-icons/all-files/ai/AiOutlineSync";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { IMPORTING_APP } from "../../../constants/constants";

const LinkedConnectorTable = (props) => {
  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const { listData, setListData, onDelete, setIsLoading } = props;

  const onSync = (record) => {
    if (record.systemStatus === IMPORTING_APP) return;

    setIsLoading(true);
    service.get("/application/refresh", { params: { id: record.id } }).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);

        const newListData = listData.map((el) => {
          if (el.id === record.id) {
            return { ...el, systemStatus: IMPORTING_APP };
          }
          return el;
        });
        setListData(newListData);
      },
      () => setIsLoading(false)
    );
  };

  const columns = [
    {
      title: "Connector",
      sorter: (el1, el2) => {
        const name1 = el1.networkConnector?.network?.name;
        const name2 = el2.networkConnector?.network?.name;

        return ("" + name1).localeCompare(name2);
      },
      render: (record) => {
        const { networkConnector } = record;
        if (!networkConnector) return record.name;

        const { network } = networkConnector;
        return (
          <div>
            <div className="flex items-center whitespace-nowrap md:whitespace-normal">
              {network?.imageUrl && (
                <img
                  alt=" "
                  src={network.imageUrl}
                  className="h-8 w-8 rounded mr-2"
                />
              )}
              <div>
                <div className="font-semibold text-black text-base">
                  {network?.name}
                </div>
                <div className="italic text-xs">
                  {networkConnector.name} - {record.name}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Last sync data",
      sorter: sortByDate("lastModifiedDate"),
      render: (record) => {
        if (!record.lastModifiedDate) return "";
        return moment(record.lastModifiedDate)?.format("DD-MM-YYYY HH:mm:ss");
      },
    },
    PlatformColumn(),
    {
      title: "Status",
      sorter: sortByString("systemStatus"),
      render: (record) => capitalizeWord(record.systemStatus),
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex space-x-2">
          <Tooltip title="Synchronize app">
            <AiOutlineSync
              size={20}
              className="text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => onSync(record)}
            />
          </Tooltip>
          <Tooltip title="Remove">
            <DeleteOutlined
              className="icon-danger text-xl cursor-pointer"
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const pagination = {
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Table
      id="linked-connector"
      getPopupContainer={() => document.getElementById("linked-connector")!}
      rowKey={(record) => record.id}
      // @ts-ignore
      columns={columns}
      dataSource={[...listData]}
      scroll={{ x: 600 }}
      pagination={pagination}
      onChange={(pagination) => {
        pagination?.pageSize && setPageSize(pagination?.pageSize);
      }}
    />
  );
};

LinkedConnectorTable.defaultProps = {
  listData: [],
};

LinkedConnectorTable.propTypes = {
  listData: PropTypes.array,
  setListData: PropTypes.func,
  onDelete: PropTypes.func,
  setIsLoading: PropTypes.func,
};

export default LinkedConnectorTable;
