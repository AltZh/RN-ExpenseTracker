import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Dimensions,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
  FlatList,
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
  const [expenseCatTypes, setExpenseCatTypes] = useState([]);
  const [incomeCatTypes, setIncomeCatTypes] = useState([]);
  const [expenseCats, setExpenseCats] = useState([]);
  const [incomeCats, setIncomeCats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getItems = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM ExpenseCategoryType',
        [],
        (tx, results) => {
          if(results.rows.length == 0){
            return setExpenseCatTypes([]);
          }
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i){
            let cat_type = results.rows.item(i);
            temp.push(cat_type);
          }

          return setExpenseCatTypes(temp);
        }
      )
      tx.executeSql(
        'SELECT * FROM IncomeCategoryType',
        [],
        (tx, results) => {
          if(results.rows.length == 0){
            return setIncomeCatTypes([]);
          }
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i){
            let cat_type = results.rows.item(i);
            temp.push(cat_type);
          }

          return setIncomeCatTypes(temp);
        }
      )
      tx.executeSql(
        'SELECT ExpenseCategories.*, ExpenseCategoryType.name as type_name FROM ExpenseCategories ' +
        'JOIN ExpenseCategoryType ON ExpenseCategories.type = ExpenseCategoryType.id',
        [],
        (tx, results) => {
          if(results.rows.length == 0){
            return setExpenseCats([]);
          }
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i){
            let cat = results.rows.item(i)
            temp.push(cat);
          }

          return setExpenseCats(temp);
        },
        error=>console.log(error)
      )
      tx.executeSql(
        'SELECT IncomeCategories.*, IncomeCategoryType.name as type_name FROM IncomeCategories ' +
        'JOIN IncomeCategoryType ON IncomeCategories.type = IncomeCategoryType.id',
        [],
        (tx, results) => {
          if(results.rows.length == 0){
            return setIncomeCats([]);
          }
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i){
            temp.push(results.rows.item(i));
          }
          return setIncomeCats(temp);
        }
      )
    })
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getItems()
    });
    return unsubscribe;
  }, [navigation]);
  
  return (
    <SafeAreaView style={{ backgroundColor: "#fff"}}>
      { expenseCats.length > 0 ?
      (<FlatList 
        data={expenseCats}
        renderItem={ ({item}) =>(
          <TouchableOpacity
            onPress={()=>{ navigation.navigate('Category Edit', { item, type:'expense' }) }}
            >
            <View style={{ padding: 4, flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 16, backgroundColor: item.color ? "#"+item.color : "#aaa" }}></View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                <Text style={{ padding: 8,  fontSize: 18, color: "#333" }}>{ item.name }</Text>
                <Text style={{ padding: 8,  fontSize: 14, color: "#aaa" }}>{ item.type_name }</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{  }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
      />) : null }
      { incomeCats.length > 0 ?
      (<FlatList 
        data={incomeCats}
        renderItem={ ({item}) =>(
          <TouchableOpacity
            onPress={()=>{ navigation.navigate('Category Edit', { item, type:'income' }) }}
            >
            <View style={{ padding: 4, flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 16, backgroundColor: item.color ? "#"+item.color : "#aaa"}}></View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: 'space-between' }}>
                <Text style={{ padding: 8,  fontSize: 18, color: "#333" }}>{ item.name }</Text>
                <Text style={{ padding: 8,  fontSize: 14, color: "#aaa" }}>{ item.type_name }</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ flex: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
      />) : null }
      {/* { expenseCatTypes.length > 0 ?
      (<FlatList 
        data={expenseCatTypes}
        renderItem={ ({item}) => (
          <TouchableOpacity
            onPress={()=>{ navigation.navigate('Category Edit', { item, type:'expense' }) }}
            >
            <View style={{ padding: 4, flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 16, backgroundColor: item.color ? "#"+item.color : "#aaa"}}></View>
              <Text style={{ padding: 8,  fontSize: 18, color: "#333" }}>{ item.name }</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{  }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
      />) : null }
      { incomeCatTypes.length > 0 ?
      (<FlatList 
        data={incomeCatTypes}
        renderItem={ ({item}) => (
          <TouchableOpacity
            onPress={()=>{ navigation.navigate('Category Edit', { item, type:'expense' }) }}
            >
            <View style={{ padding: 4, flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 16, backgroundColor: item.color ? "#"+item.color : "#aaa"}}></View>
              <Text style={{ padding: 8,  fontSize: 18, color: "#333" }}>{ item.name }</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{  }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
      />) : null } */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;