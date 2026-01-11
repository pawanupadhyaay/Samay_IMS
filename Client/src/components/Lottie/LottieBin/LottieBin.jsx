import React from "react";
import Lottie from "lottie-react";
import BinAnimation from "./Bin.json"; // ✅ Ensure bin.json exists in the same folder

const LottieBin = ({ isplay, isHover, className }) => {
    return (
        <Lottie
          animationData={BinAnimation}
          className={className}
          loop
          style={{ width: 30, height: 30 }} // ✅ Increase size to match other icons
        />
      );
};

export default LottieBin;
