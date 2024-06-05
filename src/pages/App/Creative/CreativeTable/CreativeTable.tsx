import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
// @ts-ignore
import TableWrapper, {
  TableSettingState,
} from "../../../../partials/common/Table/TableWrapper";
import {
  baseURL,
  checkResponseStatus,
  LIST_ERROR_CODE,
  OG_CODE_HEADER,
} from "../../../../partials/services/axios.config";
import { getTableColumns } from "./TableColumns";
import { getNewColSettings } from "../../../../utils/helper/TableHelpers";
import { OFFSET_TABLE_HEADER } from "../../../../constants/constants";
import Button from "antd/lib/button/button";
import TagsOutlined from "@ant-design/icons/lib/icons/TagsOutlined";
import MarkCreative from "./MarkCreative";
import DownloadOutlined from "@ant-design/icons/lib/icons/DownloadOutlined";
import Tooltip from "antd/lib/tooltip";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { downloadCSV } from "../../../CSVManagement/TemplateManagement/Helpers";
import Loading from "../../../../utils/Loading";

function CreativeTable(props) {
  const urlParams = useParams();
  const token = useSelector((state: RootState) => state.account.token);
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const {
    isLoading,
    setImgPreview,
    listData,
    setPreviewData,
    onSearchTable,
    onFilterTable,
    listType,
  } = props;

  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [columns, setColumns] = useState<any>(getTableColumns({}));
  const [colSettings, setColSettings] = useState<TableSettingState>({});
  const [isMarkCreative, setIsMarkCreative] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  useEffect(() => {
    updateColumns();
  }, [listData, listType, colSettings]);

  const updateColumns = () => {
    const columns = getTableColumns({
      onSearchTable,
      setImgPreview,
      setPreviewData,
      onFilterTable,
      listType,
      listData,
    });

    const newCols = getNewColSettings(columns, colSettings);
    setColumns(newCols);
  };

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const handleMarkCreative = () => {
    setIsMarkCreative(true);
  };

  const onDownloadCSV = () => {
    const params = { storeAppId: urlParams.appId };
    setIsLoadingPage(true);
    axios
      .get(`${baseURL}/creative/csv`, {
        params,
        headers: { Authorization: token, [OG_CODE_HEADER]: organizationCode },
      })
      .then(
        (res: any) => {
          setIsLoadingPage(false);
          if (LIST_ERROR_CODE.includes(res.data.code)) {
            return checkResponseStatus(res);
          }
          downloadCSV(res);
        },
        () => setIsLoadingPage(false)
      );
  };

  const additionalSetting = (
    <>
      <Button
        icon={<TagsOutlined />}
        onClick={handleMarkCreative}
        size="small"
        className="!text-xs2"
      >
        Tagging
      </Button>
      <Tooltip title="Download CSV">
        <DownloadOutlined className="cursor-pointer" onClick={onDownloadCSV} />
      </Tooltip>
    </>
  );

  const pagination = {
    showQuickJumper: true,
    pageSize,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      {isLoadingPage && <Loading />}
      <MarkCreative
        isOpen={isMarkCreative}
        onClose={() => setIsMarkCreative(false)}
        setIsLoading={setIsLoadingPage}
      />

      <TableWrapper
        id="creative-table"
        getPopupContainer={() => document.getElementById("creative-table")!}
        className="my-2"
        settingClassNames="mr-2"
        // @ts-ignore
        hideOnSinglePage
        bordered
        loading={isLoading}
        rowKey={(record) => record.tableId || record.creativeId}
        scroll={{ x: 2400 }}
        dataSource={[...listData]}
        pagination={pagination}
        onChange={onChangeTable}
        tableLayout="fixed"
        sticky={{ offsetHeader: OFFSET_TABLE_HEADER }}
        initialColumns={columns}
        setColumns={setColumns}
        colSettings={colSettings}
        setColSettings={setColSettings}
        isShowSummary={false}
        additionalSetting={additionalSetting}
      />
    </>
  );
}

CreativeTable.propTypes = {
  isLoading: PropTypes.bool,
  setPreviewData: PropTypes.func,
  setImgPreview: PropTypes.func,
  onSearchTable: PropTypes.func,
  onFilterTable: PropTypes.func,
  listData: PropTypes.array,
  listType: PropTypes.array,
};

export default CreativeTable;
