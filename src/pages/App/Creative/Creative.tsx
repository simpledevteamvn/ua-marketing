import React, { useEffect, useState } from "react";
import Page from "../../../utils/composables/Page";
import Button from "antd/lib/button";
import CreativeTable from "./CreativeTable/CreativeTable";
import VideoPopup from "./VideoPopup/VideoPopup";
import ModalAddCreative from "./ModalAddCreative/ModalAddCreative";
import service from "../../../partials/services/axios.config";
import { LIST_AD_NETWORK } from "../../../api/constants.api";
import { useQuery } from "@tanstack/react-query";
import { getListAdNetwork } from "../../../api/common/common.api";
import SelectNetwork from "../../../partials/common/Forms/SelectNetwork";
import Select from "antd/lib/select";
import {
  capitalizeWord,
  getSelectMultipleParams,
} from "../../../utils/Helpers";
import { ALL_NETWORK_OPTION, EXTRA_FOOTER } from "../../../constants/constants";
import DatePicker from "antd/lib/date-picker";
import Tag from "antd/lib/tag";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../partials/common/Forms/RangePicker";
import moment from "moment";
import { useParams } from "react-router-dom";
import {
  checkContainText,
  checkRangeValue,
  setRangeValue,
} from "../../../utils/helper/TableHelpers";
import SelectCampaignByNetwork from "../../../partials/common/Forms/SelectCampaignByNetwork";
import { detectAdBlock } from "../../../utils/helper/UIHelper";
import { onLoadWhenAppChange } from "../../../utils/hooks/CustomHooks";
import ImagePreview from "./ImagePreview/ImagePreview";

function Creative(props) {
  const urlParams = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
  const [previewData, setPreviewData] = useState<any>({});
  const [imgPreview, setImgPreview] = useState<any>({});

  const [listType, setListType] = useState<string[]>([]);
  const [listMarks, setListMarks] = useState<string[]>([]);
  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  const [activedNetwork, setActivedNetwork] = useState([]);
  const [activedCampaign, setActivedCampaign] = useState([]);
  const [activedStatus, setActivedStatus] = useState();
  const [tagging, setTagging] = useState<any>([]);

  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [tableData, setTableData] = useState<any>();
  const [filterByMaxMin, setFilterByMaxMin] = useState<any>({});
  const [searchData, setSearchData] = useState<any>({});

  onLoadWhenAppChange();

  const { data: listNetwork, isLoading: isLoadingNetwork } = useQuery({
    queryKey: [LIST_AD_NETWORK],
    queryFn: getListAdNetwork,
    staleTime: 20 * 60000,
  });

  useEffect(() => {
    setListAdNetwork(listNetwork?.results || []);
  }, [listNetwork]);

  useEffect(() => {
    detectAdBlock();
  }, []);

  useEffect(() => {
    service.get("/creative/type").then(
      (res: any) => {
        setListType(res.results || []);
      },
      () => {}
    );
    getTableData();
  }, []);

  useEffect(() => {
    service
      .get("/creative/mark", {
        params: {
          storeAppId: urlParams.appId,
          networks: activedNetwork?.join(","),
          rawCampaignIds: activedCampaign?.join(","),
        },
      })
      .then(
        (res: any) => {
          const newMarks = res.results || [];
          setListMarks(newMarks);

          if (tagging?.length) {
            const isReset = tagging.some((tag) => !newMarks.includes(tag));
            isReset && setTagging([]);
          }
        },
        () => {}
      );
  }, [activedNetwork, activedCampaign]);

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const getTableData = () => {
    const params = {
      storeAppId: urlParams.appId,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      rawCampaignIds: activedCampaign?.join(","),
      networks: getSelectMultipleParams(
        activedNetwork,
        ALL_NETWORK_OPTION
      ).join(","),
      status: activedStatus,
      marks: tagging?.join(","),
    };

    setIsLoading(true);
    service.get("/report/creative", { params }).then(
      (res: any) => {
        setIsLoading(false);

        if (!res.results) return setTableData([]);

        const newData = res.results?.map((el, idx) => {
          if (el.creatives?.length) {
            return {
              ...el,
              tableId: String(idx),
              children: el.creatives,
            };
          }

          return { ...el, tableId: String(idx) };
        });
        setTableData(newData);
      },
      () => setIsLoading(false)
    );
  };

  const onAddCreative = () => {
    setIsOpenModalAdd(true);
  };

  const onCloseModal = () => {
    setIsOpenModalAdd(false);
  };

  const onFilterTable = (data) => {
    setRangeValue(data, filterByMaxMin, setFilterByMaxMin);
  };

  const onSearchTable = (value, field) => {
    setSearchData({ ...searchData, [field]: value });
  };

  const onApply = () => {
    getTableData();
  };

  const filteredData = tableData?.filter((el) => {
    let result = true;

    const isContainText = checkContainText(searchData, el);
    const checkValue = checkRangeValue(filterByMaxMin, el);

    if (!isContainText || !checkValue) {
      result = false;
    }

    return result;
  });
  const globalLoading = isLoading || isLoadingNetwork;

  return (
    <Page>
      <div className="flex justify-between flex-col xs:flex-row">
        {/* <div className="mt-1 sm:mt-0">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddCreative}
          >
            Add Creative
          </Button>
        </div> */}
      </div>

      <div className="flex items-center flex-wrap -mx-1 2xl:-mx-2 -mt-3">
        <SelectNetwork
          classNames="xs:w-[180px] !mx-1 2xl:!mx-2 !mt-3"
          listNetwork={listAdNetwork}
          value={activedNetwork}
          onChange={setActivedNetwork}
        />

        <SelectCampaignByNetwork
          isGetRawId
          classNames="xs:w-[200px] !mx-1 2xl:!mx-2 !mt-3"
          value={activedCampaign}
          networkData={activedNetwork}
          onChange={setActivedCampaign}
        />

        <Select
          className="w-full xs:w-[130px] !mx-1 2xl:!mx-2 !mt-3"
          placeholder="Select status"
          allowClear
          value={activedStatus}
          onChange={setActivedStatus}
        >
          {["ACTIVE", "PAUSED"].map((data) => (
            <Select.Option key={data}>{capitalizeWord(data)}</Select.Option>
          ))}
        </Select>

        <Select
          className="w-full xs:w-[180px] !mx-1 2xl:!mx-2 !mt-3"
          placeholder="Select tags"
          allowClear
          mode="multiple"
          maxTagCount="responsive"
          value={tagging}
          onChange={setTagging}
        >
          {listMarks?.map((tag) => (
            <Select.Option key={tag}>{tag}</Select.Option>
          ))}
        </Select>

        <DatePicker.RangePicker
          className="w-full xs:w-auto !mx-1 2xl:!mx-2 !mt-3"
          open={isOpenDateRange}
          onOpenChange={(open) => setIsOpenDateRange(open)}
          value={dateRange}
          onChange={onChangeRangePicker}
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

      <div className="">
        <CreativeTable
          listType={listType}
          isLoading={globalLoading}
          setPreviewData={setPreviewData}
          setImgPreview={setImgPreview}
          listData={filteredData || []}
          onFilterTable={onFilterTable}
          onSearchTable={onSearchTable}
        />
      </div>

      <ModalAddCreative isOpen={isOpenModalAdd} onClose={onCloseModal} />
      <VideoPopup
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />

      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </Page>
  );
}

Creative.propTypes = {};

export default Creative;
