import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import AntInput from "antd/lib/input";
import { Select } from "antd";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
import GamePlatformIcon from "../../../partials/common/GamePlatformIcon";
import { FIELD_REQUIRED } from "../../../constants/formMessage";
function ModalAddAppGroup(props) {
  const [form] = Form.useForm();
  const { isOpen, onClose, setIsLoading, setListAppGroup, setSelectItem } =
    props;
  const [listApp, setListApp] = useState<any>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setIsLoading(true);
    service.get("/store-app").then(
      (res: any) => {
        setListApp(res.results);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, [isOpen]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onAddAppGroup = (values) => {
    let { appGroupName, selectApp } = values;
    console.log(values);
    selectApp = selectApp.map((id) => listApp.find((app) => app.id == id));
    setIsLoading(true);
    service
      .post("/app-group", {
        name: appGroupName,
        apps: selectApp,
      })
      .then(
        (res: any) => {
          toast(res.message || "Create app group success!", {
            type: "success",
          });
          setIsLoading(false);
          onCloseModal();

          const newData = res.results;
          if (!newData?.id) return;
          setListAppGroup((prev) =>
            prev?.length ? [...prev, newData] : [newData]
          );
          setSelectItem(null);
        },
        () => setIsLoading(false)
      );
  };

  return (
    <Form
      id="FormAddNewAppGroup"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onAddAppGroup}
    >
      <Modal
        title="Add new app group"
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
            form="FormAddNewAppGroup"
          >
            Save
          </Button>,
        ]}
      >
        <Form.Item
          name="appGroupName"
          label="Group name"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <AntInput allowClear placeholder="Enter a name" className="w-full" />
        </Form.Item>
        <Form.Item
          name="selectApp"
          label="Apps"
          rules={[{ required: true, message: FIELD_REQUIRED }]}
        >
          <Select
            allowClear
            showSearch
            mode="multiple"
            placeholder="Select apps"
            className="w-full"
            onChange={(selectedOptions) => {
              form.setFieldsValue({ selectApp: selectedOptions });
            }}
            filterOption={(input, option) => {
              return (
                option?.title?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {listApp.map(
              (item, index) =>
                item?.groupId == null && (
                  <Select.Option
                    key={index}
                    value={item?.id}
                    disabled={item?.groupId != null}
                    title={item.name}
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <img
                          className="w-6 h-6 mr-2"
                          src={item.icon}
                          alt="App Icon"
                        ></img>
                      )}
                      {item?.name}
                    </div>
                  </Select.Option>
                )
            )}
          </Select>
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalAddAppGroup.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setIsLoading: PropTypes.func,
  setListAppGroup: PropTypes.func,
  setSelectItem: PropTypes.func,
};

export default ModalAddAppGroup;
