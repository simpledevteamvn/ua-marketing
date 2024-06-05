import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import {
  getCountryEl,
  getCountryNameFromCode,
  getCurrency,
  getValueWithCurrency,
  isNumeric,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import Tooltip from "antd/lib/tooltip";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import {
  EDITABLE_STATUS,
  EDITABLE_STAT_IDS,
  NETWORK_CODES,
  NOT_A_NUMBER,
} from "../../../../constants/constants";
import classNames from "classnames";
import { ACTION_KEY, SettingEl, listAction } from "../Helper";
import ModalBatch from "./Modal/ModalBatch";
import { useParams } from "react-router-dom";
import Popconfirm from "antd/lib/popconfirm";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { BATCH_EDIT_TYPES } from "../../../../api/common/common.api";
import { showBatchErrModal } from "../../CampaignCenter/CampaignIntel/BatchErrorModal/BatchErrorModal";
import Popover from "antd/lib/popover";
import { historyColumns } from "../../../../partials/common/Table/EditNumberCell";
import { AiOutlineHistory } from "@react-icons/all-files/ai/AiOutlineHistory";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../utils/helper/TableHelpers";
import searchMaxMinValue from "../../../../partials/common/Table/SearchMaxMinValue";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import ModalEditMultiple from "../../CampaignCenter/CampaignIntel/ModalEditMultiple";
import { ID_COL } from "../../../../partials/common/Table/Columns/IndexCol";
import InfiniteScrollTable from "../../../../utils/hooks/InfiniteScrollTable";
import { SortData, SortMap } from "../../../../partials/common/Table/interface";
import {
  getSortedData,
  keepSortColumn,
  onChangeInfiniteTable,
  sortByCountry,
} from "../../../../partials/common/Table/Helper";

function CountryBudget(props) {
  const urlParams = useParams();
  const {
    listData,
    setIsLoading,
    setCountryBudget,
    campaignData,
    currenciesConfigs,
  } = props;

  const defaultCellData = { editedField: "", crrValue: null, cellData: {} };
  const [isOpenEdit, setIsOpenEdit] = useState(false); // Case nomal
  const [editedData, setEditedData] = useState(defaultCellData);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [action, setAction] = useState();

  const [searchData, setSearchData] = useState<any>({});
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});

  const PAGE_SIZE = 20;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});

  if (!campaignData) return <></>;

  const { network, defaultBid, defaultBudget, currency } = campaignData;

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const isNA = network?.countryBudgetAccess === EDITABLE_STATUS.none;
  let note = "";
  let crrListAction = listAction;
  let showTable = true;
  let showDeleteAction = true;
  /**
   * @Network = Vungle, Mintegral: thao tác thực tế qua targeting -> add note in CountryBid.tsx
   * @Network = Unity, Applocvin
   * Note: Vì campaign bid có thể có type khác CPI nên check có default bid hay ko qua 4 field (bid, goal, maxBid, baseBid)
   * - Case 1: Có 2 default: Ẩn cả Bid và Budget comp (table + batch options)
   * - Case 2: Có Default Budget:
   *    + Ẩn Budget comp
   *    + Country & Bids: batch thêm sửa xóa bt (ko có budget)
   * - Case 3: Có Default Bid:
   *    + Ẩn Bid comp
   *    + Country & Budgets: batch thêm sửa xóa bt (ko có bid)
   * - Case 4: Ko có cả 2:
   *    + Add, Delete Budget qua bid (country budget batch chỉ có action EDIT)
   *    + Add, Delete Bid kèm theo budget
   */

  switch (network?.code) {
    case NETWORK_CODES.applovin:
    case NETWORK_CODES.unity:
      const hasDailyBudget = isNumeric(defaultBudget?.dailyBudget);
      if (hasDailyBudget) {
        showTable = false;
        crrListAction = [];
        note = "This campaign has a default daily budget for all countries.";
      } else {
        const handleNoBidAction = () => {
          // Case 4
          showDeleteAction = false;
          crrListAction = listAction.filter((el) => el.key === ACTION_KEY.edit);
          note =
            "Applovin and Unity network country budgets add or remove actions must be used in conjunction with country bids.";
        };

        if (!defaultBid) {
          handleNoBidAction();
          break;
        }

        const { bid, goal, maxBid, baseBid } = defaultBid;
        const hasBid =
          isNumeric(bid) ||
          isNumeric(goal) ||
          isNumeric(maxBid) ||
          isNumeric(baseBid);

        if (!hasBid) {
          handleNoBidAction();
        }
      }
      break;

    default:
      break;
  }

  const sortMap: SortMap[] = [
    {
      title: "Country",
      sorter: (a, b) => sortByCountry(a, b),
    },
    {
      title: "Daily budget",
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.dailyBudget),
    },
    {
      title: "Total budget",
      sorter: (a, b) => sortNumberWithNullable(a, b, (el) => el.totalBudget),
    },
  ];

  let columns: any = [
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
    {
      title: "Daily budget",
      sorter: keepSortColumn,
      ...searchMaxMinValue({
        dataIndex: "dailyBudget",
        placeholderSuffix: " ",
        getField: (r) => r.dailyBudget,
        onFilterTable,
      }),
      render: (rd) => {
        const { dailyBudget, history } = rd;

        if (isNA) {
          return NOT_A_NUMBER;
        }

        const budgetStr = getValueWithCurrency(
          dailyBudget,
          campaignData?.currency,
          currenciesConfigs
        );

        return (
          <div className="flex justify-between">
            <span>{budgetStr}</span>
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
    },
    {
      title: "Total budget",
      dataIndex: "totalBudget",
      sorter: keepSortColumn,
    },
  ];

  if (!isNA || showDeleteAction) {
    columns.push({
      title: "Action",
      render: (record) => (
        <div className="flex space-x-2 ml-2">
          {!isNA && (
            <Tooltip title="Edit">
              <AiOutlineEdit
                size={20}
                className="text-slate-600 hover:text-antPrimary cursor-pointer"
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}
          {showDeleteAction && (
            <Tooltip title="Remove">
              <Popconfirm
                placement="left"
                title={`Remove "${getCountryNameFromCode(
                  record.country
                )}" country budget configuration?`}
                onConfirm={() => onDelete(record)}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      ),
    });
  }

  const onCloseEditModal = () => {
    setEditedData(defaultCellData);
    setIsOpenEdit(false);
  };

  const onEdit = (rd) => {
    setEditedData({
      editedField: EDITABLE_STAT_IDS.budget,
      crrValue: rd.dailyBudget,
      cellData: rd,
    });
    setIsOpenEdit(true);
  };

  const customEditSingle = (params, urlStr, callback) => {
    setIsLoading(true);
    service.put(urlStr, params).then(
      (res: any) => {
        res.message && toast(res.message, { type: "success" });
        const newData = listData.map((el) => {
          if (el.id === res.results?.id) {
            return res.results;
          }
          return el;
        });
        setCountryBudget(newData);
        setIsLoading(false);
        callback && callback();
      },
      () => setIsLoading(false)
    );
  };

  const onClickAction = (key) => {
    setIsOpenModal(true);
    setAction(key);
  };

  const onSubmitBatch = (values, callback) => {
    const { budget, countries } = values;
    const params = {
      ...values,
      campaignId: urlParams.campId,
    };
    delete params.countryBudgetValue;

    if (action === ACTION_KEY.add) {
      params.value = budget;
      delete params.budget;

      setIsLoading(true);
      return service.post("/budget/country", params).then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });
          callback && callback();

          if (res.results?.length) {
            setCountryBudget([...listData, ...res.results]);
          }
          // setUpdateBidBudget((prevKey) => prevKey + 1);
        },
        () => setIsLoading(false)
      );
    } else if (action === ACTION_KEY.delete) {
      const listIds = listData
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
      return service.put("/budget/batch", editParams).then(
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

  const onDelete = (rd, listIds = [], callback = () => { }) => {
    const params = {
      campaignId: urlParams.campId,
      budgetIds: listIds.length > 0 ? listIds.join(",") : rd.id,
    };

    setIsLoading(true);
    service.delete("/budget/country", { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        callback && callback();

        // if (listIds.length) {
        //   setUpdateBidBudget((prevKey) => prevKey + 1);
        // }
        if (!res.results?.length) return;

        const deletedRecords = res.results.map((el) => el.id);
        const newData = listData.filter(
          (el) => !deletedRecords.includes(el.id)
        );
        setCountryBudget(newData);
      },
      () => setIsLoading(false)
    );
  };

  const sortedData = getSortedData(listData, sortData);
  const filteredData = sortedData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el, true);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  InfiniteScrollTable({
    listData,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignCountryBudget",
  });

  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;

  return (
    <>
      <div className="page-section-multi">
        <div className="flex justify-between">
          <div className="text-black font-semibold text-lg">
            Countries & Budgets
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
            id="CampaignCountryBudget"
            className={classNames("mt-3", isScrollY && "custom-mask")}
            size="middle"
            rowKey={(record) => record.country}
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

        <ModalEditMultiple
          isOpen={isOpenEdit}
          onClose={onCloseEditModal}
          editedCellData={editedData}
          customEditSingle={customEditSingle}
          currenciesConfigs={currenciesConfigs}
          campaignCurrency={getCurrency(currency)}
        />
      </div>

      <ModalBatch
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        action={action}
        type={EDITABLE_STAT_IDS.budget}
        onSubmit={onSubmitBatch}
        campaignData={campaignData}
        setIsLoading={setIsLoading}
        listCountries={listData.map((el) => el.country)}
        currenciesConfigs={currenciesConfigs}
        campaignCurrency={getCurrency(currency)}
      />
    </>
  );
}

CountryBudget.propTypes = {
  listData: PropTypes.array,
  currenciesConfigs: PropTypes.array,
  setIsLoading: PropTypes.func,
  setCountryBudget: PropTypes.func,
  setUpdateBidBudget: PropTypes.func,
  campaignData: PropTypes.object,
};

export default CountryBudget;
