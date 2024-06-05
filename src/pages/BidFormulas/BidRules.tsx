import React, { useEffect, useState } from "react";
import service from "../../partials/services/axios.config";
import Page from "../../utils/composables/Page";
import SelectCountry from "../../partials/common/Forms/SelectCountry";
import { ALL_APP_OPTION } from "../../constants/constants";
import RulesTable from "./RulesTable";
import Button from "antd/lib/button";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import ModalConfirmDelete from "../../partials/common/ModalConfirmDelete";
import { toast } from "react-toastify";
import ModalAddAndEdit from "./ModalAddAndEdit";
import { useQuery } from "@tanstack/react-query";
import { LIST_STORE_APPS } from "../../api/constants.api";
import { getStoreApps } from "../../api/apps/apps.api";
import SelectStoreApp from "../../partials/common/Forms/SelectStoreApp";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import Select from "antd/lib/select";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../utils/helper/TableHelpers";

function BidRules(props) {
  const isAdmin = useSelector(
    (state: RootState) => state?.account?.userData?.isAdmin
  );
  const defaultPageSize = 10;
  const [isLoading, setIsLoading] = useState(true);

  const [activedCountries, setActivedCountries] = useState<any>([]);
  const [listStoreApps, setListStoreApps] = useState([]);
  const [activedApp, setActivedApp] = useState<string>();

  const [listCurrency, setListCurrency] = useState<any>([]);
  const [activedCurrency, setActivedCurrency] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [deletedRule, setDeletedRule] = useState<any>({});
  const [editedRule, setEditedRule] = useState<any>({});

  useEffect(() => {
    const getCurrencies = service.get("/rule-config/currency");
    const getRules = service.get("/rule-config");

    Promise.all([getCurrencies, getRules]).then(
      (res: any) => {
        setListCurrency(res[0].results || []);
        setTableData(res[1].results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, []);

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  const onChangeTableFilter = (pagination) => {
    const { pageSize, current } = pagination;

    setTableFilters({ size: pageSize, page: current - 1 });
  };

  const handleAddRuleCallback = (resData: any = {}, isEditMode) => {
    if (isEditMode && resData.id) {
      const removedIdx = tableData.findIndex((el) => el.id === resData.id);
      const newTableData = [...tableData];
      newTableData.splice(removedIdx, 1, resData);

      return setTableData(newTableData);
    }

    // Add mode
    const newTableData = [resData, ...tableData];
    setTableData(newTableData);
  };

  const onEdit = (record) => {
    setEditedRule(record);
    setIsOpenAddModal(true);
  };

  const handleCloseModalAddAndEdit = () => {
    setIsOpenAddModal(false);
    if (editedRule.id) {
      setEditedRule({});
    }
  };

  const onDelete = (record) => {
    setIsOpenDeleteModal(true);
    setDeletedRule(record);
  };

  const onCloseDeleteModal = () => {
    setIsOpenDeleteModal(false);

    setTimeout(() => {
      setDeletedRule({});
    }, 300);
  };

  const onSubmitDelete = () => {
    setIsLoading(true);
    service.delete(`/rule-config/${deletedRule.id}`).then(
      (res: any) => {
        const newTableData = tableData.filter((el) => el.id !== deletedRule.id);

        setTableData(newTableData);
        toast(res.message, { type: "success" });
        onCloseDeleteModal();
        setIsLoading(false);
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

  const filteredData = tableData.filter((el) => {
    let result = true;

    let isContainGame = true;
    if (activedApp) {
      if (activedApp === ALL_APP_OPTION) {
        isContainGame = Array.isArray(el?.storeApps) && !el.storeApps.length;
      } else {
        if (Array.isArray(el.storeApps)) {
          isContainGame = el.storeApps.some(
            (appDetail) => appDetail.storeId + appDetail.name === activedApp
          );
        } else {
          isContainGame = false;
        }
      }
    }

    let isContainCountry = true;
    if (activedCountries.length) {
      if (Array.isArray(el?.countries)) {
        isContainCountry = el?.countries.some((countryCode) =>
          activedCountries.includes(countryCode)
        );
      } else {
        isContainCountry = false;
      }
    }

    let isContainCurrency = true;
    if (activedCurrency.length) {
      if (!el.currency || !activedCurrency.includes(el.currency)) {
        isContainCountry = false;
      }
    }

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (
      !isContainGame ||
      !isContainCountry ||
      !isContainCurrency ||
      !isContainText ||
      !checkValue
    ) {
      result = false;
    }

    return result;
  });

  const totalElements = filteredData?.length;

  return (
    <Page>
      <div className="flex justify-between">
        <div className="tab-title">Rules</div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={(e) => setIsOpenAddModal(true)}
        >
          Add Rule
        </Button>
      </div>

      <div className="tab-filter">
        <SelectStoreApp
          hasAllOpt={true}
          classNames="filter-item xs:w-[250px]"
          listApp={listStoreApps}
          activedApp={activedApp}
          setActivedApp={setActivedApp}
        />

        <SelectCountry
          placeholder="Select countries"
          classNames="filter-item xs:w-[220px]"
          value={activedCountries}
          onChange={setActivedCountries}
          acceptOnlyAll={true}
        />

        <Select
          className="filter-item w-full xs:w-[200px]"
          placeholder="Select currency"
          mode="multiple"
          allowClear
          value={activedCurrency}
          onChange={setActivedCurrency}
          maxTagCount="responsive"
        >
          {listCurrency.map((data) => (
            <Select.Option key={data}>{data}</Select.Option>
          ))}
        </Select>
      </div>

      <div className="page-section">
        Available Rules
        {totalElements > 0 && <span> ({totalElements})</span>}
      </div>

      <RulesTable
        isAdmin={isAdmin}
        isLoading={isLoading}
        listData={filteredData}
        totalData={totalElements}
        onChangeFilter={onChangeTableFilter}
        onFilterTable={onFilterTable}
        onSearchTable={onSearchTable}
        tableFilters={tableFilters}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <ModalAddAndEdit
        isOpen={isOpenAddModal}
        setIsLoading={setIsLoading}
        onClose={handleCloseModalAddAndEdit}
        onSubmit={handleAddRuleCallback}
        editedRule={editedRule}
        listCurrency={listCurrency}
        listStoreApps={listStoreApps}
        isAdmin={isAdmin}
      />

      <ModalConfirmDelete
        isOpen={isOpenDeleteModal}
        onClose={onCloseDeleteModal}
        onSubmit={onSubmitDelete}
        targetName={"Confirm"}
      />
    </Page>
  );
}

export default BidRules;
