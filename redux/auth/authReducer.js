import { createSlice } from "@reduxjs/toolkit";

const state = {
  userID: null,
  login: null,
  email:null,
  stateChange: false,
  userAvatar: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState: state,
  reducers: {
    updateUserProfile: (state, { payload }) => {
      console.log("updating userAvatar :", payload.userAvatar);
      return {
        ...state,
        userID: payload.userID,
        login: payload.login,
        email:payload.email,
        userAvatar:
          payload.userAvatar !== undefined
            ? payload.userAvatar
            : state.userAvatar,
      };
    },
    authStateChange: (state, { payload }) => ({
      ...state,
      stateChange: payload.stateChange,
    }),
    authLogOut: () => state,
  },
});
