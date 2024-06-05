import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import Button from "antd/lib/button";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import service from "../../partials/services/axios.config";
import Page from "../../utils/composables/Page";
import { checkContainText } from "../../utils/helper/TableHelpers";
import { capitalizeWord } from "../../utils/Helpers";
import Loading from "../../utils/Loading";
import MemberTable from "./MemberTable";
import ModalAddAndEdit from "./ModalAddAndEdit";

const Members = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [listRole, setListRole] = useState<any>([]);
  const [listApp, setListApp] = useState([]);
  const [listMember, setListMember] = useState<any>([]);
  const [isOpenModalAddAndEdit, setIsOpenModalAddAndEdit] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  useEffect(() => {
    const getListRole = service.get("/role");
    const getListApp = service.get("/store-app");
    const getAllUser = service.get("/user/all");

    Promise.all([getListRole, getListApp, getAllUser]).then(
      (res: any) => {
        setIsLoading(false);
        if (!res[0].results?.length) return;

        const listRole = res[0].results.map((role) =>
          Object.assign({}, role, {
            label: capitalizeWord(role.name.toLowerCase()),
          })
        );

        setListRole(listRole);
        setListApp(res[1].results || []);
        setListMember(res[2].results || []);
      },
      () => setIsLoading(false)
    );
  }, []);

  const onInviteMember = () => {
    setIsOpenModalAddAndEdit(true);
  };

  const onEditUser = (userData) => {
    setEditedUser(userData);
    setIsOpenModalAddAndEdit(true);
  };

  const onCloseModal = () => {
    setIsOpenModalAddAndEdit(false);
    if (editedUser.id) {
      setEditedUser({});
    }
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onDeactive = (memberData) => {
    setIsLoading(true);
    service.delete(`/user/${memberData.id}`).then(
      (res: any) => {
        const newTableData = listMember.map((mem) =>
          mem.id === memberData.id
            ? Object.assign({}, mem, { isActive: false })
            : mem
        );

        setListMember(newTableData);
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const onActive = (memberData) => {
    setIsLoading(true);
    service.post("/user/active", memberData).then(
      (res: any) => {
        const newTableData = listMember.map((mem) =>
          mem.id === memberData.id
            ? Object.assign({}, mem, { isActive: true })
            : mem
        );

        setListMember(newTableData);
        toast(res.message, { type: "success" });
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const filteredData = listMember.filter((el) =>
    checkContainText(searchData, el)
  );

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="flex justify-between flex-col xs:flex-row">
        <div className="page-title">Members</div>
        <div className="mt-1 sm:mt-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onInviteMember}
          >
            Invite Member
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <MemberTable
          onEdit={onEditUser}
          listData={filteredData}
          onActive={onActive}
          onDeactive={onDeactive}
          onSearchTable={onSearchTable}
        />
      </div>

      <ModalAddAndEdit
        isOpen={isOpenModalAddAndEdit}
        setIsLoading={setIsLoading}
        onClose={onCloseModal}
        listStoreApps={listApp}
        memberData={editedUser}
        listRole={listRole}
        setListMember={setListMember}
        listMember={listMember}
      />
    </Page>
  );
};

export default Members;
