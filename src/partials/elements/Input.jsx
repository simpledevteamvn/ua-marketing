import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

function Input(props) {
  const {
    innerRef,
    className,
    labelClassName,
    inputClassName,
    id,
    placeholder,
    type,
    label,
    required,
    value,
    onChange,
    onBlur,
    onKeyDown,
    onKeyUp,
    disabled,
    noteRequire,
  } = props;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={`text-sm font-medium text-gray-900 ${labelClassName}`}
        >
          {noteRequire && <span className="text-red-500">* </span>}
          {label}
        </label>
      )}
      <input
        ref={innerRef}
        className={classNames("input-light", label && "mt-2", inputClassName)}
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
    </div>
  );
}

Input.defaultProps = {
  type: "text",
  className: "",
  label: "",
  labelClassName: "",
  inputClassName: "",
  required: false,
  disabled: false,
  noteRequire: false,
};

Input.propTypes = {
  innerRef: PropTypes.any,
  className: PropTypes.string,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  value: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  noteRequire: PropTypes.bool,
};

export default Input;
