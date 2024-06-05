import React, { useState } from "react";
import PropTypes from "prop-types";
import CompressOutlined from "@ant-design/icons/lib/icons/CompressOutlined";
import DownloadOutlined from "@ant-design/icons/lib/icons/DownloadOutlined";
import ExpandOutlined from "@ant-design/icons/lib/icons/ExpandOutlined";
import MoreOutlined from "@ant-design/icons/lib/icons/MoreOutlined";
import SettingOutlined from "@ant-design/icons/lib/icons/SettingOutlined";
import Popover from "antd/lib/popover";
import Tooltip from "antd/lib/tooltip";
import Checkbox from "antd/lib/checkbox";
import Typography from "antd/lib/typography";
import { CSVLink } from "react-csv";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { reorder } from "../../../utils/Helpers";
import ModalSettings from "./ModalSettings";

const { Text } = Typography;

function TableSettings(props) {
  const {
    columns,
    setColumns,
    hasFixedRight,
    dataSource,
    id,
    isSkanPage,
    additionalSetting,
    classNames,
    handleDownloadCSV,
    setColSettings,
    colSettings,
    treeColumns,
    dateRange,
    isModalSetting,
  } = props;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isSetting, setIsSetting] = useState(false);

  const onFullScreen = (value) => {
    const tableWrapperEl = document.getElementById(`TableWrapper--${id}`);
    if (!tableWrapperEl) return;

    if (value) {
      tableWrapperEl.classList.add("table-full-screen");
    } else {
      tableWrapperEl.classList.remove("table-full-screen");
    }
    setIsFullScreen(value);
  };

  return (
    <div className={`flex items-center space-x-2 text-lg ${classNames}`}>
      {additionalSetting}
      <Tooltip title="Table settings">
        {isModalSetting ? (
          <>
            <SettingOutlined onClick={() => setIsSetting(true)} />

            <ModalSettings
              tableId={id}
              isSkanPage={isSkanPage}
              isOpen={isSetting}
              onClose={() => setIsSetting(false)}
              treeColumns={treeColumns}
              columns={columns}
              colSettings={colSettings}
              setColSettings={setColSettings}
              dateRange={dateRange}
            />
          </>
        ) : (
          <Popover
            title="Column settings"
            placement="left"
            trigger="click"
            open={isOpenSettings}
            onOpenChange={(value) => setIsOpenSettings(value)}
            content={PopoverContent(
              columns,
              setColumns,
              hasFixedRight,
              colSettings,
              setColSettings
            )}
          >
            <SettingOutlined />
          </Popover>
        )}
      </Tooltip>

      {handleDownloadCSV && (
        <Tooltip title="Export CSV">
          <CSVLink
            data={dataSource}
            filename={id || "table"}
            className="flex items-center"
          >
            <DownloadOutlined className="!text-black/80" />
          </CSVLink>
        </Tooltip>
      )}

      <div className="items-center text-base hidden md:flex">
        {isFullScreen ? (
          <Tooltip title="Zoom out">
            <CompressOutlined onClick={() => onFullScreen(false)} />
          </Tooltip>
        ) : (
          <Tooltip title="Full screen">
            <ExpandOutlined onClick={() => onFullScreen(true)} />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

TableSettings.propTypes = {
  columns: PropTypes.array,
  dataSource: PropTypes.array,
  setColumns: PropTypes.func,
  hasFixedRight: PropTypes.bool,
  id: PropTypes.string,
  isSkanPage: PropTypes.bool,
  classNames: PropTypes.string,
  additionalSetting: PropTypes.node,
  handleDownloadCSV: PropTypes.func,
  setColSettings: PropTypes.func,
  colSettings: PropTypes.object,
  isModalSetting: PropTypes.bool,
  treeColumns: PropTypes.array,
  dateRange: PropTypes.array,
};

export default TableSettings;

const PopoverContent = (
  columns,
  setColumns,
  hasFixedRight,
  colSettings,
  setColSettings
) => {
  if (!columns?.length) return <></>;

  const listFixedLeft: any[] = [];
  const listNotFixed: any[] = [];
  const listFixedRight: any[] = [];

  columns.forEach((column, id) => {
    const columnData = Object.assign({}, column, { id });
    if (column.fixed === "left") {
      listFixedLeft.push(columnData);
    } else if (column.fixed === "right") {
      listFixedRight.push(columnData);
    } else {
      listNotFixed.push(columnData);
    }
  });

  let detailColumnData = [
    { isDiabled: true, title: "Fixed on the left" },
    ...listFixedLeft,
    { isDiabled: true, title: "Not fixed" },
    ...listNotFixed,
  ];
  if (listFixedRight.length || hasFixedRight) {
    detailColumnData = [
      ...detailColumnData,
      { isDiabled: true, title: "Fixed on the right" },
      ...listFixedRight,
    ];
  }

  const ColumnData = detailColumnData.map((el, idx) =>
    Object.assign({}, el, { idx })
  );

  const getFixedStatus = (code) => {
    switch (code) {
      case 1:
        return "left";
      case 2:
        return "";
      case 3:
        return "right";

      default:
        return "";
    }
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // item does not change position
    if (result.source.index === result.destination.index) return;

    const orderedColumn = reorder(
      detailColumnData,
      result.source.index,
      result.destination.index
    );

    const newColumn: any = [];
    let fixedCode = 0;
    orderedColumn.forEach((column: any) => {
      if (column.isDiabled) {
        return fixedCode++;
      }
      const fixedStatus = getFixedStatus(fixedCode);
      let newCol;
      if (!fixedCode && column.fixed) {
        newCol = Object.assign({}, column, { fixed: "" });
      } else {
        newCol = Object.assign({}, column, { fixed: fixedStatus });
      }
      newColumn.push(newCol);
    });

    const totalFixedLeft = newColumn.filter(
      (col: any) => col.fixed === "left"
    )?.length;
    const totalFixedRight = newColumn.filter(
      (col: any) => col.fixed === "right"
    )?.length;

    setColSettings(
      Object.assign({}, colSettings, {
        orderData: newColumn.map((el) => el.columnId),
        totalFixedLeft,
        totalFixedRight,
      })
    );
    setColumns(newColumn);
  };

  const onChangeCheckbox = (columnData, value) => {
    const newColumns = columns;
    newColumns[columnData.id] = Object.assign({}, columnData, {
      checked: value,
    });

    const newSetting = Object.assign({}, colSettings, {
      [columnData.columnId]: value,
    });
    setColSettings(newSetting);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="ColumnSettingDroppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col popover-custom-zIndex"
          >
            <DragDropColumn listData={ColumnData} onChange={onChangeCheckbox} />

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DragDropColumn = ({ listData, onChange }) => {
  return (
    <>
      {listData.map((column) => {
        const isChecked = column.checked === false ? false : true;

        if (column.isDiabled) {
          return (
            <Draggable
              isDragDisabled={true}
              key={column.idx}
              draggableId={String(column.idx)}
              index={column.idx}
            >
              {(provided) => (
                <Text
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  type="secondary"
                >
                  {column.title}
                </Text>
              )}
            </Draggable>
          );
        }

        const colName = column.settingName || column.title;
        return (
          <Draggable
            key={column.idx}
            draggableId={String(column.idx)}
            index={column.idx}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="flex items-center"
              >
                <MoreOutlined />
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => onChange(column, e.target.checked)}
                >
                  <div
                    className="cursor-grab truncate max-w-[160px]"
                    title={colName}
                  >
                    {colName}
                  </div>
                </Checkbox>
              </div>
            )}
          </Draggable>
        );
      })}
    </>
  );
};
