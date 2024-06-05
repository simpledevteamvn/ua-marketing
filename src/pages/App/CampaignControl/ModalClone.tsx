import Button from "antd/lib/button/button";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useRef, useState } from "react";
import AntInput from "antd/lib/input/Input";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";

function ModalClone({
  isOpen,
  onClose,
  setIsLoading,
  callback,
  rd,
  field = "campaign",
}) {
  const inputRef = useRef<any>(null);
  const [campName, setCampName] = useState<string>();

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setCampName("");
    }, 300);
  };

  const onSubmit = () => {
    if (!campName) return;

    let params: any = { name: campName };
    let url = "campaign";

    if (field === "creative pack") {
      url = "creative-pack";
      params.creativePackId = rd.id;
    } else if (field === "campaign") {
      params.campaignId = rd.id;
    }

    setIsLoading(true);
    service.post(`/${url}/clone`, null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseModal();
        callback(res.results);
      },
      () => setIsLoading(false)
    );
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal
      title={`Clone ${field} "${rd?.name}"`}
      width={400}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit}>
          Add
        </Button>,
      ]}
    >
      <AntInput
        allowClear
        value={campName}
        onChange={(e) => setCampName(e.target.value)}
        placeholder={`Enter new ${field} name`}
        className="mt-1"
        ref={inputRef}
        onPressEnter={onSubmit}
      />
    </Modal>
  );
}

export default ModalClone;
