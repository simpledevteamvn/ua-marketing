import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import { UPLOAD_PROGRESS_CONFIGS } from "../../../../../constants/constants";
import Upload from "antd/lib/upload";
import {
  UPLOAD_HINT,
  UPLOAD_SINGLE_HINT,
} from "../../../../../constants/formMessage";
import {
  formatBytes,
  getLabelFromCamelCaseStr,
  handleErrorImage,
} from "../../../../../utils/Helpers";
import classNames from "classnames";
import Modal from "antd/lib/modal";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";

function DynamicUpload(props) {
  const { Dragger } = Upload;
  const {
    multiple,
    configs,
    field,
    idx,
    onSetSizeErr,
    onSetCapacityErr,
    listFiles,
    onSetListFiles,
  } = props;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [listSizes, setListSizes] = useState<string[]>([]);
  const [sizeErr, setSizeErr] = useState(false);
  const [capacityErr, setCapacityErr] = useState(false);

  const fieldValidations = configs.validations?.[field] || {};

  const getSizeOfImg = (file, fileIdx) => {
    // https://stackoverflow.com/questions/7460272/getting-image-dimensions-using-the-javascript-file-api/7460303#7460303
    // https://stackoverflow.com/questions/27120757/failed-to-execute-createobjecturl-on-url
    const url = window.URL.createObjectURL(
      new Blob([file], { type: "application/zip" })
    );
    const img = document.createElement("img"); // const img = new Image();

    const updateListSizes = (newSize, newListSizes) => {
      if (multiple) {
        setListSizes([...newListSizes]);
      } else {
        setListSizes([newSize]);
      }
    };

    if (file.type?.includes("image")) {
      img.onload = function () {
        // https://coolboi567.medium.com/dynamically-get-image-dimensions-from-image-url-in-react-d7e216887b68
        const imgSize = img.width + "x" + img.height;
        const newListSizes = listSizes;
        newListSizes[fileIdx] = imgSize;

        updateListSizes(imgSize, newListSizes);
        URL.revokeObjectURL(img.src);
      };

      img.src = url;
    }

    if (file.type?.includes("video")) {
      const video = document.createElement("video");

      video.onloadedmetadata = function () {
        // https://stackoverflow.com/questions/52397746/get-dimensions-of-mp4-on-user-upload-reactjs
        const videoSize = video.videoWidth + "x" + video.videoHeight;
        const newListSizes = listSizes;
        newListSizes[fileIdx] = videoSize;

        updateListSizes(videoSize, newListSizes);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    }
  };

  const beforeUpload = (file, fileList) => {
    if (multiple) {
      setListFiles([...listFiles, ...fileList]);
    } else {
      const fileSrc = URL.createObjectURL(file);
      setPreviewImage(fileSrc);
      setPreviewTitle(file.name);
      setListFiles(fileList);
    }
    fileList.forEach((el, idx) => getSizeOfImg(el, listFiles.length + idx));
    return false;
  };

  const onRemove = (file) => {
    if (!multiple) {
      setListFiles([]);
      onUpdateSizeErr(false);
      onUpdateCapacityErr(false);
    }
  };

  const setListFiles = (files) => {
    onSetListFiles(field, files);
  };

  const onUpdateSizeErr = (value) => {
    onSetSizeErr(value, idx);
    value !== sizeErr && setSizeErr(value);
  };

  const onUpdateCapacityErr = (value) => {
    onSetCapacityErr(value, idx);
    value !== capacityErr && setCapacityErr(value);
  };

  const itemRender = (originNode, file, fileList, actions) => {
    return <></>;
  };

  useEffect(() => {
    const maxCapacity = fieldValidations?.maxSize?.[0];

    if (maxCapacity && listFiles.length) {
      const newCapacityErr = listFiles.some((file) => file.size > maxCapacity);
      onUpdateCapacityErr(newCapacityErr);
    }

    if (!listSizes) {
      return sizeErr ? setSizeErr(false) : undefined;
    }

    let hasSizeErr = false;
    listSizes.forEach((size) => {
      if (fieldValidations["dimensions"]?.length) {
        hasSizeErr = hasSizeErr || !fieldValidations.dimensions.includes(size);
      }
    });

    onUpdateSizeErr(hasSizeErr);
  }, [listSizes]);

  // const getCreativeType = (record) => {
  //   if (record.type?.includes("image")) return "Image";
  //   return "Video";
  // };

  // const checkFileExist = (record, recordIdx) => {
  //   const listExistedIds: number[] = [];
  //   listFiles.forEach((file, idx) => {
  //     if (
  //       file.name === record.name &&
  //       getCreativeType(file) === getCreativeType(record) &&
  //       listSizes[idx] === listSizes[recordIdx] &&
  //       file.size === record.size &&
  //       moment(file.lastModifiedDate).isSame(moment(record.lastModifiedDate))
  //     ) {
  //       listExistedIds.push(idx);
  //     }
  //   });
  //   return listExistedIds;
  // };

  // const getDisableStatus = () => {
  //   let isDisable = false;
  //   listFiles.forEach((file, id) => {
  //     isDisable =
  //       isDisable ||
  //       !EXPECTED_SIZES.includes(listSizes[id]) ||
  //       checkFileExist(file, id).length > 1;
  //   });
  //   return isDisable;
  // };

  const handleCancel = () => {
    setPreviewOpen(false);
  };

  const getModalSize = () => {
    let width = 520;
    if (typeof listSizes?.[0] === "string") {
      const newWidth = Number(listSizes?.[0]?.split("x")?.[0]);

      if (newWidth > 520 && newWidth <= window.innerWidth) {
        width = newWidth;
      }
    }

    return width;
  };

  let conditionEl = <></>;
  let accept = "video/*,image/*";

  if (Object.keys(fieldValidations).length) {
    conditionEl = (
      <ul className="pl-8 mt-1 list-disc">
        {Object.keys(fieldValidations).map((valName) => {
          const content = fieldValidations[valName];
          let contentStr = Array.isArray(content)
            ? content.join(", ")
            : content;
          let isErr = false;

          if (valName === "contentType" && Array.isArray(content)) {
            accept = content.map((el) => "." + el).join(", ");
          }
          if (valName === "maxSize") {
            contentStr = formatBytes(contentStr);
            isErr = capacityErr;
            if (capacityErr) {
              contentStr +=
                " (Current: " + formatBytes(listFiles[0]?.size) + ")";
            }
          }
          if (valName === "dimensions") {
            isErr = sizeErr;
            if (sizeErr) {
              contentStr += " (Current: " + listSizes?.[0] + ")";
            }
          }

          return (
            <li key={valName} className={classNames(isErr && "text-red-500")}>
              <span>{getLabelFromCamelCaseStr(valName, false)}: </span>
              <span>{contentStr}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="mb-6">
      <div className={classNames(!conditionEl && "mb-3")}>
        <span className="text-[#ff4d4f] mr-1 mt-2">*</span>
        <span className="text-base font-semibold">
          {getLabelFromCamelCaseStr(field, false)}
        </span>
      </div>

      {conditionEl}

      <div className="px-4">
        <Dragger
          className="upload-small"
          multiple={multiple}
          name="file"
          accept={accept}
          progress={UPLOAD_PROGRESS_CONFIGS}
          fileList={listFiles}
          beforeUpload={beforeUpload}
          itemRender={itemRender}
        >
          <p className="ant-upload-drag-icon !mb-0">
            <InboxOutlined className="!text-4xl" />
          </p>
          <p className="ant-upload-text !mb-0 !text-base">
            Click or drag file to this area to upload.
          </p>
          <p className="ant-upload-hint !text-sm">
            {multiple ? UPLOAD_HINT : UPLOAD_SINGLE_HINT}
          </p>
        </Dragger>

        {listFiles.length > 0 && (
          <div className="mt-2 px-2.5 py-2 rounded-sm border flex items-center justify-between">
            <div className="grow flex items-center truncate">
              <img
                alt=" "
                className="h-12 w-12 object-cover rounded-sm cursor-pointer"
                src={previewImage}
                onError={handleErrorImage}
                onClick={() => setPreviewOpen(true)}
              />
              <div
                className="ml-2 cursor-pointer truncate"
                onClick={() => setPreviewOpen(true)}
              >
                {previewTitle}
              </div>
            </div>

            <DeleteOutlined
              title="Remove file"
              className="pl-2 pr-1 cursor-pointer"
              onClick={onRemove}
            />
          </div>
        )}

        <Modal
          open={previewOpen}
          title={previewTitle}
          centered
          footer={null}
          width={getModalSize()}
          onCancel={handleCancel}
        >
          <img alt=" " className="w-full" src={previewImage} />
        </Modal>

        {/* <UploadedFilesTable
          listFiles={listFiles}
          setListFiles={setListFiles}
          listSizes={listSizes}
          setListSizes={setListSizes}
          checkFileExist={checkFileExist}
        /> */}
      </div>
    </div>
  );
}

DynamicUpload.defaultProps = {
  multiple: false,
  configs: {},
};

DynamicUpload.propTypes = {
  multiple: PropTypes.bool,
  field: PropTypes.string,
  idx: PropTypes.number,
  configs: PropTypes.object,
  onSetSizeErr: PropTypes.func,
  onSetCapacityErr: PropTypes.func,
  onSetListFiles: PropTypes.func,
  listFiles: PropTypes.array,
};

export default DynamicUpload;
