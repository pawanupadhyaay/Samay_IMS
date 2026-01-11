/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/display-name */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import axios from "axios";

function Auth(WrapedComponent) {
  return (props) => {
    const [user, setUser] = useState(localStorage.getItem("token") || false);
    const [authScreen, setAuthScreen] = useState("login");

    useEffect(() => {
      if (localStorage.getItem("token")) {
        axios
          .get(`${import.meta.env.VITE_API_URL}/auth/protected`, {
            headers: { "x-auth-token": localStorage.getItem("token") },
          })
          .then((data) => {
            setUser(data.data);
            data;
          })
          .catch((error) => {
            error;
            setUser(false);
            localStorage.removeItem("token");
          });
      }
    }, []);

    "the user is : ", user;
    typeof user;
    function login() {
      localStorage.setItem("user", true);
      setUser(localStorage.getItem("user"));
    }

    function logout() {
      localStorage.setItem("user", "");
      setUser(localStorage.getItem("user"));
    }

    if (!user) {
      if (authScreen == "login")
        return <Login setUser={login} setAuthScreen={setAuthScreen} />;
      return <Signup setAuthScreen={setAuthScreen} />;
    }

    return <WrapedComponent {...props} setUser={setUser} logout={logout} />;
  };
}

export default Auth;
