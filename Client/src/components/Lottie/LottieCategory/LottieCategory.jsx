import lottie from "lottie-web";
import React, { useEffect, useRef, useState } from "react";
import data from "./category(white).json";

function LottieCategory({ isplay, style, isHover, className }) {
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
    animate.setSpeed(0.6);
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

export default LottieCategory;
