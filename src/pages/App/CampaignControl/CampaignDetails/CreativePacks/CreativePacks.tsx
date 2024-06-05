import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import service from "../../../../../partials/services/axios.config";
import { useParams } from "react-router";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../../../partials/common/Forms/RangePicker";
import TableWrapper from "../../../../../partials/common/Table/TableWrapper";
import { getColumns } from "./TableColumns";
import {
  SortData,
  SortMap,
} from "../../../../../partials/common/Table/interface";
import classNames from "classnames";
import {
  getRowSelection,
  getSortedData,
  onChangeInfiniteTable,
  sortByString,
} from "../../../../../partials/common/Table/Helper";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import InfiniteScrollTable from "../../../../../utils/hooks/InfiniteScrollTable";
import { performanceSortMap } from "../../../../../partials/common/Table/Columns/PerformanceCols";
import ModalDetail from "../../../Creative/CreativePack/CreativePackTable/ModalDetail";
import {
  CREATIVE_PACK_ACTION,
  SettingEl,
  creativePackAction,
} from "../../Helper";
import ModalAssignCreativePack from "./ModalAssignCreativePack";
import {
  MESSAGE_DURATION,
  NETWORK_CODES,
} from "../../../../../constants/constants";
import Modal from "antd/lib/modal";
import message from "antd/lib/message";
import {
  CHOOSE_RECORD,
  CHOOSE_RECORDS,
} from "../../../../../constants/formMessage";
import { toast } from "react-toastify";
import ModalAddPack from "./ModalAddPack";
import ModalClone from "../../ModalClone";
import Loading from "../../../../../utils/Loading";

function CreativePacks(props) {
  const urlParams = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [creativePacks, setCreativePacks] = useState<any>([]);

  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const PAGE_SIZE = 10;
  const [tablePage, setTablePage] = useState(0);
  const [sortData, setSortData] = useState<SortData>({});
  const [columns, setColumns] = useState(getColumns({}));

  const [packToView, setPackToView] = useState<any>({}); // show modal

  const [isAdd, setIsAdd] = useState(false);
  const [isAssign, setIsAssign] = useState(false);
  const [isClone, setIsClone] = useState(false);

  const {
    campaignData,
    dateRange,
    setPreviewData,
    setImgPreview,
    setInitedCreatives,
  } = props;
  const { rawCampaignId, network } = campaignData;

  useEffect(() => {
    const params = {
      storeAppId: urlParams.appId,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      networks: network?.code,
      rawCampaignIds: rawCampaignId,
    };

    setIsLoading(true);
    service.get("/report/creative-pack", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setCreativePacks(res.results || []);

        if (res.results?.length) {
          let creatives: any = [];
          res.results.forEach((el) => {
            if (el.creatives?.length) {
              creatives = [...creatives, ...el.creatives];
            }
          });
          setInitedCreatives(creatives);
        }
      },
      () => setIsLoading(false)
    );
  }, [dateRange]);

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onClickName = (rd) => {
    if (rd.creatives?.length || rd.assets?.length) {
      setPackToView(rd);
    }
  };

  useEffect(() => {
    setColumns(
      getColumns({
        onClickName,
        onSearchTable,
        onFilterTable,
      })
    );
  }, [creativePacks]);

  const onClickAction = (key) => {
    if (key === CREATIVE_PACK_ACTION.add) {
      return setIsAdd(true);
    }
    if (key === CREATIVE_PACK_ACTION.assign) {
      return setIsAssign(true);
    }
    if (key === CREATIVE_PACK_ACTION.unassign) {
      if (!selectedRecords?.length)
        return message.error(CHOOSE_RECORDS, MESSAGE_DURATION);

      const packName = selectedRecords?.length > 1 ? "packs" : "pack";
      return Modal.confirm({
        title: "Confirm",
        content: `Unassign ${selectedRecords?.length} ${packName}?`,
        onOk: () => {
          const params = {
            campaignId: campaignData.id,
            creativePackIds: selectedRecords.join(","),
          };

          setIsLoading(true);
          service.put("/creative-pack/unassign", null, { params }).then(
            (res: any) => {
              const newList = creativePacks.filter(
                (el) => !selectedRecords?.includes(el.id)
              );
              setCreativePacks(newList);
              setSelectedRecords([]);
              toast(res.message, { type: "success" });
              setIsLoading(false);
            },
            () => setIsLoading(false)
          );
        },
      });
    }
    if (key === CREATIVE_PACK_ACTION.clone) {
      if (selectedRecords?.length !== 1) {
        return message.error(CHOOSE_RECORD, MESSAGE_DURATION);
      }
      setIsClone(true);
    }
  };

  const handleAddCreatives = (newCreatives) => {
    const newList = [...creativePacks];
    newCreatives.forEach((el) => {
      const isExist = newList.some((data) => el.id === data.id);
      if (!isExist || !newList?.length) {
        newList.push(el);
      }
    });
    setCreativePacks(newList);
  };

  const cloneCallback = (newPack) => {
    setCreativePacks([...creativePacks, newPack]);
  };

  const rowSelection = getRowSelection(
    selectedRecords,
    setSelectedRecords,
    creativePacks
  );

  const sortMap: SortMap[] = [
    {
      title: "Name",
      sorter: (a, b) => sortByString(a, b, "name"),
    },
    ...performanceSortMap,
  ];

  const sortedData = getSortedData(creativePacks, sortData);
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
    listData: creativePacks,
    setTablePage,
    tablePage,
    filteredData,
    PAGE_SIZE,
    tableId: "CampaignCreativePacks",
  });

  const clonedData = creativePacks.find((el) => el.id === selectedRecords[0]);
  const paginationedData = filteredData.slice(0, PAGE_SIZE * (tablePage + 1));
  const isScrollY = filteredData && filteredData.length > 10;

  /**
   * Mintegral + applovin: add creative pack
   * Unity: add/assign/unassign
   */
  let settingOpts;
  switch (network?.code) {
    case NETWORK_CODES.mintegral:
    case NETWORK_CODES.applovin:
      settingOpts = creativePackAction.filter(
        (el) =>
          el.key === CREATIVE_PACK_ACTION.add ||
          el.key === CREATIVE_PACK_ACTION.clone
      );
      break;

    case NETWORK_CODES.unity:
    default:
      settingOpts = creativePackAction;
      break;
  }

  return (
    <div className="page-section-multi">
      <div className="flex justify-between items-start">
        <div className="text-black font-semibold text-lg min-h-[32px]">
          Creative Packs
          {filteredData?.length > 0 && (
            <span className="ml-1">({filteredData?.length})</span>
          )}
        </div>
        <SettingEl onClickAction={onClickAction} items={settingOpts} />
      </div>

      {isLoadingPage && <Loading />}
      <TableWrapper
        loading={isLoading}
        initialColumns={columns}
        setColumns={setColumns}
        isShowSettings={false}
        isShowSummary={false}
        id="CampaignCreativePacks"
        size="middle"
        className={classNames("mt-1")}
        rowKey={(record) => record.id}
        dataSource={paginationedData}
        scroll={{ x: 1800, y: isScrollY ? 325 : undefined }}
        pagination={false}
        onChange={(p, f, s, e) =>
          onChangeInfiniteTable(p, f, s, e, sortMap, setSortData)
        }
        rowSelection={rowSelection}
      />

      <ModalDetail
        isOpen={!!packToView?.id}
        onClose={() => setPackToView({})}
        rd={packToView}
        setPreviewData={setPreviewData}
        setImgPreview={setImgPreview}
      />

      <ModalAddPack
        isOpen={isAdd}
        onClose={() => setIsAdd(false)}
        campaignData={campaignData}
        handleAddCreatives={handleAddCreatives}
      />

      <ModalAssignCreativePack
        isOpen={isAssign}
        onClose={() => setIsAssign(false)}
        handleAddCreatives={handleAddCreatives}
        campaignData={campaignData}
        setPreviewData={setPreviewData}
        setImgPreview={setImgPreview}
      />

      <ModalClone
        isOpen={isClone}
        onClose={() => setIsClone(false)}
        rd={clonedData}
        callback={cloneCallback}
        setIsLoading={setIsLoadingPage}
        field="creative pack"
      />
    </div>
  );
}

CreativePacks.propTypes = {
  campaignData: PropTypes.object,
  dateRange: PropTypes.array,
  setPreviewData: PropTypes.func,
  setImgPreview: PropTypes.func,
  setInitedCreatives: PropTypes.func,
};

export default CreativePacks;
