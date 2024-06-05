import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import Tooltip from "antd/lib/tooltip";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { ACTION_KEY, BidColumn, SettingEl, listAction } from "../Helper";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import {
  checkMaximumPercentage,
  getCountryEl,
  getCountryNameFromCode,
  getCurrency,
  isNumeric,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import Popconfirm from "antd/lib/popconfirm";
import ModalBatch from "./Modal/ModalBatch";
import {
  BID_CPI_TYPE,
  BID_RETENSION_TYPE,
  BID_ROAS_TYPE,
  BID_SOURCE_TYPE,
  EDITABLE_STAT_IDS,
  NETWORK_CODES,
} from "../../../../constants/constants";
import { BATCH_EDIT_TYPES } from "../../../../api/common/common.api";
import { showBatchErrModal } from "../../CampaignCenter/CampaignIntel/BatchErrorModal/BatchErrorModal";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../utils/helper/TableHelpers";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import ModalEdit from "../../CampaignCenter/CampaignIntel/ModalEdit";
import ModalEditMultiple from "../../CampaignCenter/CampaignIntel/ModalEditMultiple";
import { ID_COL } from "../../../../partials/common/Table/Columns/IndexCol";
import { SortData, SortMap } from "../../../../partials/common/Table/interface";
import {
  getSortedData,
  keepSortColumn,
  onChangeInfiniteTable,
  sortByCountry,
  sortByString,
} from "../../../../partials/common/Table/Helper";
import InfiniteScrollTable from "../../../../utils/hooks/InfiniteScrollTable";

function CountryBid(props) {
  const urlParams = useParams();
  const {
    listData,
    currenciesConfigs,
    setIsLoading,
    setCountryBid,
    campaignData,
    setUpdateBidBudget,
  } = props;

  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const [isOpenEdit, setIsOpenEdit] = useState(false); // Case nomal
  const [editedBid, setEditedBid] = useState(defaultCellData);

  const [isOpenEditModal, setIsOpenEditModal] = useState(false); // Case Roas, Retension
  const [isOpenModalBatch, setIsOpenModalBatch] = useState(false);
  const [action, setAction] = useState();

  const [searchData, setSearchData] = useState<any>({});
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});

  // Country bid without "SOURCE" type
  const [countryBidData, setCountryBidData] = useState<any>([]);

  const PAGE_SIZE = 20;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});

  if (!campaignData) return <></>;
  const { network, bidType, currency, defaultBid, defaultBudget } =
    campaignData;

  const isCpiCampaign = [BID_CPI_TYPE].includes(bidType);

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  useEffect(() => {
    const newList = listData.filter((el) => el.type !== BID_SOURCE_TYPE);
    setCountryBidData(newList);
  }, [listData]);

  const sortMap: SortMap[] = [
    {
      title: "Country",
      sorter: (a, b) => sortByCountry(a, b),
    },
    {
      title: "Bid",
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.bid),
    },
    {
      title: "Type",
      sorter: (a, b) => sortByString(a, b, "type"),
    },
  ];

  const columns = [
    ID_COL,
    {
      title: "Country",
      render: getCountryEl,
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        dataIndex: "country",
        callback: (value) => onSearchTable(value, "country"),
        customFilter: () => true,
      }),
    },
    BidColumn(
      onFilterTable,
      currenciesConfigs,
      campaignData,
      false,
      keepSortColumn
    ),
    {
      title: "Type",
      render: (rd) => rd.type,
      sorter: keepSortColumn,
      ...getColumnSearchProps({
        dataIndex: "type",
        callback: (value) => onSearchTable(value, "type"),
        customFilter: () => true,
      }),
    },
    {
      title: "Action",
      render: (record) => (
        <div className="flex space-x-2 ml-2">
          <Tooltip title="Edit">
            <AiOutlineEdit
              size={20}
              className="text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Remove">
            <Popconfirm
              placement="left"
              title={`Remove "${getCountryNameFromCode(
                record.country
              )}" country bid configuration?`}
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const onClickAction = (key) => {
    setIsOpenModalBatch(true);
    setAction(key);
  };

  const onSubmitBatch = (values, callback) => {
    const { bid, countries } = values;
    const params = {
      ...values,
      campaignId: urlParams.campId,
    };

    if (action === ACTION_KEY.add) {
      params.type = campaignData?.bidType;
      params.value = bid;
      delete params.bid;

      setIsLoading(true);
      return service.post("/bid/country", params).then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });
          callback && callback();

          if (res.results?.length) {
            setCountryBid([...listData, ...res.results]);
          }
          setUpdateBidBudget((prevKey) => prevKey + 1);
        },
        () => setIsLoading(false)
      );
    } else if (action === ACTION_KEY.delete) {
      const listIds = countryBidData
        .filter((el) => countries.includes(el.country))
        ?.map((el) => el.id);
      return onDelete({}, listIds, callback);
    } else if (action === ACTION_KEY.edit) {

      const editParams: any = {
        ...params,
        countries,
        level: BATCH_EDIT_TYPES.country,
        storeAppId: urlParams.appId,
        campaignIds: [urlParams.campId],
        networks: [network?.code],
        campaignStatus: campaignData?.status,
      };

      setIsLoading(true);
      return service.put("/bid/batch/allow-failure", editParams).then(
        (res: any) => {
          setIsLoading(false);

          if (!res.results?.length) {
            toast(res.message, { type: "success" });
            callback && callback();
            return;
          }

          showBatchErrModal(res.results);
        },
        () => setIsLoading(false)
      );
    }
  };

  const onEdit = (rd) => {
    setEditedBid({
      editedField: EDITABLE_STAT_IDS.bid,
      crrValue: rd.bid,
      cellData: rd,
    });

    if ([BID_ROAS_TYPE, BID_RETENSION_TYPE].includes(rd.type)) {
      return setIsOpenEditModal(true);
    }
    setIsOpenEdit(true);
  };

  const onCloseEditModal = () => {
    setEditedBid(defaultCellData);
    setIsOpenEdit(false);
  };

  const customEditSingle = (params, urlStr, callback) => {
    setIsLoading(true);
    service.put(urlStr, params).then(
      (res: any) => updateEditAction(res, callback),
      () => setIsLoading(false)
    );
  };

  const onSubmitEdit = (params, callback) => {
    setIsLoading(true);
    service.put("/bid", params).then(
      (res: any) => updateEditAction(res, callback),
      () => {
        setIsLoading(false);
      }
    );
  };

  const updateEditAction = (res, callback) => {
    res.message && toast(res.message, { type: "success" });
    const newData = listData.map((el) => {
      if (el.id === res.results?.id) {
        return res.results;
      }
      return el;
    });
    setUpdateBidBudget((prevKey) => prevKey + 1);
    setCountryBid(newData);
    setIsLoading(false);
    callback && callback();
  };

  const onDelete = (rd, listIds = [], callback = () => { }) => {
    const params = {
      campaignId: urlParams.campId,
      bidIds: listIds.length > 0 ? listIds.join(",") : rd.id,
    };

    setIsLoading(true);
    service.delete("/bid/country", { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        callback && callback();

        setUpdateBidBudget((prevKey) => prevKey + 1);
        if (!res.results?.length) return;

        const deletedRecords = res.results.map((el) => el.id);
        const newData = listData.filter(
          (el) => !deletedRecords.includes(el.id)
        );
        setCountryBid(newData);
      },
      () => setIsLoading(false)
    );
  };

  const sortedData = getSortedData(countryBidData, sortData);
  const filteredData = sortedData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el, true);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  let crrListAction = listAction;
  if (!isCpiCampaign) {
    crrListAction = crrListAction.filter((el) => el.key !== ACTION_KEY.edit);
  }

  let note = "";
  let showTable = true;
  // Check note in CountryBudget.tsx component
  switch (network?.code) {
    case NETWORK_CODES.vungle:
    case NETWORK_CODES.mintegral:
      note =
        "Add or delete country bid action for Vungle and Mintegral networks will use the targeting locations.";
      break;
    case NETWORK_CODES.adjoe:
      crrListAction = crrListAction.filter(
        (el) => el.key !== ACTION_KEY.delete
      );
      break;
    case NETWORK_CODES.applovin:
    case NETWORK_CODES.unity:
      if (!defaultBid) break;
      const { bid, goal, maxBid, baseBid } = defaultBid;
      const hasBid =
        isNumeric(bid) ||
        isNumeric(goal) ||
        isNumeric(maxBid) ||
        isNumeric(baseBid);

      if (hasBid) {
        showTable = false;
        crrListAction = [];
        note = "This campaign has a default bid for all countries.";
      }
      break;
  }

  InfiniteScrollTable({
    listData,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignCountryBid",
  });

  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;

  return (
    <>
      <div className="page-section-multi">
        <div className="flex justify-between">
          <div className="text-black font-semibold text-lg">
            Countries & Bids
            {filteredData?.length > 0 && (
              <span className="ml-1">({filteredData?.length})</span>
            )}
          </div>

          <SettingEl onClickAction={onClickAction} items={crrListAction} />
        </div>

        {note && (
          <div className="text-neutral-400 mt-1 mb-3">
            <span className="font-bold">Note:</span> {note}
          </div>
        )}

        {showTable && (
          <Table
            id="CampaignCountryBid"
            className={classNames("mt-3", isScrollY && "custom-mask")}
            size="middle"
            rowKey={(record: any) => record.id}
            // @ts-ignore
            columns={columns}
            dataSource={paginationedData}
            scroll={{ x: 600, y: isScrollY ? 325 : undefined }}
            pagination={false}
            onChange={(p, f, s, e) =>
              onChangeInfiniteTable(p, f, s, e, sortMap, setSortData)
            }
          />
        )}
      </div>

      <ModalEdit
        isOpen={isOpenEditModal}
        editedBid={editedBid?.cellData}
        onClose={() => setIsOpenEditModal(false)}
        onSubmitEdit={onSubmitEdit}
        networkCode={network?.code}
      />

      <ModalEditMultiple
        isOpen={isOpenEdit}
        onClose={onCloseEditModal}
        editedCellData={editedBid}
        customEditSingle={customEditSingle}
        currenciesConfigs={currenciesConfigs}
        campaignCurrency={getCurrency(currency)}
      />

      <ModalBatch
        isOpen={isOpenModalBatch}
        onClose={() => setIsOpenModalBatch(false)}
        action={action}
        onSubmit={onSubmitBatch}
        campaignData={campaignData}
        setIsLoading={setIsLoading}
        listCountries={countryBidData.map((el) => el.country)}
        currenciesConfigs={currenciesConfigs}
        campaignCurrency={getCurrency(currency)}
      />
    </>
  );
}

CountryBid.propTypes = {
  listData: PropTypes.array,
  currenciesConfigs: PropTypes.array,
  setIsLoading: PropTypes.func,
  setCountryBid: PropTypes.func,
  setUpdateBidBudget: PropTypes.func,
  campaignData: PropTypes.object,
};

export default CountryBid;
