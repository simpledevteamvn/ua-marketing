import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Field } from "../Helper";
import { AiOutlineEdit } from "@react-icons/all-files/ai/AiOutlineEdit";
import Button from "antd/lib/button";
import { useParams } from "react-router-dom";
import SelectCountry from "../../../../partials/common/Forms/SelectCountry";
import {
  ALL_COUNTRIES_OPTION,
  NETWORK_CODES,
} from "../../../../constants/constants";
import service from "../../../../partials/services/axios.config";
import { toast } from "react-toastify";
import classNames from "classnames";

function Details(props) {
  const urlParams = useParams();
  const { data, setIsLoading, setCampaignData, setUpdateBidBudget } = props;

  const [isEdit, setIsEdit] = useState(false);
  const [activedCountries, setActivedCountries] = useState([]);

  useEffect(() => {
    setActivedCountries(data?.targetLocations || []);
  }, [data]);

  const onSave = () => {
    let geos = activedCountries;
    if (activedCountries?.length) {
      geos = geos.filter((code) => code !== ALL_COUNTRIES_OPTION);
    }

    const params = {
      campaignId: urlParams.campId,
      geos: geos.join(","),
    };

    setIsLoading(true);
    service.put("/campaign/target-geos", null, { params }).then(
      (res: any) => {
        setIsLoading(false);
        setIsEdit(false);
        toast(res.message, { type: "success" });

        setCampaignData((prevCamp) => ({
          ...prevCamp,
          targetLocations: res.results?.targetLocations,
        }));
        setUpdateBidBudget((prevKey) => prevKey + 1);
      },
      () => setIsLoading(false)
    );
  };

  if (!data?.id) return <></>;

  const isVungle = data.network?.code === NETWORK_CODES.vungle;
  const isMintegral = data.network?.code === NETWORK_CODES.mintegral;
  const isApplovin = data.network?.code === NETWORK_CODES.applovin;
  const flag = data.network?.imageUrl;

  return (
    <div className="page-section-multi mt-6">
      <div className="text-black font-semibold text-lg">Campaign details</div>

      <div className="rounded-sm border-t border-b mt-4 text-sm2">
        <Field
          border
          name="Network"
          value={
            <div className="flex items-center">
              {flag && (
                <img src={flag} alt=" " className="w-5 h-5 rounded-sm mr-1" />
              )}
              <span>{data.network?.name}</span>
            </div>
          }
        />
        <Field
          border
          name="Name"
          value={<span className="font-bold">{data.name}</span>}
        />
        <Field border name="Billing type" value={data.bidType} />
        <Field border name="Target Ad Type" value={data.targetAdType} />
        <Field
          name="Target device"
          value={data.targetDevice}
          border={data.targetLocations?.length}
        />
        {data.targetLocations?.length > 0 && (
          <div className="flex items-center justify-end px-5 py-3">
            <div className="basis-1/3">
              <div>Target locations</div>
              {isVungle && (
                <div className="text-neutral-400 text-xs mt-0.5 pr-2 2xl:pr-12">
                  <span className="font-bold">Note:</span> Add a country to your
                  target locations automatically add daily country budget with
                  default value <span className="font-bold text-xs2">100$</span>
                </div>
              )}
              {isMintegral && (
                <div className="text-neutral-400 text-xs mt-0.5 pr-2 2xl:pr-12">
                  <span className="font-bold">Note:</span> Add a country to your
                  target locations automatically add daily country budget with
                  default value <span className="font-bold text-xs2">50$</span>
                </div>
              )}
              {isApplovin && (
                <div className="text-neutral-400 text-xs mt-0.5 pr-2 2xl:pr-12">
                  <span className="font-bold">Note:</span> Only allow adding new
                  country when it has enough default bid and default budget.
                </div>
              )}
            </div>

            <div className="basis-2/3 flex justify-between items-center">
              <div>
                {isEdit ? (
                  <SelectCountry
                    classNames={classNames(
                      "!w-80 2xl:!w-[500px]",
                      isVungle && "!mt-1"
                    )}
                    value={activedCountries}
                    onChange={setActivedCountries}
                  />
                ) : (
                  <div className="">{data.targetLocations.join(", ")}</div>
                )}
              </div>

              <div className="w-28 flex justify-end">
                {isEdit && (
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsEdit(false)}>Cancel</Button>
                    <Button type="primary" onClick={onSave}>
                      Save
                    </Button>
                  </div>
                )}
                {data.editTargetLocations && !isEdit && (
                  <AiOutlineEdit
                    size={20}
                    className="shrink-0 text-slate-600 hover:text-antPrimary cursor-pointer"
                    onClick={() => setIsEdit(true)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Details.propTypes = {
  data: PropTypes.object,
  setIsLoading: PropTypes.func,
  setCampaignData: PropTypes.func,
  setUpdateBidBudget: PropTypes.func,
};

export default Details;
