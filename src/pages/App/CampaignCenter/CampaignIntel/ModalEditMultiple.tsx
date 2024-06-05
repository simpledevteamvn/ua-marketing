import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal";
import Button from "antd/lib/button";
import Form from "antd/lib/form";
import {
  EDITABLE_STATS,
  EDITABLE_STAT_IDS,
  MAXIMUM_INC_PERCENTAGE,
  MESSAGE_DURATION,
} from "../../../../constants/constants";
import {
  ENTER_NEW_VALUE,
  STATS_REQUIRED,
  VALUE_REQUIRED,
} from "../../../../constants/formMessage";
import Select from "antd/lib/select";
import InputNumber from "antd/lib/input-number";
import {
  getAndSetRecordData,
  getDataByKey,
} from "../../../../partials/common/Table/EditNumberCell";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import {
  checkMaximumPercentage,
  getPercentDiff,
} from "../../../../utils/Helpers";
import { RootState } from "../../../../redux/store";
import { useSelector } from "react-redux";
import Loading from "../../../../utils/Loading";
import message from "antd/lib/message";
import { getDataObj, updateListFromData } from "./Helper";
import {
  confirmValue,
  confirmValueWithPercentageChanged,
} from "../../../../utils/helper/UIHelper";
import ModalPreview from "./EditPreview/ModalPreview";
import { Col, Row } from "antd/lib/grid";
import {
  BID_ADJUSTMENT,
  BidAdjustmentDrd,
} from "../../../../partials/common/Dropdowns/Dropdowns";

function ModalEditMultiple(props) {
  const {
    isOpen,
    onClose,
    selectedRecords,
    listData,
    editedCellData,
    setListData,
    customEditSingle,
    currenciesConfigs,
    campaignCurrency,
    formId,
  } = props;
  const inputRef = useRef<any>(null);
  const [form] = Form.useForm();
  const emailName = useSelector(
    (state: RootState) => state.account.userData.email
  );
  const name = useSelector((state: RootState) => state.account.userData.name);

  const minBidValue = 0.001;
  const defaultBidAdjusmentIdx = 0;
  const [bidAdjustment, setBidAdjustment] = useState(defaultBidAdjusmentIdx);
  const [newValue, setNewValue] = useState(Number);

  const [isLoading, setIsLoading] = useState(false);

  const [isOpenPreview, setIsOpenPreview] = useState(false);
  const [listPreviewData, setListPreviewData] = useState<any>([]);

  const activedStat = Form.useWatch("stats", form);

  const { editedField, crrValue, cellData } = editedCellData;

  const defaultBidAdjusmentValue = 0;
  const initialValues = {
    stats: EDITABLE_STAT_IDS.bid,
    bidAdjustment: defaultBidAdjusmentIdx,
    bidAdjustmentValue: defaultBidAdjusmentValue,
  };

  useEffect(() => {
    setNewValue(calculateNewValue());
    const { editedField } = editedCellData;

    if (!editedField) {
      return onChangeStats(EDITABLE_STAT_IDS.bid);
    }

    form.setFieldsValue({
      stats: editedField || EDITABLE_STAT_IDS.bid,
    });
    setTimeout(() => {
      inputRef.current && inputRef.current.focus();
    }, 100);
  }, [editedCellData]);

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setBidAdjustment(defaultBidAdjusmentIdx);
    }, 300);
  };

  const onChangeStats = (value) => {
    form.setFieldsValue({ stats: value });
    form.setFieldsValue({
      bidAdjustmentValue: getDefaultBidAdjusmentValue(bidAdjustment),
    });
  };

  const onChangeBidAdjustment = (value) => {
    if (isSingleValue() && value === 4) {
      form.setFieldsValue({
        bidAdjustmentValue: roundBidValue(Number(crrValue)),
      });
    } else if (
      value === 4 ||
      bidAdjustment === 4 ||
      getDefaultBidAdjusmentStep(bidAdjustment) !=
        getDefaultBidAdjusmentStep(value)
    ) {
      form.setFieldsValue({
        bidAdjustmentValue: getDefaultBidAdjusmentValue(value),
      });
    }

    setBidAdjustment(value);
    setNewValue(calculateNewValue());
  };

  const getDefaultBidAdjusmentValue = (bidAdjustmentIdx) => {
    const activeBidAdjustment = BID_ADJUSTMENT[bidAdjustmentIdx];
    return form.getFieldValue("stats") === EDITABLE_STAT_IDS.bid
      ? activeBidAdjustment.bidDefaultValue
      : activeBidAdjustment.budgetDefaultValue;
  };

  const getDefaultBidAdjusmentStep = (bidAdjustmentIdx) => {
    const activeBidAdjustment = BID_ADJUSTMENT[bidAdjustmentIdx];
    return form.getFieldValue("stats") === EDITABLE_STAT_IDS.bid
      ? activeBidAdjustment.bidStep
      : activeBidAdjustment.budgetStep;
  };

  const onFinish = (values) => {
    const { bidAdjustmentValue } = values;
    if (bidAdjustmentValue === 0) {
      return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
    }

    if (editedField) {
      if (newValue === 0 || newValue === Number(crrValue)) {
        return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
      }
      return handleEditData(bidAdjustmentValue);
    }

    if (bidAdjustmentIsValue()) {
      handleUpdateMultiple();
    } else {
      const isShowModal = checkMaximumPercentage(bidAdjustmentValue);
      if (isShowModal) {
        confirmValue(handleUpdateMultiple);
      } else {
        handleUpdateMultiple();
      }
    }
  };

  const handleEditData = (values) => {
    if (bidAdjustmentIsValue()) {
      const currentValue = Number(crrValue);
      const percentDiff = getPercentDiff(currentValue, newValue);
      if (percentDiff >= MAXIMUM_INC_PERCENTAGE) {
        confirmValueWithPercentageChanged(percentDiff, handleUpdateData);
      } else {
        handleUpdateData();
      }
    } else {
      const isShowModal = checkMaximumPercentage(values);
      if (isShowModal) {
        confirmValue(handleUpdateData);
      } else {
        handleUpdateData();
      }
    }
  };

  const getBidStepByCurrentValue = () => {
    const newValueLength = roundBidValue(newValue).toString().length;
    return newValueLength >= 5 ? 0.001 : 0.01;
  };

  const bidAdjustmentIsValue = () => {
    return BID_ADJUSTMENT[form.getFieldValue("bidAdjustment")].value >= 2;
  };

  const handleUpdateData = (getPreview = false) => {
    const isBid = activedStat === EDITABLE_STAT_IDS.bid;
    let urlStr = `/${editedField}`;
    let params;

    // Get object bid (budget)
    if (customEditSingle) {
      params = cellData;
    } else {
      params = getAndSetRecordData({
        recordData: cellData,
        value: newValue,
        fieldName: editedField,
      });

      if (!params) {
        return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
      }
    }

    if (customEditSingle) {
      // Mode edit: by value
      params = isBid
        ? { ...params, bid: newValue }
        : { ...params, dailyBudget: newValue };
    }

    if (customEditSingle) {
      return customEditSingle(params, urlStr, onCloseModal);
    }

    setIsLoading(true);
    service.put(urlStr, params).then(
      (res: any) => {
        const resValue = isBid ? res.results?.bid : res.results?.dailyBudget;

        res.message && toast(res.message, { type: "success" });
        getAndSetRecordData({
          recordData: cellData,
          value: resValue,
          fieldName: editedField,
          isSetData: true,
          historyField: `${editedField}History`,
          emailName,
          name,
        });
        setIsLoading(false);
        setListData(listData); // Update table with new data (mutate the old data)
        onCloseModal();
      },
      () => setIsLoading(false)
    );
  };

  const getStatData = () => {
    const listStatData = selectedRecords?.map((tableId) => {
      const recordData = getDataByKey(listData, tableId);
      return getDataObj(recordData, activedStat)?.data;
    });

    let statDatas;
    if (listStatData.length) {
      statDatas = listStatData.filter(
        (el) => !!el && Object.keys(el || {}).length
      );
    }

    return statDatas;
  };

  const handleUpdateMultiple = (getPreview = false) => {
    const bidAdjustmentValue = form.getFieldValue("bidAdjustmentValue");

    if (bidAdjustmentValue === 0) {
      return message.error(ENTER_NEW_VALUE, MESSAGE_DURATION);
    }

    const statDatas = getStatData();
    let params;
    if (bidAdjustmentIsValue()) {
      params = {
        [`${activedStat}s`]: statDatas,
      };
    } else {
      params = {
        [`${activedStat}s`]: statDatas,
      };
    }
    setParamValue(params, bidAdjustmentValue);

    if (getPreview) {
      return { ...params, isPreview: true };
    }

    setIsLoading(true);
    const url =
      activedStat === "bid"
        ? `/${activedStat}/multi/allow-failure`
        : `/${activedStat}/multi`;
    service.put(url, params).then(
      (res: any) => {
        res.message && toast(res.message, { type: "success" });

        if (Array.isArray(res.results) && res.results.length) {
          let newList;
          res.results.forEach((data) => {
            newList = updateListFromData(
              listData,
              data,
              activedStat,
              emailName,
              name
            );
          });
          setListData(newList); // Update table with new data (mutate the old data)
        }

        setIsLoading(false);
        onCloseModal();
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
  };

  const openPreview = () => {
    form.validateFields().then(
      () => {
        const params: any = handleUpdateMultiple(true);

        if (!Object.keys(params || {})?.includes("isPreview")) return;

        setIsLoading(true);
        const url =
          activedStat === "bid"
            ? `/${activedStat}/multi/allow-failure`
            : `/${activedStat}/multi`;
        service.put(url, params).then(
          (res: any) => {
            setIsOpenPreview(true);
            setListPreviewData(res.results);
            setIsLoading(false);
          },
          () => setIsLoading(false)
        );
      },
      () => {}
    );
  };

  const onChangeBidAdjustmentValue = (value) => {
    form.setFieldsValue({ bidAdjustmentValue: value });
    setNewValue(calculateNewValue());
  };

  const onChangeNewValue = (value) => {
    if (newValue === 0.01 && value === 0.001) {
      value = 0.009;
    }

    setNewValue(value);
    calculateBidAdjustmentValue(value);
  };

  const calculateBidAdjustmentValue = (newValue) => {
    const currentBidAdjustment = form.getFieldValue("bidAdjustment");

    let bidAdjustmentNewValue = 0;
    const currentValue = Number(crrValue);

    if (newValue === currentValue) {
      if (currentBidAdjustment === 4) {
        form.setFieldsValue({ bidAdjustmentValue: currentValue });
      } else {
        form.setFieldsValue({ bidAdjustmentValue: 0 });
      }
      return;
    }

    if (currentBidAdjustment === 0) {
      if (newValue < currentValue) {
        setBidAdjustment(1);
        form.setFieldsValue({ bidAdjustment: 1 });
        return calculateBidAdjustmentValue(newValue);
      }

      bidAdjustmentNewValue = ((newValue - currentValue) / currentValue) * 100;
    } else if (currentBidAdjustment === 1) {
      if (newValue > currentValue) {
        setBidAdjustment(0);
        form.setFieldsValue({ bidAdjustment: 0 });
        return calculateBidAdjustmentValue(newValue);
      }

      bidAdjustmentNewValue = ((currentValue - newValue) / currentValue) * 100;
    } else if (currentBidAdjustment === 2) {
      if (newValue < currentValue) {
        setBidAdjustment(3);
        form.setFieldsValue({ bidAdjustment: 3 });
        return calculateBidAdjustmentValue(newValue);
      }

      bidAdjustmentNewValue = newValue - currentValue;
    } else if (currentBidAdjustment === 3) {
      if (newValue > currentValue) {
        setBidAdjustment(2);
        form.setFieldsValue({ bidAdjustment: 2 });
        return calculateBidAdjustmentValue(newValue);
      }

      bidAdjustmentNewValue = currentValue - newValue;
    } else {
      bidAdjustmentNewValue = newValue;
    }

    bidAdjustmentNewValue = roundBidValue(bidAdjustmentNewValue);
    form.setFieldsValue({ bidAdjustmentValue: bidAdjustmentNewValue });
  };

  const calculateNewValue = () => {
    const bidAdjustmentValue = form.getFieldValue("bidAdjustmentValue");

    const currentValue = Number(crrValue);
    let newValue = 0;

    const currentBidAdjustment = form.getFieldValue("bidAdjustment");
    if (currentBidAdjustment === 0) {
      newValue = currentValue + (currentValue * bidAdjustmentValue) / 100;
    } else if (currentBidAdjustment === 1) {
      newValue = currentValue - (currentValue * bidAdjustmentValue) / 100;
    } else if (currentBidAdjustment === 2) {
      newValue = currentValue + bidAdjustmentValue;
    } else if (currentBidAdjustment === 3) {
      newValue = currentValue - bidAdjustmentValue;
    } else {
      newValue = bidAdjustmentValue;
    }

    return Math.max(minBidValue, roundBidValue(newValue));
  };

  const roundBidValue = (bidValue) => {
    let roundFactor = editedField === EDITABLE_STAT_IDS.bid ? 1000 : 100;
    const bidValueRounded = Math.round(bidValue * roundFactor) / roundFactor;

    return Number(bidValueRounded.toString());
  };

  const isSingleValue = () => {
    return editedField;
  };

  const id = formId ? formId : "FormEditMultipleRecord" + editedField;

  return (
    <Form
      id={id}
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {isLoading && <Loading />}

      <Modal
        style={{ paddingBottom: "15px" }}
        title={editedField ? `Edit ${editedField}` : "Edit multiple data"}
        open={isOpen}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" form={id}>
            Edit
          </Button>,
        ]}
      >
        <Form.Item
          name="stats"
          label="Targeting"
          rules={[{ required: true, message: STATS_REQUIRED }]}
        >
          <Select
            className="w-full"
            onChange={(value) => onChangeStats(value)}
            disabled={editedField}
          >
            {EDITABLE_STATS.map((statObj, idx) => (
              <Select.Option value={statObj.value} key={idx}>
                {statObj.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Edit mode"
          // name="editMode"
          labelCol={{ sm: { span: 5 }, xs: { span: 9 } }}
          wrapperCol={{ sm: { span: 19 }, xs: { span: 15 } }}
          className="!mb-2"
        ></Form.Item>

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
                  min={bidAdjustment === 4 ? minBidValue : 0}
                  step={getDefaultBidAdjusmentStep(bidAdjustment)}
                  addonAfter={BID_ADJUSTMENT[bidAdjustment].icon}
                  className="!w-full"
                  onChange={onChangeBidAdjustmentValue}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>

        {isSingleValue() && (
          <Form.Item>
            <Row gutter={4}>
              <Col
                style={{ paddingTop: "5px", paddingLeft: "5px" }}
                span={8}
                md={2}
              >
                From
              </Col>
              <Col span={8} md={6} style={{ paddingLeft: "7px" }}>
                <InputNumber
                  addonAfter={""}
                  readOnly={true}
                  value={roundBidValue(Number(crrValue))}
                />
              </Col>

              <Col span={8} md={1} style={{ paddingLeft: "17px" }}></Col>

              <Col style={{ paddingTop: "5px" }} span={8} md={1}>
                To
              </Col>
              <Col span={8} md={6} style={{ paddingLeft: "7px" }}>
                <InputNumber
                  addonAfter={""}
                  min={activedStat === EDITABLE_STAT_IDS.bid ? minBidValue : 0}
                  step={
                    activedStat === EDITABLE_STAT_IDS.bid
                      ? getBidStepByCurrentValue()
                      : 1
                  }
                  value={newValue}
                  onChange={onChangeNewValue}
                />
              </Col>
            </Row>
          </Form.Item>
        )}

        {!isSingleValue() && (
          <div
            className="text-antPrimary/80 hover:text-antPrimary cursor-pointer custom-preview-data"
            onClick={openPreview}
          >
            Preview edited data
          </div>
        )}
      </Modal>

      <ModalPreview
        listData={listPreviewData}
        isOpen={isOpenPreview}
        onClose={() => setIsOpenPreview(false)}
        currenciesConfigs={currenciesConfigs}
      />
    </Form>
  );
}

ModalEditMultiple.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  selectedRecords: PropTypes.array,
  currenciesConfigs: PropTypes.array,
  listData: PropTypes.array,
  editedCellData: PropTypes.object,
  setListData: PropTypes.func,
  customEditSingle: PropTypes.func,
  campaignCurrency: PropTypes.string,
  formId: PropTypes.string,
};

export default ModalEditMultiple;
