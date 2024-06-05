import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { DimensionDrd } from "../Dropdowns/Dropdowns";
import {
  ALL_COUNTRIES_OPTION,
  ALL_NETWORK_OPTION,
} from "../../../constants/constants";
import Select from "antd/lib/select";
import SelectNetwork from "../Forms/SelectNetwork";
import { MinusIcon, PlusIcon } from "../Forms/Icons";
import { LIST_FILTER_KEY } from "../../../constants/dropdowns";
import { filterSelect, getSelectMultipleParams } from "../../../utils/Helpers";

export interface DynamicFilter {
  dimensionOpts: any[];
  activedDimension: string | undefined;
  dimensionSuffix?: string;
  filterOpts: any;
  activedFilters: any;
  filterValue?: string;
  filterLabel?: string;
}

const getAllOpt = (field) => {
  switch (field) {
    case LIST_FILTER_KEY.adNetwork:
    default:
      return ALL_NETWORK_OPTION;
  }
};

export const getTableFilter = (filters, field) => {
  const filterObj: DynamicFilter | undefined = filters?.find(
    (el) => el.activedDimension === field
  );

  return getSelectMultipleParams(
    filterObj?.activedFilters,
    getAllOpt(field)
  )?.join(",");
};

function TableDynamicFilter(props) {
  const {
    dimensionOpts,
    defaultDimension,
    dimensionFilters,
    setDimensionFilters,
    listAdNetwork,
    listUser,
  } = props;

  const [currentDimensionOpts, setCurrentDimensionOpts] =
    useState(dimensionOpts);

  const onPlusFilter = (
    listFilter = dimensionFilters,
    opts = currentDimensionOpts
  ) => {
    const newDimension = {
      ...defaultDimension,
      dimensionOpts: opts,
    };

    if (!listFilter.length) return setDimensionFilters([newDimension]);
    setDimensionFilters([...listFilter, newDimension]);
  };

  const onMinusFilter = (idx) => {
    updateDimensionOpts(idx, true);
  };

  const onChangeDimension = (id, value) => {
    let newListOpt;
    let activedFilters;
    let filterLabel;
    let filterValue;
    switch (value) {
      // case LIST_FILTER_KEY.country:
      //   newListOpt = [];
      //   activedFilters = [ALL_COUNTRIES_OPTION];
      //   break;
      // case LIST_FILTER_KEY.type:
      //   newListOpt = [];
      //   activedFilters = [];
      //   break;
      case LIST_FILTER_KEY.email:
        newListOpt = listUser;
        activedFilters = [];
        filterLabel = "email";
        filterValue = "email";
        break;

      case LIST_FILTER_KEY.adNetwork:
      default:
        newListOpt = [];
        activedFilters = [];
        break;
    }

    const fieldObj = {
      activedDimension: value,
      dimensionOpts: currentDimensionOpts,
      filterOpts: newListOpt,
      activedFilters,
      filterValue,
      filterLabel,
    };
    handleUpdateDetailState(id, null, null, fieldObj, true);
  };

  const handleUpdateDetailState = (
    id,
    value,
    fieldName,
    fieldObj = {},
    isUpdate = false
  ) => {
    const newFilter = dimensionFilters.map((item, idx) => {
      if (idx !== id) return item;
      if (!Object.keys(fieldObj)?.length) {
        return {
          ...item,
          [fieldName]: value,
        };
      }

      return {
        ...item,
        ...fieldObj,
      };
    });

    if (!isUpdate) {
      return setDimensionFilters(newFilter);
    }
    updateDimensionOpts(id, false, newFilter);
  };

  const updateDimensionOpts = (
    filterId,
    isMinus = false,
    list = dimensionFilters
  ) => {
    const listActivedDimension = list.map((el, idx) =>
      filterId === idx && isMinus ? "" : el.activedDimension
    );
    const newDimensionOpt = dimensionOpts.filter(
      (el) => !listActivedDimension.includes(el.value)
    );
    const newDimensionFilters = list.map((el, idx) => {
      if (idx === filterId) return el;
      if (!el.activedDimension) {
        return { ...el, dimensionOpts: newDimensionOpt };
      }

      // Update old dropdown
      const currentDimensionsForDrd = listActivedDimension.filter(
        (dimensionId) => el.activedDimension !== dimensionId
      );
      const currentOpts = dimensionOpts.filter(
        (el) => !currentDimensionsForDrd.includes(el.value)
      );
      return { ...el, dimensionOpts: currentOpts };
    });

    setCurrentDimensionOpts(newDimensionOpt);
    if (isMinus) {
      // Mode: minus filter -> remove filterId
      newDimensionFilters.splice(filterId, 1);
    }

    if (!newDimensionFilters.length) {
      return onPlusFilter([], newDimensionOpt);
    }
    setDimensionFilters(newDimensionFilters);
  };

  const onSelectDimensionFilter = (filterId, optValue) => {
    handleUpdateDetailState(filterId, optValue, "activedFilters");
  };

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="form-filter-left">Filters</div>
      <div className="form-filter-right">
        {dimensionFilters.map((item, idx) => {
          const listDimesion = item.dimensionOpts;
          const dimensionLength = dimensionFilters.length;
          const maxDimesion = defaultDimension.dimensionOpts?.length - 1;
          const firstActivedDimension = dimensionFilters[0].activedDimension;

          return (
            <div
              key={idx}
              className={classNames("dynamic-filters", idx && "mt-3 xs:mt-2")}
            >
              <DimensionDrd
                options={listDimesion}
                value={item.activedDimension}
                onChange={(value) => onChangeDimension(idx, value)}
              />

              {item.filterOpts?.length > 0 && (
                <Select
                  className="w-full md:max-w-sm"
                  placeholder="Select filters"
                  mode="multiple"
                  allowClear
                  value={item.activedFilters}
                  onChange={(value) => onSelectDimensionFilter(idx, value)}
                  showSearch
                  maxTagCount="responsive"
                  filterOption={filterSelect}
                >
                  {item.filterOpts.map((data) => (
                    <Select.Option key={data[item.filterValue!]}>
                      {data[item.filterLabel!]}
                    </Select.Option>
                  ))}
                </Select>
              )}

              {item.activedDimension === LIST_FILTER_KEY.adNetwork && (
                <SelectNetwork
                  classNames="md:max-w-sm"
                  listNetwork={listAdNetwork}
                  value={item.activedFilters}
                  onChange={(value) => onSelectDimensionFilter(idx, value)}
                />
              )}

              <div className="flex xs:!ml-3">
                <MinusIcon
                  onClick={() => onMinusFilter(idx)}
                  classNames={classNames(
                    dimensionLength === 1 &&
                      !firstActivedDimension &&
                      "disabled"
                  )}
                />
                {idx === dimensionLength - 1 && idx < maxDimesion && (
                  <PlusIcon onClick={onPlusFilter} classNames="!ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

TableDynamicFilter.defaultProps = {
  listUser: [],
  defaultDimension: {},
};

TableDynamicFilter.propTypes = {
  dimensionOpts: PropTypes.array,
  defaultDimension: PropTypes.object,
  listAdNetwork: PropTypes.array,
  listUser: PropTypes.array,
  dimensionFilters: PropTypes.array,
  setDimensionFilters: PropTypes.func,
};

export default TableDynamicFilter;
