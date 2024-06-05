import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
// import { ALL_COUNTRIES_OPTION } from "../../../constants/constants";
import {
  filterSelectByDOM,
  getCountryNameFromCode,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

function SelectCountryFromList(props) {
  const {
    value,
    onChange,
    classNames,
    placeholder,
    isMultiple,
    listCountries,
  } = props;

  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState("");

  const checkCodeExist = (code) => {
    return code && listCountries.includes(code);
  };

  const getListCode = () => {
    const cleanedText = searchText.replace(/ /g, "");
    const listCodesFromSearch = cleanedText
      .split(",")
      .map((el) => el.toUpperCase());
    const listCodes = listCodesFromSearch.filter((code) =>
      checkCodeExist(code)
    );

    if (listCodes.length) {
      return value?.length ? [...value, ...listCodes] : listCodes;
    }

    return value;
  };

  return (
    <Select
      ref={inputRef}
      mode={isMultiple ? "multiple" : undefined}
      placeholder={placeholder}
      allowClear
      className={`w-full ${classNames}`}
      value={value}
      onChange={onChange}
      // onChange={(listCountryCode) => {
      //   if (isMultiple) {
      //     return onSelectWithAllOpt(
      //       listCountryCode,
      //       listCountries,
      //       ALL_COUNTRIES_OPTION,
      //       value,
      //       onChange
      //     );
      //   }

      //   return onChange(listCountryCode);
      // }}
      showSearch
      onSearch={setSearchText}
      onInputKeyDown={(e) => {
        if (
          isMultiple &&
          e.key === "Enter" &&
          searchText &&
          listCountries?.length
        ) {
          const listCodes = getListCode();

          // @ts-ignore
          inputRef.current && inputRef.current.blur();
          setSearchText("");

          onChange(listCodes);
          // onSelectWithAllOpt(
          //   listCodes,
          //   listCountries,
          //   ALL_COUNTRIES_OPTION,
          //   value,
          //   onChange
          // );
        }
      }}
      maxTagCount="responsive"
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, value, onChange)}
      filterOption={filterSelectByDOM}
    >
      {listCountries?.length > 0 &&
        listCountries.map((countryCode) => {
          let countryName = getCountryNameFromCode(countryCode);

          let label = countryCode;
          if (countryName !== countryCode) {
            label = countryName + " (" + countryCode + ")";
          }

          return (
            <Select.Option key={countryCode}>
              <span
                className={`fi fi-${countryCode.toLowerCase()} w-5 h-3 mr-1`}
              />
              {label}
            </Select.Option>
          );
        })}
    </Select>
  );
}

SelectCountryFromList.defaultProps = {
  isMultiple: true,
  placeholder: "Select countries",
};

SelectCountryFromList.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  classNames: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  isMultiple: PropTypes.bool,
  listCountries: PropTypes.array,
};

export default SelectCountryFromList;
