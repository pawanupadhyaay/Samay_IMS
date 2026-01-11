import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./NavItem.css";

function NavItem({ name, Icon, path, handleNav }) {
  const [isPlay, setIsPlay] = useState(false);
  const iconStyle = "w-[30px] h-[30px]"; // ✅ Make size equal for all icons

  return (
    <NavLink
      to={path}
      className={({ isActive }) => {
        setIsPlay(isActive);
      }}
      onClick={handleNav}
    >
      <div className="item_wraper xl:p-[1.5rem] md:p-[1rem] p-[1.5rem] flex items-center cursor-pointer">
        <div className="nav_item_icon">
          <Icon className={iconStyle} isplay={isPlay} />
        </div>
        <div className="nav_item text-appColor-dark xl:font-semibold md:font-semibold font-semibold tracking-normal transition-all ease-linear duration-300">
          {name}
        </div>
      </div>
    </NavLink>
  );
}

export default NavItem;
