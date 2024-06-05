import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "antd/lib/button";
import Empty from "antd/lib/empty";
import AntInput from "antd/lib/input/Input";
import Radio from "antd/lib/radio";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getStoreAppsWithDetailData } from "../../api/apps/apps.api";
import { LIST_STORE_APPS, WITH_DETAIL_DATA } from "../../api/constants.api";
import { ORGANIZATION_PATH } from "../../constants/constants";
import GamePlatformIcon from "../../partials/common/GamePlatformIcon";
import Input from "../../partials/elements/Input";
import Modal from "../../partials/elements/Modal";
import service from "../../partials/services/axios.config";
import { RootState } from "../../redux/store";
import Page from "../../utils/composables/Page";
import { addStoreApp } from "../../utils/helper/ReactQueryHelpers";
import { handleErrorImage } from "../../utils/Helpers";
import Loading from "../../utils/Loading";
import { numberWithCommas } from "../../utils/Utils";
import { AppChart } from "./AppChart";
import ModalRecommendApp from "./ModalRecommendApp";
import InfiniteScroll from "react-infinite-scroll-component";

const SortIds = {
  name: "0",
  nonOrganic: "1",
};
const SortData = [
  { value: SortIds.name, label: "App name" },
  { value: SortIds.nonOrganic, label: "Non-organic installs" },
];
const PAGE_SIZE = 20; // số lượng data lấy khi scroll

function Apps() {
  const defaultApp = {
    id: "",
    name: "",
    icon: "",
  };
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalAddApp, setIsOpenModalAddApp] = useState(false);
  const [isRecommendApp, setIsRecommendApp] = useState(false);
  const [appUrl, setAppUrl] = useState("");
  const [appInfo, setAppInfo] = useState(defaultApp);

  const [listApp, setListApp] = useState<any>([]); // List apps from api
  const [filteredApps, setFilteredApps] = useState([]); // List apps sau khi search name và xử lý sort
  const [apps, setApps] = useState([]); // List apps hiển thị sau khi dùng lazy load
  const [currentPage, setCurrentPage] = useState(0);
  const [sortType, setSortType] = useState(SortIds.name);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (state) {
      setSortType(state.sortType || SortIds.name);
      setSearch(state.search || "");
    }
    // https://stackoverflow.com/questions/40099431/how-do-i-clear-location-state-in-react-router-on-page-reload
    window.history.replaceState({}, document.title);
  }, []);

  const { data: storeAppRes, isLoading: isLoadingApp } = useQuery({
    queryKey: [LIST_STORE_APPS, WITH_DETAIL_DATA],
    queryFn: getStoreAppsWithDetailData,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    const newData = storeAppRes?.results || [];
    setListApp(newData);
    onSearchName("", newData);
  }, [storeAppRes]);

  const onSubmit = () => {
    setIsLoading(true);
    service.post("/store-app", appInfo).then(
      (res: any) => {
        addStoreApp(queryClient, res.results);
        onCloseModal();
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const getApp = (url = appUrl) => {
    if (!url) return;

    service.get("/store-app/information", { params: { url } }).then(
      (res: any) => {
        setAppInfo(res.results);
      },
      () => setAppInfo(defaultApp)
    );
  };

  const onCloseModal = () => {
    setIsOpenModalAddApp(false);
    setTimeout(() => {
      setAppUrl("");
      setAppInfo(defaultApp);
    }, 300);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.target.blur();
    }
  };

  const onKeyUp = (e) => {
    if (e.ctrlKey && e.key == "v") {
      // Ctrl+V is pressed.
      getApp(e.target.value);
    }
  };

  const onSearchName = (value, data = listApp) => {
    const initedData = [...data];
    const newApp: any = !value
      ? initedData
      : initedData.filter((app) => {
          const name = app.name?.toLowerCase() || "";
          const storeId = app.storeId?.toLowerCase() || "";
          return ("" + name + storeId).includes(value);
        });

    if (newApp.length) {
      newApp.sort(sortApp);
    }

    value !== search && setSearch(value);
    setFilteredApps(newApp);
    getData(0, newApp);
  };

  const onChangeSortType = (value) => {
    const newApp = [...filteredApps];
    newApp.sort((a, b) => sortApp(a, b, value));

    setSortType(value);
    setFilteredApps(newApp);
    getData(0, newApp);
  };

  const sortApp = (a, b, type = sortType) => {
    if (type === SortIds.name) {
      return ("" + a.name).localeCompare(b.name);
    }

    let aNonOrganic = a.installsDetail?.nonOrganicTotal;
    let bNonOrganic = b.installsDetail?.nonOrganicTotal;
    aNonOrganic = aNonOrganic === 0 ? aNonOrganic : aNonOrganic || -1;
    bNonOrganic = bNonOrganic === 0 ? bNonOrganic : bNonOrganic || -1;
    return bNonOrganic - aNonOrganic;
  };

  const handleAddApps = (apps) => {
    const newData = [...listApp, ...apps];
    setListApp(newData);
    onSearchName("", newData);
  };

  const getData = (page = 0, list = filteredApps) => {
    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageData = list.slice(startIndex, endIndex);

    if (!page) {
      setApps(pageData);
      currentPage && setCurrentPage(0);
    } else {
      setApps([...apps, ...pageData]);
      setCurrentPage(page);
    }
  };

  const globalLoading = isLoading || isLoadingApp;

  return (
    <Page>
      {globalLoading && <Loading />}

      <div className="flex flex-col xs:flex-row justify-between">
        <div className="tab-title">Apps</div>

        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={(e) => setIsOpenModalAddApp(true)}
          >
            New App
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={(e) => setIsRecommendApp(true)}
          >
            Recommend App
          </Button>
        </div>
      </div>

      <div className="flex items-start md:items-center flex-col md:flex-row mt-2">
        <AntInput
          allowClear
          placeholder="App name / Package name"
          className="xs:!w-[255px]"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => onSearchName(e.target.value)}
        />

        <div className="flex items-start xs:items-center flex-wrap space-x-4 mt-2 md:mt-0 md:ml-4">
          <div>Sort by</div>

          <Radio.Group
            onChange={(e) => onChangeSortType(e.target.value)}
            value={sortType}
          >
            {SortData.map((el, idx) => (
              <Radio value={el.value} key={idx}>
                {el.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      </div>

      <div className="page-section">
        Available apps
        {!globalLoading && filteredApps.length > 0 && (
          <span> ({filteredApps.length})</span>
        )}
      </div>

      <div className="min-h-[100px]" key={sortType + search}>
        {!globalLoading &&
          (listApp.length === 0 || filteredApps.length === 0) && <Empty />}

        {filteredApps.length > 0 && (
          <InfiniteScroll
            dataLength={apps.length}
            next={() => getData(currentPage + 1)}
            hasMore={filteredApps.length > apps.length}
            loader={<h4 className="mt-2">Loading...</h4>}
            scrollableTarget="ScrollableApps"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app: any, idx) => {
                const appUrl =
                  ORGANIZATION_PATH +
                  "/" +
                  organizationCode +
                  "/apps/" +
                  app.id +
                  "/overview";

                const installsDetail = app.installsDetail || {};
                const { nonOrganicTotal, data } = installsDetail;
                const isShowInstallsData =
                  nonOrganicTotal === 0 ? true : nonOrganicTotal && data.length;
                const packageClass = "!text-slate-400 truncate";

                return (
                  <div
                    key={app.id}
                    className="flex items-center p-3 xs:p-5 pr-1 xs:pr-4 rounded-md shadow border md:min-h-[110px]"
                  >
                    <div className="flex items-center grow truncate">
                      <Link
                        to={appUrl}
                        state={{ sortType, search }}
                        className="shrink-0 mr-4"
                      >
                        <GamePlatformIcon app={app} />
                      </Link>

                      <div className="grow truncate ml-1 xs:ml-3 2xl:ml-5">
                        <Link
                          to={appUrl}
                          state={{ sortType, search }}
                          className="xs:text-base sm:text-lg md:text-xl font-bold !text-black hover:!text-indigo-600 whitespace-normal line-clamp-3 xs:line-clamp-2"
                        >
                          {app.name}
                        </Link>

                        {app.url ? (
                          <a
                            href={app.url}
                            className={packageClass}
                            title="View the game in the store"
                            target="_blank"
                          >
                            {app.storeId}
                          </a>
                        ) : (
                          <div className={packageClass}>{app.storeId}</div>
                        )}
                      </div>
                    </div>
                    {isShowInstallsData && (
                      <div className="w-24 md:w-28 2xl:w-32 shrink-0 text-center text-xs2 ml-2">
                        <div>Non-organic installs</div>
                        <div>{numberWithCommas(nonOrganicTotal)}</div>
                        <div className="h-6 xs:h-8 sm:h-10 sm:mt-3">
                          <AppChart data={data} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </InfiniteScroll>
        )}
      </div>

      <ModalRecommendApp
        isOpen={isRecommendApp}
        onClose={() => setIsRecommendApp(false)}
        setIsLoading={setIsLoading}
        handleAddApps={handleAddApps}
      />

      <Modal
        title="New app"
        isOpen={isOpenModalAddApp}
        onClose={onCloseModal}
        submitLabel="Add"
        onSubmit={onSubmit}
        disabled={!appUrl || !appInfo?.name}
      >
        <div className="">
          <Input
            id="appUrl"
            value={appUrl}
            onChange={setAppUrl}
            inputClassName="input-light-antd"
            label="URL to your app on App Store / Play Store"
            placeholder="Store URL"
            required
            className="py-2"
            onBlur={(e) => getApp()}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
        </div>

        {appInfo?.name && (
          <div className="mt-6 flex flex-col items-center">
            <img
              alt=" "
              src={appInfo.icon}
              className="h-40 w-40 rounded"
              referrerPolicy="no-referrer"
              onError={handleErrorImage}
            />
            <div className="my-3 text-black font-bold text-xl">
              {appInfo.name}
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}

export default Apps;
