import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import {
  CURRENCY_REQUIRED,
  VALUE_REQUIRED,
} from "../../../constants/formMessage";
import InputNumber from "antd/lib/input-number";
import AntInput from "antd/lib/input/Input";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";

function ModalAddAndEdit(props) {
  const [form] = Form.useForm();

  const { isOpen, editedData, listData, onClose, setIsLoading, setListData } =
    props;
  const isEditMode = !!Object.keys(editedData || {}).length;

  const defaultRate = 1;
  const initialValues = {
    currency: "",
    rate: defaultRate,
  };

  useEffect(() => {
    form.setFieldsValue({
      currency: editedData?.currency || "",
      rate: editedData?.rate || defaultRate,
    });
  }, [editedData]);

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onFinish = (values) => {
    const { currency, rate } = values;
    const currencyName = currency.toUpperCase();

    setIsLoading(true);
    service.post("/admin/exchange-rate", { currency: currencyName, rate }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });

        let newListData;
        if (!isEditMode && Object.keys(res.results || {}).length) {
          newListData = listData.length
            ? [...listData, res.results]
            : [res.results];
        } else {
          newListData = listData.map((el) => {
            if (el.currency === currencyName) {
              return res.results;
            }
            return el;
          });
        }
        setListData(newListData);
        onCloseModal();
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Form
      id="FormAddNewCurrency"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title={isEditMode ? "Edit currency" : "Add new currency"}
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
            form="FormAddNewCurrency"
          >
            {isEditMode ? "Edit" : "Add"}
          </Button>,
        ]}
      >
        <Form.Item
          label="Currency name"
          name="currency"
          rules={[{ required: true, message: CURRENCY_REQUIRED }]}
        >
          <AntInput
            allowClear
            placeholder="Currency name"
            disabled={isEditMode}
          />
        </Form.Item>

        <Form.Item
          label="Rate by USD"
          name="rate"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            className="!w-full"
            onChange={(value) => form.setFieldsValue({ rate: value })}
          />
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalAddAndEdit.defaultProps = {
  editedData: {},
};

ModalAddAndEdit.propTypes = {
  isOpen: PropTypes.bool,
  listData: PropTypes.array,
  onClose: PropTypes.func,
  setIsLoading: PropTypes.func,
  setListData: PropTypes.func,
  editedData: PropTypes.object,
};

export default ModalAddAndEdit;
