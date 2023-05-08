import React from "react";

import PolyfillCrypto from 'react-native-webview-crypto'

import "react-native-get-random-values";


import { Provider } from "react-redux";

import { View } from "react-native";


import { StatusBar } from "expo-status-bar";

import { useFont } from "./shared/hooks/useFonts";

import { store} from "./redux/store";

import { Main } from "./shared/components/Main";

export default function App() {
  const { appIsReady, onLayoutRootView } = useFont();

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <PolyfillCrypto />
          <Main />
          <StatusBar style="auto" />
        </View>
    </Provider>
  );
}
