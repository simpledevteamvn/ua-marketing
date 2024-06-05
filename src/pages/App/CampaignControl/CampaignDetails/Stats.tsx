import React from "react";
import { numberWithCommas } from "../../../../utils/Utils";

function Stats({ campaignData }) {
  const checkNullable = (data) => (data === 0 ? true : !!data);

  const statClass = "text-stone-500 mb-1";
  const numberClass = "font-semibold";

  return (
    <div className="flex justify-between border bg-white rounded px-6 py-5 mt-4 md:mt-6 text-base">
      <div className="flex space-x-4 2xl:space-x-16">
        <div>
          <div className={statClass}>Installs</div>
          <div className={numberClass}>
            {numberWithCommas(campaignData.install)}
          </div>
        </div>
        <div>
          <div className={statClass}>Clicks</div>
          <div className={numberClass}>
            {numberWithCommas(campaignData.click)}
          </div>
        </div>
        <div>
          <div className={statClass}>Impressions</div>
          <div className={numberClass}>
            {numberWithCommas(campaignData.impression)}
          </div>
        </div>
      </div>
      <div className="flex space-x-4 2xl:space-x-16">
        <div>
          <div className={statClass}>eCPI</div>
          {checkNullable(campaignData.eCpi) && (
            <div className={numberClass}>
              ${numberWithCommas(campaignData.eCpi)}
            </div>
          )}
        </div>
        <div>
          <div className={statClass}>Cost</div>
          {checkNullable(campaignData.cost) && (
            <div className={numberClass}>
              ${numberWithCommas(campaignData.cost)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stats;
