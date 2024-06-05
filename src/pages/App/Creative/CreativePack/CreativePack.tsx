import React, { useEffect, useState } from "react";
import Page from "../../../../utils/composables/Page";
import SelectNetwork from "../../../../partials/common/Forms/SelectNetwork";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../../partials/common/Forms/RangePicker";
import { useParams } from "react-router-dom";
import SelectCampaignByNetwork from "../../../../partials/common/Forms/SelectCampaignByNetwork";
import DatePicker from "antd/lib/date-picker";
import {
  ALL_NETWORK_OPTION,
  EXTRA_FOOTER,
} from "../../../../constants/constants";
import Tag from "antd/lib/tag";
import Button from "antd/lib/button";
import service from "../../../../partials/services/axios.config";
import { getSelectMultipleParams } from "../../../../utils/Helpers";
import moment from "moment";
import CreativePackTable from "./CreativePackTable/CreativePackTable";
import { LIST_AD_NETWORK } from "../../../../api/constants.api";
import { useQuery } from "@tanstack/react-query";
import { getListAdNetwork } from "../../../../api/common/common.api";
import { onLoadWhenAppChange } from "../../../../utils/hooks/CustomHooks";
import ImagePreview from "../ImagePreview/ImagePreview";
import VideoPopup from "../VideoPopup/VideoPopup";

function CreativePack(props) {
  const urlParams = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const [listAdNetwork, setListAdNetwork] = useState<any>([]);
  const [activedNetwork, setActivedNetwork] = useState();
  const [activedCampaign, setActivedCampaign] = useState([]);

  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [tableData, setTableData] = useState<any>();
  const [previewData, setPreviewData] = useState<any>({});
  const [imgPreview, setImgPreview] = useState<any>({});

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
    getTableData();
  }, []);

  const onChangeRangePicker = (values) => {
    setDateRange(values);
  };

  const onApply = () => {
    getTableData();
  };

  const getTableData = () => {
    const params = {
      storeAppId: urlParams.appId,
      startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
      endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      networks: getSelectMultipleParams(
        activedNetwork,
        ALL_NETWORK_OPTION
      ).join(","),
      rawCampaignIds: activedCampaign?.join(","),
    };

    setIsLoading(true);
    service.get("/report/creative-pack", { params }).then(
      (res: any) => {
        setIsLoading(false);

        setTableData(res.results || []);
        /**
         * Số lượng creatives trong 1 pack có thể lớn nên với cấu trúc tree sẽ load hết video => nặng
         * Giải pháp trước mắt là show modal để phân trang
         */
        // if (!res.results) return setTableData([]);

        // const newData = res.results?.map((el, idx) => {
        //   if (el.creatives?.length) {
        //     return {
        //       ...el,
        //       children: el.creatives,
        //     };
        //   }

        //   return el;
        // });
        // setTableData(newData);
      },
      () => setIsLoading(false)
    );
  };

  return (
    <Page>
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

      <div className="mt-8">
        <CreativePackTable
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          tableData={tableData}
          setPreviewData={setPreviewData}
          setImgPreview={setImgPreview}
        />
      </div>

      <VideoPopup
        // Modal detail (CreativeTable.tsx) có thể bật popup
        classNames="!z-1190"
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />
      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </Page>
  );
}

export default CreativePack;
