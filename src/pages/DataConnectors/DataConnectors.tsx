import React, { useEffect, useState } from "react";
import { BiPlus } from "@react-icons/all-files/bi/BiPlus";
import Modal from "../../partials/elements/Modal";
import Select from "../../partials/elements/Select";
import service from "../../partials/services/axios.config";
import Input from "../../partials/elements/Input";
import { getLabelFromCamelCaseStr } from "../../utils/Helpers";
import { toast } from "react-toastify";
import ModalConfirmDelete from "../../partials/common/ModalConfirmDelete";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addConnector } from "../../redux/connector/connectorSlice";
// @ts-ignore
import google from "../../images/networks/google.png";
import classNames from "classnames";
import {
  NETWORK_CODES,
  PUBLIC_KEY,
  IMPORTING_DATA,
  MESSAGE_DURATION,
} from "../../constants/constants";
import ConnectorTable from "./ConnectorTable";
import ModalLinkApp from "./ModalLinkApp";
import { AiOutlineCopy } from "@react-icons/all-files/ai/AiOutlineCopy";
import CopyToClipboard from "react-copy-to-clipboard";
import Loading from "../../utils/Loading";
import message from "antd/lib/message";
import Dropdown from "antd/lib/dropdown";
import Button from "antd/lib/button";
import Page from "../../utils/composables/Page";
import DownOutlined from "@ant-design/icons/lib/icons/DownOutlined";
import { LIST_STORE_APPS } from "../../api/constants.api";
import { RootState } from "../../redux/store";
import { useQueryClient } from "@tanstack/react-query";

function DataConnectors() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const newConnectorConfig = useSelector(
    (state: RootState) => state.connector.newConfig
  );
  const isAdmin = useSelector(
    (state: RootState) => state.account.userData.isAdmin
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [spinIcons, setSpinIcons] = useState([]);
  const [listType, setListType] = useState<any>([]);
  const [activedType, setActivedType] = useState<any>({});
  const [isOpenAddConnectorModal, setIsOpenAddConnectorModal] = useState(false);
  const [privateKey, setPrivateKey] = useState("");

  const [tableData, setTableData] = useState<any>([]);
  const [activedNetwork, setActivedNetwork] = useState<any>({});
  const [allNetworkByType, setAllNetworkByType] = useState<any>([]);
  const [configData, setConfigData] = useState({});
  const [connectorName, setConnectorName] = useState("");

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [editedConnector, setEditedConnector] = useState<any>({});
  const [editedConnectorName, setEditedConnectorName] = useState("");
  const [editedConfigData, setEditedConfigData] = useState({});

  const [linkedAppRes, setLinkedAppRes] = useState({ id: "", totalLink: 0 });
  const [isOpenLinkAppModal, setIsOpenLinkAppModal] = useState(false);
  const [listLinkedApp, setListLinkedApp] = useState([]);
  const [linkedApp, setLinkedApp] = useState({});

  const [deletedConnector, setDeletedConnector] = useState<any>({});
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] =
    useState(false);

  useEffect(() => {
    const codeParams = searchParams.get("code");
    const authCodeParams = searchParams.get("auth_code");
    const code = codeParams || authCodeParams;
    if (!code) return initPage();

    const params = {
      ...newConnectorConfig,
      authorizationCode: code,
    };

    setSearchParams({});
    service.post("/network-connector", params).then(
      (res: any) => {
        dispatch(addConnector({}));
        initPage();
        toast(res.message, { type: "success" });
      },
      () => initPage()
    );
  }, []);

  const initPage = () => {
    const getNetworkType = service.get("/network-type");
    const getAllConnector = service.get("/network-connector");
    const getAllApp = service.get("/store-app");

    Promise.all([getNetworkType, getAllConnector, getAllApp]).then(
      (res: any) => {
        setIsLoadingTable(false);
        setListType(res[0].results);
        setTableData(res[1].results);
        setListLinkedApp(res[2].results || []);
      },
      () => setIsLoadingTable(false)
    );
  };

  const onAddConnector = (connectorTypeId) => {
    const activedTypeObj = listType.find(
      (el: any) => el.id === connectorTypeId
    );
    if (!activedTypeObj) return;

    setActivedType(activedTypeObj);
    setIsLoading(true);
    service.get("/network", { params: { typeId: activedTypeObj.id } }).then(
      (res: any) => {
        setIsLoading(false);
        if (!res.results?.length) {
          toast(`${activedTypeObj.name} is not supported yet`, {
            type: "warning",
          });
          return;
        }

        setIsOpenAddConnectorModal(true);
        setAllNetworkByType(res.results);
      },
      () => setIsLoading(false)
    );
  };

  const onChoseNetwork = (networkInfo) => {
    setActivedNetwork(networkInfo);

    const activedConfigs = allNetworkByType.find(
      (item: any) => item.id === networkInfo.id
    );
    const configs = activedConfigs ? activedConfigs.configs : [];
    let configStates = {};
    if (configs.length) {
      configs.forEach((configName) => {
        configStates = Object.assign({}, configStates, { [configName]: "" });
      });
    }
    setConfigData(configStates);
  };

  const onCloseAddConnectorModal = () => {
    setIsOpenAddConnectorModal(false);
    setTimeout(() => {
      setActivedNetwork({});
      setConnectorName("");
      setConfigData({});
    }, 300);
  };

  const onSubmitAddConnector = () => {
    let configs;
    if (activedNetwork?.code === NETWORK_CODES.appleSearchAds) {
      configs = { ...configData, privateKey };
    } else {
      configs = { ...configData };
    }

    const params = {
      name: connectorName,
      network: activedNetwork,
      configs,
    };

    setIsLoading(true);
    service.post("/network-connector", params).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        onCloseAddConnectorModal();
        setIsLoading(false);

        const newTableData = tableData;
        // @ts-ignore
        newTableData.unshift(res.results);
        setTableData(newTableData);
      },
      () => setIsLoading(false)
    );
  };

  const onChangeConfig = (configName, value) => {
    setConfigData((prevState) => {
      return {
        ...prevState,
        [configName]: value,
      };
    });
  };

  const onChangeEditedConfig = (configName, value) => {
    setEditedConfigData((prevState) => {
      return {
        ...prevState,
        [configName]: value,
      };
    });
  };

  const onEditData = (connectorObj) => {
    setEditedConnector(connectorObj);
    setEditedConnectorName(connectorObj.name);
    setEditedConfigData(connectorObj.configs);
    setIsOpenEditModal(true);
  };

  const onSubmitEditModal = () => {
    setIsLoading(true);

    const params = Object.assign({}, editedConnector, {
      name: editedConnectorName,
      configs: editedConfigData,
    });

    service.put("/network-connector", params).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        onCloseEditModal();

        const foundIndex = tableData.findIndex(
          (item) => item.id === editedConnector.id
        );
        if (foundIndex !== -1) {
          const newTableData = tableData;
          // @ts-ignore
          newTableData.splice(foundIndex, 1, res.results);
          // @ts-ignore
          setTableData(newTableData);
        }
      },
      () => setIsLoading(false)
    );
  };

  const onCloseEditModal = () => {
    setIsOpenEditModal(false);
  };

  const onSync = (connectorObj, idx, callback) => {
    // @ts-ignore
    if (spinIcons.includes(idx)) return;

    // @ts-ignore
    setSpinIcons([...spinIcons, idx]);
    const removedIcons = spinIcons.filter((num) => num !== idx);

    service
      .put(`/network-connector/refresh?networkConnectorId=${connectorObj.id}`)
      .then(
        () => {
          service.get("/network-connector").then(
            () => {
              // @ts-ignore
              setSpinIcons(removedIcons);
              const newTableData = tableData;
              const refreshedConnectorId = tableData.findIndex(
                (item) => item.id === connectorObj.id
              );

              if (refreshedConnectorId !== -1) {
                newTableData[refreshedConnectorId].status = IMPORTING_DATA;
              }

              // @ts-ignore
              setTableData(newTableData);
              callback && callback(connectorObj.id);
              handleUpdateApp();
            },
            // @ts-ignore
            () => setSpinIcons(removedIcons)
          );
        },
        // @ts-ignore
        () => setSpinIcons(removedIcons)
      );
  };

  const onDelete = (connectorObj) => {
    setIsOpenConfirmDeleteModal(true);
    setDeletedConnector(connectorObj);
  };

  const onSubmitDelete = () => {
    setIsLoading(true);
    service.delete(`/network-connector/${deletedConnector.id}`).then(
      (res: any) => {
        const newTableData = tableData.filter(
          (el) => el.id !== deletedConnector.id
        );
        // @ts-ignore
        setTableData(newTableData);
        toast(res.message || "Remove network connector success", {
          type: "success",
        });
        setIsLoading(false);
        setIsOpenConfirmDeleteModal(false);
        handleUpdateApp();
      },
      () => setIsLoading(false)
    );
  };

  const onLinkApp = (appObj) => {
    setLinkedApp(appObj);
    setIsOpenLinkAppModal(true);
  };

  const onGenerateKeys = () => {
    setIsLoading(true);
    service.post("/network-connector/open-ssl").then(
      (res: any) => {
        setIsLoading(false);
        setPrivateKey(res.results?.privateKey || "");

        if (res.results?.privateKey) {
          setConfigData({ ...configData, publicKey: res.results?.publicKey });
        }
      },
      () => setIsLoading(false)
    );
  };

  const onSetLinkedApp = (data) => {
    setLinkedAppRes(data);
    handleUpdateApp();
  };

  const handleUpdateApp = () => {
    queryClient.invalidateQueries({
      queryKey: [LIST_STORE_APPS],
    });
  };

  const handleAuth = () => {
    const newConnector = {
      name: connectorName,
      network: activedNetwork,
      configs: configData,
    };
    dispatch(addConnector(newConnector));
    window.location.href = activedNetwork.authorizationUri;
  };

  const getSubmitBtn = () => {
    if (
      activedNetwork?.authorizationUri &&
      activedNetwork.code === NETWORK_CODES.google
    ) {
      const googleAuthBtn = (
        <div className="flex">
          <Button
            className="!border-r-0 !rounded-r-none"
            disabled={isDisableSubmitBtn}
            icon={
              <img
                src={google}
                alt=" "
                className="w-8 px-1.5 bg-contain shrink-0"
              />
            }
          />

          <Button
            className="!rounded-l-none md:!hidden"
            type="primary"
            disabled={isDisableSubmitBtn}
            onClick={handleAuth}
          >
            Authorize
          </Button>

          <Button
            className="!rounded-l-none !hidden md:!block"
            type="primary"
            disabled={isDisableSubmitBtn}
            onClick={handleAuth}
          >
            Authorize with Google
          </Button>
        </div>
      );

      return googleAuthBtn;
    }
  };

  const isDisableSubmitBtn = !activedNetwork.id || !connectorName;

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col xs:flex-row">
        <div className="page-title">Data connectors</div>
        {isAdmin && (
          <div className="mt-1 sm:mt-0">
            <Dropdown
              menu={{
                selectable: true,
                selectedKeys: [],
                items: listType?.map((el) => {
                  return Object.assign({}, el, {
                    key: el.id,
                    label: el.name,
                    icon: <BiPlus size={18} />,
                  });
                }),
                onClick: (item) => onAddConnector(item.key),
              }}
              trigger={["click"]}
            >
              <Button type="primary">
                New data connector
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        )}
      </div>

      <div className="mt-6">
        <ConnectorTable
          isAdmin={isAdmin}
          spinIcons={spinIcons}
          setIsLoading={setIsLoadingTable}
          isLoading={isLoadingTable}
          listData={tableData}
          onSync={onSync}
          onEdit={onEditData}
          onDelete={onDelete}
          onLinkApp={onLinkApp}
          linkedAppRes={linkedAppRes}
        />
      </div>

      <Modal
        title={`Add ${activedType.name}`}
        isOpen={isOpenAddConnectorModal}
        onClose={onCloseAddConnectorModal}
        submitLabel={activedNetwork?.authorizationUri ? "Auth" : "Add"}
        onSubmit={
          activedNetwork?.authorizationUri ? handleAuth : onSubmitAddConnector
        }
        disabled={isDisableSubmitBtn}
        submitBtnEl={getSubmitBtn()}
      >
        <Select
          noteRequire
          label="Network"
          labelKey="name"
          imgKey="imageUrl"
          listOption={allNetworkByType}
          activedOpt={activedNetwork}
          onChange={(value) => onChoseNetwork(value)}
        />
        <Input
          noteRequire
          className="mt-4"
          inputClassName="input-light-antd"
          label="Connector name"
          value={connectorName}
          onChange={(value) => setConnectorName(value)}
          placeholder="Enter name"
        />
        {Object.keys(configData)?.length !== 0 && (
          <div className="font-medium text-gray-900">
            <div className="mt-8 font-semibold">Configurations:</div>

            <div className="text-sm">
              {Object.keys(configData).map((configName, idx) => {
                const isPublicKey = configName === PUBLIC_KEY;

                return (
                  <div key={idx}>
                    {isPublicKey && (
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-sm font-medium text-gray-900">
                          <span className="text-red-500">* </span>
                          Public Key
                        </div>

                        <Button
                          className="text-xs2 !px-2 !py-0"
                          onClick={onGenerateKeys}
                        >
                          Generate Key
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center mt-2 min-h-11 relative">
                      <Input
                        noteRequire
                        className={classNames("grow", isPublicKey && "mr-11")}
                        inputClassName={classNames(
                          "input-light-antd",
                          isPublicKey && "!rounded-r-none"
                        )}
                        label={
                          !isPublicKey
                            ? getLabelFromCamelCaseStr(configName)
                            : ""
                        }
                        value={configData[configName]}
                        onChange={(value) => onChangeConfig(configName, value)}
                        placeholder={
                          "Your " +
                          getLabelFromCamelCaseStr(configName).toLowerCase()
                        }
                      />
                      {isPublicKey && (
                        <CopyToClipboard
                          text={configData[PUBLIC_KEY]}
                          onCopy={() =>
                            message.success("Copied!", MESSAGE_DURATION)
                          }
                        >
                          <div className="border border-antBorder border-l-0 absolute right-0 top-0 bottom-0 w-11 flex cursor-pointer rounded-r bg-gray-100/40 hover:bg-gray-100/70">
                            <AiOutlineCopy size={20} className="m-auto" />
                          </div>
                        </CopyToClipboard>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`Edit Data Connector: ${editedConnector.name}`}
        submitLabel="Save"
        isOpen={isOpenEditModal}
        onClose={onCloseEditModal}
        onSubmit={onSubmitEditModal}
      >
        <Input label="Network" value={editedConnector.network?.name} disabled />
        <Input
          className="mt-4"
          label="Connector name"
          value={editedConnectorName}
          onChange={(value) => setEditedConnectorName(value)}
          placeholder="Enter name"
          inputClassName="input-light-antd"
        />

        {Object.keys(editedConfigData)?.length > 0 && (
          <div className="font-medium text-gray-900">
            <div className="mt-8 font-semibold">Configurations:</div>
            <div className="text-sm">
              {Object.keys(editedConfigData).map((configName, idx) => (
                <Input
                  key={idx}
                  className="mt-2"
                  inputClassName="input-light-antd"
                  label={getLabelFromCamelCaseStr(configName)}
                  value={editedConfigData[configName]}
                  onChange={(value) => onChangeEditedConfig(configName, value)}
                  placeholder={
                    "Your " + getLabelFromCamelCaseStr(configName).toLowerCase()
                  }
                />
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ModalLinkApp
        isOpen={isOpenLinkAppModal}
        onClose={() => setIsOpenLinkAppModal(false)}
        listLinkedApp={listLinkedApp}
        linkedApp={linkedApp}
        setLinkedAppRes={onSetLinkedApp}
      />

      <ModalConfirmDelete
        isOpen={isOpenConfirmDeleteModal}
        onClose={() => setIsOpenConfirmDeleteModal(false)}
        onSubmit={onSubmitDelete}
        targetName={deletedConnector.name}
      />
    </Page>
  );
}

export default DataConnectors;
