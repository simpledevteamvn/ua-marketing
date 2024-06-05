import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import React, { useEffect, useState } from "react";
import AntInput from "antd/lib/input/Input";
import service from "../../partials/services/axios.config";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import GamePlatformIcon from "../../partials/common/GamePlatformIcon";
import Radio from "antd/lib/radio";
import { PLATFORMS, STORE } from "../../constants/constants";
import { capitalizeWord } from "../../utils/Helpers";
import { getTotalSelected } from "../../utils/helper/UIHelper";
import Pagination from "antd/lib/pagination/Pagination";
import Checkbox from "antd/lib/checkbox";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";

export default function ModalRecommendApp(props) {
  const { isOpen, onClose, setIsLoading, handleAddApps } = props;

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  });
  const [apps, setApps] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);

  const [search, setSearch] = useState<string>();
  const [debouncedFilter] = useDebounce(search, 300);
  const [activedStore, setActivedStore] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    // https://dev.to/purohitdheeraj/optimized-react-search-bar-5em6
    const newApps = apps.filter((el) => {
      const name = el.name?.toLowerCase() || "";
      const storeId = el.storeId?.toLowerCase() || "";
      const searchText = search?.toLowerCase();
      return name.includes(searchText) || storeId.includes(searchText);
    });
    setFilteredData(newApps);
  }, [debouncedFilter]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    service.get("/recommend-store-app").then(
      (res: any) => {
        setIsLoading(false);
        setApps(res?.results || []);
        setFilteredData(res?.results);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  const onSearchName = (e) => {
    setSearch(e.target.value);
  };

  const onSelectFlatform = (e) => {
    setActivedStore(e.target.value);
  };

  const onChangePagination = (page, pageSize) => {
    setPagination({ page, pageSize });
  };

  const onCheckGame = (id) => {
    const isExist = selectedIds.some((el) => el === id);
    let newSelectedIds;
    if (isExist) {
      newSelectedIds = selectedIds.filter((el) => el !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }
    setSelectedIds(newSelectedIds);
  };

  const onClearAll = () => {
    setSelectedIds([]);
  };

  const onSlectAll = () => {
    setSelectedIds(apps.map((el) => el.id));
  };

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSearch(undefined);
      setActivedStore("");
      setSelectedIds([]);
    }, 300);
  };

  const onAdd = () => {
    const params: any = { recommendIds: selectedIds.join(",") };
    if (selectedIds.length === apps.length) {
      params.recommendIds = "";
      params.all = true;
    }

    setIsLoading(true);
    service.post("/store-app/recommend", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseModal();
        handleAddApps(res.results);
      },
      () => setIsLoading(false)
    );
  };

  const Stores = Object.values(STORE).map((el) => ({
    ...el,
    label: el.platform === PLATFORMS.ios ? "IOS" : capitalizeWord(el.platform),
    value: el.name,
  }));
  const ListStores = [{ label: "All", value: "" }, ...Stores];

  let filteredApp = filteredData;
  if (activedStore) {
    filteredApp = filteredData.filter((el) => el.store === activedStore);
  }

  const { page, pageSize } = pagination;
  const min = pageSize * (page - 1);
  let max = pageSize * page;

  max = max + 1 > filteredApp.length ? filteredApp.length : max;
  const paginationApps = filteredApp.slice(min, max);

  return (
    <Modal
      title="Recommended apps"
      width={800}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          onClick={onAdd}
          disabled={!selectedIds?.length}
        >
          Add
        </Button>,
      ]}
    >
      <div className="flex items-center shrink-0 mb-2">
        <span className="mr-4">Filter by:</span>
        <Radio.Group onChange={onSelectFlatform} value={activedStore}>
          {ListStores.map((el, idx) => (
            <Radio value={el.value} key={idx}>
              {el.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <AntInput
        allowClear
        placeholder="App name / Package name"
        className="flex-1"
        prefix={<SearchOutlined />}
        value={search}
        onChange={onSearchName}
      />

      <div className="mt-3 flex justify-between items-center">
        {getTotalSelected(selectedIds)}
        <div className="flex space-x-3 font-semibold">
          <div
            className="cursor-pointer hover:text-gray-500"
            onClick={onSlectAll}
          >
            Select all
          </div>
          <div
            className="cursor-pointer hover:text-gray-500"
            onClick={onClearAll}
          >
            Clear all
          </div>
        </div>
      </div>

      {paginationApps?.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2 mt-3">
            {paginationApps.map((app) => {
              const { name, id } = app;
              return (
                <div
                  key={id}
                  className="flex items-center bg-white py-2 px-3 lg:px-4 rounded border shadow"
                >
                  <Checkbox
                    onChange={() => onCheckGame(id)}
                    checked={selectedIds.includes(id)}
                    className="!mr-3 lg:!mr-4"
                  />
                  <GamePlatformIcon
                    app={app}
                    imgClass="w-7 h-7 md:w-9 md:h-9 rounded-md shrink-0"
                  />
                  <div className="ml-5 truncate">
                    <div className="font-semibold text-black overflow-auto whitespace-normal line-clamp-2">
                      {name}
                    </div>
                    <div className="truncate text-xs2 text-slate-400">
                      {app.storeId}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            <Pagination
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              total={filteredApp.length}
              pageSize={pageSize}
              current={page}
              onChange={onChangePagination}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
