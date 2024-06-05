import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Transition from "../../utils/Transition";
import { FaRegBell } from "@react-icons/all-files/fa/FaRegBell";
import { FaRegBellSlash } from "@react-icons/all-files/fa/FaRegBellSlash";
import CheckCircleOutlined from "@ant-design/icons/lib/icons/CheckCircleOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/lib/icons/ExclamationCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/lib/icons/CloseCircleOutlined";
import Badge from "antd/lib/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  MESSAGE_DURATION,
  NOTIFICATION_TYPES,
  ORGANIZATION_PATH,
} from "../../constants/constants";
import service, { OG_CODE_HEADER } from "../services/axios.config";
import { getExternalUrl } from "../../utils/ProtectedRoutes";
import classNames from "classnames";
import { Client } from "@stomp/stompjs";
import { updateNotification } from "../../redux/socket/notificationSlice";
import Divider from "antd/lib/divider";
import { getBeforeTime } from "../../utils/Helpers";
import Switch from "antd/lib/switch";
import InfiniteScroll from "react-infinite-scroll-component";
import message from "antd/lib/message";
import Empty from "antd/lib/empty";
import Skeleton from "antd/lib/skeleton/Skeleton";

export const getNotificationTypeIcon = (data) => {
  const isSuccessType = data.type === NOTIFICATION_TYPES.success;
  const isErrType = data.type === NOTIFICATION_TYPES.error;
  const isWarningType = data.type === NOTIFICATION_TYPES.warning;

  return (
    <>
      {isSuccessType && (
        <CheckCircleOutlined className="text-base !text-green-600 mr-1" />
      )}
      {isErrType && (
        <CloseCircleOutlined className="text-base !text-red-500 mr-1" />
      )}
      {isWarningType && (
        <ExclamationCircleOutlined className="text-base !text-orange-500 mr-1" />
      )}
    </>
  );
};

// @ts-ignore
const SOCKET_URL = `${import.meta.env.VITE_WS_HOST}/ws-falcon-ua-api`;
const NOTICATION_MUTED = "notification-mute";

function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );
  const totalNotification = useSelector(
    (state: RootState) => state.notification.totalNotifications
  );

  const notificationUrl =
    ORGANIZATION_PATH + "/" + organizationCode + "/settings/notifications";
  const maxNotifications = 20;
  const getMutedStatus = () => {
    return localStorage.getItem(NOTICATION_MUTED) === "true" ? true : false;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationData, setNotificationData] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [isMuted, setIsMuted] = useState(getMutedStatus());

  const trigger = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    service.get("/notification/count").then(
      (res: any) => {
        if (res.results) {
          dispatch(updateNotification({ newValue: res.results }));
        }
      },
      () => {}
    );
  }, []);

  useEffect(() => {
    const onConnected = () => {
      const headers = { [OG_CODE_HEADER]: organizationCode };
      client.subscribe(
        `/topic/${organizationCode}/notification`,
        function (msg) {
          if (msg.body) {
            const jsonBody = JSON.parse(msg.body);

            if (!jsonBody) return;

            const { data } = jsonBody;
            if (data) {
              dispatch(updateNotification({}));
              if (data.popUp && !getMutedStatus()) {
                const messageText = data.createdBy + ": " + data.title;

                switch (data.type) {
                  case NOTIFICATION_TYPES.error:
                    return message.error(messageText, MESSAGE_DURATION);
                  case NOTIFICATION_TYPES.warning:
                    return message.warning(messageText, MESSAGE_DURATION);
                  default:
                    return message.success(messageText, MESSAGE_DURATION);
                }
              }
            }
          }
        },
        headers
      );
    };
    const onDisconnected = () => {};

    const client = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: onConnected,
      onDisconnect: onDisconnected,
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const getNoti = (page = 0) => {
    const params = { size: maxNotifications, page };
    setIsLoading(true);
    service.get("/notification", { params }).then(
      (res: any) => {
        setIsLoading(false);
        const newData = Array.isArray(res.results?.content)
          ? res.results?.content
          : [];
        const newTotalNoti = res.results?.totalElements;
        newTotalNoti !== totalData && setTotalData(newTotalNoti);

        if (!page) {
          setNotificationData(newData);
        } else {
          setNotificationData([...notificationData, ...newData]);
          setCurrentPage(page);
        }
      },
      () => setIsLoading(false)
    );
  };

  const onClose = () => {
    setDropdownOpen(false);
    if (totalNotification) {
      dispatch(updateNotification({ newValue: 0 }));
    }
  };

  const onToggle = () => {
    if (dropdownOpen) {
      onClose();
    } else {
      setDropdownOpen(true);
    }
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (
        !dropdownOpen ||
        !dropdown.current ||
        // @ts-ignore
        dropdown.current.contains(target) ||
        // @ts-ignore
        trigger.current.contains(target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      onClose();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const onClickBell = () => {
    onToggle();
    getNoti();
  };

  const goToNotificationPage = () => {
    onClose();

    setTimeout(() => {
      navigate(notificationUrl);
    }, 100);
  };

  const onMute = () => {
    localStorage.setItem(NOTICATION_MUTED, `${!isMuted}`);
    setIsMuted(!isMuted);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  let maxHeight = window.innerHeight - 160;
  if (window.innerHeight > 660) {
    maxHeight = 500;
  }

  return (
    <div className="sm:relative inline-flex ml-3">
      <button
        ref={trigger}
        className="w-8 h-8 flex items-center justify-center transition duration-150 rounded-full"
        aria-haspopup="true"
        onClick={onClickBell}
        aria-expanded={dropdownOpen}
        tabIndex={-1}
      >
        <div className="flex items-center">
          <Badge count={totalNotification}>
            {isMuted ? (
              <FaRegBellSlash size={32} className="cursor-pointer" />
            ) : (
              <FaRegBell size={26} className="cursor-pointer" />
            )}
          </Badge>
        </div>
      </button>

      <Transition
        className="origin-top-right z-10 absolute top-3/4 sm:top-full right-0 mr-1 sm:mr-0 w-[300px] bg-white border border-slate-200 py-1.5 rounded-lg shadow-custom1 overflow-hidden mt-1"
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          className="relative"
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={onClose}
        >
          <div className="flex justify-between pt-1.5 pb-2 px-4 border-b">
            <div className="text-sm text-slate-900 uppercase">
              Notifications
            </div>
            <Switch
              size="small"
              checked={!isMuted}
              onChange={onMute}
              title={
                isMuted ? "Turn on notifications" : "Turn off notifications"
              }
            />
          </div>

          {notificationData.length > 0 ? (
            <ul
              className="my-1 overflow-y-auto"
              style={{ maxHeight }}
              id="scrollableNotification"
            >
              <InfiniteScroll
                dataLength={notificationData.length}
                next={() => getNoti(currentPage + 1)}
                hasMore={totalData > notificationData.length}
                loader={<h4 className="ml-[22px] pr-4">Loading...</h4>}
                scrollableTarget="scrollableNotification"
              >
                {notificationData.map((data, idx) => {
                  const isNewNoti = totalNotification > idx;

                  return (
                    <React.Fragment key={idx}>
                      <li
                        className={classNames(
                          "flex py-1.5 pr-4",
                          isNewNoti ? "bg-slate-100" : "hover:bg-slate-50"
                        )}
                      >
                        {isNewNoti ? (
                          <div className="ml-2.5 mr-1.5 mt-[7px] w-1.5 h-1.5 bg-antPrimary rounded-full shrink-0" />
                        ) : (
                          <div className="ml-[22px]" />
                        )}
                        <div className="w-full">
                          <div className="text-sm mb-0.5 line-clamp-4">
                            <Link
                              className="block truncate"
                              to={getExternalUrl(
                                data.externalLink,
                                organizationCode
                              )}
                              // to={"/external-url/" + data.externalLink}
                              onClick={onClose}
                            >
                              {getNotificationTypeIcon(data)}
                              <span
                                className="font-bold text-slate-900 truncate"
                                title={data.createdBy}
                              >
                                {data.createdBy}:
                              </span>
                            </Link>
                            <div
                              className="text-slate-900 line-clamp-4 break-words"
                              title={data.description}
                            >
                              {data.description}
                            </div>
                          </div>

                          <Link
                            className="block !text-xs !text-slate-400"
                            to={getExternalUrl(
                              data.externalLink,
                              organizationCode
                            )}
                            onClick={onClose}
                          >
                            {getBeforeTime(data.createdDate)}
                          </Link>
                        </div>
                      </li>
                      {idx !== notificationData.length - 1 && (
                        <div className="mx-12">
                          <Divider className="!my-1" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </InfiniteScroll>
            </ul>
          ) : (
            <>
              {isLoading ? (
                <div className="py-6 pl-5 pr-4">
                  <div className="flex flex-col space-y-2">
                    <Skeleton.Node className="rounded !h-3 !w-2/3" active>
                      {" "}
                    </Skeleton.Node>
                    <Skeleton.Node className="rounded !h-3 !w-full" active>
                      {" "}
                    </Skeleton.Node>
                    <Skeleton.Node className="rounded !h-3 !w-5/6" active>
                      {" "}
                    </Skeleton.Node>
                  </div>

                  <div className="flex flex-col space-y-2 mt-6">
                    <Skeleton.Node className="rounded !h-3 !w-2/3" active>
                      {" "}
                    </Skeleton.Node>
                    <Skeleton.Node className="rounded !h-3 !w-full" active>
                      {" "}
                    </Skeleton.Node>
                  </div>
                </div>
              ) : (
                <Empty className="py-10" />
              )}
            </>
          )}

          <div className="px-4 pt-2 mb-1 border-t">
            <div
              className="text-antPrimary cursor-pointer"
              onClick={goToNotificationPage}
            >
              View all notifications
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default Notifications;
