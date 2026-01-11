import lottie from "lottie-web";
import React, { useEffect, useRef, useState } from "react";
import data from "./layers(white).json";

function LottieLayer({ isplay, style, loop }) {
  const continer = useRef(null);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    var animate = lottie.loadAnimation({
      container: continer.current,
      renderer: "svg",
      loop: loop,
      autoplay: false,
      animationData: data,
    });
    animate.setSpeed(0.5);
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

export default LottieLayer;
