import lottie from "lottie-web";
import React, { useEffect, useRef, useState } from "react";
import data from "./system-regular-41-home(white).json";
import "./LottieHome.css";

function LottieHome({ isplay, style, isHover, className }) {
  const continer = useRef(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    var animate = lottie.loadAnimation({
      container: continer.current,
      renderer: "svg",
      loop: true,
      autoplay: false,
      animationData: data,
    });
    animate.setSpeed(0.5);
    if (isplay || isHover) {
      animate.play();
    } else {
      animate.stop();
    }
    return () => {
      animate.destroy();
    };
  }, [isplay || isHover]);

  return (
    <div className={"icon " + className} ref={continer} style={style}></div>
  );
}

export default LottieHome;
