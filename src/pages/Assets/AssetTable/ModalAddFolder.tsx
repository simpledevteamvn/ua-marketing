import Button from "antd/lib/button/button";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useRef, useState } from "react";
import AntInput from "antd/lib/input/Input";
import service from "../../../partials/services/axios.config";
import { ROOT_FOLDER } from "../Assets";
import { toast } from "react-toastify";
import { getNodeName } from "../Helpers";

function ModalAddFolder({
  isOpen,
  onClose,
  selectedKeys,
  setIsLoading,
  callback,
}) {
  const inputRef = useRef<any>(null);
  const [newFolderName, setNewFolderName] = useState<string>();

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setNewFolderName("");
    }, 300);
  };

  const onSubmit = () => {
    if (!newFolderName) return;

    const key = selectedKeys[0]?.key;
    const parentFolderId = key === ROOT_FOLDER ? null : key;

    setIsLoading(true);
    service.post("/folder", { name: newFolderName, parentFolderId }).then(
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
      title={
        <div>
          Add a new folder to "
          <span className="text-zinc-500">{getNodeName(selectedKeys[0])}</span>"
        </div>
      }
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
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Enter folder name"
        className="mt-1"
        ref={inputRef}
        onPressEnter={onSubmit}
      />
    </Modal>
  );
}

export default ModalAddFolder;
