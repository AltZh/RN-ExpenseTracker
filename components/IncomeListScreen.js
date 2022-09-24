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
  Image,
  FlatList,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';
import {formatNumber as fn} from '../functions/formatNumber';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  ()=>{},
  error=>{console.log(error)}
)

const StackScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dataByCat, setDataByCat] = useState([]);
  const [incomesSumTotal, setIncomesSumTotal] = useState(0);
  const [incomesSumByCat, setIncomesSumByCat] = useState([]);

  const getItems = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT Incomes.*, IncomeCategories.color, IncomeCategories.icon '+
        'FROM Incomes '+
        'JOIN IncomeCategories ON IncomeCategories.id = Incomes.category '+
        'ORDER BY '+
        'ABS(year) DESC, '+
        'ABS(month) DESC, '+
        'ABS(day) DESC',
        [],
        (tx, results) => {
          if(results.rows.length == 0){
            return setData([]);
          }
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i){
            temp.push(results.rows.item(i));
          }
          return setData(temp);
        },
        error=>console.log(error)
      );
      tx.executeSql(
        'SELECT SUM(amount) as summ, category, name, color, icon, type '+
        'FROM Incomes '+
        'JOIN IncomeCategories ON IncomeCategories.id = Incomes.category '+ 
        //'WHERE IncomeCategories.is_counted = 1 '+
        'GROUP BY category ', //+
        //'ORDER BY is_counted DESC ',
        [],
        (tx, results) => {
          let temp = []
          for (let i = 0; i < results.rows.length; ++i){
            temp.push(results.rows.item(i));
          }
          return setDataByCat(temp)
          // if(results.rows.length == 0){
          //   return setData([]);
          // }
          // let temp = [];
          // for (let i = 0; i < results.rows.length; ++i){
          //   temp.push(results.rows.item(i));
          // }
          // return setData(temp);
        }
      );
      tx.executeSql(
          "SELECT SUM(amount) as total, IncomeCategoryType.name as label "+
          "FROM Incomes "+
          "JOIN IncomeCategories ON IncomeCategories.id = Incomes.category "+ 
          "JOIN IncomeCategoryType ON IncomeCategoryType.id = IncomeCategories.type "+ 
          "GROUP BY IncomeCategories.type ",
          [],
          (tx, results) => {
            if(results.rows.length == 0){
              return setIncomesSumByCat([]);
            }
            let temp = []
            for(let i = 0; i < results.rows.length; i++){
              temp.push({'total': results.rows.item(i).total, 'label':results.rows.item(i).label})
            }
            return setIncomesSumByCat(temp);
          }
      );
      tx.executeSql(
          "SELECT SUM(amount) as total "+
          "FROM Incomes ",
          [],
          (tx, results) => {
              if(results.rows.length == 0){
                  return setIncomesSumTotal(0);
              }
              return setIncomesSumTotal(results.rows.item(0).total);
          }
      );
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
      { data.length > 0 ?
      (<FlatList 
        ListHeaderComponent={
          <View style={{ paddingVertical: 8, borderBottomColor: "#e8e8e8", borderBottomWidth: 1}}>
            <FlatList 
              ListHeaderComponent={
                <View style={{ padding: 16 }}>
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 48, color: '#333', textAlign: "center" }}>{fn(incomesSumTotal || 0)}</Text>
                    <Text style={{ fontSize: 12, color: '#333', textAlign: "center" }}>всего</Text>
                  </View>
                  <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
                    { incomesSumByCat.length > 0 ?
                        incomesSumByCat.map((item, index)=>{
                          return(
                            <View key={index}>
                              <Text style={{ fontSize: 24, color: '#333', textAlign: "center" }}>{fn(item.total || 0)}</Text>
                              <Text style={{ fontSize: 12, color: '#333', textAlign: "center" }}>{item.label}</Text>
                            </View>
                          )
                        }) : null
                      }
                  </View>
                </View>
              }

              data={dataByCat}
              keyExtractor={item => item.category}
              renderItem={({ item })=>{
                return (
                  <View style={{ padding: 0, marginBottom: 12, 
                    width: 75 + (item.summ*25/incomesSumTotal)+'%', 
                    backgroundColor: '#'+item.color+'3', 
                    flexDirection: "row", alignItems: "center", borderRadius: 6 }}>
                    <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 32, 
                      backgroundColor: '#'+item.color, 
                      }}></View>
                    <Text style={{ padding: 8, width: 68, textAlign: 'center', color: '#333' }}>{ fn(item.summ) }</Text>
                    <Text style={{ padding: 8, color: '#333' }}>{ item.name }</Text>
                  </View>
                )
              }}
              />
              <View style={{ flexDirection: 'row', paddingTop: 8, paddingBottom: 32 }}>
                {dataByCat.map((item) => {
                  //if(item.is_counted == 1){
                      return (
                        <View key={item.category} style={{ height: 10, width: item.summ*100/incomesSumTotal+'%', borderRadius: 0,  backgroundColor: item.color ? "#"+item.color : "#aaa" }}></View>)
                  //  }
                })}
              </View>
              <View>
                <Text style={{ paddingLeft: 6, }}>Подробный список</Text>
              </View>
          </View>
        }
        data={data}
        renderItem={ ({item}) =>(
          
          <View style={{ padding: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: "#e8e8e8", borderBottomWidth: 1 }}>
            <View style={{ padding: 0, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ padding: 12,  width: 78, fontSize: 18, borderRightColor: "#" + ( item.color || "ddd"), color: "#333", borderRightWidth: 4, }}>
                { item.day < 10 ? '0' + item.day : item.day }/{ item.month < 10 ? '0' + item.month : item.month }</Text>
              <Text style={{ paddingVertical: 8, paddingLeft: 16,  fontSize: 18, color: "#333" }}>{ fn(item.amount || 0) }</Text>
              { item.comment ?
                <Text style={{ paddingVertical: 0, paddingLeft: 12,  fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                  { item.comment.length > 20 ? item.comment.substring(0, 20) + '...' : item.comment }
                </Text> : null 
              }
            </View>
            
            <TouchableOpacity
              onPress={()=>{ navigation.navigate('Income Edit', { item }) }}
              style={{ padding: 12, marginRight: 4, }}
              >
                <Image source={ require('../assets/icons/edit.png') } style={{ height: 24, width: 24, }}/>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={{ flex: 1}}
        ListFooterComponent={()=>{
          return (
            <View>
              <Text>Итого ...</Text>
            </View>
          )
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
      />) : null }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;