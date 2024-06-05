import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import {
  NUMBER_PLACEHOLDER,
  VALUE_REQUIRED,
} from "../../../../constants/formMessage";
import InputNumber from "antd/lib/input-number";
import { capitalizeWord, checkMaximumValue } from "../../../../utils/Helpers";
import { toast } from "react-toastify";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import { SITE_ID_LABEL } from "./ReportTable";
import {
  BID_RETENSION_TYPE,
  BID_RETENTION_GOAL_TYPE,
  BID_ROAS_TYPE,
  DEFAULT_BID_STEP,
  EDIT_NUMBER_MODE,
  NETWORK_CODES,
} from "../../../../constants/constants";
import { confirmValue } from "../../../../utils/helper/UIHelper";

function ModalEdit(props) {
  const [form] = Form.useForm();
  const {
    isOpen,
    onClose,
    onSubmitEdit,
    editedBid,
    setListData,
    record,
    listData,
    networkCode,
    formId,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [editedValues, setEditedValues] = useState<any>({});

  const initialValues = {
    goal: 0,
    baseBid: 0,
    maxBid: 0,
    bid: 0,
  };

  useEffect(() => {
    if (!isOpen || !Object.keys(editedBid || {}).length) return;

    const { goal, baseBid, maxBid, bid } = editedBid;
    form.setFieldsValue({ goal, baseBid, maxBid, bid });
  }, [isOpen, editedBid]);

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onFinish = (values) => {
    const { goal, baseBid, maxBid, bid } = values;
    let isShowConfirm = false;

    const listField = [{ goal }, { baseBid }, { maxBid }, { bid }];
    listField.forEach((fieldObj) => {
      const field = Object.keys(fieldObj)[0];
      const value = Object.values(fieldObj)[0];

      isShowConfirm =
        isShowConfirm ||
        checkMaximumValue(value, editedBid[field], EDIT_NUMBER_MODE.value);
    });

    if (isShowConfirm) {
      setEditedValues(values);
      confirmValue(() => handleChangeBid(values));
    } else {
      handleChangeBid(values);
    }
  };

  const handleChangeBid = (values = editedValues) => {
    const { goal, baseBid, maxBid, bid } = values;
    let params;

    switch (editedBid?.type) {
      case BID_ROAS_TYPE:
        params = { ...editedBid, goal, maxBid };
        break;

      case BID_RETENSION_TYPE:
        params = { ...editedBid, baseBid, maxBid };
        break;

      case BID_RETENTION_GOAL_TYPE:
        params = { ...editedBid, goal, bid };
        break;
      default:
        params = editedBid;
        break;
    }

    if (onSubmitEdit) {
      return onSubmitEdit(params, onCloseModal);
    }

    setIsLoading(true);
    service.put("/bid", params).then(
      (res: any) => {
        res.message && toast(res.message, { type: "success" });

        switch (editedBid?.type) {
          case BID_ROAS_TYPE:
            setRecordData({ goal, maxBid });
            break;

          case BID_RETENSION_TYPE:
            setRecordData({ baseBid, maxBid });
            break;

          case BID_RETENTION_GOAL_TYPE:
            setRecordData({ goal, bid });
            break;
        }
        setListData(listData); // Update table with new data (mutate the old data)
        setIsLoading(false);
        onCloseModal();
      },
      () => {
        setIsLoading(false);
      }
    );
  };

  const setRecordData = (especialData = {}) => {
    // Campaign level
    if (Object.keys(record.campaign || {})?.length) {
      return Object.keys(especialData).forEach((field) => {
        record.campaign.defaultBid[field] = especialData[field];
      });
    }

    // Site id level
    if (record.siteId && record.siteId !== SITE_ID_LABEL) {
      return Object.keys(especialData).forEach((field) => {
        record.bid[field] = especialData[field];
      });
    }

    // Location level
    if (record.location || Object.keys(record.bid || {})?.length) {
      return Object.keys(especialData).forEach((field) => {
        record.bid[field] = especialData[field];
      });
    }

    // AdGroup level
    if (record.adGroup?.id) {
      return Object.keys(especialData).forEach((field) => {
        record.adGroup.bid[field] = especialData[field];
      });
    }
  };

  const bidType = editedBid?.type;
  let isShowGoal = false;
  let isShowBid = false;
  let isShowBaseBid = false;
  let isShowMaxBid = false;
  let bidName = capitalizeWord(bidType);

  switch (bidType) {
    case BID_ROAS_TYPE:
      isShowGoal = true;
      isShowMaxBid = true;
      break;

    case BID_RETENSION_TYPE:
      isShowBaseBid = true;
      isShowMaxBid = true;
      break;

    case BID_RETENTION_GOAL_TYPE:
      isShowGoal = true;
      isShowBid = true;
      bidName = "Retention goal";
      break;
    default:
      break;
  }

  if ([NETWORK_CODES.google, NETWORK_CODES.applovin].includes(networkCode)) {
    isShowMaxBid = false;
  }

  const id = formId || "FormEditRoasAndRetentionBid";

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
        title={`Edit ${bidName} bid`}
        open={isOpen}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" form={id}>
            Update
          </Button>,
        ]}
      >
        {isShowGoal && (
          <Form.Item
            label="Goal"
            name="goal"
            rules={[{ required: true, message: VALUE_REQUIRED }]}
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="!w-full"
              onChange={(value) => form.setFieldsValue({ goal: value })}
            />
          </Form.Item>
        )}
        {isShowBaseBid && (
          <Form.Item
            label="Base bid"
            name="baseBid"
            rules={[{ required: true, message: VALUE_REQUIRED }]}
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="!w-full"
              onChange={(value) => form.setFieldsValue({ baseBid: value })}
            />
          </Form.Item>
        )}
        {isShowMaxBid && (
          <Form.Item
            label="Max bid"
            name="maxBid"
            rules={[
              { required: bidType !== BID_ROAS_TYPE, message: VALUE_REQUIRED },
            ]}
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="!w-full"
              onChange={(value) => form.setFieldsValue({ maxBid: value })}
            />
          </Form.Item>
        )}
        {isShowBid && (
          <Form.Item
            label="Bid"
            name="bid"
            rules={[{ required: true, message: VALUE_REQUIRED }]}
          >
            <InputNumber
              min={0}
              step={DEFAULT_BID_STEP}
              placeholder={NUMBER_PLACEHOLDER}
              className="!w-full"
              onChange={(value) => form.setFieldsValue({ bid: value })}
            />
          </Form.Item>
        )}
      </Modal>
    </Form>
  );
}

ModalEdit.defaultProps = {
  editedBid: {},
  listData: [],
};

ModalEdit.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmitEdit: PropTypes.func,
  setListData: PropTypes.func,
  editedBid: PropTypes.object,
  record: PropTypes.object,
  listData: PropTypes.array,
  networkCode: PropTypes.string,
  formId: PropTypes.string,
};

export default ModalEdit;
