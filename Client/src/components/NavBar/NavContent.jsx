import LottieHome from "../Lottie/LottieHome/LottieHome";
import HomeImage from "../Lottie/LottieHome/system-regular-41-home(svg).svg";

import LottieCategory from "../Lottie/LottieCategory/LottieCategory";
import CategoryImage from "../Lottie/LottieCategory/category(svg).svg";

import LottieHistory from "../Lottie/LottieHistory/LottieHistory"; 
import HistoryImage from "../Lottie/LottieHistory/history.json"; 

import LottieBin from "../Lottie/LottieBin/LottieBin"; // ✅ Import Bin Animation
import BinImage from "../Lottie/LottieBin/bin.json"; // ✅ Import Bin JSON Animation

export const NavContent = [
  {
    id: 1,
    name: "DashBoard",
    path: "/",
    Icon: LottieHome,
    image: HomeImage,
  },
  {
    id: 2,
    name: "Products",
    path: "/products",
    Icon: LottieCategory,
    image: CategoryImage,
  },
  {
    id: 3,
    name: "History",
    path: "/history",
    Icon: LottieHistory,
    image: HistoryImage,
  },
  // {
  //   id: 4,
  //   name: "Bin", // ✅ Add Bin Button
  //   path: "/bin",
  //   Icon: LottieBin,
  //   image: BinImage,
  // },
];
