import React from "react";
import Lottie from "lottie-react";
import historyAnimation from "./history.json"; // Ensure this file exists

const LottieHistory = ({ className }) => {
  return (
    <Lottie
      animationData={historyAnimation}
      className={className}
      loop
      style={{ width: 30, height: 30 }} // ✅ Increase size to match other icons
    />
  );
};

export default LottieHistory;
