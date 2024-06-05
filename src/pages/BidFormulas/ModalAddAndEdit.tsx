import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import InputNumber from "antd/lib/input-number";
import { toast } from "react-toastify";
import {
  APP_REQUIRED,
  COUNTRY_REQUIRED,
  CURRENCY_REQUIRED,
  VALUE_REQUIRED,
} from "../../constants/formMessage";
import SelectCountry from "../../partials/common/Forms/SelectCountry";
import {
  ALL_APP_OPTION,
  DEFAULT_BID,
  DEFAULT_BID_STEP,
  DEFAULT_BUDGET,
  DEFAULT_BUDGET_STEP,
  USD,
} from "../../constants/constants";
import Select from "antd/lib/select";
import service from "../../partials/services/axios.config";
import SelectStoreApp, {
  getActivedApp,
} from "../../partials/common/Forms/SelectStoreApp";
import AntInput from "antd/lib/input/Input";

function ModalAddAndEdit(props) {
  const [form] = Form.useForm();
  const {
    isOpen,
    isAdmin,
    onClose,
    onSubmit,
    setIsLoading,
    editedRule,
    listCurrency,
    listStoreApps,
  } = props;

  const [activedApp, setActivedApp] = useState<string[]>();

  useEffect(() => {
    if (!editedRule?.id) return;

    const {
      countries,
      currency,
      storeApps,
      maxBidValue,
      maxBudgetValue,
      name,
    } = editedRule;

    let newApps;
    if (storeApps && Array.isArray(storeApps)) {
      newApps = storeApps.map((el) => el.storeId + el.name);
      setActivedApp(newApps);
    }

    form.setFieldsValue({
      name,
      apps: newApps,
      currency,
      countries,
      maxBid: maxBidValue,
      maxBudget: maxBudgetValue,
    });
  }, [editedRule?.id]);

  const initialValues = {
    name: "",
    apps: [],
    currency: USD,
    countries: [],
    maxBid: DEFAULT_BID,
    maxBudget: DEFAULT_BUDGET,
  };

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setActivedApp([]);
    }, 300);
  };

  const onFinish = (values) => {
    const { maxBid, maxBudget, countries, currency, apps, name } = values;

    let storeApps = apps?.map((str) => {
      return getActivedApp(listStoreApps, str);
    });
    if (apps.length === 1 && apps[0] === ALL_APP_OPTION) {
      storeApps = [];
    }

    let params: any = {
      name,
      maxBidValue: maxBid,
      maxBudgetValue: maxBudget,
      countries,
      currency,
      storeAppIds: storeApps.map((el) => el.id),
    };

    if (editedRule?.id) {
      params = { ...params, id: editedRule.id };
    }

    setIsLoading(true);
    service.post("/rule-config", params).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        onCloseModal();
        onSubmit && onSubmit(res.results, !!editedRule?.id);
      },
      () => setIsLoading(false)
    );
  };

  const isEditMode = !!editedRule?.id;

  return (
    <Form
      id="FormAddNewRule"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title={isEditMode ? "Edit rule" : "Add new rule"}
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
            form="FormAddNewRule"
          >
            {isEditMode ? "Edit" : "Add"}
          </Button>,
        ]}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <AntInput allowClear placeholder="Enter a name" />
        </Form.Item>
        <Form.Item
          name="apps"
          label="Apps"
          rules={[{ required: true, message: APP_REQUIRED }]}
        >
          <SelectStoreApp
            hasAllOpt={isAdmin}
            listApp={listStoreApps}
            isMultiple={true}
            activedApp={activedApp}
            setActivedApp={(apps) => {
              setActivedApp(apps);
              form.setFieldsValue({ apps });
            }}
          />
        </Form.Item>

        <Form.Item
          name="countries"
          label="Countries"
          rules={[{ required: true, message: COUNTRY_REQUIRED }]}
        >
          <SelectCountry
            onChange={(value) => form.setFieldsValue({ countries: value })}
          />
        </Form.Item>

        <Form.Item
          name="currency"
          label="Currency"
          rules={[{ required: true, message: CURRENCY_REQUIRED }]}
        >
          <Select
            className="w-full"
            onChange={(value) => form.setFieldsValue({ currency: value })}
          >
            {listCurrency?.map((currency, idx) => (
              <Select.Option value={currency} key={idx}>
                {currency}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Max bid"
          name="maxBid"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            step={DEFAULT_BID_STEP}
            className="!w-full"
            onChange={(value) => form.setFieldsValue({ maxBid: value })}
          />
        </Form.Item>

        <Form.Item
          label="Max budget"
          name="maxBudget"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            step={DEFAULT_BUDGET_STEP}
            className="!w-full"
            onChange={(value) => form.setFieldsValue({ maxBudget: value })}
          />
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalAddAndEdit.propTypes = {
  isOpen: PropTypes.bool,
  isAdmin: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  setIsLoading: PropTypes.func,
  editedRule: PropTypes.object,
  listCurrency: PropTypes.array,
  listStoreApps: PropTypes.array,
};

export default ModalAddAndEdit;
