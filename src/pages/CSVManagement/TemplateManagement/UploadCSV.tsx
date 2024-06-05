import Button from "antd/lib/button";
import Upload from "antd/lib/upload";
import PropTypes from "prop-types";
import React, { useState } from "react";
import service from "../../../partials/services/axios.config";
import { UPLOAD_PROGRESS_CONFIGS } from "../../../constants/constants";
import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import UploadOutlined from "@ant-design/icons/lib/icons/UploadOutlined";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import { UPLOAD_SINGLE_HINT } from "../../../constants/formMessage";
import { toast } from "react-toastify";

const { Dragger } = Upload;

function UploadCSV(props) {
  const { setIsLoading, listAdNetwork, filterLeftClass } = props;
  const [fileList, setFileList] = useState<any>([]);
  const [activedNetwork, setActivedNetwork] = useState<any>();

  const onUploadFile = () => {
    const formData = new FormData();
    // https://developer.mozilla.org/en-US/docs/Web/API/FormData/append
    formData.append("network", activedNetwork);
    formData.append("file", fileList?.[0]);

    setIsLoading(true);
    // https://stackoverflow.com/questions/43013858/how-to-post-a-file-from-a-form-with-axios
    // https://stackblitz.com/edit/so-58128062-upload-progress?file=index.js
    // https://upload-react-component.vercel.app/demo/custom-request
    service.post("/bid/file/allow-failure", formData).then(
      (res: any) => {
        setIsLoading(false);
        setFileList([]);
        toast(res?.message, { type: "success" });
      },
      () => setIsLoading(false)
    );
  };

  const onRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    setFileList([file]);
    return false;
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-2 mt-4 mb-5">
        <div className={filterLeftClass}>
          Network <span className="text-red-400 ml-px">*</span>
        </div>
        <div className="form-filter-right large">
          <SelectNetwork
            classNames="xs:w-[250px]"
            isMultiple={false}
            listNetwork={listAdNetwork}
            value={activedNetwork}
            onChange={setActivedNetwork}
          />
        </div>
      </div>

      <Dragger
        name="file"
        accept=".csv"
        progress={UPLOAD_PROGRESS_CONFIGS}
        fileList={fileList}
        onRemove={onRemove}
        beforeUpload={beforeUpload}
        headers={{ "Content-Type": "multipart/form-data" }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload a CSV file.
        </p>
        <p className="ant-upload-hint">{UPLOAD_SINGLE_HINT}</p>
      </Dragger>

      <Button
        type="primary"
        icon={<UploadOutlined />}
        className="mt-5 mb-4"
        disabled={!activedNetwork || !fileList?.length}
        onClick={onUploadFile}
      >
        Upload
      </Button>
    </>
  );
}

UploadCSV.propTypes = {
  setIsLoading: PropTypes.func,
  filterLeftClass: PropTypes.string,
  listAdNetwork: PropTypes.array,
};

export default UploadCSV;
