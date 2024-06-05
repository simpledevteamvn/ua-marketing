import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Button from "antd/lib/button";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Table from "antd/lib/table";
import getTableColumns from "./TableColumns";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import AntInput from "antd/lib/input";
import { Link } from "react-router-dom";
import { ORGANIZATION_PATH } from "../../../constants/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import service from "../../../partials/services/axios.config";
import { getListAdNetwork } from "../../../api/common/common.api";
import { LIST_AD_NETWORK } from "../../../api/constants.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { RULE_STATUS } from "./constants";
import AddAutomatedRules from "./AddAutomatedRules";
import Dropdown from "antd/lib/dropdown";
import ModalRuleTarget from "./ModalRuleTarget/ModalRuleTarget";

function AutomatedRules(props) {
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useState(getTableColumns({}));
  const [tableData, setTableData] = useState<any>({});
  const [listAdNetwork, setListAdNetwork] = useState([]);
  const [targetedRule, setTargetedRule] = useState<any>({});

  const [search, setSearch] = useState<string>();
  const [recentedSearch, setRecentedSearch] = useState<string[]>([]);

  const defaultPageSize = 20;
  const [tableFilters, setTableFilters] = useState({
    page: 0,
    size: defaultPageSize,
  });
  const [editedData, setEditedData] = useState<any>({});

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);

  useEffect(() => {
    setColumns(
      getTableColumns({
        onEdit,
        onDelete,
        onChangeStatus,
        listAdNetwork,
        setTaget,
      })
    );
  }, [listAdNetwork, tableData]);

  useEffect(() => {
    const getSearchHistory = service.get("/automated-rules/search-history");
    Promise.all([getSearchHistory]).then((res: any) => {
      setRecentedSearch(res[0].results || []);
    });
  }, []);

  useEffect(() => {
    getTableData();
  }, [tableFilters]);

  const onChangeStatus = (rd) => {
    const active = rd.status === RULE_STATUS.active ? false : true;
    setIsLoading(true);
    service
      .put(`/automated-rules/${rd.id}/status`, null, {
        params: { active },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });

          const newTableData = tableData.content?.map((el) => {
            if (el.id === rd.id) {
              return {
                ...el,
                status: active ? RULE_STATUS.active : RULE_STATUS.inactive,
              };
            }
            return el;
          });
          setTableData({ ...tableData, content: newTableData });
        },
        () => setIsLoading(false)
      );
  };

  const onEdit = (rd) => {
    setEditedData(rd);
  };

  const onDelete = (rd) => {
    setIsLoading(true);
    service.delete(`/automated-rules/${rd.id}`).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        getTableData();
      },
      () => setIsLoading(false)
    );
  };

  const setTaget = (rd) => {
    setTargetedRule(rd);
  };

  const getTableData = () => {
    const params = {
      page: tableFilters.page,
      pageSize: tableFilters.size,
      search,
    };

    setIsLoading(true);
    service.get("/automated-rules", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setTableData(res.results || {});
      },
      () => setIsLoading(false)
    );
  };

  const onSearch = () => {
    getTableData();
    if (search) {
      setTimeout(() => {
        let newHistory;
        if (!recentedSearch?.length) {
          newHistory = [search];
        } else if (!recentedSearch.includes(search)) {
          newHistory = [search, ...recentedSearch].slice(0, 10);
        } else {
          const filteredData = recentedSearch.filter((el) => el !== search);
          newHistory = [search, ...filteredData];
        }
        setRecentedSearch(newHistory);
      }, 200);
    }
  };

  const onChange = (pagination, filters) => {
    const { pageSize, current } = pagination;

    if (pageSize !== tableFilters.size || current - 1 !== tableFilters.page) {
      setTableFilters({ size: pageSize, page: current - 1 });
    }
  };

  const updateEditRule = (newData) => {
    const filteredData = tableData.content?.filter(
      (el) => el.id !== newData.id
    );
    setTableData({ ...tableData, content: [newData, ...filteredData] });
  };

  const updateTarget = (newData) => {
    const filteredData = tableData.content?.filter(
      (el) => el.id !== newData.id
    );
    setTableData({ ...tableData, content: [newData, ...filteredData] });
  };

  const pagination = {
    pageSize: tableFilters?.size,
    current: tableFilters?.page + 1,
    total: tableData?.totalElements,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  const InputSearch = (
    <AntInput
      allowClear
      placeholder="Search"
      className="filter-item xs:!w-[255px]"
      prefix={<SearchOutlined />}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );

  return (
    <Page>
      <div className="flex justify-between">
        <div className="tab-title">Automated Rules</div>
        <Link to={`${ORGANIZATION_PATH}/${organizationCode}/add-rules`}>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Rule
          </Button>
        </Link>
      </div>

      <div className="tab-filter">
        {recentedSearch?.length > 0 ? (
          <Dropdown
            trigger={["click"]}
            overlayClassName="custom-dropdown-size"
            menu={{
              selectable: true,
              items: [
                {
                  key: "default",
                  type: "group",
                  label: "Recent search",
                  children: recentedSearch?.map((text) => ({
                    key: text,
                    label: text,
                  })),
                },
              ],
              onClick: (item) => setSearch(item.key),
            }}
            placement="bottomLeft"
          >
            {InputSearch}
          </Dropdown>
        ) : (
          InputSearch
        )}

        <Button type="primary" className="filter-item" onClick={onSearch}>
          Search
        </Button>
      </div>

      <Table
        className="mt-4 -mb-4"
        size="middle"
        loading={isLoading}
        rowKey={(record) => record.id}
        // @ts-ignore
        columns={columns}
        dataSource={tableData?.content || []}
        scroll={{ x: 1000 }}
        pagination={pagination}
        onChange={onChange}
      />

      <AddAutomatedRules
        data={editedData}
        isOpen={!!editedData?.id}
        onClose={() => setEditedData({})}
        updateCb={updateEditRule}
      />

      <ModalRuleTarget
        data={targetedRule}
        onClose={() => setTargetedRule({})}
        updateCb={updateTarget}
      />
    </Page>
  );
}

export default AutomatedRules;
