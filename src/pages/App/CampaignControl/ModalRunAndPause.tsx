import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import Select from "antd/lib/select";
import service from "../../../partials/services/axios.config";
import { OPTION_REQUIRED } from "../../../constants/formMessage";
import { filterSelectGroup, onSelectWithAllOpt } from "../../../utils/Helpers";
import { MORE_ACTION_KEY } from "./Helper";
import {
  ALL_CAMPAIGNS_OPTION,
  LIST_CAMPAIGN_STATUS,
} from "../../../constants/constants";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import { toast } from "react-toastify";
import Loading from "../../../utils/Loading";
import { showBatchErrModal } from "../CampaignCenter/CampaignIntel/BatchErrorModal/BatchErrorModal";

function ModalRunAndPause(props) {
  const [form] = Form.useForm();

  const { isOpen, setTableData, onClose, action, tableData, listAdNetwork } =
    props;

  const [isLoading, setIsLoading] = useState(false);
  const [activedCamp, setActivedCamp] = useState([]);

  const formNetworks = Form.useWatch("networks", form);

  const onCloseModal = () => {
    onClose();

    setTimeout(() => {
      form.resetFields();
      setActivedCamp([]);
    }, 300);
  };

  const onChangeNetwork = (value) => {
    if (form.getFieldValue("campaigns")?.length) {
      form.setFieldValue("campaigns", []);
    }
  };

  const onChange = (values) => {
    setActivedCamp(values);
    form.setFieldValue("campaigns", values);
  };

  const onFinish = (values) => {
    const isPauseAction = action === MORE_ACTION_KEY.pause;
    const params = {
      campaignIds: activedCamp
        .filter((el) => el !== ALL_CAMPAIGNS_OPTION)
        ?.join(","),
      enable: !isPauseAction,
    };

    setIsLoading(true);
    service.put("/campaign/status", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        onCloseModal();

        if (!res.results) return;
        const updatedData = res.results.successList;
        const failList = res.results.failList;

        if (failList?.length) {
          const columns = [
            {
              title: "Network",
              render: (rd) => (
                <div className="flex items-center">
                  {rd.network?.imageUrl && (
                    <img
                      src={rd.network?.imageUrl}
                      alt=" "
                      className="w-5 h-5 rounded-sm mr-1 mb-0.5"
                    />
                  )}
                  <span>{rd.network?.name}</span>
                </div>
              ),
            },
            {
              title: "Campaign Name",
              render: (rd) => rd.campaign?.name,
            },
            {
              title: "Message",
              dataIndex: "message",
            },
          ];
          showBatchErrModal(failList, columns, (rd) => rd.campaign?.id);
        } else {
          toast(res.message, { type: "success" });
        }

        if (!updatedData?.length) return;

        const newTableData = tableData.map((el) => {
          const activedEl = updatedData.find((newData) => newData.id === el.id);
          if (activedEl?.id) {
            const newStatus = isPauseAction
              ? LIST_CAMPAIGN_STATUS.paused.value
              : LIST_CAMPAIGN_STATUS.running.value;
            return { ...el, status: newStatus };
          }

          return el;
        });

        setTableData(newTableData);
      },
      () => setIsLoading(false)
    );
  };

  let title;
  let listData;
  if (action === MORE_ACTION_KEY.pause) {
    title = "Pause campaigns";
    listData = tableData.filter(
      (el) => el.status === LIST_CAMPAIGN_STATUS.running.value
    );
  } else {
    title = "Run campaigns";
    listData = tableData.filter(
      (el) => el.status === LIST_CAMPAIGN_STATUS.paused.value
    );
  }

  let filteredData = listData;
  if (formNetworks?.length) {
    filteredData = filteredData.filter((el) =>
      formNetworks.includes(el.network?.code)
    );
  }
  const listOpts = filteredData?.map((camp) => camp.id);

  return (
    <Form
      id="FormRunAndPause"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={{}}
    >
      {isLoading && <Loading />}

      <Modal
        title={title}
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
            form="FormRunAndPause"
          >
            {action} all
          </Button>,
        ]}
      >
        <Form.Item name="networks" label="Networks">
          <SelectNetwork
            listNetwork={listAdNetwork}
            onChange={onChangeNetwork}
          />
        </Form.Item>
        <Form.Item
          name="campaigns"
          label="Campaigns"
          rules={[{ required: true, message: OPTION_REQUIRED }]}
        >
          <Select
            showSearch
            allowClear
            mode="multiple"
            maxTagCount="responsive"
            placeholder="Select campaigns"
            value={activedCamp}
            onChange={(listCampaign) =>
              onSelectWithAllOpt(
                listCampaign,
                listOpts,
                ALL_CAMPAIGNS_OPTION,
                activedCamp,
                onChange
              )
            }
            filterOption={filterSelectGroup}
          >
            {filteredData.length > 0 && (
              <>
                <Select.OptGroup
                  label={`All Campaigns (${filteredData.length})`}
                >
                  <Select.Option value={ALL_CAMPAIGNS_OPTION}>
                    All Campaigns
                  </Select.Option>
                </Select.OptGroup>

                <Select.OptGroup label="Campaign">
                  {filteredData.map((camp, idx) => (
                    <Select.Option value={camp.id} key={idx}>
                      {camp.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              </>
            )}
          </Select>
        </Form.Item>
      </Modal>
    </Form>
  );
}

ModalRunAndPause.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  setTableData: PropTypes.func,
  action: PropTypes.string,
  tableData: PropTypes.array,
  listAdNetwork: PropTypes.array,
};

export default ModalRunAndPause;
