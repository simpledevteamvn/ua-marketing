import React, { useState } from "react";
import Modal from "antd/lib/modal";
import Table from "antd/lib/table";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../../../utils/helper/TableHelpers";
import { miniHistoryCols } from "../../CampaignCenter";
import { FromCol, ToCol } from "../../../../../utils/helper/UIHelper";
import Button from "antd/lib/button";
import { PreviewStatusCol } from "../../../../../partials/common/Table/Columns/PreviewStatusCol";

function ModalPreview(props) {
  const {
    listData,
    isOpen,
    onClose,
    currenciesConfigs,
    isReduceCol = false,
  } = props;

  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  if (!Array.isArray(listData)) return <></>;

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const columns = [
    ...miniHistoryCols(onSearchTable),
    FromCol(currenciesConfigs, onFilterTable),
    ToCol(
      currenciesConfigs,
      (el) => el.bid || el.dailyBudget || 0,
      onFilterTable
    ),
    PreviewStatusCol
  ];

  let tableCols = columns;
  if (isReduceCol) {
    const removedCols = ["Ad Group", "Keyword"];
    // @ts-ignore
    tableCols = tableCols.filter((el) => !removedCols.includes(el.title));
  }

  const filteredData = listData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  const pagination = {
    pageSize: 10,
    showSizeChanger: false,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <Modal
      closable={false}
      width={isReduceCol ? 900 : 1100}
      title="Edit preview"
      open={isOpen}
      footer={
        <Button type="primary" onClick={onClose}>
          Ok
        </Button>
      }
    >
      <div>
        <Table
          className="!-mb-4"
          rowKey={(record: any) => record.id || record.rawCampaignId}
          // @ts-ignore
          columns={tableCols}
          dataSource={filteredData}
          scroll={{ x: 600 }}
          pagination={pagination}
        />
      </div>
    </Modal>
  );
}

export default ModalPreview;
