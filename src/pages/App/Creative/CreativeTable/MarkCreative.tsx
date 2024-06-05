import React, { useState } from "react";
import Modal from "antd/lib/modal/Modal";
import Button from "antd/lib/button";
import Dragger from "antd/lib/upload/Dragger";
import { UPLOAD_PROGRESS_CONFIGS } from "../../../../constants/constants";
import InboxOutlined from "@ant-design/icons/lib/icons/InboxOutlined";
import { UPLOAD_SINGLE_HINT } from "../../../../constants/formMessage";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";

function MarkCreative(props) {
  const { isOpen, onClose, setIsLoading } = props;
  const [fileList, setFileList] = useState<any>([]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setFileList([]);
    }, 300);
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

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("file", fileList?.[0]);

    setIsLoading(true);
    service.put("/creative/mark/csv", formData).then(
      (res: any) => {
        setIsLoading(false);
        onCloseModal();
        toast(res.message, { type: "success" });
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Modal
      title="Mark creatives"
      width={700}
      open={isOpen}
      maskClosable={false}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" onClick={onCloseModal}>
          Close
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          onClick={handleUpload}
        >
          Upload
        </Button>,
      ]}
    >
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
    </Modal>
  );
}

export default MarkCreative;
