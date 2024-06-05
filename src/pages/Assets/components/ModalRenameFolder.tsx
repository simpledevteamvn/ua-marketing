import Button from "antd/lib/button/button";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useRef, useState } from "react";
import AntInput from "antd/lib/input/Input";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { getNodeName } from "../Helpers";

function ModalRenameFolder({
  isOpen,
  onClose,
  treeNode,
  setIsLoading,
  callback,
}) {
  const inputRef = useRef<any>(null);
  const [newFolderName, setNewFolderName] = useState<string>();
  const folderName = getNodeName(treeNode);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      setNewFolderName("");
    }, 300);
  };

  const onSubmit = () => {
    const params = {
      id: treeNode?.id,
      name: newFolderName,
      parentFolderId: treeNode?.parentFolderId,
    };

    setIsLoading(true);
    service.put("/folder", params).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onClose();

        const newNode = { ...treeNode, name: newFolderName };
        callback && callback(newNode);
      },
      () => setIsLoading(false)
    );
  };

  useEffect(() => {
    if (isOpen) {
      setNewFolderName(folderName);
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
        inputRef.current && inputRef.current.select();
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal
      title={
        <div>
          Rename "<span className="text-zinc-500">{folderName}</span>" folder
        </div>
      }
      width={400}
      open={isOpen}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          disabled={!newFolderName || newFolderName === folderName}
        >
          Rename
        </Button>,
      ]}
    >
      <AntInput
        allowClear
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Enter new name"
        className="mt-1"
        ref={inputRef}
      />
    </Modal>
  );
}

export default ModalRenameFolder;
