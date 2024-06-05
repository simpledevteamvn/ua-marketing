import React from "react";
import PropTypes from "prop-types";
import Form from "antd/lib/form";
import {
  BASE_BID_PLACEHOLDER,
  BID_PLACEHOLDER,
  COUNTRY_REQUIRED,
  GOAL_PLACEHOLDER,
  MAX_BID_PLACEHOLDER,
  VALUE_REQUIRED,
} from "../../../../constants/formMessage";
import InputNumber from "antd/lib/input-number";
import {
  BID_CPI_TYPE,
  BID_RETENSION_TYPE,
  BID_ROAS_TYPE,
  DEFAULT_BID_STEP,
} from "../../../../constants/constants";
import SelectCountryFromList from "../../../../partials/common/Forms/SelectCountryFromList";

export const DYNAMIC_COUNTRIES = "dynamicCountries";
export const DYNAMIC_BID = "dynamicBid";
export const DYNAMIC_GOAL = "dynamicGoal";
export const DYNAMIC_BASE_BID = "dynamicBaseBid";
export const DYNAMIC_MAX_BID = "dynamicMaxBid";

function BidRateGroup(props) {
  const { bidGroup, onChangeGroup, listCountries, type } = props;
  const { id, countries, bid } = bidGroup;

  return (
    <>
      <Form.Item
        className="!mb-1"
        name={DYNAMIC_COUNTRIES + id}
        rules={[{ required: true, message: COUNTRY_REQUIRED }]}
      >
        <SelectCountryFromList
          listCountries={listCountries}
          value={countries}
          onChange={(value) => onChangeGroup(bidGroup, value)}
        />
      </Form.Item>

      {type === BID_CPI_TYPE && (
        <Form.Item
          className="!mt-4 !mb-1"
          name={DYNAMIC_BID + id}
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            value={bid}
            onChange={(value) => onChangeGroup(bidGroup, value, "bid")}
            step={DEFAULT_BID_STEP}
            placeholder={BID_PLACEHOLDER}
            className="!w-full"
            addonBefore="$"
          />
        </Form.Item>
      )}

      {type === BID_RETENSION_TYPE && (
        <Form.Item
          className="!mt-4 !mb-1"
          name={DYNAMIC_BASE_BID + id}
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            value={bid}
            onChange={(value) => onChangeGroup(bidGroup, value, "baseBid")}
            step={DEFAULT_BID_STEP}
            placeholder={BASE_BID_PLACEHOLDER}
            className="!w-full"
            addonBefore="$"
          />
        </Form.Item>
      )}
      {type === BID_ROAS_TYPE && (
        <Form.Item
          className="!mt-4 !mb-1"
          name={DYNAMIC_GOAL + id}
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            value={bid}
            onChange={(value) => onChangeGroup(bidGroup, value, "goal")}
            step={DEFAULT_BID_STEP}
            placeholder={GOAL_PLACEHOLDER}
            className="!w-full"
            addonBefore="$"
          />
        </Form.Item>
      )}
      {(type === BID_RETENSION_TYPE || type === BID_ROAS_TYPE) && (
        <Form.Item
          className="!mt-4 !mb-1"
          name={DYNAMIC_MAX_BID + id}
          rules={[{ required: true, message: VALUE_REQUIRED }]}
        >
          <InputNumber
            min={0}
            value={bid}
            onChange={(value) => onChangeGroup(bidGroup, value, "maxBid")}
            step={DEFAULT_BID_STEP}
            placeholder={MAX_BID_PLACEHOLDER}
            className="!w-full"
            addonBefore="$"
          />
        </Form.Item>
      )}
    </>
  );
}

BidRateGroup.defaultProps = {
  bidGroup: {},
  listCountries: [],
  type: BID_CPI_TYPE,
};

BidRateGroup.propTypes = {
  bidGroup: PropTypes.object,
  listCountries: PropTypes.array,
  onChangeGroup: PropTypes.func,
  type: PropTypes.string,
};

export default BidRateGroup;
