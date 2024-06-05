import Button from "antd/lib/button/button";
import Modal from "antd/lib/modal/Modal";
import React, { useEffect, useState } from "react";
import service from "../../../partials/services/axios.config";
import Tree from "antd/lib/tree";
import {
  getCurrentNode,
  getParentKey,
  onDropTree,
  updateTreeNode,
} from "../../../utils/helper/TreeHelpers";

function ModalMoveFolders({
  isOpen,
  onClose,
  treeData,
  setIsLoading,
  initExpandedKeys,
  movedCallback,
}) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [movedTreeData, setMovedTreeData] = useState();

  useEffect(() => {
    if (isOpen) {
      setExpandedKeys(initExpandedKeys);
      setMovedTreeData(treeData);
    }
  }, [isOpen]);

  const onCloseModal = () => {
    onClose();
    movedCallback(movedTreeData);
  };

  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys);
  };

  const onDropTreeCallback = (data, info) => {
    const dragKey = info?.dragNode?.key;
    const parentKey = getParentKey(dragKey, data);
    const crrNode = getCurrentNode(dragKey, data);

    const newNode = { ...crrNode, parentFolderId: parentKey };
    const newTreeData = updateTreeNode(newNode, data);
    setMovedTreeData(newTreeData);

    const params = {
      id: dragKey,
      name: crrNode.name,
      parentFolderId: parentKey,
    };

    setIsLoading(true);
    service.put("/folder", params).then(
      (res: any) => {
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Modal
      title="Move folders"
      open={isOpen}
      maskClosable={false}
      onCancel={onCloseModal}
      footer={[
        <Button key="back" htmlType="button" onClick={onCloseModal}>
          Close
        </Button>,
      ]}
    >
      <Tree.DirectoryTree
        className="overflow-auto"
        treeData={movedTreeData}
        showLine={false}
        selectable={false}
        expandedKeys={expandedKeys}
        onExpand={onExpand}
        autoExpandParent
        blockNode
        draggable
        onDrop={(info) => onDropTree(info, movedTreeData, onDropTreeCallback)}
      />
    </Modal>
  );
}

export default ModalMoveFolders;
