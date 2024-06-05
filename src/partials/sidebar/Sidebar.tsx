import React, {
  useState,
  useEffect,
  useRef,
  startTransition,
  useLayoutEffect,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
// @ts-ignore
import logo from "../../images/logo/logo.svg";
import {
  APP_PATH,
  ORGANIZATION_PATH,
  SIDEBAR_EXPANDED,
} from "../../constants/constants";
import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { getLastSlug, getSubOrganizationUrl } from "../../utils/Helpers";
import { RootState } from "../../redux/store";
import { BiArrowBack } from "@react-icons/all-files/bi/BiArrowBack";
import GamePlatformIcon from "../common/GamePlatformIcon";
import { useQuery } from "@tanstack/react-query";
import { getStoreAppById } from "../../api/common/common.api";
import { GET_STORE_APP_BY_ID, LIST_STORE_APPS } from "../../api/constants.api";
import Skeleton from "antd/lib/skeleton/Skeleton";
import Transition from "../../utils/Transition";
import Navs from "./Navs";
import Drawer from "antd/lib/drawer";
import { updateExpanded } from "../../redux/sidebar/sidebarSlice";
import { getStoreApps } from "../../api/apps/apps.api";
import SelectStoreApp, { getActivedApp } from "../common/Forms/SelectStoreApp";
import SwapOutlined from "@ant-design/icons/lib/icons/SwapOutlined";

export function useWindowSize() {
  // https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  listConfigs,
  isDetailApp,
  isOpenMobileMenu,
  setIsOpenMobileMenu,
}) {
  const urlParams = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const organization = useSelector(
    (state: RootState) => state.account.userData.organization
  );
  const orgUrl = ORGANIZATION_PATH + "/" + organization.code;

  const { state } = location;
  const trigger = useRef(null);
  const sidebar = useRef(null);

  const [activedNav, setActivedNav] = useState(-1);
  const [initActivedSubNav, setInitActivedSubNav] = useState("");
  const [appState, setAppState] = useState<any>({});
  const [activedApp, setActivedApp] = useState<string>();
  const [listStoreApps, setListStoreApps] = useState([]);
  const [isShowSelectApp, setIsShowSelectApp] = useState(false);

  const storedSidebarExpanded = localStorage.getItem(SIDEBAR_EXPANDED);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );
  const [width] = useWindowSize();

  useEffect(() => {
    if (width > 1536 && !sidebarExpanded) {
      setSidebarExpanded(true);
    }
    if (width > 1024 && isOpenMobileMenu) {
      // hidden mobile sidebar
      setIsOpenMobileMenu(false);
    }
  }, [width]);

  const { data: storeAppRes } = useQuery({
    queryKey: [GET_STORE_APP_BY_ID, urlParams.appId],
    queryFn: getStoreAppById,
    staleTime: 5 * 60000,
    enabled: !!urlParams.appId,
  });

  useEffect(() => {
    setAppState(storeAppRes?.results || {});
  }, [storeAppRes]);

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
    enabled: !!appState?.id,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        // @ts-ignore
        sidebar.current.contains(target) ||
        // @ts-ignore
        trigger.current.contains(target)
      ) {
        return;
      }
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_EXPANDED, String(sidebarExpanded));
    setTimeout(() => {
      // Wait until the transition is over (300ms)
      dispatch(updateExpanded(sidebarExpanded));
    }, 300);

    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    updateActivedTab();
  }, [window.location.pathname]);

  const updateActivedTab = () => {
    const pathname = window.location.pathname;
    const listTab = [...listConfigs];
    let lastSlug = getSubOrganizationUrl(pathname);
    let activedTab;
    let activedSubTab = "";

    if (isDetailApp) {
      // (isDetailApp = true) when the routes of the apps is matched
      // E.g: lastSlug = apps/637def4fd3fd723d7448aaa2/overview
      // E.g: lastSlug = apps/637def4fd3fd723d7448aaa2/campaign-control/635b85ccd5a1ee08ad55e13a
      // -> Remove logic that get data with last of slug
      // lastSlug = "/" + getLastSlug(pathname);
    }

    listTab.forEach((tab) => {
      if (!tab.children?.length) {
        if (lastSlug.includes(tab.url)) {
          activedTab = tab.id;
        }
        if (tab.subUrl?.length) {
          const isExist = tab.subUrl.some((str) => lastSlug.includes(str));
          if (isExist) {
            activedTab = tab.id;
          }
        }
        return;
      }

      tab.children.forEach((child) => {
        if (lastSlug.includes(child.url)) {
          activedTab = tab.id;
          activedSubTab = child.url;
        }
      });
    });
    setActivedNav(activedTab);
    setInitActivedSubNav(activedSubTab);
  };

  const onClickTab = (tabId, url = "") => {
    if (tabId === activedNav) return;
    isOpenMobileMenu && setIsOpenMobileMenu(false);

    startTransition(() => {
      setActivedNav(tabId);
    });
  };

  const onMouseEnter = (id, url) => {
    const activedTab = listConfigs.find((el) => el.id === id);
    if (activedTab?.preload) {
      return activedTab.preload();
    }

    if (activedTab?.children) {
      const activedChildren = activedTab?.children.find((el) => el.url === url);

      activedChildren?.preload && activedChildren?.preload();
    }
  };

  const onEnableSelectApp = () => {
    setActivedApp(appState.storeId + appState.name);
    setIsShowSelectApp(true);
  };

  const onDisableSelectApp = () => {
    setActivedApp(undefined);
    setIsShowSelectApp(false);
  };

  const onSelectAnotherApp = (value) => {
    setActivedApp(value);
    setIsShowSelectApp(false);

    if (!value) return;
    const activedAppData = getActivedApp(listStoreApps, value);
    const lastSlug = getLastSlug(window.location.pathname);
    let newUrl = orgUrl + APP_PATH + "/" + activedAppData.id + "/";

    const isExistSlug = listConfigs.some((el) => el.url?.includes(lastSlug));
    if (isExistSlug) {
      newUrl += lastSlug + window.location.search;
    } else {
      newUrl += "overview";
    }

    startTransition(() => {
      navigate(newUrl);
    });
  };

  const packageClass =
    "text-xs2 !text-slate-400 line-clamp-2 break-words mt-3 px-2";
  const sidebarContent = (
    <>
      <div
        className={classNames(
          "flex items-center mt-2",
          isDetailApp ? "mb-5" : "mb-6 md:mb-10"
        )}
      >
        <img src={logo} alt=" " className="w-11 h-11" />
        <Transition
          unmountOnExit
          show={sidebarExpanded}
          className="text-zinc-50 text-lg ml-3 transform ease-in"
          enterStart="opacity-0"
          entering="whitespace-nowrap"
          enterEndDelay="200"
          enterEnd="opacity-100"
          leaveStart="opacity-100"
          leaveEnd="opacity-0 whitespace-nowrap"
        >
          {organization.name}
        </Transition>
      </div>

      <div className="space-y-8">
        <div>
          {isDetailApp ? (
            <>
              <Link
                to={orgUrl + APP_PATH}
                state={state}
                className="flex items-center py-2.5 pl-4 text-sky-500 border-y border-slate-600/70 hover:text-sky-600"
              >
                <BiArrowBack
                  size={22}
                  title="All Apps"
                  className="flex-shrink-0"
                />
                <Transition
                  unmountOnExit
                  show={sidebarExpanded}
                  className="transform ease-in ml-2"
                  enterStart="opacity-0"
                  entering="whitespace-nowrap"
                  enterEndDelay="200"
                  enterEnd="opacity-100 whitespace-normal"
                  leaveStart="opacity-100"
                  leaveEnd="opacity-0 whitespace-nowrap"
                >
                  All Apps
                </Transition>
              </Link>
              {!appState?.id ? (
                <div className="my-7 flex items-center">
                  <Skeleton.Avatar active size={48} />
                  <div className="flex-1 ml-3.5">
                    <Skeleton.Node className="rounded !h-3 !w-full" active>
                      {" "}
                    </Skeleton.Node>
                    <Skeleton.Node className="rounded !h-3 !w-2/3 mt-1" active>
                      {" "}
                    </Skeleton.Node>
                  </div>
                </div>
              ) : (
                <div className={classNames("my-7", isShowSelectApp && "mb-9")}>
                  {isShowSelectApp ? (
                    <SelectStoreApp
                      listApp={listStoreApps}
                      activedApp={activedApp}
                      setActivedApp={onSelectAnotherApp}
                      onBlur={onDisableSelectApp}
                    />
                  ) : (
                    <div>
                      <div className="text-white flex items-center">
                        <div className="flex-1 flex items-center">
                          <GamePlatformIcon
                            app={appState}
                            imgClass="w-12 h-12 rounded-[0.75rem]"
                            iconClass="!right-[-10px] !bottom-[-3px] !h-5 !w-5 !bg-black/50 !text-white"
                          />
                          <Transition
                            unmountOnExit
                            show={sidebarExpanded}
                            className="text-base font-semibold ml-3.5 transform ease-in line-clamp-2"
                            enterStart="opacity-0"
                            entering="whitespace-nowrap"
                            enterEndDelay="200"
                            enterEnd="opacity-100 whitespace-normal"
                            leaveStart="opacity-100"
                            leaveEnd="opacity-0 whitespace-nowrap"
                          >
                            {appState.name}
                          </Transition>
                        </div>
                        <SwapOutlined
                          title="Select another app"
                          className="cursor-pointer text-lg ml-0.5"
                          onClick={onEnableSelectApp}
                        />
                      </div>

                      {appState.url ? (
                        <a
                          href={appState.url}
                          className={packageClass}
                          title="View the game in the store"
                          target="_blank"
                        >
                          {appState.storeId}
                        </a>
                      ) : (
                        <div className={packageClass}>{appState.storeId}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <h3 className="text-xs uppercase text-slate-500 font-semibold pl-3">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
              >
                •••
              </span>
              <span className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                Pages
              </span>
            </h3>
          )}

          <Navs
            listConfigs={listConfigs}
            isDetailApp={isDetailApp}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            onMouseEnter={onMouseEnter}
            onClickTab={onClickTab}
            activedNav={activedNav}
            initActivedSubNav={initActivedSubNav}
            appState={appState}
          />
        </div>
      </div>
    </>
  );

  return (
    <div>
      <Drawer
        className="MenuMobile"
        open={isOpenMobileMenu}
        placement="left"
        closable={false}
        onClose={() => setIsOpenMobileMenu(false)}
      >
        {sidebarContent}
      </Drawer>

      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-slate-800 p-4 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {sidebarContent}

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="px-3 py-2">
            <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="w-6 h-6 fill-current sidebar-expanded:rotate-180"
                viewBox="0 0 24 24"
              >
                <path
                  className="text-slate-400"
                  d="M19.586 11l-5-5L16 4.586 23.414 12 16 19.414 14.586 18l5-5H7v-2z"
                />
                <path className="text-slate-600" d="M3 23H1V1h2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
