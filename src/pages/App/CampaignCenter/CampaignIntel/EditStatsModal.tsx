import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import Tooltip from "antd/lib/tooltip";
import Button from "antd/lib/button";
import Select from "antd/lib/select";
import Row from "antd/lib/row";
import Col from "antd/lib/col";
import Form from "antd/lib/form";
import Modal from "antd/lib/modal";
import Radio from "antd/lib/radio";
import InputNumber from "antd/lib/input-number";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import {
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_NETWORK_OPTION,
  EDITABLE_STATS,
  EDITABLE_STAT_IDS,
  LIST_CAMPAIGN_STATUS,
  MESSAGE_DURATION,
} from "../../../../constants/constants";
import {
  CAMPAIGN_REQUIRED,
  COUNTRY_REQUIRED,
  ENTER_NEW_VALUE,
  NETWORK_REQUIRED,
  STATS_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../constants/formMessage";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import {
  DESCRIPTION_TOOLTIP,
  getSelectMultipleParams,
  SELECT_COUNTRIES_TOOLTIP,
  checkMaximumPercentage,
} from "../../../../utils/Helpers";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BATCH_EDIT_TYPES,
  getListAdNetwork,
} from "../../../../api/common/common.api";
import { LIST_AD_NETWORK_BY_EDITABLE_STAT } from "../../../../api/constants.api";
import message from "antd/lib/message";
import {
  BID_ADJUSTMENT,
  BidAdjustmentDrd,
  DIMENSION_SUFFIX,
  DimensionSuffixDrd,
} from "../../../../partials/common/Dropdowns/Dropdowns";
import { showBatchErrModal } from "./BatchErrorModal/BatchErrorModal";
import { confirmValue } from "../../../../utils/helper/UIHelper";
import ModalPreview from "./EditPreview/ModalPreview";

const { Option } = Select;

function EditStatsModal(props) {
  const urlParams = useParams();
  const { isOpen, onClose, onSubmit } = props;
  const [form] = Form.useForm();

  const defaultBidAdjusmentIdx = 0;
  const [bidAdjustment, setBidAdjustment] = useState(defaultBidAdjusmentIdx);

  const defaultStat = EDITABLE_STAT_IDS.bid;
  const [isLoading, setIsLoading] = useState(false);
  const [listAdNetwork, setListAdNetwork] = useState([]);
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);
  const [activedTabLevel, setActivedTabLevel] = useState(
    BATCH_EDIT_TYPES.country
  );
  const [initNetworkSuccess, setInitNetworkSuccess] = useState(false);

  const defaultCampSuff = DIMENSION_SUFFIX.includes;
  const [campaignSuffix, setCampaignSuffix] = useState(defaultCampSuff);
  const [countrySuffix, setCountrySuffix] = useState(defaultCampSuff);

  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [listPreviewData, setListPreviewData] = useState([]);

  const formStat = Form.useWatch("stats", form);
  const formNetwork = Form.useWatch("network", form);
  const formCampaign = Form.useWatch("campaignName", form);
  const formCountries = Form.useWatch("countries", form);
  const formBidAdjustmentValue = Form.useWatch("bidAdjustmentValue", form);
  const formTabLevel = Form.useWatch("tabLevel", form);
  const formCampStatus = Form.useWatch("campaignStatus", form);

  const initialValues = {
    stats: defaultStat,
    network: [ALL_NETWORK_OPTION],
    campaignName: [ALL_CAMPAIGNS_OPTION],
    countries: [ALL_COUNTRIES_OPTION],
    bidAdjustment: defaultBidAdjusmentIdx,
    bidAdjustmentValue: BID_ADJUSTMENT[defaultBidAdjusmentIdx].bidDefaultValue,
    campaignStatus: LIST_CAMPAIGN_STATUS.running.value,
    tabLevel: BATCH_EDIT_TYPES.country,
    campaignLabelEl: "faked",
    countryLabelEl: "faked",
    campaignSuffix: defaultCampSuff,
    countrySuffix: defaultCampSuff,
  };

  const { data: listNetworkRes } = useQuery({
    queryKey: [LIST_AD_NETWORK_BY_EDITABLE_STAT, form.getFieldValue("stats"), activedTabLevel], // formTabLevel
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!listNetworkRes) return;

    setListAdNetwork(listNetworkRes.results);
    setInitNetworkSuccess(true);
  }, [listNetworkRes]);

  useEffect(() => {
    service.get("/exchange-rate").then(
      (res: any) => {
        setCurrenciesConfigs(res.results || []);
      },
      () => { }
    );
  }, []);

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setBidAdjustment(defaultBidAdjusmentIdx)
    }, 300);
  };

  const onChangeBatchType = (value) => {
    form.resetFields();
    form.setFieldValue("tabLevel", value);
    setActivedTabLevel(value);
    setBidAdjustment(defaultBidAdjusmentIdx)
  };

  const onChangeStats = () => {
    form.setFieldsValue({ bidAdjustmentValue: getDefaultBidAdjusmentValue(bidAdjustment) });
    onChangeBidAdjustment(bidAdjustment);

    if (
      (formNetwork?.length === 1 && formNetwork[0] !== ALL_NETWORK_OPTION) ||
      formNetwork?.length > 1
    ) {
      onChangeNetwork([]);
    }
  };

  const onChangeBidAdjustment = (value) => {
    if (value === 4 || bidAdjustment === 4 ||
      (getDefaultBidAdjusmentStep(bidAdjustment) != getDefaultBidAdjusmentStep(value))) {
      form.setFieldsValue({ bidAdjustmentValue: getDefaultBidAdjusmentValue(value) });
    }

    setBidAdjustment(value);

    if (currentBidAdjustmentIsValue() && form.getFieldValue("countries").includes(ALL_COUNTRIES_OPTION)) {
      form.setFieldsValue({ countries: [] });
    }
  }

  const onChangeNetwork = (networkName) => {
    if (networkName[0] === ALL_NETWORK_OPTION) {
      form.setFieldsValue({ network: [ALL_NETWORK_OPTION] });
    } else {
      form.setFieldsValue({ network: networkName });
    }

    if (
      (formCampaign?.length === 1 &&
        formCampaign[0] !== ALL_CAMPAIGNS_OPTION) ||
      formCampaign?.length > 1
    ) {
      form.setFieldsValue({ campaignName: [] });
    }
  };

  const onChangeCampaign = (campaign) => {
    if (campaign[0] === ALL_CAMPAIGNS_OPTION) {
      form.setFieldsValue({ campaignName: [ALL_CAMPAIGNS_OPTION] });
    } else {
      form.setFieldsValue({ campaignName: campaign })
    }
  };

  const onChangeCountry = (country) => {
    if (country[0] === ALL_COUNTRIES_OPTION) {
      form.setFieldsValue({ countries: [ALL_COUNTRIES_OPTION] });
    } else {
      form.setFieldsValue({ countries: country })
    }
  };

  const onFinish = (values) => {
    const { bidAdjustmentValue } = values;

    if (currentBidAdjustmentIsValue()) {
      return onBatchEdit();
    }

    if (checkMaximumPercentage(bidAdjustmentValue)) {
      return confirmValue(onBatchEdit);
    } else {
      return onBatchEdit();
    }
  };

  const bidAdjustmentIsValue = (value) => {
    return BID_ADJUSTMENT[value].value >= 2;
  }

  const currentBidAdjustmentIsValue = () => {
    return bidAdjustmentIsValue(form.getFieldValue("bidAdjustment"));
  }

  const getDefaultBidAdjusmentValue = (bidAdjustmentIdx) => {
    const activeBidAdjustment = BID_ADJUSTMENT[bidAdjustmentIdx];
    return form.getFieldValue("stats") === EDITABLE_STAT_IDS.bid ? activeBidAdjustment.bidDefaultValue : activeBidAdjustment.budgetDefaultValue;
  }

  const getDefaultBidAdjusmentStep = (bidAdjustmentIdx) => {
    const activeBidAdjustment = BID_ADJUSTMENT[bidAdjustmentIdx];
    return form.getFieldValue("stats") === EDITABLE_STAT_IDS.bid ? activeBidAdjustment.bidStep : activeBidAdjustment.budgetStep;
  }

  const onBatchEdit = (isGetPreview = false) => {
    const stats = formStat;
    const network = formNetwork;
    const campaignName = formCampaign;
    const countries = formCountries;
    const bidAdjustmentValue = formBidAdjustmentValue;

    if (bidAdjustmentValue === 0) {
      return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
    }

    let params: any = {
      storeAppId: urlParams.appId,
      networks: getSelectMultipleParams(network, ALL_NETWORK_OPTION),
      campaignIds: getSelectMultipleParams(campaignName, ALL_CAMPAIGNS_OPTION),
      countries: getSelectMultipleParams(countries, ALL_COUNTRIES_OPTION),
      isExcludeCampaign: campaignSuffix === DIMENSION_SUFFIX.excludes,
      isExcludeCountry: countrySuffix === DIMENSION_SUFFIX.excludes,
      level: formTabLevel,
      campaignStatus: formCampStatus,
    };

    setParamValue(params, bidAdjustmentValue);

    if (isGetPreview) {
      return { ...params, isPreview: true };
    }

    if (formTabLevel === BATCH_EDIT_TYPES.campaign) {
      delete params.countries;
    }

    setIsLoading(true);
    service.put(`/${stats}/batch/allow-failure`, params).then(
      (res: any) => {
        setIsLoading(false);
        onSubmit && onSubmit();
        onCloseModal();

        if (!res.results?.length) {
          toast(res.message, { type: "success" });
          return;
        }

        showBatchErrModal(res.results);
      },
      () => setIsLoading(false)
    );
  };

  const setParamValue = (params, bidAdjustmentValue) => {
    if (bidAdjustment === 0) {
      params.percentage = 100 + bidAdjustmentValue;
    } else if (bidAdjustment === 1) {
      params.percentage = 100 - bidAdjustmentValue;
    } else if (bidAdjustment === 2) {
      params.increaseValue = bidAdjustmentValue;
    } else if (bidAdjustment === 3) {
      params.decreaseValue = bidAdjustmentValue;
    } else {
      params.value = bidAdjustmentValue;
    }
  }

  const openPreview = () => {
    form.validateFields().then(
      (values) => {
        const params: any = onBatchEdit(true);

        if (!Object.keys(params || {})?.includes("isPreview")) return;

        setIsLoading(true);
        const url = formStat === "bid" ? `/${formStat}/batch/allow-failure` : `/${formStat}/batch`;
        service.put(url, params).then(
          (res: any) => {
            setIsOpenPreview(true);
            setListPreviewData(res.results);
            setIsLoading(false);
          },
          () => setIsLoading(false)
        );
      },
      () => { }
    );
  };

  return (
    <Form
      id="FormEditStats"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title="Batch edit"
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
            form="FormEditStats"
          >
            Run update
          </Button>,
        ]}
      >
        {isLoading && <Loading />}

        <Form.Item
          label="Level"
          name="tabLevel"
          labelCol={{ sm: { span: 5 }, xs: { span: 8 } }}
          wrapperCol={{ sm: { span: 14 }, xs: { span: 16 } }}
          rules={[{ required: true }]}
        >
          <Radio.Group
            className="w-full text-center"
            buttonStyle="solid"
            value={activedTabLevel}
            onChange={(e) => onChangeBatchType(e.target.value)}
          >
            <Radio.Button value={BATCH_EDIT_TYPES.country} className="w-[50%]">
              Country
            </Radio.Button>
            <Radio.Button value={BATCH_EDIT_TYPES.campaign} className="w-[50%]">
              Campaign
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="stats"
          label={
            <>
              Targeting
              <Tooltip
                title={DESCRIPTION_TOOLTIP}
                color="white"
                overlayClassName="tooltip-light"
              >
                <AiOutlineQuestionCircle size={16} className="ml-1" />
              </Tooltip>
            </>
          }
          rules={[{ required: true, message: STATS_REQUIRED }]}
        >
          <Select className="w-full" value={defaultStat} onChange={onChangeStats}>
            {EDITABLE_STATS.map((statObj, idx) => (
              <Option value={statObj.value} key={idx}>
                {statObj.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="network"
          label="Network"
          rules={[{ required: true, message: NETWORK_REQUIRED }]}
        >
          <SelectNetwork
            listNetwork={listAdNetwork}
            onChange={onChangeNetwork}
          />
        </Form.Item>

        <Form.Item
          label="Campaign"
          name="campaignLabelEl"
          rules={[{ required: true }]}
          className="!h-0 !mb-0"
        >
          <Select className="!hidden" />
        </Form.Item>
        <Form.Item
          name="campaignStatus"
          label={<></>}
          colon={false}
          className="!mb-2"
          labelCol={{ sm: { span: 5 }, xs: { span: 8 } }}
          wrapperCol={{ sm: { span: 19 }, xs: { span: 16 } }}
        >
          <Radio.Group onChange={() => form.setFieldValue("campaignName", [])}>
            {Object.values(LIST_CAMPAIGN_STATUS).map((data) => (
              <Radio value={data.value} key={data.value}>
                {data.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Row gutter={4}>
            <Col span={16} md={18}>
              <Form.Item
                noStyle
                name="campaignName"
                rules={[{ required: true, message: CAMPAIGN_REQUIRED }]}
              >
                <SelectCampaignByNetwork
                  initWithEmptyList
                  initNetworkSuccess={initNetworkSuccess}
                  listNetwork={listAdNetwork}
                  networkData={formNetwork}
                  status={formCampStatus}
                  onChange={onChangeCampaign}
                />
              </Form.Item>
            </Col>
            <Col span={8} md={6}>
              <Form.Item noStyle name="campaignSuffix">
                <DimensionSuffixDrd
                  value={campaignSuffix}
                  onChange={setCampaignSuffix}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {formTabLevel === BATCH_EDIT_TYPES.country && (
          <>
            <Form.Item
              label={
                <>
                  Countries
                  <Tooltip
                    title={SELECT_COUNTRIES_TOOLTIP}
                    color="white"
                    overlayClassName="tooltip-light"
                  >
                    <AiOutlineQuestionCircle size={16} className="ml-1" />
                  </Tooltip>
                </>
              }
              name="countryLabelEl"
              rules={[{ required: true }]}
              className="!mb-0 required-label"
            >
              <Select className="!hidden" />
            </Form.Item>
            <Form.Item>
              <Row gutter={4}>
                <Col span={16} md={18}>
                  <Form.Item
                    noStyle
                    name="countries"
                    rules={[{ required: true, message: COUNTRY_REQUIRED }]}
                  >
                    <SelectCountry
                      hasAllOpt={bidAdjustment <= 1}
                      onChange={onChangeCountry}
                    />
                  </Form.Item>
                </Col>
                <Col span={8} md={6}>
                  <Form.Item noStyle name="countrySuffix">
                    <DimensionSuffixDrd
                      value={countrySuffix}
                      onChange={setCountrySuffix}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </>
        )}

        <Form.Item
          label="Edit mode"
          name="editMode"
          labelCol={{ sm: { span: 5 }, xs: { span: 8 } }}
          wrapperCol={{ sm: { span: 19 }, xs: { span: 16 } }}
          className="!mb-2"
        >
        </Form.Item>

        <Form.Item>
          <Row gutter={4}>
            <Col span={16} md={18}>
              <Form.Item noStyle name="bidAdjustment">
                <BidAdjustmentDrd
                  value={bidAdjustment}
                  onChange={onChangeBidAdjustment}
                />
              </Form.Item>
            </Col>

            <Col span={8} md={6}>
              <Form.Item
                name="bidAdjustmentValue"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  min={0}
                  step={getDefaultBidAdjusmentStep(bidAdjustment)}
                  addonAfter={BID_ADJUSTMENT[bidAdjustment].icon}
                  className="!w-full"
                  onChange={(value) => form.setFieldsValue({ bidAdjustmentValue: value })}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        <div
          className="text-antPrimary/80 hover:text-antPrimary cursor-pointer custom-preview-data"
          onClick={openPreview}
        >
          Preview edited data
        </div>
      </Modal>

      <ModalPreview
        listData={listPreviewData}
        isOpen={isOpenPreview}
        onClose={() => setIsOpenPreview(false)}
        currenciesConfigs={currenciesConfigs}
        isReduceCol={true}
      />
    </Form>
  );
}

EditStatsModal.propType = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default EditStatsModal;
