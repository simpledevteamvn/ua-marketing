import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import { toast } from "react-toastify";
import Form from "antd/lib/form";
import AntInput from "antd/lib/input/Input";
import {
  CHOOSE_ASSET,
  FIELD_REQUIRED,
  UPLOAD_CORRECT_SIZES,
  UPLOAD_ONE_ONLY,
  UPLOAD_TWO_ASSETS,
  VALUE_REQUIRED,
} from "../../../../constants/formMessage";
import Select from "antd/lib/select";
import { useParams } from "react-router-dom";
import message from "antd/lib/message";
import {
  FAKED,
  MESSAGE_DURATION,
  NETWORK_CODES,
} from "../../../../constants/constants";
import Radio from "antd/lib/radio";
import UploadAsset from "../../../../partials/common/Forms/UploadAsset";
import Assets from "../../../Assets/Assets";
import { getTotalSelected } from "../../../../utils/helper/UIHelper";
import { getNetworkConnector } from "../../AddCampaigns/Helpers";
import {
  getAppFromAdNetwork,
  getLabelFromStr,
} from "../../../../utils/Helpers";
import { useQuery } from "@tanstack/react-query";
import { LIST_CONFIGS_FOR_UPLOAD } from "../../../../api/constants.api";
import { getConfigsForUploadingAsset } from "../../../../api/assets/assets.api";
import { UNITY_ASSET_TYPE } from "../../../../constants/asset";
import UploadNotes from "./UploadNotes";
import { PORTRAIT_IMG_SIZE, checkAssetSize } from "../Helpers";
import Empty from "antd/lib/empty";

const ASSET_MODE = {
  files: "files",
  systemAssets: "systemAssetIds",
};
const ASSET_OPTIONS = [
  { label: "Upload files", value: ASSET_MODE.files },
  { label: "System assets", value: ASSET_MODE.systemAssets },
];
const formId = "FormUploadAssetToNetwork";
const NetworksWithSingleUpload = [NETWORK_CODES.mintegral];
const SUPPORTED_NETWORKS = [NETWORK_CODES.mintegral, NETWORK_CODES.unity];
const NetworksWithoutUpload = [
  NETWORK_CODES.applovin, // Phải upload qua creative pack
];

function ModalUpload(props) {
  const urlParams = useParams();
  const [form] = Form.useForm();
  const { isOpen, onClose, setImgPreview, setPreviewData, uploadCallback } =
    props;

  const [isLoading, setIsLoading] = useState(false);
  const [applicationsData, setApplicationsData] = useState<any>([]);

  const [multiple, setMultiple] = useState(true);
  const [fileList, setFileList] = useState<any>([]);
  const [filesSizes, setFilesSizes] = useState<string[]>([]);
  const [selectedSysAssets, setSelectedSysAssets] = useState<any>([]);

  const [networkCode, setNetworkCode] = useState<string>();
  const [configs, setConfigs] = useState<any>({});

  const formType = Form.useWatch("type", form);
  const formAssetSource = Form.useWatch("assetSource", form);
  const isEndCardType = formType === UNITY_ASSET_TYPE.endCardPair;
  const isSupported = networkCode && SUPPORTED_NETWORKS.includes(networkCode);

  const initialValues = {
    assetEl: FAKED,
    assetSource: ASSET_OPTIONS[0].value,
  };

  const { data: configsRes } = useQuery({
    queryKey: [LIST_CONFIGS_FOR_UPLOAD, networkCode],
    queryFn: getConfigsForUploadingAsset,
    staleTime: 30 * 60000,
    enabled: !!networkCode,
  });

  useEffect(() => {
    setConfigs(configsRes?.results || {});
  }, [configsRes]);

  useEffect(() => {
    if (!isOpen) return;

    const getApp = service.get(`/store-app/${urlParams.appId}`);
    setIsLoading(true);
    Promise.all([getApp]).then(
      (res: any) => {
        const apps = res[0]?.results?.applications || [];
        const appFromAdNetwork = getAppFromAdNetwork(apps);

        const supportedApps = appFromAdNetwork?.filter((el) =>
          SUPPORTED_NETWORKS.includes(el.networkConnector?.network.code)
        );
        setApplicationsData(supportedApps);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
      setFileList([]);
      setSelectedSysAssets([]);
      setNetworkCode(undefined);
    }, 300);
  };

  const onChangeAssetSource = (e) => {
    fileList?.length && setFileList([]);
    selectedSysAssets?.length && setSelectedSysAssets([]);
  };

  const getNetworkCode = (value) => {
    const activedApp = applicationsData.find((el) => el.id === value);
    return activedApp?.networkConnector?.network?.code;
  };

  const onChangeTargetApp = (value) => {
    const networkCode = getNetworkCode(value);
    if (networkCode && NetworksWithSingleUpload.includes(networkCode)) {
      setMultiple(false);
    } else {
      setMultiple(true);
    }
    setNetworkCode(networkCode);
    setFileList([]);

    form.resetFields();
    setTimeout(() => {
      form.setFieldValue("targetNetwork", value);
    }, 100);
  };

  const onChangeType = (value) => {
    setFileList([]);
  };

  const onFinish = (values) => {
    const { targetNetwork, assetSource, language, name, type } = values;
    const activedApp = applicationsData.find((el) => el.id === targetNetwork);

    if (isEndCardType) {
      if (
        (assetSource === ASSET_MODE.systemAssets &&
          selectedSysAssets?.length !== 2) ||
        (assetSource === ASSET_MODE.files && fileList?.length !== 2)
      ) {
        return message.error(UPLOAD_TWO_ASSETS, MESSAGE_DURATION);
      }

      let sizes: any;
      if (assetSource === ASSET_MODE.systemAssets) {
        sizes = selectedSysAssets.map((el) =>
          el.width && el.height ? el.width + " x " + el.height : ""
        );
      } else {
        sizes = filesSizes;
      }
      const checkedSizeResult = checkAssetSize(sizes);
      if (!checkedSizeResult.isValid) {
        return message.error(
          UPLOAD_CORRECT_SIZES +
            " Accpeted: " +
            checkedSizeResult.sizes.join(", " + "."),
          MESSAGE_DURATION
        );
      }
    }
    if (assetSource === ASSET_MODE.systemAssets) {
      if (!selectedSysAssets?.length) {
        return message.error(CHOOSE_ASSET, MESSAGE_DURATION);
      }
      if (
        selectedSysAssets?.length > 1 &&
        NetworksWithSingleUpload.includes(networkCode!)
      ) {
        return message.error(UPLOAD_ONE_ONLY, MESSAGE_DURATION);
      }
    }

    let file = "";
    let systemAssetId = "";
    if (assetSource === ASSET_MODE.systemAssets) {
      systemAssetId = selectedSysAssets[0].id;
    } else if (assetSource === ASSET_MODE.files) {
      file = fileList[0];
    }

    const formData = new FormData();
    formData.append("rawAppId", activedApp?.rawAppId);
    formData.append("networkConnectorId", activedApp?.networkConnector?.id);

    switch (networkCode) {
      case NETWORK_CODES.unity:
        formData.append("name", name);
        formData.append("language", language);
        formData.append("type", type);

        if (isEndCardType) {
          if (assetSource === ASSET_MODE.files) {
            const portraitImg =
              fileList[0] === PORTRAIT_IMG_SIZE ? fileList[0] : fileList[1];
            const landscapeImg =
              fileList[0] === PORTRAIT_IMG_SIZE ? fileList[1] : fileList[0];

            formData.append("portraitEndCardFile", portraitImg);
            formData.append("landscapeEndCardFile", landscapeImg);
          } else {
            const portraitImg =
              filesSizes[0] === PORTRAIT_IMG_SIZE
                ? selectedSysAssets[0]
                : selectedSysAssets[1];
            const landscapeImg =
              filesSizes[0] === PORTRAIT_IMG_SIZE
                ? selectedSysAssets[1]
                : selectedSysAssets[0];

            formData.append("portraitEndCardSystemAssetId", portraitImg?.id);
            formData.append("landscapeEndCardSystemAssetId", landscapeImg?.id);
          }
        } else {
          formData.append("file", file);
          formData.append("systemAssetId", systemAssetId);
        }
        break;

      default:
        // Network: Mintegral + logic chung
        formData.append("file", file);
        formData.append("systemAssetId", systemAssetId);
        break;
    }

    setIsLoading(true);
    service.post("/asset", formData).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        onCloseModal();
        setIsLoading(false);
        uploadCallback(res.results);
      },
      () => setIsLoading(false)
    );
  };

  const languages = configs?.languages || {};
  const isShowLang = Object.keys(languages)?.length > 0;
  const isMultiple = isEndCardType ? true : multiple;

  return (
    <Form
      id={formId}
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title="Upload assets to network"
        maskClosable={false}
        width={1000}
        open={isOpen}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form={formId}
            disabled={!isSupported}
          >
            Add
          </Button>,
        ]}
      >
        {isLoading && <Loading />}

        <Form.Item
          name="targetNetwork"
          label="Target"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <Select
            placeholder="Select linked app"
            className="max-w-3xl"
            onChange={onChangeTargetApp}
          >
            {getNetworkConnector(applicationsData)}
          </Select>
        </Form.Item>

        {networkCode === NETWORK_CODES.unity && (
          <>
            <Form.Item
              name="name"
              label="Asset name"
              rules={[{ required: true, message: VALUE_REQUIRED }]}
            >
              <AntInput placeholder="Enter a name" className="max-w-3xl" />
            </Form.Item>

            {isShowLang && (
              <Form.Item
                name="language"
                label="Languages"
                rules={[{ required: true, message: FIELD_REQUIRED }]}
              >
                <Select
                  placeholder="Select language"
                  className="max-w-3xl"
                  allowClear
                  showSearch
                >
                  {Object.keys(languages).map((lang, idx) => (
                    <Select.Option value={languages[lang]} key={idx}>
                      {lang}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </>
        )}

        {configs?.types?.length > 0 && (
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: FIELD_REQUIRED }]}
          >
            <Select
              placeholder="Select type"
              className="max-w-3xl"
              onChange={onChangeType}
            >
              {configs.types.map((type, idx) => (
                <Select.Option value={type} key={idx}>
                  {getLabelFromStr(type)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {isSupported && (
          <>
            <Form.Item className="!mb-0">
              <Form.Item
                label="Assets"
                name="assetEl"
                rules={[{ required: true }]}
                className="!h-0 !mb-0"
              >
                <Select className="!hidden" />
              </Form.Item>
              <Form.Item
                name="assetSource"
                label={<></>}
                colon={false}
                className="!mb-4 max-w-3xl custom-mobile-form"
                labelCol={{ sm: { span: 4 }, xs: { span: 24 } }}
                wrapperCol={{ sm: { span: 20 }, xs: { span: 24 } }}
              >
                <Radio.Group onChange={onChangeAssetSource}>
                  {ASSET_OPTIONS.map((el) => (
                    <Radio.Button value={el.value} key={el.value}>
                      {el.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Form.Item>

            {formAssetSource === ASSET_MODE.files && (
              <>
                <UploadNotes networkCode={networkCode} />
                <UploadAsset
                  multiple={isMultiple}
                  fileList={fileList}
                  setFileList={setFileList}
                  setImgPreview={setImgPreview}
                  setPreviewData={setPreviewData}
                  handleSetSizes={setFilesSizes}
                />
              </>
            )}

            {formAssetSource === ASSET_MODE.systemAssets && (
              <div>
                <UploadNotes networkCode={networkCode} />
                {getTotalSelected(selectedSysAssets)}
                <Assets
                  fullFeature={false}
                  onSelectAssets={setSelectedSysAssets}
                />
              </div>
            )}
          </>
        )}

        {!isSupported && networkCode && (
          <div className="mt-10">
            <Empty description={false} />
            <div className="text-center italic my-1">
              Sorry. We currently don't support uploading assets to this
              network.
            </div>
          </div>
        )}
      </Modal>
    </Form>
  );
}

export default ModalUpload;
