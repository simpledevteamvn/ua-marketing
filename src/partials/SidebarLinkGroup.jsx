import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { BiChevronDown } from "@react-icons/all-files/bi/BiChevronDown";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function SidebarLinkGroup({
  navLabel,
  data,
  activecondition,
  sidebarExpanded,
  setSidebarExpanded,
  onClick,
  initNav,
  baseUrl,
  onMouseEnter,
  isAdmin,
}) {
  const [open, setOpen] = useState(activecondition);
  const [isActivedSubNav, setIsActivedSubNav] = useState("");

  const handleClick = () => {
    setOpen(!open);
  };

  useEffect(() => {
    setIsActivedSubNav(initNav);
    setOpen(activecondition);
  }, [initNav]);

  return (
    <>
      <div
        className={classNames(
          "px-3 py-2 rounded-sm cursor-pointer block text-white transition-none truncate",
          activecondition && "bg-sky-600",
          !activecondition && "hover:bg-sky-900"
        )}
        onClick={(e) => {
          e.preventDefault();
          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
        }}
      >
        <div className="flex items-center justify-between">
          {navLabel}
          <BiChevronDown
            size="24"
            className={classNames(
              "transition-all duration-200 ease-in-out",
              open && "rotate-180"
            )}
          />
        </div>
      </div>
      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
        <ul className={classNames("mt-1", !open && "hidden")}>
          {data.map((item, idx) => {
            if (item.checkAdmin && !isAdmin) {
              return <React.Fragment key={idx}></React.Fragment>;
            }

            return (
              <li className="py-0.5 last:mb-1" key={idx}>
                <Link
                  to={baseUrl + item.url}
                  onClick={() => {
                    onClick && onClick();
                    setIsActivedSubNav(item.url);
                  }}
                  onMouseEnter={() => onMouseEnter(item.url)}
                  className="block text-slate-400 hover:text-sky-700 transition-none truncate cursor-pointer"
                >
                  <span
                    className={classNames(
                      "text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 pl-12 ",
                      activecondition &&
                        item.url === isActivedSubNav &&
                        "text-sky-600"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

SidebarLinkGroup.propTypes = {
  activecondition: PropTypes.bool,
};

export default SidebarLinkGroup;
