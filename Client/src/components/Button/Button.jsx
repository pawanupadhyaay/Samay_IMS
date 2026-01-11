import React from "react";

function Button({ children, type, className, style, onClick }) {
  if (type == "submit") {
    return (
      <div className={className}>
        <input
          onClick={onClick}
          type="submit"
          value={children}
          className="py-2.5 px-5 me-2 mb-2 text-sm font-medium  focus:outline-none  rounded-lg appBorder  focus:z-10 focus:ring-1 focus:ring-gray-200 focus:ring-gary-200 bg-appBg-semilight text-gray-400  hover:text-white hover:bg-appBg-light transition ease-in-out"
        />
      </div>
    );
  }

  return (
    <div className={"w-full " + className}>
      <button
        onClick={onClick}
        type="button"
        className={
          "py-2.5 w-full px-5 me-2 text-sm font-medium  focus:outline-none  rounded-lg appBorder  focus:z-10 focus:ring-1 focus:ring-gray-700 focus:ring-gary-700 bg-app-txt-light text-appBg-dark  hover:text-white hover:ring-1 hover:ring-gray-200 hover:bg-appBg-light hover: transition ease-in-out " +
          style
        }
      >
        {children}
      </button>
    </div>
  );
}

export default Button;
