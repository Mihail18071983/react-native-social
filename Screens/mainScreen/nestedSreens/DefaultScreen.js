import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import { useDispatch } from "react-redux";

import { authLogOutUser } from "../../../redux/auth/authOperations";

import { Feather, FontAwesome } from "@expo/vector-icons";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import PostScreen from "../PostsScreen";

import CreatePostScreen from "../CreatePostsScreen";

import ProfileScreen from "../ProfileScreen";

const MainTab = createBottomTabNavigator();

const DefaultScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const logOut = () => {
    dispatch(authLogOutUser())
  }
  return (
    <View style={styles.screenWrapper}>
      <MainTab.Navigator
        initialRouteName="Profile"
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 83,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 80,
            paddingVertical: 20,
          },
        }}
      >
        <MainTab.Screen
          options={{
            tabBarIcon: ({ focused, size, color }) => (
              <Feather name="grid" size={size} color={color} />
            ),
            tabBarActiveBackgroundColor: "#FF6C00",
            tabBarActiveTintColor: "#FFFFFF",
            title: "Posts",
            headerTitleAlign: "center",
            headerRight: () => (
              <View style={styles.logoutWrapper}>
                <Feather
                  name="log-out"
                  size={24}
                  color="#BDBDBD"
                  onPress={logOut}
                />
              </View>
            ),
            tabBarItemStyle: { height: 40, borderRadius: 20 },
          }}
          name="Posts"
          component={PostScreen}
        />
        <MainTab.Screen
          options={{
            tabBarIcon: ({ focused, size, color }) => (
              <Feather name="plus" size={size} color={color} />
            ),
            tabBarActiveBackgroundColor: "#FF6C00",
            tabBarActiveTintColor: "#FFFFFF",
            title: "Create Post",
            headerTitleAlign: "center",
            tabBarItemStyle: { height: 40, borderRadius: 20 },
          }}
          name="Create"
          component={CreatePostScreen}
        />
        <MainTab.Screen
          options={{
            tabBarIcon: ({ focused, size, color }) => (
              <Feather name="user" size={size} color={color} />
            ),
            tabBarActiveBackgroundColor: "#FF6C00",
            tabBarActiveTintColor: "#FFFFFF",
            headerShown: false,
            headerTitleAlign: "center",
            tabBarItemStyle: { height: 40, borderRadius: 20 },
          }}
          name="Profile"
          component={ProfileScreen}
        />
      </MainTab.Navigator>
    </View>
  );
};

export default DefaultScreen;

const styles = StyleSheet.create({
  screenWrapper: {
    position: "relative",
    flex: 1,
  },
  iconWrapper: {
    width: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  logoutWrapper: {
    right:10
  }
});
