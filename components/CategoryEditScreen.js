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
  ScrollView,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';
import ColorPicker from './ColorPicker';
// import IconPicker from './IconPicker';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  ()=>{},
  error=>{console.log(error)}
)

const StackScreen = ({ navigation, route }) => {
  const { item, type } = route.params;

  console.log(type)

  const isDarkMode = useColorScheme() === 'dark';
  const [name, setName] = useState(item.name || '');
  const [color, setColor] = useState(item.color || '');
  const [icon, setIcon] = useState(item.icon || '');
  const [catType, setCatType] = useState(String(item.type) || '');


  const updateItem = () => {
    db.transaction((tx) => {
      if(type == 'expense'){
        tx.executeSql(
          'UPDATE ExpenseCategories set name=?,color=?,icon=?,type=? where id=?',
          [name, color, icon, catType, item.id],
          (tx, results) => {
            navigation.navigate('Categories List')
          }
        );
      }
      if(type == 'income'){
        tx.executeSql(
          'UPDATE IncomeCategories set name=?,color=?,icon=?,type=? where id=?',
          [name, color, icon, catType, item.id],
          (tx, results) => {
            navigation.navigate('Categories List')
          }
        );
      }
    })
  } 

  const deleteItem = () => {
    db.transaction((tx) => {
      if(type == 'expense'){
        tx.executeSql(
          'DELETE FROM ExpenseCategories where id=?',
          [item.id],
          (tx, results) => {
            navigation.navigate('Categories List')
          }
        );
      }
      if(type == 'income'){
        tx.executeSql(
          'DELETE FROM IncomeCategories where id=?',
          [item.id],
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
      <ScrollView>
        <View style={{ padding: 8 }}>
          <TextInput 
              style={{ borderBottomWidth: 2, borderBottomColor: "#eee", marginBottom: 8 }} 
              value={name} 
              onChangeText={setName}
              multiline={true}
              placeholder="Name"
              keyboardType='default'></TextInput>
          <ColorPicker 
            value={color}
            onChange={setColor}
          />
          <TextInput 
              style={{ borderBottomWidth: 2, borderBottomColor: "#eee", marginBottom: 8 }} 
              value={icon} 
              onChangeText={setIcon}
              multiline={true}
              placeholder="Icon"
              keyboardType='default'></TextInput>
          <TextInput 
              style={{ borderBottomWidth: 2, borderBottomColor: "#eee", marginBottom: 8 }} 
              value={catType} 
              onChangeText={setCatType}
              multiline={true}
              placeholder="isCounted"
              keyboardType='default'></TextInput>
          <TouchableHighlight onPress={updateItem} style={{ marginVertical: 16}}>
            <View style={{ padding: 16, backgroundColor: '#eee' }}>
                <Text style={{ textAlign: "center", fontWeight: "500" }}>Сохранить</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={deleteItem} style={{ marginVertical: 16}}>
            <View style={{ padding: 16, backgroundColor: '#eee' }}>
                <Text style={{ textAlign: "center", fontWeight: "500" }}>Удалить</Text>
            </View>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;