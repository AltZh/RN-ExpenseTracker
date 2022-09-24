import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Dimensions,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  ()=>{},
  error=>{console.log(error)}
)

const StackScreen = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [startingBalance, setStartingBalance] = useState(4839666+163086-356752);
  const [balance, setBalance] = useState('');

  
  const checkAccount = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "SELECT amount FROM AccountBalance",
            [],
            (tx, results) => {
              return setBalance(String(results.rows.item(0).amount))
            },
            error=>console.log(error)
        );
    })
  }
  const updateAccount = () => {
    db.transaction((tx) => {

      tx.executeSql(
        "UPDATE AccountBalance SET amount=?", [balance]
      )
      // tx.executeSql(
      //   "CREATE TABLE IF NOT EXISTS "+
      //   "ExpenseCategoryType "+
      //   "(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(10), is_counted INTEGER(1) DEFAULT(1))", []
      // )
      
      // tx.executeSql(
      //   "DROP TABLE IF EXISTS "+
      //   "ExpenseCategories", [],
      //   (tx, results) => {
      //   },
      //   (error)=>console.log(error)
      // )

      // tx.executeSql(
      //   "CREATE TABLE IF NOT EXISTS "+
      //   "ExpenseCategories "+
      //   "(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(10), color VARCHAR(10), icon VARCHAR(255), type INTEGER(11) DEFAULT(1))", []
      // )

      tx.executeSql("SELECT * FROM sqlite_master WHERE type='table';", [],
        (tx, results) => {
          for(let i = 0; i < results.rows.length; i++){
            console.log(results.rows.item(i))
          }
        },
        (error)=>console.log(error)
      )
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAccount();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, padding: 8 }}>
        <TextInput 
          style={{ color: '#333', borderBottomWidth: 1, fontSize: 18}}
          value={balance} 
          onChangeText={setBalance}
        />  
      </View>
      <View style={{ padding: 8 }}>
        <TouchableOpacity onPress={updateAccount} style={{ }}>
          <View style={{ padding: 16, backgroundColor: '#ffa', borderRadius: 8, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderBottomWidth: 2, borderBottomColor: '#990' }}>
              <Text style={{ color: '#333', textAlign: "center", fontWeight: "600" }}>ОБНОВИТЬ</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;