import React, { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Page from "../../utils/composables/Page";
import Tree from "antd/lib/tree";
import service from "../../partials/services/axios.config";
import Loading from "../../utils/Loading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LIST_ASSETS_BY_FOLDER } from "../../api/constants.api";
import { getAssetsByFolder } from "../../api/assets/assets.api";
import AssetTable from "./AssetTable/AssetTable";
import Search from "antd/lib/input/Search";
import {
  filterTree,
  getAllParentKeys,
  updateTreeNode,
} from "../../utils/helper/TreeHelpers";
import ExclamationCircleOutlined from "@ant-design/icons/lib/icons/ExclamationCircleOutlined";
import message from "antd/lib/message";
import {
  CHOOSE_ANOTHER_FOLDER,
  CHOOSE_RECORDS,
  DELETE_ROOT_FOLDER,
} from "../../constants/formMessage";
import Modal from "antd/lib/modal";
import ModalAddFolder from "./AssetTable/ModalAddFolder";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { SELECT_FOLDER_TOOLTIP } from "../../utils/Helpers";
import { toast } from "react-toastify";
import { addTreeNode, deleteTreeNode, getMovedAssetNames } from "./Helpers";
import Divider from "antd/lib/divider";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd/dist/core/DndProvider";
import { DroppableArea } from "./components/DroppableFolder";
import { DRAGGABLE_ASSETS } from "./constants";
import { Asset, DroppableData, TreeNode } from "./interface";
import { Preview } from "react-dnd-preview";
import { EmptyPreviewEl } from "../../utils/helper/DndHelpers";
import ModalMoveFolders from "./components/ModalMoveFolders";
import RightClickMenu, { FOLDER_ACTIONS } from "./components/RightClickMenu";
import ModalRenameFolder from "./components/ModalRenameFolder";
import { BsArrowsMove } from "@react-icons/all-files/bs/BsArrowsMove";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import classNames from "classnames";
import { useWindowSize } from "../../partials/sidebar/Sidebar";
import { MESSAGE_DURATION } from "../../constants/constants";

export const ROOT_FOLDER = "Root folder";
const EXPANDED_ASSET_KEYS = "expanded-asset-keys";

export const PositionContext = createContext<any>(null);

function Assets(props) {
  const { fullFeature, onSelectAssets } = props;
  const queryClient = useQueryClient();
  const [width, height] = useWindowSize();
  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<any>([]);
  const [crrTreeData, setCrrTreeData] = useState<any[]>([]);

  const [initedPage, setInitedPage] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const defaultSelectedFolder = [
    { key: ROOT_FOLDER, title: ROOT_FOLDER, name: ROOT_FOLDER },
  ];
  const [selectedKeys, setSelectedKeys] = useState<TreeNode[]>([]); // Selected folder state
  // Dùng để update api của react-query do selectedKeys là mảng chứa title là ReactNode
  // nên selectedKeys ko phải mảng của các Serializable objects
  const [selectedIds, setSelectedIds] = useState<string[]>();

  const [treeSearch, setTreeSearch] = useState<string>();
  const [initedAssets, setInitedAssets] = useState(false);
  const [listAssets, setListAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  const [isAddFolder, setIsAddFolder] = useState(false);
  const [isMoveFolders, setIsMoveFolders] = useState(false);

  // Position của Preview (show khi kéo asset -> folder tree)
  const [posData, setPosData] = useState<any>();
  // Position của tree menu (RightClickMenu)
  const [posTreeAction, setPosTreeAction] = useState<any>();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [rightClickNode, setRightClickNode] = useState<any>();
  const [isRename, setIsRename] = useState(false);

  useEffect(() => {
    setSelectedIds(selectedKeys.map((el) => el.key));
  }, [selectedKeys]);

  useEffect(() => {
    onSelectAssets && onSelectAssets(selectedAssets);
  }, [selectedAssets]);

  const { data: assetRes } = useQuery({
    queryKey: [LIST_ASSETS_BY_FOLDER, ROOT_FOLDER, selectedIds],
    queryFn: getAssetsByFolder,
    staleTime: 20 * 60000,
    enabled: !!selectedIds?.length,
  });

  useEffect(() => {
    if (assetRes) {
      setListAssets(assetRes?.results || []);
      !initedAssets && setInitedAssets(true);
    }
  }, [assetRes]);

  useEffect(() => {
    fullFeature && setIsLoading(true);
    service.get("/folder").then(
      (res: any) => {
        setIsLoading(false);
        const data = res.results;
        if (!data?.length) {
          const newTreeData = {
            key: ROOT_FOLDER,
            title: ROOT_FOLDER,
            name: ROOT_FOLDER,
          };
          setExpandedKeys([ROOT_FOLDER]);
          setTreeData([newTreeData]);
          setCrrTreeData([newTreeData]);
          setSelectedKeys(defaultSelectedFolder);
          return;
        }

        const initedFolders = data?.length
          ? [{ ...data[0], key: data[0].id, title: data[0].name }]
          : defaultSelectedFolder;
        const newData = convertData(data, initedFolders);

        const storedKeys = JSON.parse(
          localStorage.getItem(EXPANDED_ASSET_KEYS) || "{}"
        );
        const newTreeData = {
          key: ROOT_FOLDER,
          title: ROOT_FOLDER,
          name: ROOT_FOLDER,
          // selectable: false, // Cho phép chọn để tạo được folder con của rootNode
          children: newData?.length ? newData : undefined,
        };
        let newKeys = storedKeys?.keys?.length
          ? storedKeys.keys
          : [ROOT_FOLDER];

        if (!newKeys.includes(ROOT_FOLDER)) {
          newKeys = [ROOT_FOLDER];
        }

        setExpandedKeys(newKeys);
        setTreeData([newTreeData]);
        setCrrTreeData([newTreeData]);
        setSelectedKeys(initedFolders);
      },
      () => setIsLoading(false)
    );
  }, []);

  const convertData = (list, folders = selectedKeys) => {
    return list.map((el) => {
      const titleEl = (
        <DroppableArea
          accept={DRAGGABLE_ASSETS}
          onDrop={(asset) => onDrop(asset, el, folders)}
          name={el.name}
          // selectedKeys={folders}
        />
      );

      if (!el.children?.length) {
        return {
          ...el,
          key: el.id,
          title: titleEl,
        };
      }

      return {
        ...el,
        key: el.id,
        title: titleEl,
        children: convertData(el.children, folders),
      };
    });
  };

  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys);
  };

  const updateTree = (folders = selectedKeys, data = crrTreeData) => {
    const newData = convertData(data, folders)?.[0]?.children;
    const newTreeData = {
      key: ROOT_FOLDER,
      title: ROOT_FOLDER,
      children: newData?.length ? newData : undefined,
    };
    setCrrTreeData([newTreeData]);
  };

  useEffect(() => {
    if (!initedPage) {
      return setInitedPage(true);
    }
    localStorage.setItem(
      EXPANDED_ASSET_KEYS,
      JSON.stringify({
        keys: expandedKeys,
        folderIds: selectedKeys?.map((el) => el.key),
      })
    );
  }, [expandedKeys, selectedKeys]);

  const onDrop = (
    data: DroppableData,
    treeNode: TreeNode, // target folder
    folders: TreeNode[] = selectedKeys // selected folders
  ) => {
    if (folders?.length) {
      const isExist = folders.find((el) => el.id === treeNode.id);
      if (isExist) {
        message.error(CHOOSE_ANOTHER_FOLDER, MESSAGE_DURATION);
        return;
      }
    }

    const contentEl = getMovedAssetNames(data);
    Modal.confirm({
      title: "Confirm move asset",
      content: (
        <div className="">
          {contentEl} to "<span className="font-semibold">{treeNode.name}</span>
          " folder?
        </div>
      ),
      onOk: () => handleMoveAsset(data, treeNode, folders),
    });
  };

  const onSelect = (selectedKeys, info) => {
    setSelectedKeys(info.selectedNodes);
    updateTree(info.selectedNodes);
  };

  const onSearchTree = (e) => {
    const { value } = e.target;
    const newTreeData = filterTree(treeData, value);
    const listKeys = getAllParentKeys(newTreeData);

    value && setExpandedKeys(listKeys);
    setCrrTreeData(newTreeData);
    setTreeSearch(value);
  };

  const handleMoveAsset = (
    data: DroppableData,
    treeNode: TreeNode,
    folders: TreeNode[] = selectedKeys // selected folders
  ) => {
    let params = { ids: data.id, folderId: treeNode.id };

    const assetData = data.selectedAssets || [];
    if (assetData.length > 1) {
      params.ids = assetData.map((el) => el.id).join(",");
    }

    setIsLoading(true);
    service.put("/system-asset/folder", null, { params }).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);

        // Update api thư mục đích (được move asset đến)
        queryClient.invalidateQueries({
          queryKey: [LIST_ASSETS_BY_FOLDER, ROOT_FOLDER, [treeNode.id]],
        });
        // Update api hiện tại
        queryClient.invalidateQueries({
          queryKey: [
            LIST_ASSETS_BY_FOLDER,
            ROOT_FOLDER,
            folders.map((el) => el.id),
          ],
        });
      },
      () => setIsLoading(false)
    );
  };

  const onPlusData = (resData) => {
    if (!resData?.id) return;

    const { parentFolderId, id, name } = resData;
    const newNode = { ...resData, key: id, title: name };
    const newData = [...treeData];
    let listData = newData[0].children || []; // cấp đầu do FE fake nên luôn ko thay đổi

    if (!parentFolderId) {
      listData.push(newNode);
    } else {
      listData = addTreeNode(resData, listData);
    }

    const newTreeData = [{ ...newData[0], children: listData }];
    setTreeData(newTreeData);
    setCrrTreeData(newTreeData);
    setRightClickNode({});
  };

  const handleDelete = () => {
    if (!selectedNode?.length) {
      return message.error(CHOOSE_RECORDS, MESSAGE_DURATION);
    }

    const folderIds = selectedNode.map((el) => el.key);
    if (folderIds?.includes(ROOT_FOLDER)) {
      setSelectedKeys([]);
      updateTree([]);
      return message.error(DELETE_ROOT_FOLDER, MESSAGE_DURATION);
    }

    Modal.confirm({
      title: "Delete folders",
      content: (
        <div>
          Confirm delete {selectedNode.length > 1 ? "folders" : "folder"}:
          <span className="font-semibold ml-1">
            {selectedNode.map((el) => el.name).join(", ")}
          </span>
        </div>
      ),
      icon: <div />,
      onOk: onDelete,
    });
  };

  const onDelete = (isForce = false) => {
    const folderIds = selectedNode.map((el) => el.key);
    const params = {
      folderIds: folderIds?.join(","),
      isForce,
    };

    setIsLoading(true);
    service.delete("/folder", { params }).then(
      (res: any) => {
        setIsLoading(false);
        let totalAsset = res.results;
        if (totalAsset) {
          const folderText = folderIds?.length === 1 ? "folder" : "folders";
          const content =
            totalAsset === 1
              ? `There is an asset in the ${folderText}.`
              : `There are ${totalAsset} assets in the ${folderText}.`;

          return Modal.confirm({
            title: "Asset exists in the " + folderText,
            content: (
              <div>
                <div>{content}</div>
                <div>Continue to delete? (This action is irreversible!)</div>
              </div>
            ),
            onOk: () => onDelete(true),
            okButtonProps: { danger: true },
            centered: true,
            icon: <ExclamationCircleOutlined className="!text-red-500" />,
          });
        }

        toast(res.message, { type: "success" });
        const newList = deleteTreeNode(folderIds, treeData[0].children);
        const newTreeData = [{ ...treeData[0], children: newList }];
        setTreeData(newTreeData);
        setCrrTreeData(newTreeData);
        setRightClickNode({});

        let isResetKey = !isSingleNode;
        if (isSingleNode) {
          isResetKey = selectedKeys.some(
            (el) => el.key === selectedNode[0].key
          );
        }
        isResetKey && setSelectedKeys(defaultSelectedFolder);
      },
      () => setIsLoading(false)
    );
  };

  const generatePreview = (data) => {
    const { itemType, item, style } = data;
    const assetsEl = document
      .getElementById("AssetTable")
      ?.getBoundingClientRect();

    let newStyle;
    if (posData && assetsEl) {
      const leftCoor = posData.x - assetsEl.x - 45; // checkbox width = 45px
      newStyle = { ...style, left: leftCoor };
    } else {
      newStyle = { ...style, display: "none" };
    }

    return (
      <div className="item-list__item !z-1190" style={newStyle}>
        <EmptyPreviewEl count={selectedAssets.length} />
      </div>
    );
  };

  const handleMoveFolders = () => {
    setIsMoveFolders(true);
  };

  const movedCallback = (newTreeData) => {
    setCrrTreeData(newTreeData);
    setTreeData(newTreeData);
    treeSearch && setTreeSearch("");
  };

  const renameCB = (node) => {
    const newTreeData = updateTreeNode(node, treeData);
    movedCallback(newTreeData);
    updateTree([node], newTreeData);
  };

  const onRightClick = ({ event, node }) => {
    if (!fullFeature) return;
    const pos = { x: event.clientX, y: event.clientY };
    setPosTreeAction(pos);
    setIsOpenMenu(true);
    setRightClickNode(node);
  };

  const hideTreeAction = () => {
    setIsOpenMenu(false);
  };

  const onClickTreeAction = (key) => {
    if (key === FOLDER_ACTIONS.add) {
      return setIsAddFolder(true);
    }
    if (key === FOLDER_ACTIONS.rename) {
      return setIsRename(true);
    }
    if (key === FOLDER_ACTIONS.move) {
      return handleMoveFolders();
    }
    if (key === FOLDER_ACTIONS.delete) {
      return handleDelete();
    }
  };

  const isSingleNode = Object.keys(rightClickNode || {}).length;
  const selectedNode = isSingleNode ? [rightClickNode] : selectedKeys;
  let maxHeight = width > 742 ? height - 295 + 8 : height - 255 + 8;
  if (width < 640) {
    maxHeight = 48 * 4;
  }

  const AssetComp = (
    <>
      {isLoading && <Loading />}

      {fullFeature && <div className="page-title">Assets</div>}
      <DndProvider backend={HTML5Backend}>
        <Preview>{generatePreview}</Preview>
        <div className="bg-white border rounded mt-4">
          <div className="flex flex-col sm:flex-row justify-between sm:max-h-[calc(100vh-20px)] lg:max-h-[calc(100vh-180px)]">
            <div
              className={classNames(
                "p-4 sm:pl-5 sm:pr-1.5 relative",
                fullFeature ? "sm:w-60 2xl:w-96" : "sm:w-52 lg:w-64"
              )}
              id="TreeArea"
            >
              <div className="flex items-center justify-between text-lg font-semibold text-black">
                <div className="flex items-center">
                  Folders
                  <Tooltip
                    title={SELECT_FOLDER_TOOLTIP}
                    color="white"
                    overlayClassName="tooltip-light"
                  >
                    <AiOutlineQuestionCircle size={16} className="ml-1" />
                  </Tooltip>
                </div>
                {fullFeature && (
                  <div className="flex">
                    <BsArrowsMove
                      title="Move folders"
                      className="cursor-pointer mr-1 !text-black opacity-70 hover:opacity-90"
                      onClick={handleMoveFolders}
                    />
                    <DeleteOutlined
                      title="Delete selected folders"
                      className="cursor-pointer !text-red-400 hover:!text-red-600"
                      onClick={handleDelete}
                    />
                  </div>
                )}
              </div>
              <Search
                allowClear
                className="mt-2"
                placeholder="Search"
                value={treeSearch}
                onChange={onSearchTree}
              />
              <RightClickMenu
                posTreeAction={posTreeAction}
                isOpenMenu={isOpenMenu}
                hideTreeAction={hideTreeAction}
                onClickTreeAction={onClickTreeAction}
              />
              <Tree.DirectoryTree
                className="!mt-2 overflow-auto"
                style={{ maxHeight }}
                treeData={crrTreeData}
                showLine={false}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                multiple
                onSelect={onSelect}
                selectedKeys={selectedKeys.map((el) => el.key)}
                onRightClick={onRightClick}
              />
            </div>

            <div className="sm:!hidden px-12">
              <Divider className="!h-full !my-1" />
            </div>

            <div className="flex-1 h-auto flex items-start py-4">
              <Divider type="vertical" className="!h-full !hidden sm:!block" />
              <PositionContext.Provider value={{ setPosData }}>
                <AssetTable
                  fullFeature={fullFeature}
                  initedAssets={initedAssets}
                  listAssets={listAssets}
                  activedFolders={selectedKeys}
                  setIsLoading={setIsLoading}
                  selectedAssets={selectedAssets}
                  setSelectedAssets={setSelectedAssets}
                />
              </PositionContext.Provider>
            </div>
          </div>
        </div>

        <ModalMoveFolders
          onClose={() => setIsMoveFolders(false)}
          isOpen={isMoveFolders}
          setIsLoading={setIsLoading}
          treeData={treeData}
          initExpandedKeys={expandedKeys}
          movedCallback={movedCallback}
        />
      </DndProvider>

      <ModalAddFolder
        isOpen={isAddFolder}
        onClose={() => setIsAddFolder(false)}
        selectedKeys={selectedNode}
        setIsLoading={setIsLoading}
        callback={onPlusData}
      />
      <ModalRenameFolder
        isOpen={isRename}
        treeNode={rightClickNode}
        onClose={() => setIsRename(false)}
        setIsLoading={setIsLoading}
        callback={renameCB}
      />
    </>
  );

  if (!fullFeature) return AssetComp;
  return <Page>{AssetComp}</Page>;
}

Assets.defaultProps = {
  fullFeature: true,
};

Assets.propTypes = {
  fullFeature: PropTypes.bool,
  onSelectAssets: PropTypes.func,
};

export default Assets;
