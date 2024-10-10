import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ToastAndroid,
  ScrollView,
} from "react-native";
import { IconButton } from "react-native-paper";
import {
  firestore,
  SHOPPINGLIST,
  addDoc,
  doc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
} from "./firebase/Config";
import { useState, useEffect } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const handleAdd = async () => {
    try {
      await addDoc(collection(firestore, SHOPPINGLIST), {
        text,
      });
      setText("");
    } catch (error) {
      ToastAndroid.show("Error while adding new item", ToastAndroid.SHORT);
      console.error("Error adding document: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, SHOPPINGLIST, id));
      ToastAndroid.show("Item deleted", ToastAndroid.SHORT);
    } catch (error) {
      ToastAndroid.show("Error while deleting item", ToastAndroid.SHORT);
      console.error("Error deleting document: ", error);
    }
  };

  useEffect(() => {
    const q = query(collection(firestore, SHOPPINGLIST));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const itemsArray = [];
        querySnapshot.forEach((doc) => {
          itemsArray.push({ id: doc.id, ...doc.data() });
        });
        setItems(itemsArray);
      },
      (error) => {
        console.error("Error with Firestore connection: ", error);
        ToastAndroid.show("Failed to connect to Firestore", ToastAndroid.LONG);
        setError("Failed to connect to Firestore. Please try again later.");
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Add new item"
          value={text}
          onChangeText={setText}
        />
        <Button title="Add" onPress={handleAdd} />
      </View>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      <ScrollView>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.text}>{item.text}</Text>
            <IconButton
              icon="trash-can-outline"
              size={30}
              onPress={() => handleDelete(item.id)}
            />
          </View>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    marginTop: 50,
    padding: 20,
  },
  form: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  item: {
    margin: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 0.5,
  },
  text: {
    fontSize: 20,
  },
  input: {
    fontSize: 20,
    width: "70%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
});
