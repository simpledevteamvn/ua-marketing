import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Select from "antd/lib/select";
import CountriesList from "countries-list";
import { ALL_COUNTRIES_OPTION } from "../../../constants/constants";
import {
  filterSelectByDOM,
  onSelectGroup,
  onSelectWithAllOpt,
} from "../../../utils/Helpers";
import { maxTagPlaceholder } from "./MaxTagPlaceholder";

const { Option, OptGroup } = Select;

const Favorites = [
  "VN",
  "US", // United States
  "IN", // India
  "KR", // South Korea
  "JP", // Japan
  "CN", // China
  "SG", // Singapore
  "FR", // France
  "DE", // Germany
  "CA", // Canada
  "RU", // Russia
  "BR", // Brazil
  "TH", // Thailand
];

function SelectCountry(props) {
  const {
    value,
    onChange,
    classNames,
    placeholder,
    isMultiple,
    hasAllOpt,
    disabled,
    acceptOnlyAll,
    size,
  } = props;

  const inputRef = useRef(null);
  const [listCountry, setListCountry] = useState({});
  const [listContinent, setListContinent] = useState({});
  const [listFavorite, setListFavorite] = useState<any>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const newListFavorite = Favorites.map((code) => {
      return {
        code,
        name: CountriesList.countries[code]?.name,
      };
    });

    let newListCountry;
    Object.keys(CountriesList.countries).forEach((code) => {
      if (Favorites.includes(code)) return;

      newListCountry = Object.assign({}, newListCountry, {
        [code]: CountriesList.countries[code],
      });
    });

    setListFavorite(newListFavorite);
    setListCountry(newListCountry);
    setListContinent(CountriesList.continents);
  }, []);

  const checkCodeExist = (code) => {
    let supportedCodes = Object.keys(listCountry);
    supportedCodes = [...Favorites, ...supportedCodes, ALL_COUNTRIES_OPTION];
    return code && supportedCodes.includes(code);
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

  const listOpts = [...Favorites];
  Object.keys(listContinent).forEach((continentCode) => {
    const listCountryByContinent = Object.keys(listCountry).filter(
      (countryCode) => listCountry[countryCode].continent === continentCode
    );
    listCountryByContinent.forEach((code) => listOpts.push(code));
  });

  const onChangeValue = (listCountryCode) => {
    if (isMultiple) {
      if (!hasAllOpt) {
        return onChange(listCountryCode);
      }
      if (acceptOnlyAll) {
        return onSelectGroup(listCountryCode, ALL_COUNTRIES_OPTION, onChange);
      }
      return onSelectWithAllOpt(
        listCountryCode,
        listOpts,
        ALL_COUNTRIES_OPTION,
        value,
        onChange
      );
    }

    return onChange(listCountryCode);
  };

  return (
    <Select
      ref={inputRef}
      mode={isMultiple ? "multiple" : undefined}
      placeholder={placeholder}
      allowClear
      size={size}
      disabled={disabled}
      className={`w-full ${classNames}`}
      value={value}
      maxTagPlaceholder={(v) => maxTagPlaceholder(v, value, onChangeValue)}
      onChange={onChangeValue}
      showSearch
      onSearch={setSearchText}
      onInputKeyDown={(e) => {
        if (isMultiple && e.key === "Enter" && searchText) {
          const listCodes = getListCode();

          // @ts-ignore
          inputRef.current && inputRef.current.blur();
          setSearchText("");

          if (!hasAllOpt) {
            onChange(listCodes);
          } else if (acceptOnlyAll) {
            onSelectGroup(listCodes, ALL_COUNTRIES_OPTION, onChange);
          } else {
            onSelectWithAllOpt(
              listCodes,
              listOpts,
              ALL_COUNTRIES_OPTION,
              value,
              onChange
            );
          }
        }
      }}
      maxTagCount="responsive"
      filterOption={filterSelectByDOM}
    >
      {hasAllOpt && (
        <OptGroup
          label={`All Countries (${
            Object.keys(listCountry)?.length + listFavorite.length
          })`}
        >
          <Option value={ALL_COUNTRIES_OPTION}>All Countries</Option>
        </OptGroup>
      )}

      {listFavorite?.length && (
        <OptGroup label={`Favorites (${Favorites.length})`}>
          {listFavorite.map((el: any, idx) => (
            <Option value={el.code} key={idx}>
              <span className={`fi fi-${el.code.toLowerCase()} w-5 h-3 mr-1`} />
              {el.name} ({el.code})
            </Option>
          ))}
        </OptGroup>
      )}

      {Object.keys(listContinent)?.length > 0 &&
        Object.keys(listCountry)?.length > 0 &&
        Object.keys(listContinent).map((continentCode) => {
          const listCountryByContinent = Object.keys(listCountry).filter(
            (countryCode) =>
              listCountry[countryCode].continent === continentCode
          );

          return (
            <OptGroup
              label={`${listContinent[continentCode]} (${listCountryByContinent.length})`}
              key={continentCode}
            >
              {listCountryByContinent.map((countryCode) => (
                <Option value={countryCode} key={countryCode}>
                  <span
                    className={`fi fi-${countryCode.toLowerCase()} w-5 h-3 mr-1`}
                  />
                  {listCountry[countryCode].name} ({countryCode})
                </Option>
              ))}
            </OptGroup>
          );
        })}
    </Select>
  );
}

SelectCountry.defaultProps = {
  isMultiple: true,
  hasAllOpt: true,
  acceptOnlyAll: false,
  placeholder: "Select countries",
};

SelectCountry.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  hasAllOpt: PropTypes.bool,
  size: PropTypes.string,
  classNames: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  isMultiple: PropTypes.bool,
  disabled: PropTypes.bool,
  acceptOnlyAll: PropTypes.bool,
};

export default SelectCountry;
