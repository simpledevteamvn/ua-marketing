import type { DataNode } from "antd/es/tree";

const getTitle = (el) => {
  let title = el.titleData || el.title || "";

  if (!el.titleData && title?.props?.name) {
    // Khi dùng DroppableArea thì title là một node(object)
    title = title?.props?.name;
  }
  return title.toLowerCase();
};

/**
 * @param list : treeData ban đầu
 * @param value : giá trị string cần lọc
 * @returns Trả treeData mới với các node có title chứa "value"
 */
export const filterTree = (list, value) => {
  if (value === "") return list;

  const hasChild = list.some(
    (el) => el.children?.length && !el.children[0].isChecked
  );

  if (!hasChild) {
    const filteredList = list.filter(
      (el) => el.children?.length || getTitle(el).includes(value.toLowerCase())
    );
    return filteredList.map((el) => {
      return { ...el, isChecked: true };
    });
  }

  const newList = list.map((el) => {
    if (el.children?.length && !el.children[0].isChecked) {
      return { ...el, children: filterTree(el.children, value) };
    }
    return el;
  });

  return filterTree(newList, value);
};

/**
 * @returns Lấy tất cả key của các node cành
 */
export const getAllParentKeys = (listData: DataNode[]) => {
  let listKeys: any = [];
  const getKey = (list) => {
    list.forEach((el) => {
      if (!el.children) return;
      listKeys.push(el.key);
      getKey(el.children);
    });
  };

  getKey(listData);
  return listKeys;
};

/**
 * @returns Lấy tất cả key của node lá
 */
export const getAllLeavesKeys = (listData: DataNode[]) => {
  let listKeys: any = [];
  const getKey = (list) => {
    list.forEach((el) => {
      if (!el.children) return listKeys.push(el.key);
      getKey(el.children);
    });
  };

  getKey(listData);
  return listKeys;
};

export const getAllLeaves = (listData: DataNode[]) => {
  let listKeys: any = [];
  const getKey = (list) => {
    list.forEach((el) => {
      if (!el.children) return listKeys.push(el);
      getKey(el.children);
    });
  };

  getKey(listData);
  return listKeys;
};

export const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
        break;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

export const getCurrentNode = (key: React.Key, tree: DataNode[]) => {
  let crrNode;

  const loop = (list) => {
    const activedNode = list.find((el) => el.key === key);
    if (activedNode) {
      crrNode = activedNode;
      return;
    }
    list.forEach((el) => {
      if (el.children?.length) {
        loop(el.children);
      }
    });
  };

  loop(tree);
  return crrNode!;
};

export const updateTreeNode = (newNode: DataNode, tree: DataNode[]) => {
  let isUpdated = false;

  const loop = (list) => {
    if (isUpdated) return list;

    return list.map((el) => {
      if (el.key === newNode.key) {
        isUpdated = true;
        return { ...el, ...newNode };
      }
      if (!el.children?.length) return el;

      return { ...el, children: loop(el.children) };
    });
  };
  return loop(tree);
};

// Ref: https://ant.design/components/tree
export const onDropTree = (info, gData, callback) => {
  // console.log("onDropTree", info, gData);
  // Sau khi được drag & drop thành công thì dropKey là key của folder cha or anh em họ phía trên gần nhất
  // => Chỉ thuận tiện cho update trên tree, còn logic update qua API ko đúng
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split("-");
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

  const loop = (
    data: DataNode[],
    key: React.Key,
    callback: (node: DataNode, i: number, data: DataNode[]) => void
  ) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) {
        return callback(data[i], i, data);
      }
      if (data[i].children) {
        loop(data[i].children!, key, callback);
      }
    }
  };
  const data = [...gData];

  // Find dragObject
  let dragObj: DataNode;
  loop(data, dragKey, (item, index, arr) => {
    arr.splice(index, 1);
    dragObj = item;
  });

  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, (item) => {
      item.children = item.children || [];
      // where to insert 示例添加到头部，可以是随意位置
      item.children.unshift(dragObj);
    });
  } else if (
    // Hiện chưa thấy chạy vào case này được do info.node.props.children của thư viện trả đều đang là null
    ((info.node as any).props.children || []).length > 0 && // Has children
    (info.node as any).props.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item) => {
      item.children = item.children || [];
      // where to insert 示例添加到头部，可以是随意位置
      item.children.unshift(dragObj);
      // in previous version, we use item.children.push(dragObj) to insert the
      // item to the tail of the children
    });
  } else {
    let ar: DataNode[] = [];
    let i: number;
    loop(data, dropKey, (_item, index, arr) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i!, 0, dragObj!);
    } else {
      ar.splice(i! + 1, 0, dragObj!);
    }
  }
  callback && callback(data, info);
};
