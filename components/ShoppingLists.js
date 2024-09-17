import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShoppingLists = ({ db, route, isConnected }) => {
  const { userID } = route.params;

  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");

  // Fetch shopping lists from Firestore (this will get the existing data at startup)
  const fetchShoppingLists = async () => {
    try {
      const q = query(
        collection(db, "shoppinglists"),
        where("uid", "==", userID)
      );
      const querySnapshot = await getDocs(q);
      let newLists = [];
      querySnapshot.forEach((doc) => {
        newLists.push({ id: doc.id, ...doc.data() });
      });
      setLists(newLists); // Set the lists after fetching
      cacheShoppingLists(newLists); // Cache the fetched data
    } catch (error) {
      console.log("Error fetching lists: ", error.message);
    }
  };

  
  console.log("Is Connected: ", isConnected);
  console.log(lists);

  // Cache shopping lists locally
  const cacheShoppingLists = async (listsToCache) => {
    try {
      await AsyncStorage.setItem(
        "shopping_lists",
        JSON.stringify(listsToCache)
      );
    } catch (error) {
      console.log("Error caching lists: ", error.message);
    }
  };

  // Load cached lists when offline
  const loadCachedLists = async () => {
    try {
      const cachedLists = await AsyncStorage.getItem("shopping_lists");
      if (cachedLists !== null) {
        setLists(JSON.parse(cachedLists));
      }
    } catch (error) {
      console.log("Error loading cached lists: ", error.message);
    }
  };

  // Real-time updates with Firestore snapshot
  let unsubShoppinglists;

  useEffect(() => {
    if (isConnected === true) {
      // Unregister any previous onSnapshot listener to avoid duplicate listeners
      if (unsubShoppinglists) unsubShoppinglists();
      unsubShoppinglists = null;

      // Fetch existing data on initial load (important to get pre-existing lists)
      fetchShoppingLists();

      const q = query(
        collection(db, "shoppinglists"),
        where("uid", "==", userID)
      );
      unsubShoppinglists = onSnapshot(q, (documentsSnapshot) => {
        let newLists = [];
        documentsSnapshot.forEach((doc) => {
          newLists.push({ id: doc.id, ...doc.data() });
        });
        console.log("Snapshot data:", newLists);
        cacheShoppingLists(newLists); // Cache real-time updated lists
        setLists(newLists); // Set lists with real-time data
      });
    } else {
      // Load cached data when offline
      loadCachedLists();
    }

    // Clean up code: unsubscribe from Firestore on component unmount
    return () => {
      if (unsubShoppinglists) unsubShoppinglists();
    };
  }, [isConnected]);

  const addShoppingList = async (newList) => {
    try {
      const newListRef = await addDoc(collection(db, "shoppinglists"), newList);
      if (newListRef.id) {
        setLists([newList, ...lists]);
        Alert.alert(`The list "${listName}" has been added.`);
      } else {
        Alert.alert("Unable to add. Please try later");
      }
    } catch (error) {
      Alert.alert("Error adding list: " + error.message);
    }
  };

  useEffect(() => {
    fetchShoppingLists();
  }, []);
  return (
    <View style={styles.container}>
      <FlatList
        style={styles.listsContainer}
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem} key={item.id}>
            <Text>
              {item.name}: {item.items.join(", ")}
            </Text>
          </View>
        )}
      />
      {isConnected === true && (
        <View style={styles.listForm}>
          <TextInput
            style={styles.listName}
            placeholder="List Name"
            value={listName}
            onChangeText={setListName}
          />
          <TextInput
            style={styles.item}
            placeholder="Item #1"
            value={item1}
            onChangeText={setItem1}
          />
          <TextInput
            style={styles.item}
            placeholder="Item #2"
            value={item2}
            onChangeText={setItem2}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              const newList = {
                uid: userID,
                name: listName,
                items: [item1, item2],
              };
              addShoppingList(newList);
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}
      {Platform.OS === "ios" && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    height: 70,
    justifyContent: "center",
    paddingHorizontal: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#AAA",
  },
  listForm: {
    margin: 15,
    padding: 15,
    backgroundColor: "#CCC",
  },
  listName: {
    height: 50,
    padding: 15,
    marginBottom: 15,
    borderColor: "#555",
    borderWidth: 2,
  },
  item: {
    height: 50,
    padding: 15,
    marginBottom: 15,
    borderColor: "#555",
    borderWidth: 2,
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#000",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
  },
});//

export default ShoppingLists;
