import React, { useEffect, useState } from "react";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import service from "../../../../../partials/services/axios.config";
import Loading from "../../../../../utils/Loading";
import { toast } from "react-toastify";
import Form from "antd/lib/form";
import AntInput from "antd/lib/input/Input";
import {
  CHOOSE_ASSET,
  COUNTRY_REQUIRED,
  FIELD_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../../constants/formMessage";
import Select from "antd/lib/select";
import { useParams } from "react-router-dom";
import VideoPopup from "../../../Creative/VideoPopup/VideoPopup";
import ImagePreview from "../../../Creative/ImagePreview/ImagePreview";
import ListCreatives from "../../../AddCampaigns/Networks/Mintegral/Step4/ModalAddCreatives/ListCreatives";
import message from "antd/lib/message";
import {
  FAKED,
  MESSAGE_DURATION,
  NETWORK_CODES,
} from "../../../../../constants/constants";
import SelectCountry from "../../../../../partials/common/Forms/SelectCountry";
import Radio from "antd/lib/radio";
import { ASSET_MOBILE_OPTIONS, ASSET_MODE, ASSET_OPTIONS } from "./constants";
import UploadAsset from "../../../../../partials/common/Forms/UploadAsset";
import Assets from "../../../../Assets/Assets";
import { getTotalSelected } from "../../../../../utils/helper/UIHelper";
import { useWindowSize } from "../../../../../partials/sidebar/Sidebar";

function ModalAddPack(props) {
  const urlParams = useParams();
  const [form] = Form.useForm();
  const [width] = useWindowSize();
  const { isOpen, onClose, campaignData, handleAddCreatives } = props;
  const networkCode = campaignData?.network?.code;
  const isUnityNetwork = networkCode === NETWORK_CODES.unity;

  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [imgPreview, setImgPreview] = useState<any>({});
  const [isMobile, setIsMobile] = useState(false);

  const [configs, setConfigs] = useState<any>({});
  const [assets, setAssets] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  const [fileList, setFileList] = useState<any>([]);
  const [selectedSysAssets, setSelectedSysAssets] = useState<any>([]);

  const formAssetSource = Form.useWatch("assetSource", form);

  const initialValues = {
    assetEl: FAKED,
    assetSource: ASSET_OPTIONS[0].value,
  };

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
      setPreviewData({});
      setImgPreview({});
      setSelectedRecords([]);
      setFileList([]);
      setSelectedSysAssets([]);
    }, 300);
  };

  useEffect(() => {
    if (!width) return;
    if (width >= 640 && isMobile) {
      return setIsMobile(false);
    }
    if (width < 640 && !isMobile) {
      return setIsMobile(true);
    }
  }, [width]);

  useEffect(() => {
    if (!isOpen || !networkCode) return;

    const params = {
      storeAppId: urlParams.appId,
      rawAppIds: campaignData?.rawAppId,
    };

    const getConfig = service.get("/creative-pack/config", {
      params: { networkCode },
    });
    const getAsset = service.get("/asset", { params });
    setIsLoading(true);
    Promise.all([getConfig, getAsset]).then(
      (res: any) => {
        setConfigs(res[0].results || {});
        setAssets(res[1].results || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  const onChangeAssetSource = (e) => {
    fileList?.length && setFileList([]);
    selectedRecords?.length && setSelectedRecords([]);
    selectedSysAssets?.length && setSelectedSysAssets([]);
  };

  const onFinish = (values) => {
    const { name, type, languages, countries, assetSource, assets } = values;

    if (
      (!selectedRecords?.length &&
        (isUnityNetwork ||
          (!isUnityNetwork &&
            formAssetSource === ASSET_MODE.assetFromNetwork))) ||
      (!selectedSysAssets?.length &&
        formAssetSource === ASSET_MODE.systemAssets)
    ) {
      return message.error(CHOOSE_ASSET, MESSAGE_DURATION);
    }

    // Dùng formData vì BE dùng chung với hàm có để tham số là file
    const formData = new FormData();

    // Tạo creative-pack của Unity có 2 trường hợp, tạo cho campaign hoặc tạo cho rawApp
    // Với trường hợp tạo creative-pack cho campaign thì chỉ cần truyền thêm campaignId và không cần truyền appId
    formData.append("campaignId", campaignData?.id);
    // formData.append("appId", "");
    formData.append("name", name);

    if (isUnityNetwork) {
      formData.append("type", type);
      selectedRecords.forEach((el) => {
        formData.append("assetIds", el);
      });
    } else {
      languages.forEach((el) => {
        formData.append("languages", el);
      });
      countries.forEach((el) => {
        formData.append("countries", el);
      });

      switch (assetSource) {
        case ASSET_MODE.files:
          assets.forEach((el) => {
            formData.append("files", el.originFileObj);
          });
          break;
        case ASSET_MODE.assetFromNetwork:
          selectedRecords.forEach((el) => {
            formData.append("assetIds", el);
          });
          break;
        case ASSET_MODE.systemAssets:
          selectedSysAssets
            .map((el) => el.id)
            ?.forEach((el) => {
              formData.append("systemAssetIds", el);
            });
          break;
        default:
          break;
      }
    }

    setIsLoading(true);
    service.post("/creative-pack", formData).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        onCloseModal();
        setIsLoading(false);
        res.results?.id && handleAddCreatives([res.results]);
      },
      () => setIsLoading(false)
    );
  };

  const AssetFromNetworkEl = (
    <ListCreatives
      isShortcut={true}
      data={assets}
      selectedRecords={selectedRecords}
      setSelectedRecords={setSelectedRecords}
      setImgPreview={setImgPreview}
      setPreviewData={setPreviewData}
    />
  );
  const languages = configs?.languages || {};
  const isShowLang = Object.keys(languages)?.length > 0;

  return (
    <Form
      id="FormAddCreativePack"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title="Add creative pack"
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
            form="FormAddCreativePack"
          >
            Add
          </Button>,
        ]}
      >
        {isLoading && <Loading />}

        <Form.Item
          name="name"
          label="Creative pack name"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <AntInput placeholder="Enter a name" />
        </Form.Item>

        {configs?.types?.length > 0 && (
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: FIELD_REQUIRED }]}
          >
            <Select placeholder="Select type" className="">
              {configs.types.map((type, idx) => (
                <Select.Option value={type} key={idx}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {isShowLang && (
          <Form.Item
            name="languages"
            label="Languages"
            rules={[{ required: true, message: FIELD_REQUIRED }]}
          >
            <Select
              placeholder="Select language"
              className=""
              mode="multiple"
              maxTagCount="responsive"
              allowClear
            >
              {Object.keys(languages).map((lang, idx) => (
                <Select.Option value={languages[lang]} key={idx}>
                  {lang}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {!isUnityNetwork ? (
          <>
            <Form.Item
              name="countries"
              label="Countries"
              rules={[{ required: true, message: COUNTRY_REQUIRED }]}
            >
              <SelectCountry />
            </Form.Item>

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
                  {isMobile
                    ? ASSET_MOBILE_OPTIONS.map((el) => (
                        <Radio.Button value={el.value} key={el.value}>
                          {el.label}
                        </Radio.Button>
                      ))
                    : ASSET_OPTIONS.map((el) => (
                        <Radio.Button value={el.value} key={el.value}>
                          {el.label}
                        </Radio.Button>
                      ))}
                </Radio.Group>
              </Form.Item>
            </Form.Item>

            {formAssetSource === ASSET_MODE.files && (
              <UploadAsset fileList={fileList} setFileList={setFileList} />
            )}
            {formAssetSource === ASSET_MODE.assetFromNetwork && (
              <div className="-mt-4">{AssetFromNetworkEl}</div>
            )}
            {formAssetSource === ASSET_MODE.systemAssets && (
              <div>
                {getTotalSelected(selectedSysAssets)}
                <Assets
                  fullFeature={false}
                  onSelectAssets={setSelectedSysAssets}
                />
              </div>
            )}
          </>
        ) : (
          AssetFromNetworkEl
        )}

        <VideoPopup
          onClose={() => setPreviewData({})}
          previewData={previewData}
        />
        <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
      </Modal>
    </Form>
  );
}

export default ModalAddPack;
