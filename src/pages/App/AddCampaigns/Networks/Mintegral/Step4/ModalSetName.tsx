import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import React, { useState } from "react";
import AntInput from "antd/lib/input/Input";
import { defaultCreativeName } from "./ModalAddCreatives/TableColumns";

export default function ModalSetName(props) {
  const { rd, onClose, setCreatives } = props;

  const [name, setName] = useState<string>();

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {}, 300);
  };

  const onConfirm = () => {
    onCloseModal();
    setCreatives((oldList) =>
      oldList.map((el) =>
        el.id === rd.id ? { ...el, creativeSetName: name } : el
      )
    );
  };

  return (
    <Modal
      title="Edit Creative Set"
      maskClosable={false}
      width={400}
      open={!!rd.id}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          htmlType="submit"
          onClick={onConfirm}
        >
          Confirm
        </Button>,
      ]}
    >
      <div className="break-words">
        Edit name for the creative:{" "}
        <span className="font-semibold">{rd.name}</span>
      </div>
      <AntInput
        allowClear
        className="mt-3"
        value={name}
        defaultValue={defaultCreativeName(rd)}
        onChange={(e) => setName(e.target.value)}
      />
    </Modal>
  );
}
