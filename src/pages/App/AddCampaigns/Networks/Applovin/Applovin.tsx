import React, { useState } from "react";
import Divider from "antd/lib/divider";
import Steps from "antd/lib/steps";
import { ApplovinSteps, ROAS_AD_BASED } from "../../constants";
import { getControlBtns, getCountriesBudget } from "../../Helpers";
import Step1 from "./Step1";
import { BidGroup } from "../../interface";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import Step2 from "./Step2";
import Step3 from "./Step3";

function Applovin(props) {
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
    const stepField = "step" + (current + 1);
    setStepData((prevState) => ({ ...prevState, [stepField]: formData }));

    if (current !== ApplovinSteps.length - 1) {
      setCurrent(current + 1);
    } else {
      const { step1, step2 } = stepData;
      const { name, bidType, trackingMethod, clickUrl, impressionUrl } = step1;
      const { targetLocations, category, osVersionMin } = step2;
      const { bidGroups, budgetGroups, defaultBid, defaultBudget } = formData;

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

      let defaultBidData;
      if (defaultBid) {
        if (bidType === ROAS_AD_BASED) {
          defaultBidData = { goal: defaultBid };
        } else {
          defaultBidData = { bid: defaultBid };
        }
      }
      const defaultBudgetData = defaultBudget
        ? { dailyBudget: defaultBudget }
        : undefined;

      const params = {
        networkConnectorId: activedApp.networkConnector.id,
        rawAppId: activedApp.rawAppId,
        // Step 1:
        name,
        bidType,
        trackingMethod,
        clickUrl,
        impressionUrl,
        // Step 2:
        targetLocations,
        category,
        osVersionMin,
        // Step 3:
        defaultBid: defaultBidData,
        defaultBudget: defaultBudgetData,
        countriesBid,
        countriesBudget: getCountriesBudget(formData, budgetGroups),
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
            items={ApplovinSteps}
            size="small"
          />
        </div>
        <Divider type="vertical" className="!h-auto" />
        <div className="flex-1 flex flex-col justify-between pl-4 overflow-x-auto grow">
          {stepComp}
          {getControlBtns({ current, prev, steps: ApplovinSteps })}
        </div>
      </div>
    </>
  );
}

export default Applovin;
