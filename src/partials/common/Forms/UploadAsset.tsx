import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Upload from "antd/lib/upload";
import { UPLOAD_PROGRESS_CONFIGS } from "../../../constants/constants";
import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import {
  FIELD_REQUIRED,
  UPLOAD_HINT,
  UPLOAD_SINGLE_HINT,
} from "../../../constants/formMessage";
import Form from "antd/lib/form";
import { handleErrorImage } from "../../../utils/Helpers";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { GiGamepad } from "@react-icons/all-files/gi/GiGamepad";
// @ts-ignore
import ImgOff from "../../../images/creative/imgOff.svg";
import classNames from "classnames";

function UploadAsset(props) {
  const {
    fileList,
    setFileList,
    multiple,
    setImgPreview,
    setPreviewData,
    uploadTitle,
    handleSetSizes,
    formLabel,
  } = props;

  const [listSizes, setListSizes] = useState<string[]>([]);

  useEffect(() => {
    handleSetSizes && handleSetSizes(listSizes);
  }, [listSizes]);

  const onRemove = (file, idx) => {
    const getNewList = (list) => list.filter((el, id) => id !== idx);

    setListSizes(getNewList(listSizes));
    setFileList(getNewList(fileList));
  };

  const beforeUpload = (file, newFileList) => {
    // fileList: list files đã upload
    // file: file đơn trong số các files (newFileList) đã chọn (multiple)
    // newFileList: list files vừa upload
    if (multiple) {
      setFileList([...fileList, ...newFileList]);
    } else {
      setFileList(newFileList);
    }
    newFileList.forEach((file, idx) =>
      getSizeOfAsset({
        file,
        fileIdx: fileList.length + idx,
        listSizes,
        setListSizes,
        multiple,
      })
    );
    return false;
  };

  const getFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const itemRender = (originNode, file, fileList, actions) => {
    return <></>;
  };

  const onPreview = (file) => {
    if (file.type?.includes("image") && setImgPreview) {
      setImgPreview({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
    if (
      (file.type?.includes("video") || file.type?.includes("html")) &&
      setPreviewData
    ) {
      setPreviewData({
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  };

  const assetClass = "h-8 w-8 object-cover rounded-sm cursor-pointer shrink-0";

  return (
    <Form.Item noStyle>
      {uploadTitle && <div className="mt-2 mb-3 font-bold">{uploadTitle}</div>}

      <Form.Item noStyle>
        <Form.Item
          name="assets"
          label={formLabel}
          rules={[{ required: true, message: FIELD_REQUIRED }]}
          className="!mb-4"
          getValueFromEvent={getFile}
        >
          <Upload.Dragger
            accept="video/*,image/*,text/html"
            multiple={multiple}
            progress={UPLOAD_PROGRESS_CONFIGS}
            fileList={fileList}
            beforeUpload={beforeUpload}
            itemRender={itemRender}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload.
            </p>
            <p className="ant-upload-hint !text-sm">
              {multiple ? UPLOAD_HINT : UPLOAD_SINGLE_HINT}
            </p>
          </Upload.Dragger>
        </Form.Item>

        {fileList.length > 0 &&
          fileList.map((file, idx) => {
            const onClickAsset = () => onPreview(file);
            const assetUrl = URL.createObjectURL(file);
            const isUnknown =
              !file.type?.includes("video") &&
              !file.type?.includes("image") &&
              !file.type?.includes("html");
            const assetSize = listSizes[idx];

            return (
              <div
                className="mt-1 px-2.5 py-2 rounded-sm border flex items-center justify-between"
                key={file.uid}
              >
                <div className="grow flex items-center truncate">
                  {file.type?.includes("video") && (
                    <video
                      playsInline
                      className={assetClass}
                      src={assetUrl + "#t=1"}
                      onClick={onClickAsset}
                      title="Click to view the video"
                    />
                  )}
                  {file.type?.includes("image") && (
                    <img
                      className={assetClass}
                      src={assetUrl}
                      alt=" "
                      referrerPolicy="no-referrer"
                      onError={handleErrorImage}
                      onClick={onClickAsset}
                      title="Click to view the image"
                    />
                  )}
                  {file.type?.includes("html") && (
                    <div
                      className={`${assetClass} rounded bg-antPrimary/10 hover:bg-antPrimary/20 cursor-pointer flex justify-center items-center`}
                      onClick={onClickAsset}
                      title="Click to play"
                    >
                      <GiGamepad size={26} className="text-antPrimary" />
                    </div>
                  )}
                  {isUnknown && (
                    <img
                      src={ImgOff}
                      className={`${assetClass} !cursor-auto`}
                    />
                  )}
                  <div className="grow flex itens-center justify-between truncate ml-2">
                    <div
                      className={classNames(
                        "truncate",
                        !isUnknown && "cursor-pointer"
                      )}
                      onClick={onClickAsset}
                    >
                      {file.name}
                    </div>
                    <div className="text-center hidden md:block min-w-[100px] lg:min-w-[200px] mt-0.5">
                      {assetSize}
                    </div>
                  </div>
                </div>

                <DeleteOutlined
                  title="Remove file"
                  className="pl-2 pr-1 cursor-pointer"
                  onClick={() => onRemove(file, idx)}
                />
              </div>
            );
          })}
      </Form.Item>
    </Form.Item>
  );
}

UploadAsset.defaultProps = {
  multiple: true,
};

UploadAsset.propTypes = {
  multiple: PropTypes.bool,
  fileList: PropTypes.array,
  setFileList: PropTypes.func,
  setImgPreview: PropTypes.func,
  setPreviewData: PropTypes.func,
  handleSetSizes: PropTypes.func,
  uploadTitle: PropTypes.string,
  formLabel: PropTypes.string,
};

export default UploadAsset;

export const getSizeOfAsset = ({
  file,
  fileIdx,
  listSizes,
  setListSizes,
  multiple = true,
}) => {
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
      const imgSize = img.width + " x " + img.height;
      const newListSizes = listSizes;
      newListSizes[fileIdx] = imgSize;

      updateListSizes(imgSize, newListSizes);
      URL.revokeObjectURL(img.src);
    };

    img.src = url;
  } else if (file.type?.includes("video")) {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      // https://stackoverflow.com/questions/52397746/get-dimensions-of-mp4-on-user-upload-reactjs
      const videoSize = video.videoWidth + " x " + video.videoHeight;
      const newListSizes = listSizes;
      newListSizes[fileIdx] = videoSize;
      const duration = video.duration;

      updateListSizes(videoSize, newListSizes);
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  } else {
    const newListSizes = listSizes;
    newListSizes[fileIdx] = "";
    updateListSizes("", newListSizes);
  }
};
