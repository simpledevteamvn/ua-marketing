import React, { useEffect, useState } from "react";
import Empty from "antd/lib/empty";
import VideoPopup from "../../App/Creative/VideoPopup/VideoPopup";
import ImagePreview from "../../App/Creative/ImagePreview/ImagePreview";
import { getLabelFromStr } from "../../../utils/Helpers";
import AntInput from "antd/lib/input/Input";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Select from "antd/lib/select";
import { ASSET_TYPES, MESSAGE_DURATION } from "../../../constants/constants";
import { showListData } from "../../../utils/helper/UIHelper";
import { ROOT_FOLDER } from "../Assets";
import Button from "antd/lib/button/button";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import ModalAddAsset from "./ModalAddAsset";
import message from "antd/lib/message";
import { CHOOSE_ANOTHER_FOLDER } from "../../../constants/formMessage";
import { useWindowSize } from "../../../partials/sidebar/Sidebar";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { LIST_ASSETS_BY_FOLDER } from "../../../api/constants.api";
import Popconfirm from "antd/lib/popconfirm";
import { useQueryClient } from "@tanstack/react-query";
import { Asset } from "../interface";
import { AssetItem } from "./AssetItem";

function AssetTable(props) {
  const {
    listAssets,
    initedAssets,
    activedFolders,
    setIsLoading,
    selectedAssets,
    setSelectedAssets,
    fullFeature,
  } = props;

  const queryClient = useQueryClient();
  const [width, height] = useWindowSize();
  const [activedType, setActivedType] = useState<any>([]);
  const [search, setSearch] = useState<string>();

  const [previewData, setPreviewData] = useState({});
  const [imgPreview, setImgPreview] = useState<any>({});

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  const onAddAsset = () => {
    if (isDefault) {
      return message.error(CHOOSE_ANOTHER_FOLDER, MESSAGE_DURATION);
    }
    setIsOpenAddModal(true);
  };

  useEffect(() => {
    selectedAssets?.length && setSelectedAssets([]);
  }, [activedFolders]);

  const onChangeCheckbox = (e, asset: Asset) => {
    const isCheck = e.target.checked;
    if (isCheck) {
      setSelectedAssets([...selectedAssets, asset]);
    } else {
      setSelectedAssets(selectedAssets.filter((el) => el.id !== asset.id));
    }
  };

  const onDeleteAsset = () => {
    const deletedIds = selectedAssets?.map((el) => el.id)?.join(",");
    setIsLoading(true);
    service.delete(`/system-asset`, { params: { ids: deletedIds } }).then(
      (res: any) => {
        setIsLoading(false);
        setSelectedAssets([]);
        toast(res.message, { type: "success" });

        const ids = activedFolders.map((el) => el.id);
        queryClient.setQueryData(
          [LIST_ASSETS_BY_FOLDER, ROOT_FOLDER, ids],
          (oldData: any) => {
            if (!Array.isArray(oldData?.results)) return undefined;
            return {
              ...oldData,
              results: oldData?.results.filter(
                (el) => !selectedAssets?.some((asset) => asset.id === el.id)
              ),
            };
          }
        );
      },
      () => setIsLoading(false)
    );
  };

  const onClickAsset = (e, asset: Asset) => {
    const isShiftKey = e.shiftKey;
    const isCtrlKey = e.ctrlKey || e.metaKey; // Sử dụng metaKey để hỗ trợ trên macOS

    if (!isShiftKey && !isCtrlKey) {
      setSelectedAssets([asset]);
    }

    const firstIdx = listAssets.findIndex(
      (el) => el.id === selectedAssets?.[0]?.id
    );
    const crrIdx = listAssets.findIndex((el) => el.id === asset.id);

    if (isShiftKey) {
      let newSelecteds = [];
      if (firstIdx < crrIdx) {
        newSelecteds = listAssets.slice(firstIdx, crrIdx + 1);
      } else {
        const newList = listAssets.slice(crrIdx, firstIdx + 1);
        newSelecteds = newList.reverse();
      }
      setSelectedAssets(newSelecteds);
    }

    if (isCtrlKey) {
      const isExist = selectedAssets.some((el) => el.id === asset.id);
      if (isExist) {
        setSelectedAssets(selectedAssets.filter((el) => el.id !== asset.id));
      } else {
        setSelectedAssets([...selectedAssets, asset]);
      }
    }
  };

  let filteredAssets = listAssets;
  if (search || activedType?.length) {
    filteredAssets = listAssets.filter((el) => {
      if (
        search &&
        (!el.name || !el.name.toLowerCase().includes(search.toLowerCase()))
      ) {
        return false;
      }
      if (activedType?.length && (!el.type || !activedType.includes(el.type))) {
        return false;
      }
      return true;
    });
  }

  const isDefault =
    activedFolders.length === 1 && activedFolders[0].key === ROOT_FOLDER;
  const confirmTitle =
    selectedAssets?.length === 1
      ? "Delete this asset?"
      : "Delete " + selectedAssets?.length + " assets?";

  return (
    <div className="h-full px-4 sm:pl-2 sm:pr-5 w-full mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center text-lg font-semibold text-black">
          Assets
          {filteredAssets?.length > 0 && (
            <span> ({filteredAssets.length})</span>
          )}
          {isDefault ? (
            <></>
          ) : (
            <div className="hidden 2xl:flex items-center font-normal">
              <span className="mx-2">-</span>
              {activedFolders.length === 1 && (
                <span className="mr-1">Folder:</span>
              )}
              {showListData(
                activedFolders.map((el) => el.name),
                "folder",
                1,
                "top"
              )}
            </div>
          )}
        </div>
        {fullFeature && (
          <div className="flex space-x-2">
            <Button size="small" icon={<PlusOutlined />} onClick={onAddAsset}>
              <span className="text-xs2">Add</span>
            </Button>
            <Popconfirm
              placement="left"
              title={confirmTitle}
              onConfirm={onDeleteAsset}
              okText="Yes"
              cancelText="No"
            >
              <Button
                size="small"
                danger
                type="primary"
                disabled={!selectedAssets?.length}
                icon={<DeleteOutlined />}
              >
                <span className="text-xs2">Delete</span>
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      <div className="flex items-center flex-wrap -mx-1 2xl:-mx-2">
        <AntInput
          allowClear
          placeholder="Search name"
          prefix={<SearchOutlined />}
          className="xs:!w-[220px] !mx-1 2xl:!mx-2 !mt-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          className="w-full xs:w-[180px] !mx-1 2xl:!mx-2 !mt-2"
          placeholder="Select asset types"
          mode="multiple"
          maxTagCount="responsive"
          value={activedType}
          onChange={setActivedType}
        >
          {ASSET_TYPES.map((type, idx) => (
            <Select.Option value={type} key={idx}>
              {getLabelFromStr(type)}
            </Select.Option>
          ))}
        </Select>
      </div>

      {filteredAssets.length > 0 && (
        <div
          className="rounded-t border-t mt-3 overflow-x-auto"
          id="AssetTable"
        >
          <AssetItem
            height={height}
            filteredAssets={filteredAssets}
            selectedAssets={selectedAssets}
            onClickAsset={onClickAsset}
            onChangeCheckbox={onChangeCheckbox}
            setPreviewData={setPreviewData}
            setImgPreview={setImgPreview}
            fullFeature={fullFeature}
          />
        </div>
      )}

      {initedAssets && !filteredAssets?.length && <Empty className="!mt-3" />}

      <ModalAddAsset
        isOpen={isOpenAddModal}
        onClose={() => setIsOpenAddModal(false)}
        listFolders={activedFolders}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
      />
      <VideoPopup
        classNames="!z-1190"
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />
      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </div>
  );
}

export default AssetTable;
