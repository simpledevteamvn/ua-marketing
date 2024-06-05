import React from "react";
import PropTypes from "prop-types";
import Table from "antd/lib/table/Table";
import moment from "moment";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { getTableTitleWithTooltip } from "../../../../partials/common/Table/Header";
import { EXPECTED_SIZES } from "../../../../constants/constants";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { formatBytes } from "../../../../utils/Helpers";

const dimensionTooltip =
  "The file must be the correct size (" + EXPECTED_SIZES.join(", ") + ")";

function UploadedFilesTable(props) {
  const { listFiles, setListFiles, listSizes, setListSizes, checkFileExist } =
    props;

  const getCreativeType = (record) => {
    if (record.type?.includes("image")) return "Image";
    return "Video";
  };

  const columns = [
    {
      title: "File name",
      render: (text, record, id) => {
        const listExistedIds = checkFileExist(record, id);
        if (listExistedIds.length > 1 && id !== listExistedIds[0]) {
          return (
            <div className="flex text-red-500">
              {record.name}
              <Tooltip title="File already exists">
                <AiOutlineQuestionCircle size={20} className="ml-1 pb-0.5" />
              </Tooltip>
            </div>
          );
        }
        return record.name;
      },
    },
    {
      title: "Creative type",
      render: (r) => getCreativeType(r),
    },
    {
      title: getTableTitleWithTooltip("Pixel / Dimension", dimensionTooltip),
      render: (text, record, index) => {
        if (!EXPECTED_SIZES.includes(listSizes[index])) {
          return (
            <div className="flex text-red-500">
              {listSizes[index]}
              <Tooltip title="Size not compatible">
                <AiOutlineQuestionCircle size={20} className="ml-1 pb-0.5" />
              </Tooltip>
            </div>
          );
        }
        return listSizes[index];
      },
    },
    {
      title: "Size",
      render: (record) => formatBytes(record.size),
    },
    {
      title: "Last modified date",
      render: (record) => {
        return moment(record.lastModifiedDate).format("DD-MM-YYYY hh:ss");
      },
    },
    // {
    //   title: "Status",
    //   render: (record) => capitalizeWord(record.status),
    // },
    {
      title: "Action",
      render: (text, record, id) => {
        return (
          <div>
            <DeleteOutlined
              className="icon-danger cursor-pointer"
              onClick={() => onDeleteFile(record, id)}
            />
          </div>
        );
      },
    },
  ];

  const onDeleteFile = (record, id) => {
    const newListFiles = listFiles.filter((el) => el.uid !== record.uid);
    const newListSizes = listSizes.filter((el, idx) => idx !== id);
    setListFiles(newListFiles);
    setListSizes(newListSizes);
  };

  return (
    <Table
      size="small"
      rowKey={(record) => record.uid}
      columns={columns}
      dataSource={[...listFiles]}
      pagination={{ hideOnSinglePage: true }}
      scroll={{ x: 800 }}
    />
  );
}

UploadedFilesTable.propTypes = {
  listFiles: PropTypes.array,
  setListFiles: PropTypes.func,
  listSizes: PropTypes.array,
  setListSizes: PropTypes.func,
  checkFileExist: PropTypes.func,
};

export default UploadedFilesTable;
