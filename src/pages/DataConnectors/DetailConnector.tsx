import React, { useEffect, useState } from "react";
import Table from "antd/lib/table";
import PropTypes from "prop-types";
import { capitalizeWord, handleErrorImage } from "../../utils/Helpers";
import PlatformColumn from "../../partials/common/Table/PlatformColumn";
import getColumnSearchProps from "../../partials/common/Table/CustomSearch";
import { CONNECTOR_STATUS_FILTER } from "../../constants/constants";
import { filterIcon } from "../../partials/common/Table/Helper";

const DetailConnector = (props) => {
  const [appsWithChangedStatus, setAppsWithChangedStatus] = useState<any[]>([]);
  const {
    listData,
    onLinkApp,
    onChange,
    tableFilters,
    connectorId,
    isLoading,
    linkedAppRes,
  } = props;

  const columns = [
    {
      title: "Name",
      sorter: () => {},
      render: (record) => (
        <div className="flex items-center">
          {record.icon ? (
            <img
              src={record.icon}
              alt=" "
              className="h-8 w-8 rounded mr-2"
              // https://askcodes.net/coding/http-403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
              referrerPolicy="no-referrer"
              onError={handleErrorImage}
            />
          ) : (
            <div className="w-10" />
          )}
          <div>{record.name}</div>
        </div>
      ),
      ...getColumnSearchProps({ dataIndex: "name", isFilterWithApi: true }),
    },
    PlatformColumn(true),
    {
      title: "Status",
      sorter: () => {},
      filters: CONNECTOR_STATUS_FILTER,
      filterIcon: filterIcon,
      onFilter: () => true,
      render: (record) => {
        if (record.status === CONNECTOR_STATUS_FILTER[0].value) {
          return (
            <div className="text-green-500">
              {capitalizeWord(record.status)}
            </div>
          );
        }

        return capitalizeWord(record.status);
      },
    },
    {
      title: "Action",
      render: (record) => (
        <div>
          <button
            type="submit"
            className="btn-info btn-sm whitespace-nowrap"
            onClick={() => onLinkApp(record)}
          >
            Link to app
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!linkedAppRes?.id) return;

    const activedIdx = appsWithChangedStatus.findIndex(
      (el) => el.id === linkedAppRes.id
    );
    let newData;
    if (activedIdx !== -1) {
      newData = [...appsWithChangedStatus];
      newData.splice(activedIdx, 1, linkedAppRes);
    } else {
      newData = [...appsWithChangedStatus, linkedAppRes];
    }
    return setAppsWithChangedStatus(newData);
  }, [linkedAppRes]);

  let dataSource = [...listData];
  if (appsWithChangedStatus.length) {
    dataSource = listData.map((el) => {
      const activedEl = appsWithChangedStatus.find(
        (storeObj) => el.id === storeObj.id
      );
      if (activedEl) {
        const linkedStatus = CONNECTOR_STATUS_FILTER[0].value;
        const readyStatus = CONNECTOR_STATUS_FILTER[1].value;

        if (activedEl.totalLink) {
          return { ...el, status: linkedStatus };
        } else {
          return { ...el, status: readyStatus };
        }
      }
      return el;
    });
  }

  const tableId = "detail-connector-" + connectorId;

  return (
    <Table
      id={tableId}
      getPopupContainer={() => document.getElementById(tableId)!}
      rowKey={(record) => record.id}
      // @ts-ignore
      columns={columns}
      dataSource={dataSource}
      loading={isLoading}
      pagination={
        tableFilters.total < tableFilters.size
          ? false
          : {
              pageSize: tableFilters.size,
              current: tableFilters.page + 1,
              total: tableFilters.total,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }
      }
      onChange={(pagination, filters, sorter, extra) =>
        onChange(connectorId, pagination, filters, sorter, extra)
      }
    />
  );
};

DetailConnector.propTypes = {
  listData: PropTypes.array,
  onLinkApp: PropTypes.func,
  onChange: PropTypes.func,
  tableFilters: PropTypes.object,
  connectorId: PropTypes.string,
  linkedAppRes: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default DetailConnector;
