import React from "react";
import PropTypes from "prop-types";

function InputBox({
  name,
  placeholder,
  className = "",
  icon,
  iconClass = "",
  iconStyle = {},
  value,
  setValue,
  idName,
  type = "text", // Added type for flexibility (e.g., text, number, email)
  required = false, // Add required prop to support validation
  maxLength, // Add maxLength for input restrictions
  minLength, // Add minLength for input restrictions
  readOnly = false, // Add readOnly prop for uneditable fields
  disabled = false, // Add disabled prop for disabled fields
  error, // Optional error message
}) {
  return (
    <div className="w-full">
      <label
        htmlFor={idName}
        className="block mb-2 text-sm font-medium text-white"
      >
        {name}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative mb-6">
        {icon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <img
              style={iconStyle}
              src={icon}
              alt={`${name} icon`}
              className={`w-6 h-6 text-white ${iconClass}`}
            />
          </div>
        )}
        <input
          name={idName}
          type={type}
          id={idName}
          className={`outline-appBorder appBorder text-sm rounded-lg focus:border-appLine block w-full ${
            icon ? "ps-10 " : ""
          }p-2.5 bg-appBg-semilight placeholder-gray-400 text-white focus:ring-appLine ${className} ${
            error ? "border-red-500" : ""
          }`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${idName}-error` : undefined}
        />
        {error && (
          <p id={`${idName}-error`} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

InputBox.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  icon: PropTypes.string,
  idName: PropTypes.string.isRequired, 
  placeholder: PropTypes.string,
};
export default InputBox;
