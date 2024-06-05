import React from "react";

export const addTreeNode = (resData, listData) => {
  const { parentFolderId, id, name } = resData;
  const newNode = { ...resData, key: id, title: name };

  let updateObj = { isPushed: false };

  const findAndUpdate = (list, obj) => {
    if (obj.isPushed) return list;

    const activedParent = list.find((el) => el.id === parentFolderId);

    if (activedParent) {
      obj.isPushed = true;
      const a = list.map((el) => {
        if (el.id === parentFolderId) {
          const crrChildren = el.children || [];
          return { ...el, children: [...crrChildren, newNode] };
        }
        return el;
      });
      return a;
    } else {
      return list.map((el) => {
        if (!el.children?.length) return el;
        return { ...el, children: findAndUpdate(el.children, obj) };
      });
    }
  };

  return findAndUpdate(listData, updateObj);
};

export const deleteTreeNode = (folderIds, listData) => {
  const filterAndRemove = (list) => {
    const filteredList = list.filter((el) => !folderIds.includes(el.id));

    if (!filteredList?.length) return [];
    return filteredList.map((el) => {
      if (!el.children?.length) return el;
      return { ...el, children: filterAndRemove(el.children) };
    });
  };

  return filterAndRemove(listData);
};

export const getMovedAssetNames = (data) => {
  const assetData = data.selectedAssets || [];
  const totalAsset = assetData.length;
  let contentEl;
  const nameClass = "font-semibold break-all";

  if (totalAsset > 1) {
    if (totalAsset > 3) {
      contentEl = "Move " + totalAsset + " assets";
    } else {
      contentEl = (
        <>
          Move {totalAsset} assets:
          <ul className="pl-2 !my-1">
            {assetData.map((el, idx) => {
              return (
                <li className={nameClass} key={idx}>
                  {el.name}
                </li>
              );
            })}
          </ul>
        </>
      );
    }
  } else {
    contentEl = (
      <>
        Move this asset{" "}
        {data.name && (
          <>
            (<span className={nameClass}>{data.name}</span>)
          </>
        )}
      </>
    );
  }

  return contentEl;
};

export const getNodeName = (treeNode) =>
  treeNode?.name || treeNode?.title?.props?.name || treeNode?.title;
