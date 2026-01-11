import React from "react";

function TextArea({ name, placeholder, nLines, value, setValue, idName }) {
  return (
    <div>
      <label
        htmlFor="message"
        class="block mb-2 text-sm font-medium  text-white"
      >
        {name}
      </label>
      <textarea
        name={idName}
        id="message"
        rows={nLines}
        className="outline-appBorder block p-2.5 w-full text-sm   rounded-lg appBorder   bg-appBg-semilight  placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      ></textarea>
    </div>
  );
}

export default TextArea;
