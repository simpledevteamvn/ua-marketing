import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Loading from "../../../utils/Loading";
import Button from "antd/lib/button";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import service from "../../../partials/services/axios.config";
import CurrencyTable from "./CurrencyTable";
import ModalAddAndEdit from "./ModalAddAndEdit";
import { toast } from "react-toastify";
import Modal from "antd/lib/modal";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../utils/helper/TableHelpers";

function CurrencyConfig(props) {
  const isAdmin = useSelector(
    (state: RootState) => state.account.userData.isAdmin
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
  const [listData, setListData] = useState<any>([]);
  const [editedData, setEditedData] = useState({});

  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  useEffect(() => {
    setIsLoading(true);
    service.get("/exchange-rate").then(
      (res: any) => {
        setIsLoading(false);
        setListData(res.results || []);
      },
      () => setIsLoading(false)
    );
  }, []);

  const onAddCurrency = () => {
    setIsOpenModalAdd(true);
    setEditedData({});
  };

  const onEdit = (record) => {
    setIsOpenModalAdd(true);
    setEditedData(record);
  };

  const onDelete = (record) => {
    Modal.confirm({
      title: "Confirm",
      content: `Delete the ${record.currency} currency?`,
      onOk: () => handleDelete(record),
    });
  };

  const handleDelete = (record) => {
    setIsLoading(true);
    service
      .delete("/admin/exchange-rate", { params: { currency: record.currency } })
      .then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });

          const newListData = listData.filter(
            (el) => el.currency !== record.currency
          );
          setListData(newListData);
        },
        () => setIsLoading(false)
      );
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const filteredData = listData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col xs:flex-row">
        <div className="page-title">Currencies</div>
        {isAdmin && (
          <div className="mt-1 sm:mt-0">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAddCurrency}
            >
              Add Currency
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <CurrencyTable
          listData={filteredData}
          onEdit={onEdit}
          onDelete={onDelete}
          onSearchTable={onSearchTable}
          onFilterTable={onFilterTable}
          isAdmin={isAdmin}
        />
      </div>

      <ModalAddAndEdit
        isOpen={isOpenModalAdd}
        editedData={editedData}
        onClose={() => setIsOpenModalAdd(false)}
        setIsLoading={setIsLoading}
        setListData={setListData}
        listData={listData}
      />
    </Page>
  );
}

CurrencyConfig.propTypes = {};

export default CurrencyConfig;
