import React, { useEffect, useState } from "react";
import Page from "../../../../utils/composables/Page";
import Button from "antd/lib/button/button";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import TeleTable from "./TeleTable";
import Modal from "antd/lib/modal/Modal";
import Form from "antd/lib/form";
import AntInput from "antd/lib/input/Input";
import {
  GROUP_REQUIRED,
  TYPE_REQUIRED,
  USERNAME_REQUIRED,
} from "../../../../constants/formMessage";
import Popover from "antd/lib/popover";
import EyeOutlined from "@ant-design/icons/lib/icons/EyeOutlined";
import Steps from "antd/lib/steps";
// @ts-ignore
import step1 from "../../../../images/settings/telegram-guidelines/step1.png";
// @ts-ignore
import step2 from "../../../../images/settings/telegram-guidelines/step2.png";
// @ts-ignore
import step3 from "../../../../images/settings/telegram-guidelines/step3.png";
import { toast } from "react-toastify";
import { getAllTeleGroupType } from "../../../../api/settings/telegram.api";
import { useQuery } from "@tanstack/react-query";
import { LIST_TELE_GROUP_TYPE } from "../../../../api/constants.api";
import Select from "antd/lib/select";
import { capitalizeWord } from "../../../../utils/Helpers";
import { checkContainText } from "../../../../utils/helper/TableHelpers";

function TelegramSettings(props) {
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModalAddTele, setIsOpenModalAddTele] = useState(false);
  const [listData, setListData] = useState<any>([]);
  const [isOpenGuildline, setIsOpenGuildline] = useState(false);
  const [current, setCurrent] = useState(0);
  const [listGroupType, setListGroupType] = useState([]);
  const [searchData, setSearchData] = useState<any>({});

  const [listStoreApp, setListStoreApp] = useState([]);

  const initialValues = {
    username: "",
    group: "",
    groupType: null,
  };

  useEffect(() => {
    const getAllApp = service.get("/store-app");
    const getAllGroup = service.get("/telegram");

    Promise.all([getAllApp, getAllGroup]).then(
      (res: any) => {
        setIsLoading(false);
        setListStoreApp(res[0].results || []);
        setListData(res[1].results || []);
      },
      () => setIsLoading(false)
    );
  }, []);

  const { data: teleGroupTypeRes } = useQuery({
    queryKey: [LIST_TELE_GROUP_TYPE],
    queryFn: getAllTeleGroupType,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListGroupType(teleGroupTypeRes?.results);
  }, [teleGroupTypeRes]);

  const onCloseModalAdd = () => {
    setIsOpenModalAddTele(false);

    setTimeout(() => {
      form.resetFields();
    }, 300);
  };

  const onFinish = (values) => {
    const { username, group, groupType } = values;

    setIsLoading(true);
    service
      .post("/telegram/create", null, {
        params: { username, group, type: groupType },
      })
      .then(
        (res: any) => {
          setIsLoading(false);
          toast(res.message, { type: "success" });
          onCloseModalAdd();

          if (res.results) {
            const newListData = [...listData, res.results];
            setListData(newListData);
          }
        },
        () => setIsLoading(false)
      );
  };

  const onCloseGuidelines = () => {
    setIsOpenGuildline(false);
    setTimeout(() => {
      setCurrent(0);
    }, 200);
  };

  const onOpenChange = (value) => {
    setIsOpenGuildline(value);
    if (!value) {
      setTimeout(() => {
        setCurrent(0);
      }, 200);
    }
  };

  const onDelete = (record, callback) => {
    setIsLoading(true);
    service.delete(`/admin/telegram/${record.id}`).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });

        const newListData = listData.filter((el) => el.id !== record.id);
        setListData(newListData);
        callback && callback();
      },
      () => setIsLoading(false)
    );
  };

  const onLinkApps = (record, storeApps, callback) => {
    const activedApps = listStoreApp.filter((el: any) =>
      storeApps.includes(el.storeId + el.name)
    );
    const params = {
      storeAppIds: activedApps?.map((el: any) => el.id)?.join(","),
      groupId: record.id,
    };

    setIsLoading(true);
    service.put("/telegram/link", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });

        const newListData = listData.map((group: any) => {
          if (group.id !== record.id) return group;

          return { ...group, storeApps: res.results };
        });
        setListData(newListData);
        callback && callback();
      },
      () => setIsLoading(false)
    );
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const next = () => {
    if (current === steps.length - 1) return;
    setCurrent(current + 1);
  };

  const prev = () => {
    if (!current) return;
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: "First",
      content: "1. Create a new group from the menu of the Telegram.",
      img: step1,
    },
    {
      title: "Second",
      content: '2. Find and add the bot "Falcon UA Supporter" as member.',
      img: step2,
    },
    {
      title: "Last",
      content:
        "3. From the menu -> Settings: get username of the account that created the group to enter in the form below.",
      img: step3,
    },
  ];
  const filteredData = listData.filter((el) =>
    checkContainText(searchData, el)
  );

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col xs:flex-row">
        <div className="tab-title">Telegram settings</div>
        <div className="mt-1 sm:mt-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={(e) => setIsOpenModalAddTele(true)}
          >
            Add Group
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <TeleTable
          data={filteredData}
          listStoreApp={listStoreApp}
          onDelete={onDelete}
          onLinkApps={onLinkApps}
          onSearchTable={onSearchTable}
        />
      </div>

      <Form
        id="FormAddTeleGroup"
        labelAlign="left"
        form={form}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Modal
          title="Add new telegram group"
          maskClosable={false}
          open={isOpenModalAddTele}
          onCancel={onCloseModalAdd}
          footer={[
            <Button key="back" htmlType="button" onClick={onCloseModalAdd}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              htmlType="submit"
              form="FormAddTeleGroup"
            >
              Add
            </Button>,
          ]}
        >
          <div
            className="w-fit cursor-pointer flex items-center"
            onClick={() => !isOpenGuildline && setIsOpenGuildline(true)}
          >
            <div>
              <span className="font-semibold mr-1">Note:</span>
              <span>View the guidelines</span>
            </div>
            <EyeOutlined className="ml-1 pr-2 text-base" />
          </div>

          <div className="relative">
            <div className="absolute top-[-15px] w-full text-center">
              <Popover
                title={
                  <div className="text-center">
                    Telegram group adding process
                  </div>
                }
                content={
                  <div className="popover-in-modal">
                    <Steps current={current} size="small">
                      <Steps.Step title="Step 1" />
                      <Steps.Step title="Step 2" />
                      <Steps.Step title="Step 3" />
                    </Steps>

                    <div className="steps-content w-80 sm:w-96 sm:mt-4">
                      <div>{steps[current].content}</div>
                      {steps[current].img && (
                        <img
                          src={steps[current].img}
                          alt=" "
                          className="max-h-[180px] bg-contain mx-auto mt-2 shadow-custom1"
                        />
                      )}
                    </div>
                    <div className="mt-6 flex justify-between">
                      <div className="flex">
                        <Button
                          size="small"
                          className="mr-2"
                          onClick={() => prev()}
                          disabled={false}
                          // disabled={!current}
                        >
                          Previous
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => next()}
                          disabled={false}
                          // disabled={current === steps.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                      {current === steps.length - 1 && (
                        <Button
                          size="small"
                          type="primary"
                          className="ml-auto"
                          onClick={onCloseGuidelines}
                        >
                          Done
                        </Button>
                      )}
                    </div>
                  </div>
                }
                trigger="click"
                placement="bottom"
                open={isOpenGuildline}
                onOpenChange={onOpenChange}
              />
            </div>
          </div>

          <Form.Item
            className="!mt-3"
            name="username"
            label="Username"
            rules={[{ required: true, message: USERNAME_REQUIRED }]}
          >
            <AntInput allowClear placeholder="Enter username" />
          </Form.Item>
          <Form.Item
            name="group"
            label="Group"
            rules={[{ required: true, message: GROUP_REQUIRED }]}
          >
            <AntInput allowClear placeholder="Enter group name" />
          </Form.Item>
          <Form.Item
            name="groupType"
            label="Group Type"
            rules={[{ required: true, message: TYPE_REQUIRED }]}
          >
            <Select placeholder="Select type">
              {listGroupType?.map((groupType, idx) => (
                <Select.Option value={groupType} key={idx}>
                  {capitalizeWord(groupType)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Modal>
      </Form>
    </Page>
  );
}

TelegramSettings.propTypes = {};

export default TelegramSettings;
