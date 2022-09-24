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
  TouchableHighlight,
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
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');

  const addToAccount = () => {
    db.transaction((tx) => {
      if(type == 'expense'){
        tx.executeSql(
          'INSERT INTO ExpenseCategories (name, type) VALUES (?,1)',
          [name],
          (tx, results) => {
            navigation.navigate('Categories List')
          }
        );
      } else
      if(type == 'income'){
        tx.executeSql(
          'INSERT INTO IncomeCategories (name, type) VALUES (?,1)',
          [name],
          (tx, results) => {
            navigation.navigate('Categories List')
          }
        );
      }
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ padding: 8 }}>
        <TextInput 
            style={{ borderBottomWidth: 2, borderBottomColor: "#eee", marginBottom: 8 }} 
            value={type} 
            onChangeText={setType}
            placeholder="type"
            keyboardType='default'></TextInput>
        <TextInput 
            style={{ borderBottomWidth: 2, borderBottomColor: "#eee", marginBottom: 8 }} 
            value={name} 
            onChangeText={setName}
            multiline={true}
            placeholder="Name"
            keyboardType='default'></TextInput>
        <TouchableHighlight onPress={addToAccount} style={{ marginVertical: 16}}>
          <View style={{ padding: 16, backgroundColor: '#eee' }}>
              <Text style={{ textAlign: "center", fontWeight: "500" }}>Добавить</Text>
          </View>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;