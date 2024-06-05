import React from "react";
import PropTypes from "prop-types";

const Checkbox = (props) => {
  const { id, label, required, checked, onChange } = props;

  return (
    <>
      <div className="flex items-center h-5">
        <input
          id={id}
          aria-describedby={id}
          type="checkbox"
          className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-600 dark:ring-offset-gray-800"
          required={required}
          checked={checked}
          onChange={onChange}
        />
      </div>
      <div className="ml-1.5 sm:ml-2 text-sm">
        <label htmlFor={id} className="text-gray-500 dark:text-gray-300">
          {label}
        </label>
      </div>
    </>
  );
};

Checkbox.defaultProps = {
  required: false,
};

Checkbox.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Checkbox;
