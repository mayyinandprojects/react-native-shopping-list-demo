// import react Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ShoppingLists from "./components/ShoppingLists";
import Welcome from "./components/Welcome";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { LogBox, Alert } from "react-native";
LogBox.ignoreLogs(["AsyncStorage has been extracted from"]);

// Create the navigator
const Stack = createNativeStackNavigator();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";

const App = () => {
  // const firebaseConfig = {
  //   apiKey: "AIzaSyDZqoA9ZuQE2c_xZtUwHp2HA16MZf-ygTk",
  //   authDomain: "shopping-list-demo-ab103.firebaseapp.com",
  //   projectId: "shopping-list-demo-ab103",
  //   storageBucket: "shopping-list-demo-ab103.appspot.com",
  //   messagingSenderId: "561660294699",
  //   appId: "1:561660294699:web:91af5f8503798d8f5c5c6e",
  // };

  const firebaseConfig = {
    apiKey: "AIzaSyBB6cLj6sb6lxR6OmL7HTJSdrTss5oO4ac",
    authDomain: "shopping-list-da23e.firebaseapp.com",
    projectId: "shopping-list-da23e",
    storageBucket: "shopping-list-da23e.appspot.com",
    messagingSenderId: "611245152182",
    appId: "1:611245152182:web:634a8ab1b4474daa1dd317"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  //define a new state that represents the network connectivity status
  const connectionStatus = useNetInfo();

  //display an alert popup if connection is lost
  //Note that connectionStatus.isConnected is used as a dependency value of useEffect().
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="ShoppingLists">
          {(props) => (
            <ShoppingLists
              isConnected={connectionStatus.isConnected}
              db={db}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
