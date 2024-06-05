import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import Button from "antd/lib/button/button";
import Select from "antd/lib/select";
import { FOLDER_REQUIRED, VALUE_EXIST } from "../../../constants/formMessage";
import service from "../../../partials/services/axios.config";
import Loading from "../../../utils/Loading";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import AntInput from "antd/lib/input/Input";
import Tag from "antd/lib/tag";
import { TAGGING_COLORS } from "../constants";
import message from "antd/lib/message";
import { LIST_ASSETS_BY_FOLDER } from "../../../api/constants.api";
import { ROOT_FOLDER } from "../Assets";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import UploadAsset from "../../../partials/common/Forms/UploadAsset";
import { MESSAGE_DURATION } from "../../../constants/constants";

function ModalAddAsset(props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { isOpen, onClose, listFolders, setPreviewData, setImgPreview } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<any>([]);
  const [filesSizes, setFilesSizes] = useState<string[]>([]);

  const [listTags, setListTags] = useState<any>([]);
  const [isAddTag, setIsAddTag] = useState(false);
  const [tagName, setTagName] = useState<string>();

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setFileList([]);
      setListTags([]);
      setTagName("");
    }, 300);
  };

  useEffect(() => {
    if (listFolders.length === 1) {
      form.setFieldValue("folderId", listFolders[0].key);
    }
  }, [isOpen]);

  const onBlurTag = () => {
    setIsAddTag(false);
    setTagName("");
  };

  const onCloseTag = (tag) => {
    setListTags(listTags.filter((el) => el !== tag));
  };

  const handleAddTag = () => {
    if (listTags.includes(tagName)) {
      return message.error(VALUE_EXIST, MESSAGE_DURATION);
    }
    setListTags([...listTags, tagName]);
    setTagName("");
  };

  const onFinish = (values) => {
    const { folderId } = values;

    const formData = new FormData();
    fileList.forEach((file, index) => {
      let width = "";
      let height = "";
      if (filesSizes?.[index]) {
        const size = filesSizes[index].split(" x ");
        width = size[0];
        height = size[1];
      }

      formData.append(`files[${index}].file`, file);
      formData.append(`files[${index}].width`, width);
      formData.append(`files[${index}].height`, height);
    });
    formData.append("assetFolderId", folderId);
    formData.append("marks", listTags.join(","));

    setIsLoading(true);
    service
      .post(`/system-asset`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          setFileList([]);
          onCloseModal();
          toast(res.message, { type: "success" });

          const ids = listFolders.map((el) => el.id);
          queryClient.invalidateQueries({
            queryKey: [LIST_ASSETS_BY_FOLDER, ROOT_FOLDER, ids],
          });
        },
        () => setIsLoading(false)
      );
  };

  return (
    <Form
      id="FormAddAsset"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={{}}
    >
      {isLoading && <Loading />}

      <Modal
        title="Add new asset"
        open={isOpen}
        width={700}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="FormAddAsset"
          >
            Add
          </Button>,
        ]}
      >
        <Form.Item
          name="folderId"
          label="Folder"
          rules={[{ required: true, message: FOLDER_REQUIRED }]}
        >
          <Select className="" placeholder="Select folder" allowClear>
            {listFolders?.length > 0 &&
              listFolders.map((data) => (
                <Select.Option key={data.key} size="large">
                  {data.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          className="!mb-2.5"
          label="Tags"
          labelCol={{ sm: { span: 2 }, xs: { span: 4 } }}
          wrapperCol={{ sm: { span: 22 }, xs: { span: 20 } }}
        >
          <div className="-mt-1.5">
            {listTags.length > 0 && (
              <>
                {listTags.map((tag, idx) => {
                  const totalColor = TAGGING_COLORS.length;
                  const colorIdx =
                    idx < totalColor - 1 ? idx : idx % totalColor;

                  return (
                    <Tag
                      color={TAGGING_COLORS[colorIdx]}
                      key={tag}
                      closable
                      className="mt-1.5"
                      onClose={() => onCloseTag(tag)}
                    >
                      {tag}
                    </Tag>
                  );
                })}
              </>
            )}
            {isAddTag ? (
              <AntInput
                className="!w-[89px] !mt-1.5"
                size="small"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                autoFocus
                onBlur={onBlurTag}
                onPressEnter={handleAddTag}
              />
            ) : (
              <Button
                className="mt-1.5"
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setIsAddTag(true)}
              >
                <span className="text-xs2">New Tag</span>
              </Button>
            )}
          </div>
        </Form.Item>

        <UploadAsset
          formLabel="Assets"
          handleSetSizes={setFilesSizes}
          fileList={fileList}
          setFileList={setFileList}
          setPreviewData={setPreviewData}
          setImgPreview={setImgPreview}
        />
      </Modal>
    </Form>
  );
}

ModalAddAsset.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setImgPreview: PropTypes.func,
  setPreviewData: PropTypes.func,
  listFolders: PropTypes.array,
};

export default ModalAddAsset;
