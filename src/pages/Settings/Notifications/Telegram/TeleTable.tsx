import React, { useState } from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import Tooltip from "antd/lib/tooltip";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import ModalConfirmDelete from "../../../../partials/common/ModalConfirmDelete";
import Modal from "antd/lib/modal/Modal";
import Select from "antd/lib/select";
import GamePlatformIcon from "../../../../partials/common/GamePlatformIcon";
import Button from "antd/lib/button";
import {
  capitalizeWord,
  filterSelectGroupByKey,
  sortByString,
} from "../../../../utils/Helpers";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import getColumnSearchProps from "../../../../partials/common/Table/CustomSearch";

function TeleTable(props) {
  const isAdmin = useSelector(
    (state: RootState) => state.account.userData.isAdmin
  );
  const { data, listStoreApp, onDelete, onLinkApps, onSearchTable } = props;

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editedData, setEditedData] = useState<any>();
  const [activedApp, setActivedApp] = useState<string[]>([]);

  const defaultPageSize = 20;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] =
    useState(false);
  const [deletedData, setDeletedData] = useState<any>();

  const handleDelete = (record) => {
    setDeletedData(record);
    setIsOpenConfirmDeleteModal(true);
  };

  const handleSubmitDelete = () => {
    onDelete(deletedData, () => setIsOpenConfirmDeleteModal(false));
  };

  const handleEdit = (record) => {
    const listActivedApp = record.storeApps?.map((el) => el.storeId + el.name);

    setActivedApp(listActivedApp || []);
    setEditedData(record);
    setIsOpenEditModal(true);
  };

  const onCloseEditModal = () => {
    setIsOpenEditModal(false);
  };

  const onSubmitLinkApp = () => {
    onLinkApps(editedData, activedApp, () => setIsOpenEditModal(false));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: sortByString("name"),
      ...getColumnSearchProps({
        dataIndex: "name",
        callback: (value) => onSearchTable(value, "name"),
        customFilter: () => true,
      }),
    },
    {
      title: "Group Type",
      width: 160,
      sorter: sortByString("telegramGroupType"),
      render: (record) => <div>{capitalizeWord(record.telegramGroupType)}</div>,
      ...getColumnSearchProps({
        getField: (el) => el.telegramGroupType,
        callback: (value) => onSearchTable(value, "telegramGroupType"),
        customFilter: () => true,
      }),
    },
    { title: "Chat Id", dataIndex: "chatId" },
    {
      title: "Apps",
      render: (record) => {
        const appsName = record.storeApps?.map((el) => el.name)?.join(", ");
        return (
          <div className="line-clamp-3" title={appsName}>
            {appsName}
          </div>
        );
      },
    },
    {
      title: "Actions",
      render: (record) => (
        <div className="flex space-x-2 ml-2">
          <Tooltip title="Edit linked apps">
            <AiOutlineEdit
              size={20}
              className="text-slate-600 hover:text-antPrimary cursor-pointer"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          {isAdmin && (
            <Tooltip title="Delete group">
              <DeleteOutlined
                className="icon-danger text-xl cursor-pointer"
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const onChangeTable = (pagination) => {
    if (pagination?.pageSize && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize);
    }
  };

  const pagination = {
    pageSize,
    total: data.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      <Table
        // @ts-ignore
        columns={columns}
        dataSource={[...data]}
        scroll={{ x: 600 }}
        rowKey={(record) => record.id}
        pagination={pagination}
        onChange={onChangeTable}
      />

      <ModalConfirmDelete
        isOpen={isOpenConfirmDeleteModal}
        onClose={() => setIsOpenConfirmDeleteModal(false)}
        onSubmit={handleSubmitDelete}
        targetName={deletedData?.name}
      />

      <Modal
        title={`Edit linked apps for the "${editedData?.name}" group`}
        open={isOpenEditModal}
        onCancel={onCloseEditModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseEditModal}>
            Cancel
          </Button>,
          <Button
            type="primary"
            key="submit"
            htmlType="submit"
            onClick={onSubmitLinkApp}
          >
            Update
          </Button>,
        ]}
      >
        <div className="text-base font-medium text-gray-900 mb-2">App</div>
        <Select
          className="w-full !mb-2"
          placeholder="App name / Package name"
          mode="multiple"
          allowClear
          value={activedApp}
          onChange={setActivedApp}
          showSearch
          maxTagCount="responsive"
          filterOption={filterSelectGroupByKey}
        >
          {listStoreApp.map((data) => (
            <Select.Option key={data.storeId + data.name} size="large">
              <div className="flex items-center">
                {data.icon && <GamePlatformIcon app={data} inputSize={true} />}
                {data.name}
              </div>
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </>
  );
}

TeleTable.propTypes = {
  data: PropTypes.array,
  listStoreApp: PropTypes.array,
  onDelete: PropTypes.func,
  onLinkApps: PropTypes.func,
  onSearchTable: PropTypes.func,
};

export default TeleTable;
