import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { LIST_CAMPAIGN_STATUS } from "../../../../constants/constants";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import TableWrapper from "../../../../partials/common/Table/TableWrapper";
import { getColumns } from "./TableConfigs";
import ModalClone from "../ModalClone";
import Loading from "../../../../utils/Loading";

function CampaignTable(props) {
  const {
    isLoading,
    setIsLoading,
    tableData,
    setTableData,
    onSearchTable,
    onFilterTable,
  } = props;

  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [clonedCamp, setClonedCamp] = useState<any>({});

  const [initedData, setInitedData] = useState(false);
  const [columns, setColumns] = useState(getColumns({}));

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
        setInitedData(true);
      },
      () => setInitedData(true)
    );
  }, []);

  useEffect(() => {
    if (!initedData) return;

    setColumns(
      getColumns({
        onSearchTable,
        onFilterTable,
        currenciesConfigs,
        onChangeStatus,
        handleCloneCamp,
        tableData,
      })
    );
  }, [initedData, tableData]);

  const handleCloneCamp = (rd) => {
    setClonedCamp(rd);
  };

  const cloneCampCallback = (newCamp) => {
    setTableData([...tableData, newCamp]);
  };

  const onChangeStatus = (rd) => {
    const isPause = rd.status === LIST_CAMPAIGN_STATUS.paused.value;
    const params = {
      campaignId: rd.id,
      enable: isPause,
    };

    setIsLoading(true);
    service.put("/campaign/status", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });

        const newTableData = tableData.map((el) => {
          if (el.id === rd.id) {
            const newStatus = isPause
              ? LIST_CAMPAIGN_STATUS.running.value
              : LIST_CAMPAIGN_STATUS.paused.value;

            return { ...el, status: newStatus };
          }
          return el;
        });
        setTableData(newTableData);
      },
      () => setIsLoading(false)
    );
  };

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const pagination = {
    pageSize,
    total: tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      {isLoadingPage && <Loading />}

      <TableWrapper
        id="campaign-table"
        getPopupContainer={() => document.getElementById("campaign-table")!}
        initialColumns={columns}
        setColumns={setColumns}
        isShowSummary={false}
        isShowSettings={false}
        loading={isLoading}
        rowKey={(record) => record.id}
        // @ts-ignore
        hideOnSinglePage
        dataSource={tableData || []}
        scroll={{ x: 800 }}
        pagination={pagination}
        onChange={onChangeTable}
      />

      <ModalClone
        isOpen={!!clonedCamp?.id}
        onClose={() => setClonedCamp(false)}
        callback={cloneCampCallback}
        setIsLoading={setIsLoadingPage}
        rd={clonedCamp}
      />
    </>
  );
}

CampaignTable.propTypes = {
  tableData: PropTypes.array,
  isLoading: PropTypes.bool,
  onSearchTable: PropTypes.func,
  onFilterTable: PropTypes.func,
  setIsLoading: PropTypes.func,
  setTableData: PropTypes.func,
};

export default CampaignTable;
