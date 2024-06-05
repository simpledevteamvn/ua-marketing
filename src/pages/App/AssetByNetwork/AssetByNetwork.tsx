import React, { useEffect, useState } from "react";
import service from "../../../partials/services/axios.config";
import Page from "../../../utils/composables/Page";
import { onLoadWhenAppChange } from "../../../utils/hooks/CustomHooks";
import CreativeTable from "./Table/CreativeTable";
import Select from "antd/lib/select";
import { useParams } from "react-router";
import VideoPopup from "../Creative/VideoPopup/VideoPopup";
import ImagePreview from "../Creative/ImagePreview/ImagePreview";
import { Button } from "antd";
import CloudUploadOutlined from "@ant-design/icons/lib/icons/CloudUploadOutlined";
import { getAppFromAdNetwork } from "../../../utils/Helpers";
import ModalUpload from "./ModalUpload/ModalUpload";

function AssetByNetwork(props) {
  const urlParams = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<any>([]);
  const [previewData, setPreviewData] = useState({});
  const [imgPreview, setImgPreview] = useState<any>({});

  const [listTypes, setListTypes] = useState([]);
  const [applicationsData, setApplicationsData] = useState<any>([]);
  const [activedApp, setActivedApp] = useState<any>({});

  const [isUpload, setIsUpload] = useState(false);

  onLoadWhenAppChange();

  useEffect(() => {
    setIsLoading(true);
    const getApp = service.get(`/store-app/${urlParams.appId}`);
    const getType = service.get("/asset/types");
    const getAsset = service.get("/asset", {
      params: { storeAppId: urlParams.appId },
    });
    Promise.all([getApp, getType, getAsset]).then(
      (res: any) => {
        const apps = res[0].results?.applications || [];
        const appFromAdNetwork = getAppFromAdNetwork(apps);

        setApplicationsData(appFromAdNetwork);
        setListTypes(res[1].results || []);
        setAssets(res[2].results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, []);

  const onChangeTargetApp = (value) => {
    const activedApp = applicationsData.find((el) => el.id === value);
    setActivedApp(activedApp);
  };

  const onUpload = () => {
    setIsUpload(true);
  };

  const uploadCallback = (newAsset) => {
    setAssets([...assets, newAsset]);
  };

  let listAssets = assets;
  if (activedApp?.id) {
    listAssets = assets.filter(
      (el) => el.networkConnectorId === activedApp?.networkConnector?.id
    );
  }

  return (
    <Page>
      <div className="flex justify-between">
        <div className="page-title">Assets</div>

        <Button
          type="primary"
          onClick={onUpload}
          icon={<CloudUploadOutlined />}
        >
          Upload
        </Button>
      </div>

      <div className="flex items-center flex-wrap -mx-1 2xl:-mx-2">
        <div className="!mx-1 2xl:!mx-2 !mt-3">Target:</div>
        <Select
          allowClear
          placeholder="Select linked app"
          className="xs:!w-[350px] !mx-1 2xl:!mx-2 !mt-3"
          value={activedApp?.id}
          onChange={onChangeTargetApp}
        >
          {applicationsData?.length > 0 &&
            applicationsData.map((data: any, idx) => {
              const networkConnectorName = data.networkConnector?.name;
              const appName = data.name;
              const imgUrl = data.networkConnector?.network?.imageUrl;
              return (
                <Select.Option value={data.id} key={idx}>
                  <div className="flex items-center">
                    {imgUrl && (
                      <img src={imgUrl} alt=" " className="h-5 w-5 mr-1.5" />
                    )}
                    {networkConnectorName} - {appName}
                  </div>
                </Select.Option>
              );
            })}
        </Select>
      </div>

      <div className="mt-8">
        <CreativeTable
          data={listAssets}
          setPreviewData={setPreviewData}
          setImgPreview={setImgPreview}
          isLoading={isLoading}
          listTypes={listTypes}
        />
      </div>

      <ModalUpload
        isOpen={isUpload}
        onClose={() => setIsUpload(false)}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
        uploadCallback={uploadCallback}
      />

      <VideoPopup
        classNames="!z-1190"
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />
      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </Page>
  );
}

export default AssetByNetwork;
