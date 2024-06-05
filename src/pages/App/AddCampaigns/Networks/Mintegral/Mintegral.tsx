import React, { useState } from "react";
import Divider from "antd/lib/divider";
import Steps from "antd/lib/steps";
import { ALL_AREA, MintegralSteps, SEPARATED } from "../../constants";
import { getControlBtns } from "../../Helpers";
import Step1 from "./Step1";
import Step2, { ALL_DEVICES } from "./Step2";
import Step3 from "./Step3/Step3";
import Step4 from "./Step4/Step4";
import { BidGroup } from "../../interface";
import {
  DYNAMIC_BUDGET_COUNTRIES,
  DYNAMIC_BUDGET_TYPE,
} from "../../components/BudgetGroup";
import {
  DYNAMIC_DAILY_BUDGET,
  DYNAMIC_DAILY_BUDGET_OPEN,
  DYNAMIC_TOTAL_BUDGET,
  DYNAMIC_TOTAL_BUDGET_OPEN,
} from "../../components/DailyAndTotalBudgetForm";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../../../partials/common/Forms/RangePicker";

function Mintegral(props) {
  const {
    campaignConfigs,
    applicationsData,
    setIsLoading,
    stepData,
    setStepData,
    activedApp,
  } = props;

  const [current, setCurrent] = useState(0);
  const [countBackAction, setCountBackAction] = useState<number>(0);

  const onChange = (value) => {
    setCurrent(value);
  };

  const next = (formData) => {
    // Chỉ next được khi đã điền xong form của step trước -> lưu lại data cũ trước khi next
    const stepField = "step" + (current + 1);
    setStepData((prevState) => ({ ...prevState, [stepField]: formData }));

    if (current !== MintegralSteps.length - 1) {
      setCurrent(current + 1);
    } else {
      const { targetDevices } = campaignConfigs;
      const { step1, step2, step3 } = stepData;
      const { name, bidType, timeZone, startDate, endDate } = step1;
      const {
        networks,
        targetLocations,
        targetDevice,
        osVersionMin,
        osVersionMax,
      } = step2;
      const {
        defaultBid,
        bidGroups,
        budgetMode,
        dailyBudget,
        dailyBudgetOpen,
        totalBudgetOpen,
        totalBudget,
        budgetGroups,
      } = step3;
      const { creatives, adType, activedCountries } = formData;

      const endDateTime = endDate
        ? moment(endDate).format(DATE_RANGE_FORMAT)
        : undefined;

      let deviceData = targetDevice;
      if (targetDevice === ALL_DEVICES) {
        deviceData = targetDevices;
      } else {
        deviceData = [targetDevice];
      }

      const countriesBid: any = [];
      if (bidGroups?.length) {
        bidGroups.forEach((el: BidGroup) => {
          const { countries, bid } = el;
          if (countries?.length) {
            countries.forEach((country) => {
              countriesBid.push({ bid, country });
            });
          }
        });
      }

      const getBudget = (isOpen, value) => (!isOpen && value ? value : null);
      let defaultBudget: any = undefined;
      let countriesBudget: any = [];

      if (budgetMode === ALL_AREA) {
        defaultBudget = {
          dailyBudget: getBudget(dailyBudgetOpen, dailyBudget),
          totalBudget: getBudget(totalBudgetOpen, totalBudget),
        };
      } else if (budgetGroups?.length) {
        for (let i = 0; i < budgetGroups.length; i++) {
          const getField = (dynamicText) =>
            step3[dynamicText + budgetGroups[i]?.id];
          const budgetData = {
            dailyBudget: getBudget(
              getField(DYNAMIC_DAILY_BUDGET_OPEN),
              getField(DYNAMIC_DAILY_BUDGET)
            ),
            totalBudget: getBudget(
              getField(DYNAMIC_TOTAL_BUDGET_OPEN),
              getField(DYNAMIC_TOTAL_BUDGET)
            ),
          };
          const countryData = getField(DYNAMIC_BUDGET_COUNTRIES);

          if (getField(DYNAMIC_BUDGET_TYPE) === SEPARATED) {
            countryData.forEach((country) => {
              countriesBudget.push({ ...budgetData, country });
            });
          } else {
            countriesBudget.push({ ...budgetData, countries: countryData }); // SHARED mode
          }
        }
      }

      const targetAdType = adType.filter(
        (type) =>
          !Object.keys(campaignConfigs?.creativeTypes || {}).includes(type)
      );

      const creativeData = creatives.map((el) => {
        const geoData = activedCountries?.[el.id];
        const geos = geoData?.length ? geoData : targetLocations;

        return {
          name: el.name,
          md5: el.rawCreative?.file_md5,
          geos,
          creativeSetName: el.creativeSetName || "",
        };
      });

      const params = {
        networkConnectorId: activedApp.networkConnector.id,
        rawAppId: activedApp.rawAppId,
        // Step 1:
        name,
        bidType,
        timeZone,
        startDate: moment(startDate).format(DATE_RANGE_FORMAT),
        endDate: endDateTime,
        // Step 2:
        networks,
        targetLocations,
        osVersionMin,
        osVersionMax,
        targetDevice: deviceData,
        // Step 3:
        dailyCapType: "BUDGET",
        defaultBid: { bid: defaultBid },
        countriesBid,
        defaultBudget,
        countriesBudget,
        // Step 4:
        creatives: creativeData,
        targetAdType,
      };

      setIsLoading(true);
      service.post("/campaign", params).then(
        (res: any) => {
          setCurrent(0);
          setStepData({});
          setIsLoading(false);
          toast(res.message, { type: "success" });
        },
        () => setIsLoading(false)
      );
    }
  };

  const prev = () => {
    setCountBackAction(countBackAction + 1);
  };

  const onPrev = (formData) => {
    const stepField = "step" + (current + 1);
    setStepData((prevState) => ({ ...prevState, [stepField]: formData }));
    setCurrent(current - 1);
  };

  const stepProps = {
    next,
    onPrev,
    countBackAction,
    campaignConfigs,
    setIsLoading,
    stepData,
    setStepData,
    activedApp,
    applicationsData,
  };
  let stepComp;
  switch (current) {
    case 1:
      stepComp = <Step2 {...stepProps} />;
      break;
    case 2:
      stepComp = <Step3 {...stepProps} />;
      break;
    case 3:
      stepComp = <Step4 {...stepProps} />;
      break;

    case 0:
    default:
      stepComp = <Step1 {...stepProps} />;
      break;
  }

  return (
    <>
      <div className="flex h-full">
        <div className="grow-0 shrink-0 basis-52">
          <Steps
            current={current}
            // onChange={onChange}
            direction="vertical"
            items={MintegralSteps}
            size="small"
          />
        </div>
        <Divider type="vertical" className="!h-auto" />
        <div className="flex-1 flex flex-col justify-between pl-4 overflow-x-auto grow">
          {stepComp}
          {getControlBtns({ current, prev, steps: MintegralSteps })}
        </div>
      </div>
    </>
  );
}

Mintegral.propTypes = {};

export default Mintegral;
