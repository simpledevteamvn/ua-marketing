import React, { useEffect, useState } from "react";
import Button from "antd/lib/button";
import Modal from "antd/lib/modal";
import Select from "antd/lib/select";
import Form from "antd/lib/form";
import { TARGET_TYPE_IDS } from "../constants";
import SelectStoreApp, {
  getActivedApp,
} from "../../../../partials/common/Forms/SelectStoreApp";
import service from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import {
  LIST_AD_NETWORK,
  LIST_STORE_APPS,
} from "../../../../api/constants.api";
import { getStoreApps } from "../../../../api/apps/apps.api";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import { getListAdNetwork } from "../../../../api/common/common.api";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import { FIELD_REQUIRED } from "../../../../constants/formMessage";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import {
  ALL_APP_OPTION,
  ALL_CAMPAIGNS_OPTION,
  ALL_COUNTRIES_OPTION,
  ALL_SITE_ID_OPTION,
} from "../../../../constants/constants";
import SelectSiteId from "../../../../partials/common/Forms/SelectSiteId";
import SelectAdGroup from "../../../../partials/common/Forms/SelectAdGroup";

function ModalRuleTarget(props) {
  const [form] = Form.useForm();
  const { data, onClose, updateCb } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [inited, setInited] = useState(false);
  const [activedApp, setActivedApp] = useState<string[]>([]);

  const [appGroups, setAppGroups] = useState<any>([]);
  const [listStoreApps, setListStoreApps] = useState([]);
  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  // const [storedCamp, setStoredCamp] = useState([]);

  const targetType = data?.target?.targetType || "";
  const initialValues = {};

  const formGroup = Form.useWatch("activedGroupIds", form);
  const formCampaign = Form.useWatch("campaigns", form);
  const formCountries = Form.useWatch("countries", form);

  const { data: storeAppsRes } = useQuery({
    queryKey: [LIST_STORE_APPS],
    queryFn: getStoreApps,
    staleTime: 120 * 60000,
  });

  useEffect(() => {
    setListStoreApps(storeAppsRes?.results || []);
  }, [storeAppsRes]);

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results || []);
  }, [listNetwork]);

  useEffect(() => {
    if (!data?.id || inited) return;

    const getApp = service.get("/app-group");

    setIsLoading(true);
    Promise.all([getApp]).then(
      (res: any) => {
        setInited(true);
        setIsLoading(false);
        setAppGroups(res[0].results || []);
      },
      () => setIsLoading(false)
    );
  }, [data?.id]);

  useEffect(() => {
    if (!inited || !data?.target) return;
    const { networks } = data;
    const {
      targetGroupIds,
      targetIds,
      targetType,
      storeAppIds,
      countryIds,
      campaignIds,
    } = data.target;

    const campaigns = campaignIds?.length
      ? campaignIds
      : [ALL_CAMPAIGNS_OPTION];
    let formData: any = {
      activedGroupIds: targetGroupIds || [],
      activedIds: targetIds || [],
      networks,
    };

    const updateActivedApp = (listIds = targetIds, updateForm = false) => {
      if (!listIds?.length) return;

      let newData = [];
      if (listIds.length === 1 && listIds[0] === ALL_APP_OPTION) {
        newData = listIds;
      } else {
        newData = listIds.map((id) => {
          const activedData: any = listStoreApps.find(
            (el: any) => el.id === id
          );
          return activedData ? activedData.storeId + activedData.name : "";
        });
      }

      setActivedApp(newData);
      if (updateForm) {
        formData = { ...formData, apps: newData };
      }
    };

    switch (targetType) {
      case TARGET_TYPE_IDS.apps:
        updateActivedApp();
        break;
      case TARGET_TYPE_IDS.campaigns:
        updateActivedApp(storeAppIds, true);
        break;
      case TARGET_TYPE_IDS.geo:
        const apps = storeAppIds?.length ? storeAppIds : [ALL_APP_OPTION];
        updateActivedApp(apps, true);
        break;

      case TARGET_TYPE_IDS.adgroup:
        updateActivedApp(storeAppIds, true);
        formData = { ...formData, campaigns };
        break;

      case TARGET_TYPE_IDS.sourceAndSite:
        updateActivedApp(storeAppIds, true);
        const countries = countryIds?.length
          ? countryIds
          : [ALL_COUNTRIES_OPTION];
        formData = { ...formData, campaigns, countries };
        break;
      default:
        break;
    }
    form.setFieldsValue(formData);
  }, [data?.id, inited]);

  const onCloseModal = () => {
    onClose();
    setTimeout(() => {
      form.resetFields();
      setActivedApp([]);
    }, 300);
  };

  const getDisabled = () => {
    let disabled = false;

    switch (targetType) {
      case TARGET_TYPE_IDS.apps:
        disabled = !formGroup?.length && !activedApp?.length;
        break;

      case TARGET_TYPE_IDS.campaigns:
      default:
        break;
    }
    return disabled;
  };

  const removeAllOpt = (list, allOpt) => {
    if (!list?.length) return list;
    return list.filter((el) => el !== allOpt);
  };

  const onFinish = (values) => {
    const { activedGroupIds, activedIds, campaigns, countries } = values;
    let targetIds: string[] = activedIds;
    let targetGroupIds: string[] = activedGroupIds;
    let storeAppIds: string[] | undefined = undefined;
    // Hiện tại không đổi được targetType nên init luôn với campaigns và countries của form được
    const campaignIds: string[] | undefined = removeAllOpt(
      campaigns,
      ALL_CAMPAIGNS_OPTION
    );
    const countryIds: string[] | undefined = removeAllOpt(
      countries,
      ALL_COUNTRIES_OPTION
    );

    const storeApps = activedApp?.map((str) => {
      return getActivedApp(listStoreApps, str)?.id;
    });

    switch (targetType) {
      case TARGET_TYPE_IDS.apps:
        targetIds = storeApps;
        break;

      case TARGET_TYPE_IDS.geo:
        // Hiện chỉ GEO là có ALL_APP_OPTION => có thể lọc cho dễ đọc params
        if (activedApp?.length && activedApp.includes(ALL_APP_OPTION)) {
          storeAppIds = [];
        } else {
          storeAppIds = storeApps;
        }
        targetIds = removeAllOpt(activedIds, ALL_COUNTRIES_OPTION);
        break;

      case TARGET_TYPE_IDS.sourceAndSite:
        storeAppIds = storeApps;
        targetIds = removeAllOpt(activedIds, ALL_SITE_ID_OPTION);
        break;

      case TARGET_TYPE_IDS.campaigns:
        storeAppIds = storeApps;
        targetIds = removeAllOpt(activedIds, ALL_CAMPAIGNS_OPTION);
        break;

      case TARGET_TYPE_IDS.adgroup:
        storeAppIds = storeApps;
        break;

      default:
        break;
    }

    const params = {
      targetIds,
      targetGroupIds,
      storeAppIds,
      campaignIds,
      countryIds,
    };

    setIsLoading(true);
    service.put(`/automated-rules/${data?.id}/targets`, params).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseModal();
        updateCb && updateCb(res.results);
      },
      () => setIsLoading(false)
    );
  };

  const getAppIds = () => {
    return activedApp?.map((str) => getActivedApp(listStoreApps, str).id);
  };

  const networkAndAppForm = (
    <>
      <Form.Item label="Networks" name="networks">
        <SelectNetwork listNetwork={listAdNetwork} disabled={true} />
      </Form.Item>
      <Form.Item
        label="Apps"
        name="apps"
        rules={[{ required: true, message: FIELD_REQUIRED }]}
      >
        <SelectStoreApp
          isMultiple={true}
          listApp={listStoreApps}
          activedApp={activedApp}
          setActivedApp={(v) => {
            setActivedApp(v);
            if (v?.length > activedApp?.length) {
              form.setFieldsValue({ apps: v });
            } else {
              form.setFieldsValue({ apps: v, campaigns: [], activedIds: [] });
            }
          }}
        />
      </Form.Item>
    </>
  );

  return (
    <Form
      id="FormUpdateTarget"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {isLoading && <Loading />}
      <Modal
        width={700}
        title={
          data?.name
            ? `Update target for the "${data.name}" rule`
            : "Update target"
        }
        open={data?.id}
        maskClosable={false}
        onCancel={onCloseModal}
        footer={[
          <Button key="back" htmlType="button" onClick={onCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            htmlType="submit"
            form="FormUpdateTarget"
            disabled={getDisabled()}
          >
            Save
          </Button>,
        ]}
      >
        {targetType && (
          <Form.Item label="Target type">
            <Select disabled value={targetType} className="!w-full">
              <Select.Option value={targetType}>{targetType}</Select.Option>
            </Select>
          </Form.Item>
        )}

        {targetType === TARGET_TYPE_IDS.apps && (
          <>
            <Form.Item label="App groups" name="activedGroupIds">
              <Select
                className="!w-full"
                placeholder="Select groups"
                mode="multiple"
                maxTagCount="responsive"
                allowClear
              >
                {appGroups?.length > 0 &&
                  appGroups.map((el, idx) => (
                    <Select.Option value={el.id} key={idx}>
                      {el.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item label="Apps" name="activedIds">
              <SelectStoreApp
                isMultiple={true}
                listApp={listStoreApps}
                activedApp={activedApp}
                setActivedApp={setActivedApp}
              />
            </Form.Item>
          </>
        )}

        {targetType === TARGET_TYPE_IDS.campaigns && (
          <>
            {networkAndAppForm}
            <Form.Item
              label="Campaigns"
              name="activedIds"
              rules={[{ required: true, message: FIELD_REQUIRED }]}
            >
              <SelectCampaignByNetwork
                networkData={data?.networks}
                storeAppIds={getAppIds()}
                // setListCampaignData={setStoredCamp}
              />
            </Form.Item>
          </>
        )}

        {targetType === TARGET_TYPE_IDS.geo && (
          <>
            <Form.Item label="Apps" name="apps">
              <SelectStoreApp
                hasAllOpt={true}
                isMultiple={true}
                listApp={listStoreApps}
                activedApp={activedApp}
                setActivedApp={(v) => {
                  setActivedApp(v);
                  form.setFieldValue("apps", v);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Countries"
              name="activedIds"
              rules={[{ required: true, message: FIELD_REQUIRED }]}
            >
              <SelectCountry />
            </Form.Item>
          </>
        )}

        {(targetType === TARGET_TYPE_IDS.adgroup ||
          targetType === TARGET_TYPE_IDS.sourceAndSite) && (
          <>
            {networkAndAppForm}
            <Form.Item label="Campaigns" name="campaigns">
              <SelectCampaignByNetwork
                networkData={data?.networks}
                storeAppIds={getAppIds()}
                // setListCampaignData={setStoredCamp}
                onChange={(newValues) => {
                  if (newValues?.length < formCampaign?.length) {
                    form.setFields([
                      { name: "activedIds", value: [], errors: [] },
                    ]);
                  }
                }}
              />
            </Form.Item>
          </>
        )}

        {targetType === TARGET_TYPE_IDS.adgroup && (
          <>
            <Form.Item
              label="Ad group"
              name="activedIds"
              rules={[{ required: true, message: FIELD_REQUIRED }]}
            >
              <SelectAdGroup
                field="id"
                networkData={data?.networks}
                campaignIds={formCampaign}
                storeAppIds={getAppIds()}
              />
            </Form.Item>
          </>
        )}

        {targetType === TARGET_TYPE_IDS.sourceAndSite && (
          <>
            <Form.Item label="Countries" name="countries">
              <SelectCountry
                onChange={(values) => {
                  if (values?.length < formCountries?.length) {
                    form.setFields([
                      { name: "activedIds", value: [], errors: [] },
                    ]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              label="Site IDs"
              name="activedIds"
              rules={[{ required: true, message: FIELD_REQUIRED }]}
            >
              <SelectSiteId
                networkData={data?.networks}
                storeAppIds={getAppIds()}
                campaignData={formCampaign}
                countryData={formCountries}
              />
            </Form.Item>
          </>
        )}
      </Modal>
    </Form>
  );
}

export default ModalRuleTarget;
