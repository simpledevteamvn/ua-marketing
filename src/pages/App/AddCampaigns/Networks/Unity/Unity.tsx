import React, { useState } from "react";
import Divider from "antd/lib/divider";
import Steps from "antd/lib/steps";
import { AUTOMATED, UnitySteps } from "../../constants";
import { getControlBtns, getEndDate } from "../../Helpers";
import Step1 from "./Step1";
import { BidGroup } from "../../interface";
import moment from "moment";
import { DATE_RANGE_FORMAT } from "../../../../../partials/common/Forms/RangePicker";
import Step2 from "./Step2";
import Step3 from "./Step3/Step3";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";

function Unity(props) {
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

    if (current !== UnitySteps.length - 1) {
      setCurrent(current + 1);
    } else {
      const { step1, step2 } = stepData;
      const {
        name,
        type,
        biddingStrategy,
        startUrl,
        clickUrl,
        impressionUrl,
        startDate,
        endDate,
      } = step1;
      const {
        bidGroups,
        countries,
        dailyBudget,
        totalBudget,
        dailyBudgetOpen,
        totalBudgetOpen,
      } = step2;
      const { creatives } = formData;

      let countriesBid: any = [];
      if (biddingStrategy === AUTOMATED && countries?.length) {
        countriesBid = countries.map((country) => ({ country }));
      } else if (bidGroups?.length) {
        bidGroups.forEach((el: BidGroup) => {
          const { countries, bid, goal, baseBid, maxBid } = el;
          if (countries?.length) {
            countries.forEach((country) => {
              countriesBid.push({ bid, goal, baseBid, maxBid, country });
            });
          }
        });
      }

      const getBudget = (isOpen, value) => (!isOpen && value ? value : null);
      let defaultBudget = {
        dailyBudget: getBudget(dailyBudgetOpen, dailyBudget),
        totalBudget: getBudget(totalBudgetOpen, totalBudget),
      };

      const params = {
        networkConnectorId: activedApp.networkConnector.id,
        rawAppId: activedApp.rawAppId,
        // Step 1:
        name,
        type,
        biddingStrategy,
        startDate: moment(startDate).format(DATE_RANGE_FORMAT),
        endDate: getEndDate(endDate),
        startUrl,
        clickUrl,
        impressionUrl,
        // Step 2:
        defaultBudget,
        countriesBid,
        // Step 3:
        creativePackIds: creatives?.map((el) => el.id),
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
            items={UnitySteps}
            size="small"
          />
        </div>
        <Divider type="vertical" className="!h-auto" />
        <div className="flex-1 flex flex-col justify-between pl-4 overflow-x-auto grow">
          {stepComp}
          {getControlBtns({ current, prev, steps: UnitySteps })}
        </div>
      </div>
    </>
  );
}

Unity.propTypes = {};

export default Unity;
