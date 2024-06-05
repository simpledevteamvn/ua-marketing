import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import service from "../../../../../partials/services/axios.config";
import ListCreatives from "../../../AddCampaigns/Networks/Unity/Step3/ModalAddCreative/ListCreatives";
import Loading from "../../../../../utils/Loading";
import { toast } from "react-toastify";

function ModalAssignCreativePack(props) {
  const {
    isOpen,
    onClose,
    campaignData,
    handleAddCreatives,
    setImgPreview,
    setPreviewData,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [creatives, setCreatives] = useState<any>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setSelectedRecords([]);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen || !campaignData?.id) return;

    setIsLoading(true);
    const { rawAppId, networkConnectorId } = campaignData;
    const params = { rawAppId, networkConnectorId };

    service.get("creative-pack", { params }).then(
      (res: any) => {
        setIsLoading(false);
        setCreatives(res.results || []);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  const onApply = () => {
    const params = {
      campaignId: campaignData.id,
      creativePackIds: selectedRecords.join(","),
    };

    setIsLoading(true);
    service.put("/creative-pack/assign", null, { params }).then(
      (res: any) => {
        handleAddCreatives(res.results || []);
        toast(res.message, { type: "success" });
        onCloseModal();
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Modal
      title="Assign creative packs"
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
      {isLoading && <Loading />}

      <ListCreatives
        className="-mt-1"
        data={creatives}
        selectedRecords={selectedRecords}
        setSelectedRecords={setSelectedRecords}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
      />
    </Modal>
  );
}

export default ModalAssignCreativePack;
