import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Form from "antd/lib/form";
import Modal from "antd/lib/modal/Modal";
import Button from "antd/lib/button/button";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import {
  NETWORK_REQUIRED,
  TYPE_REQUIRED,
} from "../../../../constants/formMessage";
import Select from "antd/lib/select";
import DynamicUpload from "./DynamicUpload/DynamicUpload";
import {
  getLabelFromCamelCaseStr,
  filterSelect,
  filterSelectByDOM,
  getLabelFromStr,
} from "../../../../utils/Helpers";
import AntInput from "antd/lib/input/Input";
import SelectStoreApp from "../../../../partials/common/Forms/SelectStoreApp";
import { toast } from "react-toastify";
import { AD_NETWORK_TYPE } from "../../../../constants/constants";
import { useParams } from "react-router-dom";

const FILE = "file";
const TEXT = "text";

function ModalAddCreative(props) {
  const [form] = Form.useForm();
  const urlParams = useParams();
  const { isOpen, onClose } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNetworkData, setIsLoadingByNetworkData] = useState(false);

  const [listNetworkConnector, setListNetworkConnector] = useState<any>([]);
  const [activedNetwork, setActivedNetwork] = useState<any>();
  const [listTypes, setListTypes] = useState([]);
  const [activedType, setActivedType] = useState<string>();
  const [dynamicConfigs, setDynamicConfigs] = useState<any>({});
  const [listAppOnNetwork, setListAppOnNetwork] = useState([]);
  const [activedApp, setActivedApp] = useState<string>();

  const [listFiles, setListFiles] = useState<any>({});
  const [listSizeErr, setListSizeErr] = useState<Boolean[]>([]);
  const [listCapacityErr, setListCapacityErr] = useState<Boolean[]>([]);

  const initialValues = {};

  const onCloseModal = (reset = false) => {
    onClose();
    setTimeout(() => {
      if (reset) {
        form.resetFields();

        setListNetworkConnector([]);
        setActivedNetwork(undefined);
        setListTypes([]);
        setActivedType(undefined);
        setDynamicConfigs({});
        setListAppOnNetwork([]);
        setActivedApp(undefined);

        setListFiles({});
        setListSizeErr([]);
        setListCapacityErr([]);
      } else {
        resetTextFields();
        form.setFields([
          { name: "networkConnector", errors: [] },
          { name: "app", errors: [] },
          { name: "creativeType", errors: [] },
        ]);
      }
    }, 300);
  };

  useEffect(() => {
    if (!isOpen || listNetworkConnector?.length) return;
    setIsLoading(true);
    service
      .get("/network-connector", { params: { networkType: AD_NETWORK_TYPE } })
      .then(
        (res: any) => {
          setIsLoading(false);
          setListNetworkConnector(res.results || []);
        },
        () => setIsLoading(false)
      );
  }, [isOpen]);

  const getNetworkCode = () => {
    const activedNetworkData = listNetworkConnector?.find(
      (el: any) => el.id === activedNetwork
    );

    return activedNetworkData?.network?.code;
  };

  useEffect(() => {
    if (listTypes?.length) {
      setListTypes([]);
      setDynamicConfigs({});
      setActivedType(undefined);
      setListAppOnNetwork([]);
      setActivedApp(undefined);
      setListFiles({});
      form.setFieldsValue({ creativeType: undefined });
    }
    if (!activedNetwork) return;

    const params = {
      networkConnectorId: activedNetwork,
      storeAppId: urlParams.appId,
    };
    const getAppOnNetwork = service.get("/applications", { params });
    const getCreativeType = service.get("/creative/type", {
      params: { network: getNetworkCode() },
    });

    setIsLoadingByNetworkData(true);
    Promise.all([getAppOnNetwork, getCreativeType]).then(
      (res: any) => {
        setIsLoadingByNetworkData(false);
        setListAppOnNetwork(res[0].results || []);
        setListTypes(res[1].results || []);
      },
      () => setIsLoadingByNetworkData(false)
    );
  }, [activedNetwork]);

  useEffect(() => {
    Object.keys(listFiles || {}).length && setListFiles({});
    if (!activedType) return;

    resetTextFields(true);
    const params = {
      network: getNetworkCode(),
      type: "creative",
      deepType: activedType,
    };

    service.get("/field-config", { params }).then(
      (res: any) => {
        setDynamicConfigs(res.results || {});
      },
      () => {}
    );
  }, [activedType]);

  const onSetSizeErr = (value: Boolean, idx) => {
    if (value === listSizeErr[idx]) return;

    const newListSizeErr = [...listSizeErr];
    newListSizeErr[idx] = value;
    setListSizeErr(newListSizeErr);
  };

  const onSetCapacityErr = (value: Boolean, idx) => {
    if (value === listCapacityErr[idx]) return;

    const newListCapacityErr = [...listCapacityErr];
    newListCapacityErr[idx] = value;
    setListCapacityErr(newListCapacityErr);
  };

  const onSetListFiles = (fieldName, files: any[]) => {
    const newListFiles = { ...listFiles };
    newListFiles[fieldName] = files;

    setListFiles(newListFiles);
  };

  const getValidationFields = (type = FILE) => {
    const validationFields = dynamicConfigs?.fields || {};

    const listFields = Object.keys(validationFields).filter(
      (field) => validationFields[field] === type
    );
    return listFields;
  };

  const resetTextFields = (resetValue = false) => {
    const listTexts = getValidationFields(TEXT);

    listTexts.forEach((field) => {
      const name = getLabelFromCamelCaseStr(field, false);

      if (resetValue) {
        form.setFields([{ name, errors: [], value: "" }]);
      } else {
        form.setFields([{ name, errors: [] }]);
      }
    });
  };

  const checkFileEmpty = () => {
    let isEmpty = false;
    const listFields = getValidationFields();

    if (listFields.length) {
      isEmpty = listFields.some((field) => !listFiles?.[field]?.length);
    }

    return isEmpty;
  };

  const onFinish = (values) => {
    const { app } = values;

    const formData = new FormData();
    formData.append("type", activedType || "");
    formData.append("networkConnectorId", activedNetwork);
    formData.append("rawAppId", app);

    Object.keys(listFiles).forEach((field) => {
      if (listFiles[field]?.length) {
        // Only support upload single
        formData.append(field, listFiles[field][0]);
      }
    });

    const listTexts = getValidationFields(TEXT);
    listTexts.forEach((field) => {
      const validatedName = getLabelFromCamelCaseStr(field, false);
      formData.append(field, values[validatedName]);
    });

    setIsLoading(true);
    service.post("/creative", formData).then(
      (res: any) => {
        res.message && toast(res.message, { type: "success" });
        setIsLoading(false);
        onCloseModal(true);
      },
      () => setIsLoading(false)
    );
  };

  const hasSizeErr = listSizeErr.some((bool) => bool);
  const hasCapacityErr = listCapacityErr.some((bool) => bool);

  return (
    <Form
      id="FormAddCreative"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {isLoading && <Loading />}

      <Modal
        maskClosable={false}
        width={650}
        title="Upload New Creative"
        onCancel={() => onCloseModal()}
        open={isOpen}
        footer={[
          <Button key="back" htmlType="button" onClick={() => onCloseModal()}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="FormAddCreative"
            disabled={hasSizeErr || hasCapacityErr || checkFileEmpty()}
          >
            Submit
          </Button>,
        ]}
      >
        <Form.Item
          name="networkConnector"
          label="Network connector"
          rules={[{ required: true, message: NETWORK_REQUIRED }]}
        >
          <SelectNetwork
            isMultiple={false}
            listNetwork={listNetworkConnector}
            value={activedNetwork}
            onChange={setActivedNetwork}
          />
        </Form.Item>

        <Form.Item
          name="app"
          label="App"
          rules={[{ required: true, message: NETWORK_REQUIRED }]}
        >
          <SelectStoreApp
            loading={isLoadingNetworkData}
            listApp={listAppOnNetwork}
            getKey={(el) => el.rawAppId}
            activedApp={activedApp}
            setActivedApp={(app) => {
              setActivedApp(app);
              form.setFieldsValue({ app });
            }}
            filterOption={filterSelectByDOM}
          />
        </Form.Item>

        <Form.Item
          name="creativeType"
          label="Creative type"
          rules={[{ required: true, message: TYPE_REQUIRED }]}
        >
          <Select
            placeholder="Select filters"
            allowClear
            value={activedType}
            onChange={setActivedType}
            showSearch
            filterOption={filterSelect}
            loading={isLoadingNetworkData}
          >
            {listTypes?.map((type: any) => (
              <Select.Option key={type}>{getLabelFromStr(type)}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        {activedType &&
          Object.keys(dynamicConfigs || {}).length > 0 &&
          Object.keys(dynamicConfigs.fields || {}).map((field, idx) => {
            if (dynamicConfigs.fields[field] === FILE) {
              return (
                <DynamicUpload
                  key={field}
                  field={field}
                  idx={idx}
                  configs={dynamicConfigs}
                  onSetSizeErr={onSetSizeErr}
                  onSetCapacityErr={onSetCapacityErr}
                  onSetListFiles={onSetListFiles}
                  listFiles={listFiles[field] || []}
                />
              );
            }

            if (dynamicConfigs.fields[field] === TEXT) {
              const fieldName = getLabelFromCamelCaseStr(field, false);
              return (
                <Form.Item
                  name={fieldName}
                  label={fieldName}
                  rules={[
                    {
                      required: true,
                      message: `Please enter a ${fieldName.toLowerCase()}`,
                    },
                  ]}
                  key={idx}
                >
                  <AntInput
                    allowClear
                    placeholder={`Enter a ${fieldName.toLowerCase()}`}
                  />
                </Form.Item>
              );
            }

            return <div key={idx}></div>;
          })}
      </Modal>
    </Form>
  );
}

ModalAddCreative.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default ModalAddCreative;
