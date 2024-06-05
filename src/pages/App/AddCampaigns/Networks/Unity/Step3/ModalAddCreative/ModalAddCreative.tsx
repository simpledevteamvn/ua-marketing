import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import service from "../../../../../../../partials/services/axios.config";
import ListCreatives from "./ListCreatives";

function ModalAddCreative(props) {
  const {
    isOpen,
    onClose,
    activedApp,
    applicationsData,
    handleAddCreatives,
    setIsLoading,
    setImgPreview,
    setPreviewData,
    className,
  } = props;

  const [creatives, setCreatives] = useState<any>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSelectedRecords([]);
    }, 300);
  };

  useEffect(() => {
    const networkConnectorId = activedApp?.networkConnector?.id;
    if (!isOpen || !networkConnectorId) return;
    const params = { networkConnectorId, rawAppId: activedApp?.rawAppId };

    setIsLoading(true);
    service.get("creative-pack", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setCreatives(res.results || []);
      },
      () => setIsLoading(false)
    );
  }, [isOpen, activedApp?.id]);

  const onApply = () => {
    const listData = creatives.filter((el) => selectedRecords.includes(el.id));
    handleAddCreatives(listData);
    onCloseModal();
  };

  return (
    <Modal
      title="Add creatives"
      maskClosable={false}
      width={1000}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          disabled={!selectedRecords?.length}
          onClick={onApply}
        >
          Apply
        </Button>,
      ]}
    >
      <ListCreatives
        className={className}
        data={creatives}
        selectedRecords={selectedRecords}
        setSelectedRecords={setSelectedRecords}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
      />
    </Modal>
  );
}

export default ModalAddCreative;
