import Button from "antd/lib/button";
import React, { useEffect, useState } from "react";
import { BiPlus } from "@react-icons/all-files/bi/BiPlus";
import { BiMinusCircle } from "@react-icons/all-files/bi/BiMinusCircle";
import { toast } from "react-toastify";
import Input from "../../partials/elements/Input";
import Modal from "../../partials/elements/Modal";
import Select from "../../partials/elements/Select";
import service from "../../partials/services/axios.config";
import Page from "../../utils/composables/Page";
import Loading from "../../utils/Loading";
import NetworkTable from "./NetworkTable";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";

const NetworkConfig = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenAddNetworkModal, setIsOpenAddNetworkModal] = useState(false);

  const [network, setNetwork] = useState("");
  const [code, setCode] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [activedType, setActivedType] = useState({});

  const [configName, setConfigName] = useState("");
  const [listConfig, setListConfig] = useState([]);
  const [listNetworkType, setListNetworkType] = useState([]);
  const [listNetwork, setListNetwork] = useState([]);

  const [isOpenEditNetworkModal, setIsOpenEditNetworkModal] = useState(false);
  const [editedNetwork, setEditedNetwork] = useState({});
  const [editedName, setEditedName] = useState("");
  const [editedImgUrl, setEditedImgUrl] = useState("");
  const [editedType, setEditedType] = useState({});
  const [editedConfigs, setEditedConfigs] = useState([]);
  const [editedConfigName, setEditedConfigName] = useState("");

  useEffect(() => {
    const getNetworkType = service.get("/network-type");
    const getListNetwork = service.get("/network");

    Promise.all([getNetworkType, getListNetwork]).then(
      (res) => {
        setListNetworkType(res[0].results);
        setListNetwork(res[1].results);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, []);

  const addConfig = () => {
    // @ts-ignore
    if (!listConfig.includes(configName)) {
      // @ts-ignore
      setListConfig([...listConfig, configName]);
    }
    setConfigName("");
  };

  const addEditedConfig = () => {
    // @ts-ignore
    if (!editedConfigs.includes(editedConfigName)) {
      // @ts-ignore
      setEditedConfigs([...editedConfigs, editedConfigName]);
    }
    setEditedConfigName("");
  };

  const removeConfig = (config) => {
    const newListConfig = listConfig.filter((item) => item !== config);
    // @ts-ignore
    setListConfig(newListConfig);
  };

  const removeEditedConfig = (config) => {
    const newListConfig = editedConfigs.filter((item) => item !== config);
    // @ts-ignore
    setEditedConfigs(newListConfig);
  };

  const onSubmitAddNetwork = () => {
    setIsLoading(true);
    const params = {
      name: network,
      code,
      imageUrl: imgUrl,
      networkType: activedType,
      configs: listConfig,
    };

    service.post("/network", params).then(
      (res) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseAddNetworkModal();

        const newTableData = listNetwork;
        newTableData.push(res.results);
        setListNetwork(newTableData);
      },
      () => setIsLoading(false)
    );
  };

  const onCloseAddNetworkModal = () => {
    setIsOpenAddNetworkModal(false);
    setTimeout(() => {
      setNetwork("");
      setCode("");
      setImgUrl("");
      setActivedType({});
      setConfigName("");
      setListConfig([]);
    }, 300);
  };

  const onEditNetwork = (networkObj) => {
    setIsOpenEditNetworkModal(true);
    setEditedNetwork(networkObj);
    setEditedName(networkObj.name);
    setEditedImgUrl(networkObj.imageUrl || "");
    setEditedType(networkObj.networkType);
    setEditedConfigs(networkObj.configs || []);
  };

  const onUpdateNetwork = () => {
    setIsLoading(true);

    const params = {
      id: editedNetwork.id,
      name: editedName,
      imageUrl: editedImgUrl,
      code: editedNetwork.code, // "code" field is non mutative
      networkType: editedType,
      configs: editedConfigs,
    };
    service.put("/network", params).then(
      (res) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        onCloseEditNetworkModal();

        const foundIndex = listNetwork.findIndex(
          (item) => item.id === editedNetwork.id
        );
        if (foundIndex !== -1) {
          const newTableData = listNetwork;
          newTableData.splice(foundIndex, 1, res.results);
          // @ts-ignore
          setListNetwork(newTableData);
        }
      },
      () => setIsLoading(false)
    );
  };

  const onCloseEditNetworkModal = () => {
    setIsOpenEditNetworkModal(false);
    setTimeout(() => {
      setEditedConfigName("");
    }, 300);
  };

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col xs:flex-row">
        <div className="page-title">Networks</div>
        <div className="mt-1 sm:mt-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsOpenAddNetworkModal(true)}
          >
            Add Network
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <NetworkTable
          onEdit={onEditNetwork}
          listData={listNetwork}
          key={listNetwork.length}
        />
      </div>

      <Modal
        title="Add Network"
        isOpen={isOpenAddNetworkModal}
        onClose={onCloseAddNetworkModal}
        submitLabel="Add"
        onSubmit={onSubmitAddNetwork}
        disabled={!network || !code || !activedType?.id}
      >
        <Input
          noteRequire
          label="Network"
          value={network}
          onChange={setNetwork}
          placeholder="E.g. Google Ads"
          inputClassName="input-light-antd"
        />
        <Input
          noteRequire
          className="mt-4"
          label="Code"
          value={code}
          onChange={setCode}
          placeholder="E.g. google-ads"
          inputClassName="input-light-antd"
        />
        <Input
          className="mt-4"
          label="Image url"
          value={imgUrl}
          onChange={setImgUrl}
          placeholder="Url"
          inputClassName="input-light-antd"
        />
        <Select
          noteRequire
          className="mt-4"
          label="Network Type"
          labelKey="name"
          listOption={listNetworkType}
          activedOpt={activedType}
          onChange={(value) => setActivedType(value)}
        />

        <div className="modal-label">Add dynamic configurations:</div>
        <div className="flex items-center w-full">
          <Input
            className="flex-1 rounded"
            value={configName}
            onChange={setConfigName}
            placeholder="Configuration name"
            inputClassName="input-light-antd"
          />
          <button
            className="btn-light ml-3 px-2"
            disabled={!configName}
            onClick={addConfig}
          >
            <BiPlus size={22} />
          </button>
        </div>

        {listConfig?.length > 0 && (
          <>
            <div className="modal-label">Configurations:</div>
            <ul className="grid grid-cols-2 gap-y-1 gap-x-2">
              {listConfig.map((config, idx) => (
                <li key={idx} className="flex items-center">
                  <BiMinusCircle
                    size={20}
                    className="cursor-pointer"
                    onClick={() => removeConfig(config)}
                  />
                  <div className="ml-2 text-truncate text-sm">{config}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>

      <Modal
        title={`Edit ${editedNetwork.name}`}
        isOpen={isOpenEditNetworkModal}
        onClose={onCloseEditNetworkModal}
        submitLabel="Save"
        onSubmit={onUpdateNetwork}
      >
        <Input
          label="Network"
          value={editedName}
          onChange={setEditedName}
          inputClassName="input-light-antd"
        />
        <Input
          className="mt-4"
          label="Image url"
          value={editedImgUrl}
          onChange={setEditedImgUrl}
          inputClassName="input-light-antd"
        />
        <Select
          className="mt-4"
          label="Network Type"
          labelKey="name"
          listOption={listNetworkType}
          activedOpt={editedType}
          onChange={(value) => setEditedType(value)}
        />

        <div className="modal-label">Add dynamic configurations:</div>
        <div className="flex items-center w-full">
          <Input
            className="flex-1 rounded"
            value={editedConfigName}
            onChange={setEditedConfigName}
            placeholder="Configuration name"
            inputClassName="input-light-antd"
          />
          <button
            className="btn-light ml-3 px-2"
            disabled={!editedConfigName}
            onClick={addEditedConfig}
          >
            <BiPlus size={22} />
          </button>
        </div>

        {editedConfigs?.length > 0 && (
          <>
            <div className="modal-label">Configurations:</div>
            <ul className="grid grid-cols-2 gap-y-1 gap-x-2">
              {editedConfigs.map((config, idx) => (
                <li key={idx} className="flex items-center">
                  <BiMinusCircle
                    size={20}
                    className="cursor-pointer"
                    onClick={() => removeEditedConfig(config)}
                  />
                  <div className="ml-2 text-truncate text-sm">{config}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </Page>
  );
};

export default NetworkConfig;
