import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "../../partials/elements/Modal";
import Select from "antd/lib/select";
import service from "../../partials/services/axios.config";
import { toast } from "react-toastify";
import Loading from "../../utils/Loading";
import GamePlatformIcon from "../../partials/common/GamePlatformIcon";
import { filterSelectGroupByKey } from "../../utils/Helpers";

function ModalLinkApp(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [activedApp, setActivedApp] = useState<string>();
  const [listLinkedStore, setListLinked] = useState({});

  const { isOpen, onClose, listLinkedApp, linkedApp, setLinkedAppRes } = props;

  useEffect(() => {
    if (!linkedApp.id) return;
    if (Object.keys(listLinkedStore).includes(linkedApp.id)) {
      const linkedAppData = listLinkedStore[linkedApp.id] || {};
      return onSetActivedApp(linkedAppData);
    }

    setIsLoading(true);
    service
      .get("/store-app/application", {
        params: { applicationId: linkedApp.id },
      })
      .then(
        (res: any) => {
          setIsLoading(false);

          const newListData = res.results || {};
          onSetActivedApp(newListData);
          setListLinked({
            ...listLinkedStore,
            [linkedApp.id]: newListData,
          });
        },
        () => setIsLoading(false)
      );
  }, [linkedApp?.id]);

  const onSetActivedApp = (app) => {
    setActivedApp(app.storeId + app.name || undefined);
  };

  const onCloseLinkApp = () => {
    onSetActivedApp(listLinkedStore[linkedApp.id] || {});
    onClose();
  };

  const onSubmitLinkApp = () => {
    setIsLoading(true);

    const activedData = listLinkedApp.find(
      (el) => el.storeId + el.name === activedApp
    );
    const storeAppId = activedData?.id || "";
    service
      .put(
        `/store-app/application/link?storeAppId=${storeAppId}&applicationId=${linkedApp.id}`
      )
      .then(
        (res: any) => {
          setIsLoading(false);
          setLinkedAppRes({
            id: linkedApp.id,
            totalLink: res.results?.id ? 1 : 0,
          });
          toast(res.message, { type: "success" });

          const newListData = res.results || {};
          setListLinked({
            ...listLinkedStore,
            [linkedApp.id]: newListData,
          });
          onSetActivedApp(newListData);
          onClose();
        },
        () => setIsLoading(false)
      );
  };

  const compareTwoObj = (appData = activedApp, stateData = listLinkedStore) => {
    const storedApp = stateData[linkedApp.id];
    if (!appData || !storedApp) return false;

    return storedApp.storeId + storedApp.name === appData;
  };

  const hasLinkedApp = listLinkedStore[linkedApp?.id]?.id;
  const isDisabled =
    (!activedApp && !listLinkedStore[linkedApp.id]?.id) || compareTwoObj();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Modal
      title={`Link app with ${linkedApp.name}`}
      submitLabel={hasLinkedApp ? "Update" : "Link"}
      isOpen={isOpen}
      onClose={onCloseLinkApp}
      onSubmit={onSubmitLinkApp}
      disabled={isDisabled}
    >
      <div className="text-base font-medium text-gray-900 mb-2">App</div>
      <Select
        className="w-full"
        placeholder="App name / Package name"
        allowClear
        value={activedApp}
        onChange={setActivedApp}
        showSearch
        filterOption={filterSelectGroupByKey}
      >
        {listLinkedApp.map((data, idx) => (
          <Select.Option key={data.storeId + data.name} size="large">
            <div className="flex items-center">
              {data.icon && <GamePlatformIcon app={data} inputSize={true} />}
              {data.name}
            </div>
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
}

ModalLinkApp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  listLinkedApp: PropTypes.array,
  linkedApp: PropTypes.object,
  setLinkedAppRes: PropTypes.func,
};

export default ModalLinkApp;
