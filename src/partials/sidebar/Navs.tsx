import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Link, useParams } from "react-router-dom";
import SidebarLinkGroup from "../SidebarLinkGroup";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { APP_PATH, ORGANIZATION_PATH, STORE } from "../../constants/constants";

function Navs(props) {
  const urlParams = useParams();
  const isAdmin = useSelector(
    (state: RootState) => state.account.userData.isAdmin
  );
  const organization = useSelector(
    (state: RootState) => state.account.userData.organization
  );

  const {
    listConfigs,
    isDetailApp,
    sidebarExpanded,
    setSidebarExpanded,
    onClickTab,
    onMouseEnter,
    activedNav,
    initActivedSubNav,
    appState,
  } = props;

  const orgUrl = ORGANIZATION_PATH + "/" + organization.code;
  const appUrl = APP_PATH + "/" + urlParams.appId;
  const baseUrl = isDetailApp ? orgUrl + appUrl : orgUrl;

  return (
    <ul className="mt-3">
      {listConfigs.map((navObj) => {
        const { id, url, label, iconEl, children, checkAdmin, checkIOS } =
          navObj;
        const isActivedTab = activedNav === id;
        const hasChildren = children && children.length > 1;

        if (checkIOS && appState?.store !== STORE.apple.name) return;
        if (checkAdmin && !isAdmin) return;

        const navLabel = (
          <div className="flex items-center">
            <div className="h-5 w-5">{iconEl}</div>
            <div className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {label}
            </div>
          </div>
        );

        if (!hasChildren) {
          return (
            <li
              key={id}
              className={classNames(
                "rounded-sm mb-0.5 last:mb-0 !text-white",
                isActivedTab && "bg-sky-600",
                !isActivedTab && "hover:bg-sky-900"
              )}
            >
              <Link
                to={baseUrl + url}
                className="px-3 py-2 block !text-white truncate transition duration-150 cursor-pointer"
                onClick={() => onClickTab(id)}
                onMouseEnter={() => onMouseEnter(id, url)}
              >
                {navLabel}
              </Link>
            </li>
          );
        }

        return (
          <li key={id} className="mb-0.5 last:mb-0">
            <SidebarLinkGroup
              isAdmin={isAdmin}
              navLabel={navLabel}
              activecondition={isActivedTab}
              data={children}
              sidebarExpanded={sidebarExpanded}
              setSidebarExpanded={setSidebarExpanded}
              onClick={() => onClickTab(id)}
              initNav={initActivedSubNav}
              baseUrl={baseUrl}
              onMouseEnter={(url) => onMouseEnter(id, url)}
            />
          </li>
        );
      })}
    </ul>
  );
}

Navs.propTypes = {
  listConfigs: PropTypes.array,
  activedNav: PropTypes.number,
  initActivedSubNav: PropTypes.string,
  isDetailApp: PropTypes.bool,
  sidebarExpanded: PropTypes.bool,
  setSidebarExpanded: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onClickTab: PropTypes.func,
  appState: PropTypes.object,
};

export default Navs;
