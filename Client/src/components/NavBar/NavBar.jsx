import React, { useState } from "react";
import "./NavBar.css";
import { NavContent } from "./NavContent";
import NavItem from "./NavItem/NavItem";
import LottieCross from "../Lottie/LottieCross/LottieCross";

import LinkWraper from "../LinkWraper/LinkWraper";
import LottieCart from "../Lottie/LottieCart/LottieCart";
import logoutIcon from "../../assets/icons/logout.svg";

function NavBar({ handleNav }) {
  return (
    <div className="nav_main text-appColor-light ">
      <div className="nav_head flex justify-between items-center md:justify-center md:items-center xl:p-0 md:p-0 pl-[2rem] pr-[2rem] xl:mt-[0] md:mt-[0] mt-[-3.2rem]">
        <div className="xl:block md:hidden hidden avatar_wraper w-[20%] h-[4rem] rounded-xl overflow-hidden mr-2">
          <LottieCart isplay={false} />
        </div>
        <h1 className="font-bold xl:text-3xl md:text-1 text-2xl tracking-wider text-appColor-dark">
          <img src="https://samaywatch.com/cdn/shop/files/Rectangle.svg?v=1698323423&width=360" alt="samay_logo" />
          <span className="nav_footer xl:text-[.65rem] md:text-[.55rem] md:block hidden text-appColor-dark  font-normal">
            <LinkWraper link={"mailto:sakthiveltofficial@gmail.com"}>
              Inventory
            </LinkWraper>
          </span>
        </h1>

        <div
          className="Nav_close_btn xl:hidden md:hidden block "
          onClick={() => {
            handleNav();
          }}
        >
          <LottieCross
            isplay={true}
            style={{ width: "25px", height: "25px", marginTop: "5px" }}
            loop={true}
          />
        </div>
      </div>
      <div className="nav_items">
        {NavContent.map((item, index) => {
          return (
            <NavItem
              key={index}
              name={item.name}
              path={item.path}
              Icon={item.Icon}
              image={item.image}
              handleNav={handleNav}
            />
          );
        })}
      </div>
      <div
        className="nav_footer text-[.9rem] flex justify-center items-center text-appColor-dark cursor-pointer"
        onClick={() => {
          localStorage.removeItem("token");
          history.go("/");
        }}
      >
        <img
          src={logoutIcon}
          className={"w-4 h-4 cursor-pointer text-white mr-2 "}
        />
        Log Out
      </div>
    </div>
  );
}

export default NavBar;
