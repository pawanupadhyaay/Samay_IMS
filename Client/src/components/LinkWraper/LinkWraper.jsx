import React from "react";

function LinkWraper({ children, link }) {
  return (
    <a href={link} target="_blank" className="select-none">
      {children}
    </a>
  );
}

export default LinkWraper;
