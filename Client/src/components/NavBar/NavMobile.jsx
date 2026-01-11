import React from "react";
import "./NavMobile.css";
import LottieLayer from "../Lottie/LottieLayer/LottieLayer";

function NavMobile({ handleNav }) {
  return (
    <div className="mobile_nav sticky xl:hidden md:hidden  bg-appBg-dark flex justify-between items-center p-[1rem] pl-[2rem] pr-[2rem]">
      <div className="mobile_nav_title font-bold text-2xl tracking-widest select-none">
        Inventry
      </div>
      <div
        className="mobile_nav_bar"
        onClick={() => {
          handleNav();
        }}
      >
        <LottieLayer
          style={{ width: "30px", height: "30px" }}
          isplay={true}
          loop={true}
        />
      </div>
    </div>
  );
}

export default NavMobile;
