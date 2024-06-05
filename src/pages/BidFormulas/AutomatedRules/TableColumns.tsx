import React from "react";
import { capitalizeWord, getLabelFromStr } from "../../../utils/Helpers";
import { ACTIONS, ACTION_IDS, FREQUENCY_IDS, RULE_STATUS } from "./constants";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import Popconfirm from "antd/lib/popconfirm";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import Switch from "antd/lib/switch";
import { showListData } from "../../../utils/helper/UIHelper";
import { getTableTitleWithTooltip } from "../../../partials/common/Table/Header";
import { message } from "antd";
import { TARGET_REQUIRED } from "../../../constants/formMessage";

export default function getTableColumns(props) {
  const { onEdit, onDelete, onChangeStatus, listAdNetwork, setTaget } = props;

  const tabletScreen = window.innerWidth < 900 && window.innerWidth > 600;

  return [
    { title: "Name", dataIndex: "name" },
    {
      title: "Created by",
      render: (record) => (
        <div className="whitespace-nowrap md:whitespace-normal">
          {record.createdBy}
        </div>
      ),
    },
    {
      title: "Networks",
      render: (rd) => {
        if (!rd.networks?.length) return;

        const listNetworks: string[] = [];
        rd.networks.forEach((code) => {
          const networkName = listAdNetwork?.find(
            (el) => el.code === code
          )?.name;

          if (networkName) {
            listNetworks.push(networkName);
          }
        });

        return showListData(listNetworks, "network");
      },
    },
    {
      title: "Targets",
      render: (rd) => {
        const target = rd.target || {};
        const { targetGroupIds, targetIds, targetType } = target;
        const totalGroup = targetGroupIds?.length;
        const totalData = targetIds?.length;
        const hasTarget = totalGroup || totalData;

        return (
          <div className="flex justify-between items-center">
            <div>
              <div>{targetType}</div>
              {hasTarget ? (
                <div className="text-xs2 leading-3 text-slate-600">
                  {totalGroup > 0 && (
                    <span>
                      {totalGroup} {totalGroup === 1 ? "group" : "groups"}
                    </span>
                  )}
                  {totalGroup > 0 && totalData > 0 && " + "}
                  {totalData > 0 && <span>{totalData} target</span>}
                </div>
              ) : (
                <div className="text-xs2 leading-3 text-red-600">Not set</div>
              )}
            </div>
            <AiOutlineEdit
              size={18}
              className="text-antPrimary/90 hover:text-antPrimary cursor-pointer"
              onClick={() => setTaget(rd)}
            />
          </div>
        );
      },
    },
    {
      title: getTableTitleWithTooltip(
        "Rule actions",
        "Notification is default action"
      ),
      render: (rd) => {
        if (!rd.actions?.length) return;
        const list: string[] = [];

        rd.actions.forEach((obj) => {
          const activedData = ACTIONS.find((el) => el.value === obj.actionType);
          if (activedData?.label && obj.actionType !== ACTION_IDS.noti) {
            list.push(activedData.label);
          }
        });
        return capitalizeWord(list?.join(", ")?.toLowerCase());
      },
    },
    {
      title: "Execution frequency",
      render: (rd) => {
        const { executionFrequency } = rd;
        if (!executionFrequency) return;
        return (
          executionFrequency.value +
          " " +
          executionFrequency.type?.toLowerCase()
        );
      },
    },
    {
      title: "Check scheduled",
      render: (rd) => {
        if (!rd.checkScheduled) return;
        const { frequency, specificTimes } = rd.checkScheduled;
        // const type = getLabelFromStr(frequency);

        // if (frequency === FREQUENCY_IDS.hourly) return type;
        // if (frequency === FREQUENCY_IDS.daily) return type + ;

        // let contentEl: string[] = [];
        // specificTimes?.forEach((obj) => {
        //   switch (frequency) {
        //     case FREQUENCY_IDS.daily:
        //       contentEl.push(obj.time);
        //       break;
        //     case FREQUENCY_IDS.weekly:
        //       contentEl.push(capitalizeWord(obj.dayOfWeek) + " " + obj.time);
        //       break;

        //     case FREQUENCY_IDS.hourly:
        //     default:
        //       break;
        //   }
        // });

        return (
          <div>
            <div>{getLabelFromStr(frequency)}</div>
            {/* {contentEl?.length > 0 &&
              contentEl.map((el: string) => (
                <div key={el} className="text-xs2">
                  {el}
                </div>
              ))} */}
          </div>
        );
      },
    },
    {
      title: "Action",
      width: tabletScreen ? 120 : undefined,
      fixed: tabletScreen ? "right" : undefined,
      align: "center",
      render: (rd) => {
        const isRunning = rd.status === RULE_STATUS.active;
        const hasTarget =
          !rd.target?.targetGroupIds?.length && !rd.target?.targetIds?.length;
        let switchComp;

        if (hasTarget && !isRunning) {
          switchComp = (
            <Switch
              onChange={() => message.error(TARGET_REQUIRED)}
              style={{ backgroundColor: isRunning ? "#16a34a" : "#d6d3d1" }}
              size="small"
              checked={isRunning}
            />
          );
        } else {
          switchComp = (
            <Popconfirm
              placement="left"
              title={`${isRunning ? "Pause" : "Run"} this rule?`}
              onConfirm={() => onChangeStatus(rd)}
              okText="Yes"
              cancelText="No"
            >
              <Switch
                style={{ backgroundColor: isRunning ? "#16a34a" : "#d6d3d1" }}
                size="small"
                checked={isRunning}
              />
            </Popconfirm>
          );
        }

        return (
          <div className="flex items-center justify-center space-x-2">
            <Tooltip title={isRunning ? "Pause" : "Run"}>{switchComp}</Tooltip>
            <Tooltip title="Edit rule">
              <AiOutlineEdit
                size={20}
                className="text-slate-600 hover:text-antPrimary cursor-pointer"
                onClick={() => onEdit(rd)}
              />
            </Tooltip>
            <Popconfirm
              placement="left"
              title="Are you sure to delete this rule?"
              onConfirm={() => onDelete(rd)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete rule">
                <DeleteOutlined className="icon-danger text-xl cursor-pointer" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
}
