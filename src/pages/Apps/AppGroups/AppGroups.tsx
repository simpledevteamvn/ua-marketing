import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Loading from "../../../utils/Loading";
import Button from "antd/lib/button";
import AntInput from "antd/lib/input/Input";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import AppGroupTable from "./AppGroupsTable";
import ModalAddAppGroup from "./ModalAddAppGroup";
import service from "../../../partials/services/axios.config";
import ModalEditAppGroup from "./ModalEditAppGroup";
import { Select } from "antd";
import { toast } from "react-toastify";
import ModalChangeGroup from "./ModalChangeGroup";
import GamePlatformIcon from "../../../partials/common/GamePlatformIcon";

function AppGroups() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isOpenModalAddGroup, setIsOpenModalAddGroup] = useState(false);
  const [isOpenModalEditGroup, setIsOpenModalEditGroup] = useState(false);
  const [editedGroup, setEditedGroup] = useState<any>({});
  const [editedApp, setEditedApp] = useState<any>({});
  const [listGroup, setListGroup] = useState<any>([]);
  const [listDisplayGroup, setListDisplayGroup] = useState<any>([]);
  const [selectItem, setSelectItem] = useState<any>(null);
  const [listApp, setListApp] = useState<any>([]);
  const [isOpenModalChangeGroup, setIsOpenModalChangeGroup] = useState(false);
  useEffect(() => {
    setIsLoadingTable(true);
    service.get("/app-group").then(
      (res: any) => {
        setListGroup(res.results);
        setIsLoadingTable(false);
      },
      () => setIsLoadingTable(false)
    );
  }, []);

  useEffect(() => {
    if (selectItem == null) {
      setListDisplayGroup(listGroup);
    } else {
      setListDisplayGroup(
        listGroup.filter(
          (group) =>
            group?.id == selectItem ||
            group?.apps?.map((app) => app.id).includes(selectItem)
        )
      );
    }
  }, [listGroup, selectItem]);

  useEffect(() => {
    service.get("/store-app").then((res: any) => {
      setListApp(res.results);
    });
  }, [listGroup]);

  const onEdit = (record) => {
    setEditedGroup(record);
    setIsOpenModalEditGroup(true);
  };

  const onDelete = (record) => {
    setIsLoading(true);
    service.delete("/app-group/" + record?.id).then(
      (res: any) => {
        setListGroup(listGroup.filter((item) => item.id != record.id));
        toast(res.message || "Delete app group success!", {
          type: "success",
        });
        setSelectItem(null);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
  };

  const handleOptionClick = (item) => {
    setEditedApp(item);
    setIsOpenModalChangeGroup(true);
  };

  return (
    <Page>
      {isLoading && <Loading />}
      <div className="flex justify-between">
        <div className="tab-title">App Groups</div>

        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={(e) => setIsOpenModalAddGroup(true)}
          >
            New Group
          </Button>
        </div>
      </div>

      <div className="flex items-start md:items-center flex-col md:flex-row mt-2">
        <Select
          allowClear
          showSearch
          placeholder="Group name / App name"
          className="xs:!w-[255px]"
          onSelect={(value, option) => {
            if (option?.children != option?.title) {
              handleOptionClick(listApp.find((app) => app.id == value));
            }
          }}
          onChange={(value) => {
            setSelectItem(value);
          }}
          filterOption={(input, option) => {
            return (
              option?.title?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
          }}
          value={selectItem}
        >
          <Select.OptGroup label="Groups">
            {listGroup?.map((item) => (
              <Select.Option key={item?.id} value={item?.id} title={item.name}>
                {item?.name}
              </Select.Option>
            ))}
          </Select.OptGroup>

          <Select.OptGroup label="Apps">
            {listApp?.map((item) => (
              <Select.Option key={item?.id} value={item?.id} title={item.name}>
                <div className="flex items-center">
                  {item.icon && (
                    <GamePlatformIcon app={item} inputSize={true} />
                  )}
                  {item.name.length > 25
                    ? item.name.slice(0, 25) + "..."
                    : item.name}
                </div>
              </Select.Option>
            ))}
          </Select.OptGroup>
        </Select>
      </div>
      <div className="mt-6">
        <AppGroupTable
          listData={listDisplayGroup}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoadingTable}
        />
      </div>
      <ModalAddAppGroup
        isOpen={isOpenModalAddGroup}
        onClose={() => setIsOpenModalAddGroup(false)}
        setIsLoading={setIsLoading}
        setListAppGroup={setListGroup}
        setSelectItem={setSelectItem}
      />
      <ModalEditAppGroup
        isOpen={isOpenModalEditGroup}
        onClose={() => {
          setIsOpenModalEditGroup(false);
          setEditedGroup(null);
        }}
        setSelectItem={setSelectItem}
        setIsLoading={setIsLoading}
        setListAppGroup={setListGroup}
        editedGroup={editedGroup}
      />
      <ModalChangeGroup
        isOpen={isOpenModalChangeGroup}
        onClose={() => {
          setIsOpenModalChangeGroup(false);
          setEditedApp(null);
        }}
        setIsLoading={setIsLoading}
        setListAppGroup={setListGroup}
        setSelectItem={setSelectItem}
        listAppGroup={listGroup}
        editedApp={editedApp}
      />
    </Page>
  );
}

export default AppGroups;
