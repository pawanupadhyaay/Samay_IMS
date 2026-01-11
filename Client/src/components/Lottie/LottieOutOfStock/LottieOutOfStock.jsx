import lottie from "lottie-web";
import React, { useEffect, useRef, useState } from "react";
import data from "./outOfStock.json";

function LottieOutOfStock({ isplay, style }) {
  const continer = useRef(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    var animate = lottie.loadAnimation({
      container: continer.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: data,
    });
    animate.setSpeed(0.2);

    if (isplay) {
      animate.play();
    } else {
      animate.stop();
    }
    return () => {
      animate.destroy();
    };
  }, [isplay]);

  return <div className="icon" ref={continer} style={style}></div>;
}

export default LottieOutOfStock;
