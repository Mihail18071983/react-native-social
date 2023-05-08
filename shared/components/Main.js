import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { useRoute } from "./routing";
import { authStateChangeUser } from "../../redux/auth/authOperations";

export const Main = () => {
  const { stateChange } = useSelector((state) => state.auth);
  console.log(stateChange)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authStateChangeUser());
  }, []);

    const routing = useRoute(stateChange);
    
  return <NavigationContainer>{routing}</NavigationContainer>;
};
