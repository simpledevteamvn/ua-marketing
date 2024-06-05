import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import AntInput from "antd/lib/input/Input";
import service from "../../../partials/services/axios.config";
import {
  DATE_RANGE_REQUIRED,
  NETWORK_REQUIRED,
  OPTION_REQUIRED,
  VALUE_REQUIRED,
} from "../../../constants/formMessage";
import DatePicker from "antd/lib/date-picker";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../partials/common/Forms/RangePicker";
import {
  disabledDate,
  getLabelFromCamelCaseStr,
  getLabelFromStr,
} from "../../../utils/Helpers";

const TYPES = {
  date: "date",
  text: "text",
  select: "text[]", // Todo: convert to "select"
};

function ModalAddCampaign(props) {
  const [form] = Form.useForm();
  const { isOpen, onClose, setIsLoading } = props;

  const [listNetworkConnector, setListNetworkConnector] = useState<any>([]);
  const [listConfig, setListConfig] = useState<any>();

  useEffect(() => {
    setIsLoading(true);
    service.get("/network-connector").then(
      (res: any) => {
        setListNetworkConnector(res.results || []);
        setIsLoading(false);

        // setTimeout(() => {
        //   onChangeNetwork("6384552cafa8d503f1b23224")
        // }, 500);
      },
      () => setIsLoading(false)
    );
  }, []);

  const initialValues = {
    name: "",
    networkConnector: [],
  };

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onChangeNetwork = (value) => {
    const activedNetwork = listNetworkConnector.find((el) => el.id === value);
    const networkCode = activedNetwork?.network?.code;

    if (!networkCode) return;

    const params = {
      network: networkCode,
      type: "campaign",
      deepType: "create",
    };

    service.get("/field-config", { params }).then(
      (res: any) => {
        setListConfig(res.results);
      },
      () => {}
    );
  };

  const getValidationByField = (field) => {
    const validations = listConfig?.validations || {};
    if (!field || !Object.keys(validations)?.length) {
      return {};
    }

    return validations[field] ? validations[field] : {};
  };

  useEffect(() => {
    console.log("listConfig :>> ", listConfig);
  }, [listConfig]);

  const onFinish = (values) => {
    const { name, networkConnector, dateRange } = values;

    const params = {
      name,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
    };

    console.log("values :>> ", values, params);
  };

  const configFields = listConfig?.fields || {};
  const listFields = Object.keys(configFields);
  const showDateRange = configFields?.startDate && configFields?.endDate;

  return (
    <Form
      id="FormAddCampaign"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Modal
        title="Add campaign"
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
            form="FormAddCampaign"
          >
            Create
          </Button>,
        ]}
      >
        <Form.Item
          name="networkConnector"
          label="Network connector"
          rules={[{ required: true, message: NETWORK_REQUIRED }]}
        >
          <Select
            placeholder="Select network connector"
            onChange={onChangeNetwork}
          >
            {listNetworkConnector?.map((data: any, idx) => (
              <Select.Option value={data.id} key={idx}>
                {data.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <AntInput placeholder="Enter a campaign name" className="w-full" />
        </Form.Item>

        {showDateRange && (
          <Form.Item
            name="dateRange"
            label="Date"
            rules={[{ required: true, message: DATE_RANGE_REQUIRED }]}
          >
            <DatePicker.RangePicker
              className="!w-full"
              disabledDate={disabledDate}
            />
          </Form.Item>
        )}

        {listFields?.length > 0 &&
          listFields.map((field, idx) => {
            if (field === "startDate" || field === "endDate") {
              return <div key={idx}></div>;
            }

            const validations = getValidationByField(field);
            const required = validations.require?.[0] === "true";
            const options = validations?.option;

            if (configFields[field] === TYPES.text) {
              return (
                <Form.Item
                  key={idx}
                  name={field}
                  label={getLabelFromCamelCaseStr(field)}
                  rules={[{ required, message: VALUE_REQUIRED }]}
                >
                  <AntInput
                    placeholder={`Enter a ${getLabelFromCamelCaseStr(
                      field
                    )?.toLowerCase()}`}
                    className="w-full"
                  />
                </Form.Item>
              );
            }

            if (configFields[field] === TYPES.select && options?.length) {
              return (
                <Form.Item
                  key={idx}
                  name={field}
                  label={getLabelFromCamelCaseStr(field)}
                  rules={[{ required, message: OPTION_REQUIRED }]}
                >
                  <Select
                    placeholder={`Select ${getLabelFromCamelCaseStr(
                      field
                    )?.toLowerCase()}`}
                    onChange={onChangeNetwork}
                  >
                    {options?.map((data: any, idx) => (
                      <Select.Option value={data} key={idx}>
                        {getLabelFromStr(data)}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }

            return <div key={idx}></div>;
          })}
      </Modal>
    </Form>
  );
}

ModalAddCampaign.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setIsLoading: PropTypes.func,
};

export default ModalAddCampaign;
