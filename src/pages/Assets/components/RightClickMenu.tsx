import React, { useEffect, useState } from "react";
import Dropdown from "antd/lib/dropdown";
import { useOutsideClick } from "../../../utils/hooks/ClickOutside";
import FolderAddOutlined from "@ant-design/icons/lib/icons/FolderAddOutlined";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { BsArrowsMove } from "@react-icons/all-files/bs/BsArrowsMove";

export const FOLDER_ACTIONS = {
  add: "add",
  rename: "rename",
  move: "move",
  delete: "delete",
};

const TreeActions = [
  {
    key: FOLDER_ACTIONS.add,
    label: <div className="min-w-[80px]">New folder </div>,
    icon: <FolderAddOutlined />,
  },
  { key: FOLDER_ACTIONS.rename, label: "Rename", icon: <EditOutlined /> },
  { key: FOLDER_ACTIONS.move, label: "Move", icon: <BsArrowsMove /> },
  { key: FOLDER_ACTIONS.delete, label: "Delete", icon: <DeleteOutlined /> },
];

function RightClickMenu({
  posTreeAction,
  isOpenMenu,
  hideTreeAction,
  onClickTreeAction,
}) {
  const dropdownRef = useOutsideClick(hideTreeAction);

  const [posTree, setPosTree] = useState<any>({});

  useEffect(() => {
    const treeEl = document.getElementById("TreeArea");
    const treeCoor = treeEl?.getBoundingClientRect();
    // Phụ thuộc dropdownRef (height, width) và TreeActions width
    setPosTree({ x: (treeCoor?.x || 0) - 110, y: 268 });
  }, []);

  return (
    <Dropdown
      // ref={dropdownRef}
      // Hiện antd chưa support ref cho Dropdown: https://github.com/ant-design/ant-design/issues/39098
      // Giải pháp tạm thời: đầy ref xuống children -> ảnh hưởng đến phần hardcode tính toán tính posTree ở trên
      open={isOpenMenu}
      menu={{
        selectable: true,
        items: TreeActions,
        selectedKeys: [],
        onClick: (item) => onClickTreeAction(item.key),
      }}
      getPopupContainer={() => document.getElementById("TreeArea")!}
      align={{
        offset: [posTreeAction?.x - posTree.x, posTreeAction?.y - posTree.y],
      }}
      trigger={["contextMenu"]}
      placement="bottomRight"
    >
      <div ref={dropdownRef} className="fixed invisible">
        &nbsp;
      </div>
    </Dropdown>
  );
}

export default RightClickMenu;
