import React, { useEffect, useState } from "react";
import Form from "antd/lib/form";
import {
  CREATIVE_REQUIRED,
  TYPE_REQUIRED,
} from "../../../../../../constants/formMessage";
import Select from "antd/lib/select";
import Tree from "antd/lib/tree";
import { getLabelFromStr } from "../../../../../../utils/Helpers";
import { getAllParentKeys } from "../../../../../../utils/helper/TreeHelpers";
import CreativeTable from "./CreativeTable";
import ModalAddCreative from "./ModalAddCreatives/ModalAddCreative";
import VideoPopup from "../../../../Creative/VideoPopup/VideoPopup";
import ImagePreview from "../../../../Creative/ImagePreview/ImagePreview";
import { backActionHook } from "../../../Helpers";

function Step4(props) {
  const [form] = Form.useForm();
  const {
    campaignConfigs,
    next,
    stepData,
    activedApp,
    applicationsData,
    setIsLoading,
    onPrev,
    countBackAction,
  } = props;

  const [treeData, setTreeData] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [isShowRequired, setIsShowRequired] = useState(false);

  const [isAddCreatives, setIsAddCreatives] = useState(false);
  const [creatives, setCreatives] = useState<any>([]);
  const [activedCountries, setActivedCountries] = useState<any>();

  const [previewData, setPreviewData] = useState({});
  const [imgPreview, setImgPreview] = useState<any>({});

  const initialValues = {
    typeLabelEl: "faked",
    creativeEl: "faked",
  };

  backActionHook(form, onPrev, countBackAction, {
    creatives,
    activedCountries,
  });

  useEffect(() => {
    const initData = stepData?.step4;

    if (initData) {
      const { adType, creatives, activedCountries } = initData;
      setCreatives(creatives || []);
      setActivedCountries(activedCountries);
      setCheckedKeys(adType);
      form.setFieldValue("adType", adType);
    }
  }, [stepData]);

  useEffect(() => {
    const { creativeTypes } = campaignConfigs;

    if (Object.keys(creativeTypes || {})?.length) {
      const getChildren = (list, parentId) => {
        if (!list?.length) return undefined;

        return list.map((el, idx) => {
          const newId = !!parentId ? parentId + "-" + idx : String(idx);
          return { title: getLabelFromStr(el), key: el, id: newId };
        });
      };

      const data = Object.keys(creativeTypes).map((el, idx) => {
        const crrId = String(idx);
        return {
          title: getLabelFromStr(el),
          key: el,
          id: crrId,
          children: getChildren(creativeTypes[el], crrId),
        };
      });
      const listKeys = getAllParentKeys(data);
      setExpandedKeys(listKeys);
      setTreeData(data);
    }
  }, [campaignConfigs]);

  const onCheck = (checkedKeysValue, info) => {
    setCheckedKeys(checkedKeysValue);
    form.setFields([{ name: "adType", errors: [] }]);
  };

  const onExpand = (newExpandedKeys, info) => {
    setExpandedKeys(newExpandedKeys);
  };

  const handleAddCreatives = (newCreatives) => {
    const newList = [...creatives];
    newCreatives.forEach((el) => {
      const isExist = newList.some((data) => el.id === data.id);
      if (!isExist || !newList?.length) {
        newList.push(el);
      }
    });
    setCreatives(newList);
    isShowRequired && setIsShowRequired(false);
  };

  const handleDelete = (ids) => {
    const newList = creatives.filter((el) => !ids.includes(el.id));
    setCreatives(newList);
  };

  const onFinish = (values) => {
    if (!creatives?.length) {
      return setIsShowRequired(true);
    }
    next({ ...values, creatives, activedCountries });
  };

  return (
    <Form
      id="FormStep4"
      labelAlign="left"
      form={form}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Ad type"
        name="typeLabelEl"
        rules={[{ required: true }]}
        className="!h-0 !-mb-2"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item label={<></>} className="!mb-0">
        <div className="border p-5 pb-3 bg-gray-100/60 shadow-sm rounded mb-6 max-w-3xl">
          <div>
            <div className="mb-2 -mt-1 text-sm2">
              <div>
                The creatives added above will determine what ads are eligible
                below.
              </div>
              <div>
                <a
                  href="https://cdn-adn-https.rayjump.com/cdn-adn/v2/portal/21/06/23/17/56/60d305676af22.pdf"
                  target="_blank"
                >
                  Click here{" "}
                </a>
                to learn more about each individual ad.
              </div>
            </div>
            <Form.Item
              name="adType"
              className="!mb-1"
              rules={[{ required: true, message: TYPE_REQUIRED }]}
              valuePropName="checkedKeys"
              trigger="onCheck"
            >
              <Tree
                className="!pt-2 !pb-1 !mb-1 overflow-auto max-h-[300px]"
                selectable={false}
                checkable
                blockNode
                treeData={treeData}
                checkedKeys={checkedKeys}
                onCheck={onCheck}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
              />
            </Form.Item>
          </div>
        </div>
      </Form.Item>

      <Form.Item
        label="Creatives"
        name="creativeEl"
        rules={[{ required: true }]}
        className="!h-0 !-mb-2"
      >
        <Select className="!hidden" />
      </Form.Item>

      <Form.Item label={<></>} className="overflow-x-auto">
        <CreativeTable
          handleAdd={() => setIsAddCreatives(true)}
          handleDelete={handleDelete}
          data={creatives}
          setCreatives={setCreatives}
          countries={stepData?.step2?.targetLocations || []}
          setImgPreview={setImgPreview}
          setPreviewData={setPreviewData}
          activedCountries={activedCountries}
          setActivedCountries={setActivedCountries}
        />
        {isShowRequired && (
          <div className="text-red-500">{CREATIVE_REQUIRED}</div>
        )}
      </Form.Item>

      <ModalAddCreative
        isOpen={isAddCreatives}
        onClose={() => setIsAddCreatives(false)}
        activedApp={activedApp}
        applicationsData={applicationsData}
        handleAddCreatives={handleAddCreatives}
        setIsLoading={setIsLoading}
        setImgPreview={setImgPreview}
        setPreviewData={setPreviewData}
      />

      <VideoPopup
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />
      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </Form>
  );
}

export default Step4;
