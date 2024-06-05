import React from "react";
import PropTypes from "prop-types";
import {
  checkNumberValue,
  getValueWithCurrency,
} from "../../../../../utils/Helpers";
import {
  BID_CPI_TYPE,
  BID_RETENSION_TYPE,
  BID_ROAS_TYPE,
  DEFAULT_BUDGET_STEP,
  EDITABLE_STATUS,
  NETWORK_CODES,
} from "../../../../../constants/constants";
import service from "../../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import { Field } from "../../Helper";
import EditableField from "./EditableField";

function BidAndBuget(props) {
  const {
    currenciesConfigs,
    setIsLoading,
    setCampaignData,
    campaignData,
  } = props;

  const { defaultBudget, network, currency, bidType } = campaignData;

  const defaultBid = campaignData?.defaultBid || {};
  const { goal, baseBid, maxBid, bid } = defaultBid;

  const onSaveBid = (bidValue, type = "bid") => {
    const params = { ...defaultBid, [type]: bidValue };

    setIsLoading(true);
    service.put("/bid", params).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        setCampaignData((prevCamp) => ({
          ...prevCamp,
          defaultBid: res.results || params,
        }));
      },
      () => setIsLoading(false)
    );
  };

  const onSaveBudget = (budgetValue) => {
    const params = { ...defaultBudget, dailyBudget: budgetValue };

    setIsLoading(true);
    service.put("/budget", params).then(
      (res: any) => {
        toast(res.message, { type: "success" });
        setIsLoading(false);
        setCampaignData((prevCamp) => ({
          ...prevCamp,
          defaultBudget: res.results || params,
        }));
      },
      () => setIsLoading(false)
    );
  };

  let cantEditBudget = true;
  if (network?.code === NETWORK_CODES.ironSource) {
    cantEditBudget = false;
  }

  let isShowMaxBid = true;
  switch (network?.code) {
    case NETWORK_CODES.applovin:
    case NETWORK_CODES.google:
      isShowMaxBid = false;
      break;
  }

  const bidValue = getValueWithCurrency(bid, currency, currenciesConfigs);
  const goalValue = getValueWithCurrency(goal, currency, currenciesConfigs);
  const maxBidValue = getValueWithCurrency(maxBid, currency, currenciesConfigs);
  const baseBidValue = getValueWithCurrency(
    baseBid,
    currency,
    currenciesConfigs
  );
  const budgetValue = getValueWithCurrency(
    defaultBudget?.dailyBudget,
    currency,
    currenciesConfigs
  );
  const totalBudget = getValueWithCurrency(
    defaultBudget?.totalBudget,
    currency,
    currenciesConfigs
  );
  const isNABid = network?.defaultBidAccess === EDITABLE_STATUS.none;
  const isNABudget = network?.defaultBudgetAccess === EDITABLE_STATUS.none;

  const isCpiCampaign = bidType === BID_CPI_TYPE;
  const isRoas = bidType === BID_ROAS_TYPE;
  const isRetension = bidType === BID_RETENSION_TYPE;

  // if (
  //   network?.code !== NETWORK_CODES.adjoe &&
  //   bidType === BID_CPI_TYPE &&
  //   countryBid?.length &&
  //   countryBudget?.length &&
  //   !checkNumberValue(totalBudget)
  // ) {
  //   return <></>;
  // }

  return (
    <div className="mt-6">
      <div className="border bg-white rounded mt-3 text-base">
        <div className="p-6">
          <div className="text-black font-semibold text-lg mb-3">
            Bid & Budget
          </div>

          {isCpiCampaign && (
            <EditableField
              isNA={isNABid}
              defaultValue={bid}
              valueWithCurrency={bidValue}
              onSave={onSaveBid}
              editable={checkNumberValue(bid)}
            />
          )}

          {isRoas && (
            <EditableField
              title="Goal"
              fieldName="goal"
              isNA={isNABid}
              defaultValue={goal}
              valueWithCurrency={goalValue}
              onSave={onSaveBid}
              editable={checkNumberValue(goal)}
            />
          )}

          {isRetension && (
            <EditableField
              title="Base bid"
              fieldName="baseBid"
              isNA={isNABid}
              defaultValue={baseBid}
              valueWithCurrency={baseBidValue}
              onSave={onSaveBid}
              editable={checkNumberValue(baseBid)}
            />
          )}

          {isShowMaxBid && (isRoas || isRetension) && (
            <EditableField
              title="Max bid"
              fieldName="maxBid"
              isNA={isNABid}
              defaultValue={maxBid}
              valueWithCurrency={maxBidValue}
              onSave={onSaveBid}
              editable={checkNumberValue(maxBid)}
            />
          )}

          <EditableField
            title="Daily budget"
            step={DEFAULT_BUDGET_STEP}
            editable={
              cantEditBudget && checkNumberValue(defaultBudget?.dailyBudget)
            }
            isNA={isNABudget}
            defaultValue={defaultBudget?.dailyBudget}
            valueWithCurrency={budgetValue}
            onSave={onSaveBudget}
          />

          <Field
            border
            name="Total budget"
            classData="border-t"
            value={totalBudget}
          />
        </div>
      </div>
    </div>
  );
}

BidAndBuget.propTypes = {
  currenciesConfigs: PropTypes.array,
  campaignData: PropTypes.object,
  setIsLoading: PropTypes.func,
  setCampaignData: PropTypes.func,
  countryBid: PropTypes.any,
  countryBudget: PropTypes.any,
};

export default BidAndBuget;
