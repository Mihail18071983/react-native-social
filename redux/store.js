import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authReducer";

// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { persistStore, persistReducer } from "redux-persist";

// const persistConfig = {
//   key: "auth",
//   storage: AsyncStorage,
// };

// import {
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";

const rootReducer = combineReducers({
  [authSlice.name]: authSlice.reducer,
});

// export const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
// });
export const store = configureStore({
  reducer: rootReducer,
});

// export const persistor = persistStore(store);

