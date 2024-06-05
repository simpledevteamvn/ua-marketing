import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import service from "../../../partials/services/axios.config";
import { useQuery } from "@tanstack/react-query";
import {
  LIST_AD_NETWORK,
  LIST_CAMPAIGN_TYPE,
} from "../../../api/constants.api";
import { getListCampaignType } from "../../../api/campaign-center/campaign-center.api";
import Select from "antd/lib/select";
import {
  capitalizeWord,
  disabledDate,
  filterSelectGroup,
  getSelectMultipleParams,
  sortNumberWithNullable,
} from "../../../utils/Helpers";
import DatePicker from "antd/lib/date-picker";
import {
  ALL_NETWORK_OPTION,
  EXTRA_FOOTER,
  LIST_CAMPAIGN_STATUS,
} from "../../../constants/constants";
import Tag from "antd/lib/tag";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../partials/common/Forms/RangePicker";
import Button from "antd/lib/button";
import moment from "moment";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import { getListAdNetwork } from "../../../api/common/common.api";
import { Link, useParams } from "react-router-dom";
import CampaignTable from "./Table/CampaignTable";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import PauseCircleOutlined from "@ant-design/icons/lib/icons/PauseCircleOutlined";
import PlayCircleOutlined from "@ant-design/icons/lib/icons/PlayCircleOutlined";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../utils/helper/TableHelpers";
import MoreOutlined from "@ant-design/icons/lib/icons/MoreOutlined";
import Dropdown from "antd/lib/dropdown";
import ModalRunAndPause from "./ModalRunAndPause";
import { MORE_ACTION_KEY } from "./Helper";
import { onLoadWhenAppChange } from "../../../utils/hooks/CustomHooks";

function CampaignControl(props) {
  const urlParams = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenChangeStatus, setIsOpenChangeStatus] = useState(false);
  const [campAction, setCampAction] = useState();

  const [activedNetwork, setActivedNetwork] = useState([]);
  const [listAdNetwork, setListAdNetwork] = useState([]);
  const [listCampaignType, setListCampaignType] = useState([]);
  const [activedType, setActivedType] = useState();
  const [activedStatus, setActivedStatus] = useState();
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [tableData, setTableData] = useState<any>([]);
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  onLoadWhenAppChange();

  const { data: listCampaignTypeRes } = useQuery({
    queryKey: [LIST_CAMPAIGN_TYPE],
    queryFn: getListCampaignType,
    staleTime: 30 * 60000,
  });

  useEffect(() => {
    setListCampaignType(listCampaignTypeRes?.results);
  }, [listCampaignTypeRes]);

  const { data: listNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results);
  }, [listNetwork]);

  useEffect(() => {
    if (listAdNetwork?.length && listCampaignType?.length) {
      getData();
    }
  }, [listAdNetwork, listCampaignType]);

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const getData = () => {
    const status =
      activedStatus === LIST_CAMPAIGN_STATUS.all.value ? "" : activedStatus;
    const params = {
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      status,
      type: activedType,
      networks: getSelectMultipleParams(
        activedNetwork,
        ALL_NETWORK_OPTION
      ).join(","),
    };

    setIsLoading(true);
    service.get(`/apps/${urlParams.appId}/campaigns`, { params }).then(
      (res: any) => {
        setIsLoading(false);
        const newData = res.results;
        if (!newData) return;

        newData.sort((a, b) => sortNumberWithNullable(b, a, (el) => el.cost));
        setTableData(newData);
      },
      () => setIsLoading(false)
    );
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onClickAction = (key) => {
    if (key === MORE_ACTION_KEY.add) {
      return;
    }

    setCampAction(key);
    setIsOpenChangeStatus(true);
  };

  const listActions = [
    {
      key: MORE_ACTION_KEY.add,
      label: (
        <Link to="create">
          <PlusOutlined className="mr-1.5" />
          Add campaign
        </Link>
      ),
    },
    {
      key: MORE_ACTION_KEY.pause,
      label: "Pause campaigns",
      icon: <PauseCircleOutlined />,
    },
    {
      key: MORE_ACTION_KEY.run,
      label: "Run campaigns",
      icon: <PlayCircleOutlined />,
    },
  ];

  const filteredData = tableData.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });

  const onApply = () => {
    getData();
  };

  return (
    <Page>
      <div>
        <div className="flex justify-between">
          <div className="page-title">Campaign Control</div>
        </div>

        <div className="flex items-center flex-wrap -mx-1 2xl:-mx-2">
          <SelectNetwork
            classNames="xs:w-[180px] !mx-1 2xl:!mx-2 !mt-3"
            listNetwork={listAdNetwork}
            value={activedNetwork}
            onChange={setActivedNetwork}
          />

          <Select
            className="w-full xs:w-[170px] !mx-1 2xl:!mx-2 !mt-3"
            placeholder="Select type"
            allowClear
            value={activedType}
            onChange={setActivedType}
            filterOption={filterSelectGroup}
          >
            {listCampaignType?.length > 0 &&
              listCampaignType.map((data) => (
                <Select.Option key={data} size="large">
                  {capitalizeWord(data)}
                </Select.Option>
              ))}
          </Select>

          <Select
            className="w-full xs:w-[130px] !mx-1 2xl:!mx-2 !mt-3"
            placeholder="Select status"
            allowClear
            value={activedStatus}
            onChange={setActivedStatus}
            filterOption={filterSelectGroup}
          >
            {Object.values(LIST_CAMPAIGN_STATUS).map((data) => (
              <Select.Option key={data.value} size="large">
                {data.label}
              </Select.Option>
            ))}
          </Select>

          <DatePicker.RangePicker
            className="w-full xs:w-auto !mx-1 2xl:!mx-2 !mt-3"
            open={isOpenDateRange}
            onOpenChange={(open) => setIsOpenDateRange(open)}
            value={dateRange}
            onChange={onChangeRangePicker}
            disabledDate={disabledDate}
            renderExtraFooter={() => (
              <div className="flex py-2.5">
                {EXTRA_FOOTER.map((obj, idx) => (
                  <Tag
                    key={idx}
                    color="blue"
                    className="cursor-pointer"
                    onClick={() =>
                      onClickRangePickerFooter(obj.value, setDateRange, () =>
                        setIsOpenDateRange(false)
                      )
                    }
                  >
                    {obj.label}
                  </Tag>
                ))}
              </div>
            )}
          />

          <Button
            type="primary"
            onClick={onApply}
            className="mx-1 2xl:!mx-2 mt-3"
          >
            Apply
          </Button>
        </div>

        <div className="flex justify-end mt-1">
          <Dropdown
            menu={{
              selectable: true,
              items: listActions,
              selectedKeys: [],
              onClick: (item) => onClickAction(item.key),
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button icon={<MoreOutlined className="custom-btn-padding" />}>
              Actions
            </Button>
          </Dropdown>
        </div>

        <div className="mt-2">
          <CampaignTable
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            tableData={filteredData}
            setTableData={setTableData}
            onSearchTable={onSearchTable}
            onFilterTable={onFilterTable}
          />
        </div>
      </div>

      <ModalRunAndPause
        isOpen={isOpenChangeStatus}
        onClose={() => setIsOpenChangeStatus(false)}
        action={campAction}
        tableData={tableData}
        setTableData={setTableData}
        listAdNetwork={listAdNetwork}
      />
    </Page>
  );
}

CampaignControl.propTypes = {};

export default CampaignControl;
