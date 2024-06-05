import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import {
  COUNTRY_REQUIRED,
  ENTER_NEW_VALUE,
  VALUE_REQUIRED,
} from "../../../../../constants/formMessage";
import {
  SELECT_COUNTRIES_TOOLTIP,
  capitalizeWord,
  checkMaximumPercentage,
  isNumeric,
} from "../../../../../utils/Helpers";
import SelectCountry from "../../../../../partials/common/Forms/SelectCountry";
import {
  BID_RETENSION_TYPE,
  BID_ROAS_TYPE,
  DEFAULT_BID,
  DEFAULT_BID_STEP,
  DEFAULT_BUDGET,
  DEFAULT_BUDGET_STEP,
  DEFAULT_GOAL,
  EDITABLE_STAT_IDS,
  MESSAGE_DURATION,
  NETWORK_CODES,
} from "../../../../../constants/constants";
import InputNumber from "antd/lib/input-number";
import { ACTION_KEY } from "../../Helper";
import Tooltip from "antd/lib/tooltip";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { useParams } from "react-router-dom";
import { BATCH_EDIT_TYPES } from "../../../../../api/common/common.api";
import service from "../../../../../partials/services/axios.config";
import SelectCountryFromList from "../../../../../partials/common/Forms/SelectCountryFromList";
import ModalPreview from "../../../CampaignCenter/CampaignIntel/EditPreview/ModalPreview";
import AntInput from "antd/lib/input/Input";
import { Col, Row } from "antd/lib/grid";
import { BID_ADJUSTMENT, BidAdjustmentDrd } from "../../../../../partials/common/Dropdowns/Dropdowns";
import message from "antd/lib/message";
import { confirmValue } from "../../../../../utils/helper/UIHelper";

export const NETWORK_MERGE_BID_BUDGET = [
  NETWORK_CODES.applovin,
  NETWORK_CODES.unity,
];

function ModalBatch(props) {
  const urlParams = useParams();
  const [form] = Form.useForm();

  const {
    isOpen,
    onClose,
    action,
    type,
    onSubmit,
    campaignData,
    setIsLoading,
    listCountries,
    currenciesConfigs,
    campaignCurrency,
  } = props;

  const defaultBidAdjusmentIdx = 0;
  const [bidAdjustment, setBidAdjustment] = useState(defaultBidAdjusmentIdx);

  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [listPreviewData, setListPreviewData] = useState([]);

  const { network, bidType, defaultBudget, defaultTrackingUrl } = campaignData;

  const initialValues = {
    bid: DEFAULT_BID,
    goal: DEFAULT_GOAL,
    baseBid: DEFAULT_BID,
    maxBid: DEFAULT_BID,
    budget: DEFAULT_BUDGET,
    countryBudgetValue: DEFAULT_BUDGET,
    bidAdjustment: defaultBidAdjusmentIdx,
    bidAdjustmentValue: BID_ADJUSTMENT[defaultBidAdjusmentIdx].bidDefaultValue,
  };

  const onChangeBidAdjustment = (value) => {
    if (value === 4 || bidAdjustment === 4 ||
      (getDefaultBidAdjusmentStep(bidAdjustment) != getDefaultBidAdjusmentStep(value))) {
      form.setFieldsValue({ bidAdjustmentValue: getDefaultBidAdjusmentValue(value) });
    }

    setBidAdjustment(value);
  }

  const getDefaultBidAdjusmentValue = (bidAdjustmentIdx) => {
    return BID_ADJUSTMENT[bidAdjustmentIdx].bidDefaultValue;
  }

  const getDefaultBidAdjusmentStep = (bidAdjustmentIdx) => {
    return BID_ADJUSTMENT[bidAdjustmentIdx].bidStep;
  }

  const openPreview = () => {
    const bidAdjustmentValue = form.getFieldValue("bidAdjustmentValue");

    if (bidAdjustmentValue === 0) {
      return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
    }

    form.validateFields().then((values) => {
      const { countries } = values;
      const params: any = {
        type,
        countries,
        level: BATCH_EDIT_TYPES.country,
        storeAppId: urlParams.appId,
        campaignIds: [urlParams.campId],
        networks: [network?.code],
        campaignStatus: campaignData?.status,
        isPreview: true,
      };

      setParamValue(params, bidAdjustmentValue);

      setIsLoading(true);
      const url = type === "bid" ? `/${type}/batch/allow-failure` : `/${type}/batch`;
      service.put(url, params).then(
        (res: any) => {
          setIsOpenPreview(true);
          setListPreviewData(res.results);
          setIsLoading(false);
        },
        () => setIsLoading(false)
      );
    });
  };


  const onFinish = (values) => {
    delete values.bidAdjustment;
    delete values.bidAdjustmentValue;

    const bidAdjustmentValue = form.getFieldValue("bidAdjustmentValue");
    setParamValue(values, bidAdjustmentValue);

    if (bidAdjustmentIsValue()) {
      return onSubmit(values, onCloseModal);
    }

    if (checkMaximumPercentage(bidAdjustmentValue)) {
      return confirmValue(() => {
        onSubmit(values, onCloseModal);
      });
    } else {
      return onSubmit(values, onCloseModal);
    }
  };

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setBidAdjustment(defaultBidAdjusmentIdx)
    }, 300);
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
  };

  const bidAdjustmentIsValue = () => {
    return BID_ADJUSTMENT[form.getFieldValue("bidAdjustment")].value >= 2;
  }

  const countriesLabel = (
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
  );

  const formId = "FormBatchCountry" + action + type;
  const title = "Batch " + action + " " + type;
  const isAdd = action === ACTION_KEY.add;
  const isEdit = action === ACTION_KEY.edit;

  const isBid = type === EDITABLE_STAT_IDS.bid;

  const hasDailyBudget = isNumeric(defaultBudget?.dailyBudget);
  const isNeedBudget =
    NETWORK_MERGE_BID_BUDGET.includes(network?.code) && !hasDailyBudget;

  const isRoasBid = bidType === BID_ROAS_TYPE;
  const isRetensionBid = bidType === BID_RETENSION_TYPE;
  const isShowAdditionalUrl =
    !defaultTrackingUrl && network?.code === NETWORK_CODES.applovin;

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
        title={title}
        open={isOpen}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" form={formId}>
            {capitalizeWord(action)}
          </Button>,
        ]}
      >
        {isAdd ? (
          <Form.Item
            name="countries"
            label={countriesLabel}
            rules={[{ required: true, message: COUNTRY_REQUIRED }]}
          >
            <SelectCountry />
          </Form.Item>
        ) : (
          <Form.Item
            name="countries"
            label={countriesLabel}
            rules={[{ required: true, message: COUNTRY_REQUIRED }]}
          >
            <SelectCountryFromList listCountries={listCountries} />
          </Form.Item>
        )}

        {isEdit && (
          <>
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
          </>
        )}

        {isAdd && (
          <>
            {!isBid && (
              <Form.Item
                name="budget"
                label="Daily budget"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BUDGET_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}
            {isBid && !isRoasBid && !isRetensionBid && (
              <Form.Item
                name="bid"
                label="Bid"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BID_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}

            {isBid && isRoasBid && (
              <Form.Item
                name="goal"
                label="Goal"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BUDGET_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}
            {isBid && isRetensionBid && (
              <Form.Item
                name="baseBid"
                label="Base bid"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BID_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}
            {isBid && (isRoasBid || isRetensionBid) && (
              <Form.Item
                name="maxBid"
                label="Max bid"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BID_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}

            {isBid && isNeedBudget && (
              <Form.Item
                name="countryBudgetValue"
                label="Budget"
                rules={[{ required: true, message: VALUE_REQUIRED }]}
              >
                <InputNumber
                  className="!w-full"
                  min={0}
                  step={DEFAULT_BUDGET_STEP}
                  addonAfter={campaignCurrency}
                />
              </Form.Item>
            )}

            {isShowAdditionalUrl && (
              <>
                <Form.Item
                  name="clickUrl"
                  label="Click url"
                  rules={[{ required: true, message: VALUE_REQUIRED }]}
                >
                  <AntInput allowClear placeholder="Enter a link" />
                </Form.Item>
                <Form.Item
                  name="impressionUrl"
                  label="Impression url"
                  rules={[{ required: true, message: VALUE_REQUIRED }]}
                >
                  <AntInput allowClear placeholder="Enter a link" />
                </Form.Item>
              </>
            )}
          </>
        )}
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

ModalBatch.defaultProps = {
  type: EDITABLE_STAT_IDS.bid,
  campaignData: {},
  campaignCurrency: "$",
};

ModalBatch.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  setIsLoading: PropTypes.func,
  action: PropTypes.string,
  type: PropTypes.string,
  listCountries: PropTypes.array,
  currenciesConfigs: PropTypes.array,
  campaignData: PropTypes.object,
  campaignCurrency: PropTypes.string,
};

export default ModalBatch;
