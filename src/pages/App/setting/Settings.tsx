import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "antd/lib/button/button";
import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getStoreAppById } from "../../../api/common/common.api";
import {
  GET_STORE_APP_BY_ID,
  LIST_STORE_APPS,
} from "../../../api/constants.api";
import { ORGANIZATION_PATH } from "../../../constants/constants";
import ModalConfirmDelete from "../../../partials/common/ModalConfirmDelete";
import service from "../../../partials/services/axios.config";
import { RootState } from "../../../redux/store";
import Page from "../../../utils/composables/Page";
import { deletedStoreApp } from "../../../utils/helper/ReactQueryHelpers";
import Loading from "../../../utils/Loading";
import LinkedConnectorTable from "./LinkedConnectorTable";

function Settings() {
  const urlParams = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const organization = useSelector(
    (state: RootState) => state.account.userData.organization
  );
  const isAdmin = useSelector(
    (state: RootState) => state.account.userData.isAdmin
  );

  const [isLoading, setIsLoading] = useState(false);
  const [applicationsData, setApplicationsData] = useState([]);
  const [deletedRecord, setDeletedRecord] = useState<any>({});
  const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] =
    useState(false);
  const [appState, setAppState] = useState<any>({});

  const { data: storeAppRes } = useQuery({
    queryKey: [GET_STORE_APP_BY_ID, urlParams.appId],
    queryFn: getStoreAppById,
    staleTime: 5 * 60000,
    enabled: !!urlParams.appId,
  });

  useEffect(() => {
    setAppState(storeAppRes?.results || {});
  }, [storeAppRes]);

  useEffect(() => {
    setIsLoading(true);
    service.get(`/store-app/${urlParams.appId}`).then(
      (res: any) => {
        setApplicationsData(res?.results?.applications || []);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  }, [urlParams.appId]);

  const onDelete = (record) => {
    setDeletedRecord(record);
    setIsOpenConfirmDeleteModal(true);
  };

  // Delete linked connector
  const onSubmitDelete = () => {
    setIsLoading(true);
    service
      .delete(
        `/store-app/application/link?storeAppId=${urlParams.appId}&applicationId=${deletedRecord?.id}`
      )
      .then(
        (res: any) => {
          setIsLoading(false);
          setIsOpenConfirmDeleteModal(false);
          toast(res.message, { type: "success" });

          const newApp = applicationsData.filter(
            (el: any) => el.id !== deletedRecord?.id
          );
          setApplicationsData(newApp);
          handleUpdateApp();
        },
        () => setIsLoading(false)
      );
  };

  const onClickDeleteApp = () => {
    setIsOpenConfirmDeleteModal(true);
    setDeletedRecord({});
  };

  // Delete store app
  const onDeleteApp = () => {
    setIsLoading(true);
    service.delete(`/store-app/${urlParams.appId}`).then(
      (res: any) => {
        deletedStoreApp(queryClient, urlParams.appId);
        toast(res.message, { type: "success" });
        setIsLoading(false);
        setIsOpenConfirmDeleteModal(false);
        navigate(`${ORGANIZATION_PATH}/${organization.code}/apps`);
      },
      () => setIsLoading(false)
    );
  };

  const onAutoLink = () => {
    setIsLoading(true);

    service.put(`/store-app/auto-link?storeAppId=${urlParams.appId}`).then(
      (res: any) => {
        if (res.message) {
          toast(res.message, { type: "success" });
        }
        if (res.results) {
          setApplicationsData(res.results.applications || []);
        }
        setIsLoading(false);
        handleUpdateApp();
      },
      () => setIsLoading(false)
    );
  };

  const handleUpdateApp = () => {
    queryClient.invalidateQueries({
      queryKey: [LIST_STORE_APPS],
    });
  };

  const networkName = deletedRecord?.networkConnector?.network?.name;
  const linkedName = networkName
    ? networkName + " - " + deletedRecord.name
    : deletedRecord.name;

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col sm:flex-row">
        <div className="page-title">Linked Connectors</div>

        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <Button type="primary" onClick={onAutoLink}>
            Auto link app
          </Button>
          <Button type="primary" danger onClick={onClickDeleteApp}>
            Delete App
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <LinkedConnectorTable
          listData={applicationsData}
          setListData={setApplicationsData}
          onDelete={onDelete}
          setIsLoading={setIsLoading}
        />
      </div>

      <ModalConfirmDelete
        isOpen={isOpenConfirmDeleteModal}
        onClose={() => setIsOpenConfirmDeleteModal(false)}
        onSubmit={deletedRecord.id ? onSubmitDelete : onDeleteApp}
        targetName={deletedRecord.id ? linkedName : appState.name}
      />
    </Page>
  );
}

export default Settings;
