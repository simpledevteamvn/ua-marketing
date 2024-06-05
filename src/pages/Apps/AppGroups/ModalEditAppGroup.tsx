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
function ModalEditAppGroup(props) {
  const [form] = Form.useForm();
  const {
    isOpen,
    onClose,
    setIsLoading,
    setListAppGroup,
    editedGroup,
    setSelectItem,
  } = props;
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

  useEffect(() => {
    if (!isOpen || !editedGroup) return;
    form.setFieldsValue({
      selectApp: editedGroup.apps?.map((app) => app.id),
      appGroupName: editedGroup.name,
    });
  }, [isOpen]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onEditGroup = (values) => {
    let { appGroupName, selectApp } = values;
    console.log(appGroupName, selectApp);
    selectApp = selectApp.map((item) => ({ id: item }));
    setIsLoading(true);
    service
      .put("/app-group/" + editedGroup.id, {
        name: appGroupName,
        apps: selectApp,
      })
      .then(
        (res: any) => {
          toast(res.message || "Edit app group success!", {
            type: "success",
          });
          setIsLoading(false);
          onCloseModal();
          const newData = res.results;
          if (!newData?.id) return;
          setListAppGroup((prevList) => {
            return prevList.map((item) => {
              if (item.id == newData.id) {
                return newData;
              }
              return item;
            });
          });
          setSelectItem(null);
        },
        () => setIsLoading(false)
      );
  };

  return (
    <Form
      id="FormEditAppGroup"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onEditGroup}
    >
      <Modal
        title="Edit app group"
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
            form="FormEditAppGroup"
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
            <Select.OptGroup label="Possible change app">
              {listApp.map(
                (item, index) =>
                  (item?.groupId == null ||
                    editedGroup?.apps?.find((app) => app.id == item.id)) && (
                    <Select.Option
                      key={`possible_${index}`}
                      value={item?.id}
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
            </Select.OptGroup>
            <Select.OptGroup label="Impossible change app">
              {editedGroup?.apps?.map(
                (item, index) =>
                  !listApp.find((app) => app.id == item.id) && (
                    <Select.Option
                      key={`impossible_${index}`}
                      value={item?.id}
                      title={item.name}
                      disabled={true}
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
            </Select.OptGroup>
          </Select>
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalEditAppGroup.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setIsLoading: PropTypes.func,
  setListAppGroup: PropTypes.func,
  editedGroup: PropTypes.any,
  setSelectItem: PropTypes.func,
};

export default ModalEditAppGroup;
