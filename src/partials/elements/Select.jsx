import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import React from "react";
import { AiOutlineCheck } from "@react-icons/all-files/ai/AiOutlineCheck";
import { BiChevronDown } from "@react-icons/all-files/bi/BiChevronDown";

import PropTypes from "prop-types";
import classNames from "classnames";

const Select = (props) => {
  const {
    className,
    btnClassName,
    optClassName,
    listOption,
    activedOpt,
    onChange,
    labelKey,
    defaultLabel,
    label,
    imgKey,
    multiple,
    noteRequire,
    isUpdateActiveOpt,
    optIcon,
  } = props;

  if (!listOption.length) return <></>;

  const isSelected = (opt) => {
    return activedOpt?.some((item) => item[labelKey] === opt[labelKey]);
  };

  const onChangeListbox = (value) => {
    if (!multiple) return onChange(value);

    // Multiple mode: value is array
    // Find and remove initial data if it choose again.
    const newData = value[value.length - 1];
    const existDataIndex = value.findIndex(
      (item) => item[labelKey] === newData[labelKey]
    );

    let updatedData = value;
    if (existDataIndex > -1 && existDataIndex !== value.length - 1) {
      // Remove two elements with the same data
      updatedData = value.filter(
        (item) => item[labelKey] !== newData[labelKey]
      );
    }
    onChange(updatedData);
  };

  const defaultSelectLabel = defaultLabel || listOption[0][labelKey];
  let boxLabel = activedOpt[labelKey];
  if (multiple && activedOpt.length) {
    boxLabel = activedOpt.map((opt) => opt[labelKey]).join(", ");
  }
  if (!isUpdateActiveOpt) {
    boxLabel = defaultSelectLabel;
  }

  let isShowRequire = noteRequire;
  if (noteRequire && multiple && activedOpt.length) {
    isShowRequire = false;
  }

  return (
    <Listbox
      value={activedOpt}
      onChange={(value) => onChangeListbox(value)}
      multiple={multiple}
    >
      <div className={classNames("relative", className)}>
        {label && (
          <Listbox.Label className="block mb-1 text-sm font-medium text-gray-900">
            {isShowRequire && <span className="text-red-500">* </span>}
            {label}
            {multiple && activedOpt.length > 0 && (
              <span> ({activedOpt.length})</span>
            )}
          </Listbox.Label>
        )}
        <Listbox.Button
          className={classNames(
            "relative w-full cursor-pointer rounded border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm sm:text-sm",
            btnClassName
          )}
        >
          {boxLabel ? (
            <span className={classNames("block truncate", multiple && "")}>
              {boxLabel}
            </span>
          ) : (
            <span>{defaultSelectLabel}</span>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <BiChevronDown size={20} />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm">
            {listOption.map((opt, idx) => {
              const isMultipleSelect = multiple && isSelected(opt); // use when initial values
              const isSingeSelect = activedOpt[labelKey] === opt[labelKey]; // use when initial value

              return (
                <Listbox.Option
                  key={idx}
                  value={opt}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 focus:outline-none ${optClassName} ${
                      !optIcon && active
                        ? "bg-amber-100 text-amber-900"
                        : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => {
                    let optionIconEl = optIcon;
                    if (
                      !optIcon &&
                      (selected || isMultipleSelect || isSingeSelect)
                    ) {
                      optionIconEl = <AiOutlineCheck size={20} />;
                    }

                    return (
                      <>
                        <div className="flex items-center">
                          {imgKey && (
                            <img
                              src={opt[imgKey]}
                              alt=" "
                              className="w-7 h-7 rounded mr-2"
                            />
                          )}
                          <span
                            className={`block truncate ${
                              isMultipleSelect || selected
                                ? "font-medium"
                                : "font-normal"
                            }`}
                          >
                            {opt[labelKey]}
                          </span>
                        </div>
                        <span
                          className={classNames(
                            "absolute inset-y-0 left-0 flex items-center pl-3",
                            !optIcon && "text-amber-600"
                          )}
                        >
                          {optionIconEl}
                        </span>
                      </>
                    );
                  }}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

Select.defaultProps = {
  className: "",
  listOption: [],
  defaultLabel: "Select",
  labelKey: "name",
  btnClassName: "",
  optClassName: "",
  multiple: false,
  noteRequire: false,
  isUpdateActiveOpt: true,
};

Select.propTypes = {
  listOption: PropTypes.array.isRequired,
  labelKey: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  activedOpt: PropTypes.any,
  defaultLabel: PropTypes.string,
  label: PropTypes.string,
  imgKey: PropTypes.string,
  className: PropTypes.string,
  btnClassName: PropTypes.string,
  optClassName: PropTypes.string,
  multiple: PropTypes.bool,
  noteRequire: PropTypes.bool,
  isUpdateActiveOpt: PropTypes.bool,
  optIcon: PropTypes.node,
};

export default Select;
