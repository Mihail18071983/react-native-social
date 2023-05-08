import React from "react";

import { useState, useEffect } from "react";

import MapView, { Marker } from "react-native-maps";

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  Platform,
} from "react-native";

const MapScreen = ({ route }) => {
  const { location, title } = route.params;
  console.log('route.params',route.params);
  console.log("location in maps", location);

  const [isInitialRegionSet, setIsInitialRegionSet] = useState(false);

   const initialRegion = {
     latitude: location.latitude,
     longitude: location.longitude,
     latitudeDelta: 0.001,
     longitudeDelta: 0.006,
   };
  
  const onChangeRegionComplete = () => {
    if (!isInitialRegionSet) 
    setIsInitialRegionSet(true);
  };
  return (
    <View style={styles.container}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onRegionChange={onChangeRegionComplete}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={title}
        />
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
