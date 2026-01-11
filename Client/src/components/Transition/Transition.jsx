import { motion } from "framer-motion";
import { Fragment } from "react";

function Transition({ children, text }) {
  const windowSize = window.screen >= 768;
  windowSize;

  if (windowSize) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <motion.div
        className="slide-in flex justify-center items-center"
        initial={{
          scaleY: 0,
        }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      ></motion.div>
      <motion.div
        className="slide-out flex justify-center items-center"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* {text} */}
      </motion.div>
    </>
  );
}

export default Transition;
