import React from "react";
import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import { BiChevronDown } from "@react-icons/all-files/bi/BiChevronDown";
import PropTypes from "prop-types";
import _ from "lodash";

function Autocomplete(props) {
  const { listOption, labelKey, label, activedOpt, onChange, multiple } = props;
  const [query, setQuery] = useState("");

  const filteredData =
    query === ""
      ? listOption
      : listOption.filter((option) =>
          option[labelKey]
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <Combobox value={activedOpt} onChange={onChange} multiple={multiple}>
      <div className="relative mt-1">
        <Combobox.Label className="block mb-1 text-sm font-medium text-gray-900">
          {label}
        </Combobox.Label>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left shadow-sm sm:text-sm">
          <Combobox.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
            displayValue={(option) => {
              if (_.isEmpty(option)) return "";
              if (!multiple) return option[labelKey];
              return option.map((opt) => opt[labelKey]).join(", ");
            }}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <BiChevronDown size={20} />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData.length === 0 && query !== "" ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredData.map((opt, idx) => (
                <Combobox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-teal-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={opt}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {opt[labelKey]}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? "text-white" : "text-teal-600"
                          }`}
                        >
                          <AiOutlineCheck size={20} />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}

Autocomplete.defaultProps = {
  listOption: [],
  multiple: false,
  labelKey: "name",
};

Autocomplete.propTypes = {
  listOption: PropTypes.array.isRequired,
  labelKey: PropTypes.string.isRequired,
  label: PropTypes.string,
  activedOpt: PropTypes.any,
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
};

export default Autocomplete;
