import React from "react";

import DefaultScreen from "./nestedSreens/DefaultScreen";

import MapScreen from "./nestedSreens/MapScreen";

import CommentScreen from "./nestedSreens/CommentsScreen";

import { createStackNavigator } from "@react-navigation/stack";

const AuthStack = createStackNavigator();

const HomeScreen = () => {
  return (
    <>
      <AuthStack.Navigator initialRouteName="default" >
        <AuthStack.Screen
          options={{ headerShown: false, headerTitleAlign:'center' }}
          name="default"
          component={DefaultScreen}
        />
        <AuthStack.Screen
          options={{ headerShown: true, headerTitleAlign:'center' }}
          name="Map"
          component={MapScreen}
        />
        <AuthStack.Screen
          options={{ headerShown: true, headerTitleAlign:'center' }}
          name="Comments"
          component={CommentScreen}
        />
      </AuthStack.Navigator>
    </>
  );
};

export default HomeScreen;
