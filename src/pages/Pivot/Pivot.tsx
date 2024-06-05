import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Page from "../../utils/composables/Page";
import Button from "antd/lib/button/button";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import service from "../../partials/services/axios.config";
import PivotTable from "./PivotTable";
import ModalAddAndEdit from "./ModalAddAndEdit";
import { useQuery } from "@tanstack/react-query";
import { LIST_STORE_APPS } from "../../api/constants.api";
import { getStoreApps } from "../../api/apps/apps.api";
import { toast } from "react-toastify";

function Pivot(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<any>([]);
  const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
  const [listStoreApps, setListStoreApps] = useState([]);

  const [editedData, setEditedData] = useState<any>({});

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  useEffect(() => {
    service.get("/pivot-table").then(
      (res: any) => {
        setIsLoading(false);
        setTableData(res.results || []);
      },
      () => setIsLoading(false)
    );
  }, []);

  const createNewPivot = () => {
    setIsOpenModalAdd(true);
  };

  const onCloseModal = () => {
    setIsOpenModalAdd(false);
    setEditedData({});
  };

  const onDelete = (record) => {
    setIsLoading(true);
    service.delete(`pivot-table/${record.id}`).then(
      (res: any) => {
        const newData = tableData.filter((el) => el.id !== record.id);
        setTableData(newData);
        setIsLoading(false);
        toast(res.message, { type: "success" });
      },
      () => setIsLoading(false)
    );
  };

  const onEdit = (record) => {
    setEditedData(record);
    setIsOpenModalAdd(true);
  };

  return (
    <Page>
      <div className="flex justify-between flex-col xs:flex-row">
        <div className="page-title">Pivot</div>

        {/* Todo: show in mobile */}
        <div className="mt-1 sm:mt-0 hidden sm:block">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={createNewPivot}
          >
            New pivot table
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <PivotTable
          isLoading={isLoading}
          listData={tableData}
          listStoreApps={listStoreApps}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <ModalAddAndEdit
        editedData={editedData}
        isOpen={isOpenModalAdd}
        onClose={onCloseModal}
        listStoreApps={listStoreApps}
        tableData={tableData}
        setTableData={setTableData}
      />
    </Page>
  );
}

Pivot.propTypes = {};

export default Pivot;
