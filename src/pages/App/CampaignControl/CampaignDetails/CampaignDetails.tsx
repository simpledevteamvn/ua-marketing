import React, { useEffect, useState } from "react";
import service, {
  OG_CODE_HEADER,
} from "../../../../partials/services/axios.config";
import Loading from "../../../../utils/Loading";
import {
  APP_PATH,
  BID_SOURCE_TYPE,
  EDITABLE_STAT_IDS,
  EXTRA_FOOTER,
  LIST_CAMPAIGN_STATUS,
  NETWORK_CODES,
  ORGANIZATION_PATH,
} from "../../../../constants/constants";
import Button from "antd/lib/button";
import {
  disabledDate,
  getBeforeTime,
  sortNumberWithNullable,
} from "../../../../utils/Helpers";
import moment from "moment";
import CountryBid from "./CountryBid";
import CountryBudget from "./CountryBudget";
import Adgroup from "./Adgroup/Adgroup";
import Creatives from "./Creatives/Creatives";
import Details from "./Details";
import Breadcrumb from "antd/lib/breadcrumb/Breadcrumb";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import Page from "../../../../utils/composables/Page";
import DatePicker from "antd/lib/date-picker";
import {
  DATE_RANGE_FORMAT,
  getLast7Day,
  onClickRangePickerFooter,
} from "../../../../partials/common/Forms/RangePicker";
import Tag from "antd/lib/tag";
import Popconfirm from "antd/lib/popconfirm";
import { toast } from "react-toastify";
import { detectAdBlock } from "../../../../utils/helper/UIHelper";
import { Client } from "@stomp/stompjs";
import {
  resetReportTable,
  updateReportTable,
} from "../../../../redux/socket/socketSlice";
import Stats from "./Stats";
import BidAndBudget from "./BidAndBudget/BidAndBudget";
import { onLoadWhenAppChange } from "../../../../utils/hooks/CustomHooks";
import SourceBids from "./SourceBids/SourceBids";
import CreativePacks from "./CreativePacks/CreativePacks";
import VideoPopup from "../../Creative/VideoPopup/VideoPopup";
import ImagePreview from "../../Creative/ImagePreview/ImagePreview";

// @ts-ignore
const SOCKET_URL = `${import.meta.env.VITE_WS_HOST}/ws-falcon-ua-api`;

function CampaignDetails(props) {
  const dispatch = useDispatch();
  const urlParams = useParams();
  const organization = useSelector(
    (state: RootState) => state.account.userData.organization
  );
  const listRealtimeData = useSelector(
    (state: RootState) => state.socket.reportTable
  );
  const organizationCode = useSelector(
    (state: RootState) => state.account.userData.organization.code
  );

  const campaignUrl =
    ORGANIZATION_PATH +
    "/" +
    organization.code +
    APP_PATH +
    "/" +
    urlParams.appId +
    "/campaign-control";

  const [initedCamp, setInitedCamp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<any>({});
  const [isOpenDateRange, setIsOpenDateRange] = useState(false);
  const [dateRange, setDateRange] = useState<any>(getLast7Day());

  const [countryBid, setCountryBid] = useState<any>([]);
  const [countryBudget, setCountryBudget] = useState<any>([]);
  const [sourceBids, setSourceBids] = useState([]);
  const [adgroup, setAdgroup] = useState([]);
  const [currenciesConfigs, setCurrenciesConfigs] = useState([]);

  const [initedCreatives, setInitedCreatives] = useState();
  const [previewData, setPreviewData] = useState({});
  const [imgPreview, setImgPreview] = useState<any>({});

  // Use to update bid and budget (from api)
  const [updateBidBudget, setUpdateBidBudget] = useState(0);

  const { network, status } = campaignData;

  onLoadWhenAppChange();

  useEffect(() => {
    if (updateBidBudget) {
      const getCountryBid = service.get("/bid/country", {
        params: { campaignId: urlParams.campId },
      });
      const getCountryBudget = service.get("/budget/country", {
        params: { campaignId: urlParams.campId },
      });

      setIsLoading(true);
      Promise.all([getCountryBid, getCountryBudget]).then(
        (res: any) => {
          setIsLoading(false);
          setCountryBid(res[0]?.results || []);
          setCountryBudget(res[1]?.results || []);
        },
        () => setIsLoading(false)
      );
    }
  }, [updateBidBudget]);

  useEffect(() => {
    const sourceBids = countryBid.filter((el) => el.type === BID_SOURCE_TYPE);
    setSourceBids(sourceBids);
  }, [countryBid]);

  useEffect(() => {
    setIsLoading(true);
    const startDate = moment(dateRange[0])?.format(DATE_RANGE_FORMAT);
    const endDate = moment(dateRange[1])?.format(DATE_RANGE_FORMAT);
    const commonParams = { campaignId: urlParams.campId, startDate, endDate };

    const getCountryBid = service.get("/bid/country", {
      params: { campaignId: urlParams.campId },
    });
    const getCountryBudget = service.get("/budget/country", {
      params: { campaignId: urlParams.campId },
    });
    const getAdGroup = service.get("/adgroup/report", {
      params: commonParams,
    });
    const getCampaignData = service.get(`/campaign/${urlParams.campId}`, {
      params: {
        startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
        endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      },
    });
    const getCurrencyExchange = service.get("/exchange-rate");

    Promise.all([
      getCountryBid,
      getCountryBudget,
      getAdGroup,
      getCampaignData,
      getCurrencyExchange,
    ]).then(
      (res: any) => {
        console.log("res :>> ", res);
        const sortedAdgroup = res[2]?.results || [];
        sortedAdgroup.sort((a, b) =>
          sortNumberWithNullable(b, a, (el) => el.data?.cost)
        );

        setInitedCamp(true);
        setIsLoading(false);
        setCountryBid(res[0]?.results || []);
        setCountryBudget(res[1]?.results || []);
        setAdgroup(sortedAdgroup);
        setCurrenciesConfigs(res[4].results || []);

        const data = res[3].results || {};
        if (!Object.keys(data).length) return;

        setCampaignData(data);
      },
      () => setIsLoading(false)
    );
  }, [urlParams.campId]);

  useEffect(() => {
    detectAdBlock();
  }, []);

  useEffect(() => {
    const onConnected = () => {
      const headers = { [OG_CODE_HEADER]: organizationCode };
      client.subscribe(
        `/topic/${organizationCode}/campaign-center/${urlParams.appId}`,
        function (msg) {
          if (msg.body) {
            const jsonBody = JSON.parse(msg.body);

            if (!jsonBody) return;

            const { data, event, updatedBy } = jsonBody;
            const isBid = event === "batch_bid";
            const field = isBid
              ? EDITABLE_STAT_IDS.bid
              : EDITABLE_STAT_IDS.budget;

            let newData = data;
            if (data?.length) {
              newData = data.map((el) => ({ ...el, updatedBy }));
            }
            dispatch(updateReportTable({ data: newData, field }));
          }
        },
        headers
      );
    };
    const onDisconnected = () => {};

    const client = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: onConnected,
      onDisconnect: onDisconnected,
    });

    client.activate();

    return () => {
      client.deactivate();
      dispatch(resetReportTable({}));
    };
  }, []);

  useEffect(() => {
    listRealtimeData.forEach((updatedEl) => {
      if (!updatedEl.data.length) return;

      const reversedData = [...updatedEl.data];
      reversedData.reverse();

      if (updatedEl.type === EDITABLE_STAT_IDS.bid) {
        const newBid = countryBid.map((el: any) => {
          const updatedData = reversedData.find((data) => data.id === el.id);

          if (!updatedData) return el;

          const newHistory = el.history?.length ? el.history : [];
          newHistory.push({
            id: newHistory.length,
            date: moment().format("YYYY-MM-DD hh:mm A"),
            value: updatedData.bid,
            emailName: updatedData.updatedBy,
          });
          return { ...updatedData, history: newHistory };
        });
        setCountryBid(newBid);
      } else if (updatedEl.type === EDITABLE_STAT_IDS.budget) {
        const newBudget = countryBudget.map((el: any) => {
          const updatedData = reversedData.find((data) => data.id === el.id);

          if (!updatedData) return el;

          const newHistory = el.history?.length ? el.history : [];
          newHistory.push({
            id: newHistory.length,
            date: moment().format("YYYY-MM-DD hh:mm A"),
            value: updatedData.dailyBudget,
            emailName: updatedData.updatedBy,
          });
          return { ...updatedData, history: newHistory };
        });
        setCountryBudget(newBudget);
      }
    });
  }, [listRealtimeData]);

  const onChangeRangePicker = (values) => {
    setDateRange(values);

    const startDate = moment(dateRange[0])?.format(DATE_RANGE_FORMAT);
    const endDate = moment(dateRange[1])?.format(DATE_RANGE_FORMAT);
    const commonParams = { campaignId: urlParams.campId, startDate, endDate };

    const getAdGroup = service.get("/adgroup/report", {
      params: commonParams,
    });
    const getCampaignData = service.get(`/campaign/${urlParams.campId}`, {
      params: {
        startDate: moment(dateRange[0])?.format(DATE_RANGE_FORMAT),
        endDate: moment(dateRange[1])?.format(DATE_RANGE_FORMAT),
      },
    });

    Promise.all([getAdGroup, getCampaignData]).then(
      (res: any) => {
        setAdgroup(res[0].results || []);
        setCampaignData(res[1].results || {});
      },
      () => {}
    );
  };

  const changeRunningStatus = () => {
    const params = {
      campaignId: urlParams.campId,
      enable: !isRunning,
    };

    setIsLoading(true);
    service.put("/campaign/status", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        toast(res.message, { type: "success" });
        setCampaignData({
          ...campaignData,
          status: isRunning
            ? LIST_CAMPAIGN_STATUS.paused.value
            : LIST_CAMPAIGN_STATUS.running.value,
        });
      },
      () => setIsLoading(false)
    );
  };

  const isRunning = status === LIST_CAMPAIGN_STATUS.running.value;

  let isShowAdgroup = false;
  switch (network?.code) {
    case NETWORK_CODES.facebook:
    case NETWORK_CODES.tiktok:
    case NETWORK_CODES.appleSearchAds:
      isShowAdgroup = true;
      break;

    default:
      break;
  }

  let isShowCountryBidBudget = true;
  switch (network?.code) {
    case NETWORK_CODES.google:
    case NETWORK_CODES.appleSearchAds:
    case NETWORK_CODES.tiktok:
    case NETWORK_CODES.facebook:
    case NETWORK_CODES.moloco:
      isShowCountryBidBudget = false;
      break;

    default:
      break;
  }

  let isShowCountryBudget = true;
  if ([NETWORK_CODES.ironSource, NETWORK_CODES.adjoe].includes(network?.code)) {
    isShowCountryBudget = false;
  }

  let isShowCreativePacks = false;
  if (
    [
      NETWORK_CODES.applovin,
      NETWORK_CODES.mintegral,
      NETWORK_CODES.unity,
    ].includes(network?.code)
  ) {
    isShowCreativePacks = true;
  }

  return (
    <Page>
      {isLoading && <Loading />}

      <div className="page-breadcrum">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to={campaignUrl}>Campaign</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{campaignData.name}</Breadcrumb.Item>
        </Breadcrumb>

        <DatePicker.RangePicker
          className="w-full xs:w-auto"
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
      </div>

      <div className="px-4 sm:px-6 lg:px-12 2xl:px-24 py-6">
        <div className="border bg-white rounded px-6 py-5 flex justify-between text-base">
          <div className="flex items-center text-sm2">
            {isRunning && (
              <>
                <span className="bg-green-500 h-3 w-3 rounded-full mr-2" />
                Your campaign went live{" "}
                {getBeforeTime(campaignData.lastChangeStatus, true)} by{" "}
                {campaignData.updatedStatusBy}.
              </>
            )}
            {!isRunning && (
              <span>
                This campaign was paused on{" "}
                {getBeforeTime(campaignData.lastChangeStatus, true)} by{" "}
                {campaignData.updatedStatusBy}.
              </span>
            )}
          </div>
          {initedCamp ? (
            <Popconfirm
              placement="left"
              title={`${isRunning ? "Pause" : "Run"} this campaign?`}
              onConfirm={changeRunningStatus}
              okText="Yes"
              cancelText="No"
            >
              <Button type={isRunning ? undefined : "primary"}>
                {isRunning ? "Pause campaign" : "Run campaign"}
              </Button>
            </Popconfirm>
          ) : (
            <span className="h-8"></span>
          )}
        </div>

        <Stats campaignData={campaignData} />
        <Details
          data={campaignData}
          setIsLoading={setIsLoading}
          setCampaignData={setCampaignData}
          setUpdateBidBudget={setUpdateBidBudget}
        />
        <BidAndBudget
          campaignData={campaignData}
          currenciesConfigs={currenciesConfigs}
          setIsLoading={setIsLoading}
          setCampaignData={setCampaignData}
          countryBid={countryBid}
          countryBudget={countryBudget}
        />
        {isShowCountryBidBudget && (
          <>
            <div className="mt-6">
              <CountryBid
                listData={countryBid}
                setIsLoading={setIsLoading}
                setCountryBid={setCountryBid}
                setUpdateBidBudget={setUpdateBidBudget}
                campaignData={campaignData}
                currenciesConfigs={currenciesConfigs}
              />
            </div>
            {isShowCountryBudget && (
              <div className="mt-6">
                <CountryBudget
                  listData={countryBudget}
                  setIsLoading={setIsLoading}
                  setCountryBudget={setCountryBudget}
                  setUpdateBidBudget={setUpdateBidBudget}
                  campaignData={campaignData}
                  currenciesConfigs={currenciesConfigs}
                />
              </div>
            )}
            {sourceBids?.length > 0 && (
              <SourceBids
                sourceBids={sourceBids}
                currenciesConfigs={currenciesConfigs}
                campaignData={campaignData}
              />
            )}
          </>
        )}
        {isShowAdgroup && (
          <div className="mt-6">
            <Adgroup
              listData={adgroup}
              campaignData={campaignData}
              currenciesConfigs={currenciesConfigs}
              setIsLoading={setIsLoading}
              setAdgroup={setAdgroup}
            />
          </div>
        )}
        {isShowCreativePacks && (
          <div className="mt-6">
            <CreativePacks
              campaignData={campaignData}
              dateRange={dateRange}
              setPreviewData={setPreviewData}
              setImgPreview={setImgPreview}
              setInitedCreatives={setInitedCreatives}
            />
          </div>
        )}
        <div className="mt-6">
          <Creatives
            isExtendData={isShowCreativePacks}
            initedCreatives={initedCreatives}
            campaignData={campaignData}
            dateRange={dateRange}
            setPreviewData={setPreviewData}
            setImgPreview={setImgPreview}
          />
        </div>
      </div>

      <VideoPopup
        classNames="!z-1190"
        onClose={() => setPreviewData({})}
        previewData={previewData}
      />
      <ImagePreview imgPreview={imgPreview} setImgPreview={setImgPreview} />
    </Page>
  );
}

CampaignDetails.propTypes = {};

export default CampaignDetails;
