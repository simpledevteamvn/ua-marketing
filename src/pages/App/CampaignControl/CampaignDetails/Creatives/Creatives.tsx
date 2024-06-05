import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import classNames from "classnames";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import InfiniteScrollTable from "../../../../../utils/hooks/InfiniteScrollTable";
import {
  getRowSelection,
  getSortedData,
  onChangeInfiniteTable,
  sortByString,
} from "../../../../../partials/common/Table/Helper";
import {
  SortData,
  SortMap,
} from "../../../../../partials/common/Table/interface";
import { NETWORK_CODES } from "../../../../../constants/constants";
import Popconfirm from "antd/lib/popconfirm";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import Button from "antd/lib/button";
import { getColumns } from "./TableColumns";
import TableWrapper from "../../../../../partials/common/Table/TableWrapper";
import { performanceSortMap } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../../../partials/common/Forms/RangePicker";
import { sortNumberWithNullable } from "../../../../../utils/Helpers";

function Creatives(props) {
  const urlParams = useParams();
  const {
    campaignData,
    dateRange,
    setPreviewData,
    setImgPreview,
    isExtendData,
    initedCreatives,
  } = props;

  const { network } = campaignData;
  const [isLoading, setIsLoading] = useState(true);
  const [creatives, setCreatives] = useState<any>([]);

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const PAGE_SIZE = 10;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});
  const [columns, setColumns] = useState(getColumns({}));

  useEffect(() => {
    // Khi chưa call api get thông tin code của campaign xong (network?.code) thì tạm thời chưa call api này
    // Vì chi phí call api này cùng với call api get creative packs được cho là trùng và tốn performance ở BE
    if (isExtendData || !network?.code) return;

    const params = {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      campaignId: urlParams.campId,
    };

    setIsLoading(true);
    service.get("/creative/report", { params }).then(
      (res: any) => {
        setIsLoading(false);
        onUpdateCreatives(res.results);
      },
      () => setIsLoading(false)
    );
  }, [dateRange, isExtendData, network?.code]);

  useEffect(() => {
    if (isExtendData) {
      onUpdateCreatives(initedCreatives);

      // initedCreatives là một mảng, default là undefined
      // -> ko check theo length để đợi api của creative pack call xong (initedCreatives có thể là [])
      if (initedCreatives) {
        setIsLoading(false);
      }
    }
  }, [isExtendData, initedCreatives]);

  const onUpdateCreatives = (listData) => {
    if (!listData?.length) return setCreatives([]);

    const sortedData = [...listData];
    sortedData.sort((a, b) =>
      sortNumberWithNullable(b, a, (el) => el.data?.cost)
    );
    setCreatives(sortedData);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const sortMap: SortMap[] = [
    {
      title: "Name",
      sorter: (a, b) => sortByString(a, b, "name"),
    },
    {
      title: "Dimension",
      sorter: (a, b) => {
        const aData = a.rawCreative?.dimension;
        const bData = b.rawCreative?.dimension;

        return ("" + aData).localeCompare(bData);
      },
    },
    {
      title: "Type",
      sorter: (a, b) => sortByString(a, b, "type"),
    },
    {
      title: "Status",
      sorter: (a, b) => sortByString(a, b, "status"),
    },
    ...performanceSortMap,
  ];

  useEffect(() => {
    setColumns(
      getColumns({
        onSearchTable,
        onFilterTable,
        setPreviewData,
        setImgPreview,
      })
    );
  }, [creatives]);

  // if (network?.code === NETWORK_CODES.mintegral) {
  //   columns.push({
  //     title: "Action",
  //     render: (record) => (
  //       <div className="flex space-x-2 ml-2">
  //         <Tooltip title="Remove">
  //           <Popconfirm
  //             placement="left"
  //             title="Remove this creative?"
  //             onConfirm={() => onDelete(record)}
  //             okText="Yes"
  //             cancelText="No"
  //           >
  //             <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
  //           </Popconfirm>
  //         </Tooltip>
  //       </div>
  //     ),
  //   });
  // }

  const onDelete = (rd: any = null) => {
    let params;
    if (rd) {
      params = { creativeIds: rd.id, campaignId: urlParams.campId };
    } else {
      params = {
        creativeIds: selectedRecords.join(","),
        campaignId: urlParams.campId,
      };
    }

    setIsLoading(true);
    service.put("/creative/campaign/remove", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });

        if (rd) {
          const newData = creatives.filter((el) => el.id !== rd.id);
          setCreatives(newData);
        } else if (res.results?.length) {
          const newData = creatives.filter(
            (el) => !res.results.some((resData) => resData.id === el.id)
          );
          setCreatives(newData);
        }

        setSelectedRecords([]);
        setPreviewData({});
        setImgPreview({});
      },
      () => setIsLoading(false)
    );
  };

  const rowSelection = getRowSelection(
    selectedRecords,
    setSelectedRecords,
    creatives
  );

  const sortedData = getSortedData(creatives, sortData);
  const filteredData = sortedData?.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  InfiniteScrollTable({
    listData: creatives,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignCreative",
  });

  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;
  const canDelete = network?.code === NETWORK_CODES.mintegral;

  return (
    <>
      <div className="page-section-multi">
        <div className="flex justify-between items-start">
          <div className="text-black font-semibold text-lg min-h-[32px]">
            Creatives
            {filteredData?.length > 0 && (
              <span className="ml-1">({filteredData?.length})</span>
            )}
          </div>
          {canDelete && selectedRecords?.length > 0 && (
            <Popconfirm
              placement="left"
              title="Remove this creative?"
              onConfirm={() => onDelete()}
              okText="Yes"
              cancelText="No"
            >
              <Button danger type="primary" icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        </div>

        <TableWrapper
          loading={isLoading}
          initialColumns={columns}
          setColumns={setColumns}
          isShowSettings={false}
          isShowSummary={false}
          id="CampaignCreative"
          size="small"
          className={classNames("mt-1")}
          rowKey={(record) => record.id}
          dataSource={paginationedData}
          scroll={{ x: 1800, y: isScrollY ? 325 : undefined }}
          pagination={false}
          onChange={(p, f, s, e) =>
            onChangeInfiniteTable(p, f, s, e, sortMap, setSortData)
          }
          rowSelection={canDelete ? rowSelection : undefined}
        />
      </div>
    </>
  );
}

Creatives.propTypes = {
  isExtendData: PropTypes.bool,
  campaignData: PropTypes.object,
  dateRange: PropTypes.array,
  setPreviewData: PropTypes.func,
  setImgPreview: PropTypes.func,
  initedCreatives: PropTypes.array,
};

export default Creatives;
