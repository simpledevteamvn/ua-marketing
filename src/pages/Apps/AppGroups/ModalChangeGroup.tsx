import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import AntInput from "antd/lib/input";
import { Select } from "antd";
import service from "../../../partials/services/axios.config";
import { toast } from "react-toastify";
function ModalChangeGroup(props) {
  const [form] = Form.useForm();
  const {
    isOpen,
    onClose,
    setIsLoading,
    setListAppGroup,
    listAppGroup,
    editedApp,
    setSelectItem,
  } = props;

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onChangeGroup = (values) => {
    let { selectGroup } = values;
    setIsLoading(true);
    if (selectGroup == editedApp.groupId) {
      setIsLoading(false);
      onCloseModal();
    } else {
      service
        .put("/app-group/change/" + selectGroup, { appId: editedApp.id })
        .then(
          (res: any) => {
            toast(res.message || "Change app group success!", {
              type: "success",
            });
            setIsLoading(false);
            onCloseModal();
            const newData = res.results;
            setListAppGroup((prevList) =>
              prevList.map((item) =>
                newData.find((group) => group.id == item.id)
                  ? newData.find((group) => group.id == item.id)
                  : item
              )
            );
            setSelectItem(null);
          },

          () => setIsLoading(false)
        );
    }
  };

  useEffect(() => {
    if (!isOpen || !editedApp) return;
    form.setFieldsValue({
      selectGroup: editedApp?.groupId,
    });
  }, [isOpen]);

  return (
    <Form
      id="FormChangeGroup"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onChangeGroup}
    >
      <Modal
        title="Change app group"
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
            form="FormChangeGroup"
          >
            Save
          </Button>,
        ]}
      >
        <div className="flex items-center justify-center w-full text-2xl mb-10">
          {editedApp?.icon && (
            <img
              className="w-10 h-10 mr-2"
              src={editedApp?.icon}
              alt="App Icon"
            ></img>
          )}
          {editedApp?.name}
        </div>
        <Form.Item name="selectGroup" label="Select group">
          <Select
            allowClear
            showSearch
            placeholder="Select group"
            className="w-full"
            onChange={(option) => {
              form.setFieldsValue({ selectGroup: option });
            }}
            filterOption={(input, option) => {
              return (
                option?.title?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              );
            }}
          >
            {listAppGroup.map((item, index) => (
              <Select.Option key={index} value={item?.id} title={item.name}>
                <div className="flex items-center">{item?.name}</div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalChangeGroup.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setIsLoading: PropTypes.func,
  setListAppGroup: PropTypes.func,
  listAppGroup: PropTypes.any,
  editedApp: PropTypes.any,
  setSelectItem: PropTypes.func,
};

export default ModalChangeGroup;
