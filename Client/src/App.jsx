import { useState } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import NavBar from "./components/NavBar/NavBar";
import NavMobile from "./components/NavBar/NavMobile";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import History from "./pages/History/History";  // ✅ Import History Page
import Footer from "./components/Footer/Footer";
import { Toaster } from "react-hot-toast";

function App() {
  const location = useLocation();
  const [navIsOpen, setNavIsOpen] = useState(false);

  function handleNav() {
    setNavIsOpen(!navIsOpen);
  }

  return (
    <div className="main_wraper flex xl:flex-row md:flex-row flex-col">
      <NavMobile handleNav={handleNav} />
      <div
        className={
          "nav_wraper bg-appBg-dark xl:static md:static absolute top-0 left-0 z-50 xl:w-[15%] md:w-[15%] w-[100%] xl:h-[100vh] md:h-[100vh] overflow-hidden " +
          (navIsOpen ? "navOpen" : "navClose")
        }
      >
        <NavBar handleNav={handleNav} />
      </div>
      <div className="continar_wraper bg-appBg-light xl:w-[85%] md:w-[85%] w-[100%]">
        <div className="continar">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/history" element={<History />} /> {/* ✅ Added History Route */}
            </Routes>
          </AnimatePresence>
        </div>
        <div className="flex flex-col align-bottom">
          <Footer className="mt-auto" />
        </div>
      </div>
    </div>
  );
}

export default Auth(App);
