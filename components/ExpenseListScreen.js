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
  const [dataByCat, setDataByCat] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expensesCountedTotal, setExpensesCountedTotal] = useState(0);
  const [expensesSumTotal, setExpensesSumTotal] = useState(0);
  const [expensesSumByCat, setExpensesSumByCat] = useState(0);

  const getItems = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT Expenses.*'+
        ', ExpenseCategories.color, ExpenseCategories.icon '+
        'FROM Expenses '+
        'JOIN ExpenseCategories ON ExpenseCategories.id = Expenses.category '+
        'ORDER BY '+
        'year DESC, '+
        'month DESC, '+
        'day DESC',
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
        }
      );
      tx.executeSql(
        'SELECT SUM(amount) as summ, category, ExpenseCategories.name, color, icon, type, is_counted '+
        'FROM Expenses '+
        'JOIN ExpenseCategories ON ExpenseCategories.id = Expenses.category '+ 
        'JOIN ExpenseCategoryType ON ExpenseCategoryType.id = ExpenseCategories.type '+ 
        'GROUP BY category '+
        'ORDER BY '+
        'is_counted DESC, '+
        'summ DESC ',
        [],
        (tx, results) => {
          let temp = []
          for (let i = 0; i < results.rows.length; ++i){
            temp.push(results.rows.item(i));
          }

          return setDataByCat(temp)
        },
        error=>console.log(error)
      );
      tx.executeSql(
          "SELECT SUM(amount) as total, ExpenseCategoryType.name as label, is_counted "+
          "FROM Expenses "+
          "JOIN ExpenseCategories ON ExpenseCategories.id = Expenses.category "+ 
          "JOIN ExpenseCategoryType ON ExpenseCategoryType.id = ExpenseCategories.type "+ 
          "GROUP BY ExpenseCategories.type ",
          [],
          (tx, results) => {
            if(results.rows.length == 0){
              return setExpensesSumByCat([]);
            }
            let totalSummCounted = 0;
            let temp = []
            for(let i = 0; i < results.rows.length; i++){
              let total = results.rows.item(i).total;
              let label = results.rows.item(i).label;
              let is_counted = results.rows.item(i).is_counted;

              if(is_counted == 1){ totalSummCounted += total}
              temp.push({'total': total, 'label':label})
            }
            setExpensesCountedTotal(totalSummCounted);
            return setExpensesSumByCat(temp);
          }
      );
      tx.executeSql(
          "SELECT SUM(amount) as total "+
          "FROM Expenses ",
          [],
          (tx, results) => {
              if(results.rows.length == 0){
                  return setExpensesSumTotal(0);
              }
              return setExpensesSumTotal(results.rows.item(0).total);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff"}}>
      { data.length > 0 ?
      (<FlatList 
        ListHeaderComponent={
          <View style={{ paddingVertical: 8, borderBottomColor: "#e8e8e8", borderBottomWidth: 1}}>
            <FlatList 
              ListHeaderComponent={
                <View style={{ padding: 16 }}>
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 48, color: '#333', textAlign: "center" }}>{fn(expensesSumTotal || 0)}</Text>
                    <Text style={{ fontSize: 12, color: '#333', textAlign: "center" }}>всего</Text>
                  </View>
                  <View style={{ paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
                    { expensesSumByCat.length > 0 ?
                      expensesSumByCat.map((item, index)=>{
                        return(
                          <View key={index}>
                            <Text style={{ fontSize: 32 - expensesSumByCat.length * 4, color: '#333', textAlign: "center" }}>{fn(item.total || 0)}</Text>
                            <Text style={{ fontSize: 16 - expensesSumByCat.length * 2, color: '#333', textAlign: "center" }}>{item.label}</Text>
                          </View>
                        )}) : null 
                    }                    
                  </View>
                </View>
              }

              data={dataByCat}
              keyExtractor={item => item.category}
              renderItem={({ item })=>{
                return (
                  <View style={{ padding: 0, marginBottom: 12, 
                    width: item.is_counted == 1 ? 60 + (item.summ*40/expensesCountedTotal)+'%' : '100%', 
                    backgroundColor: (item.is_counted ? '#'+item.color+'3' : '#fff'), 
                    flexDirection: "row", alignItems: "center", borderRadius: 6 }}>
                    <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 32, 
                      backgroundColor: (item.is_counted ? '#'+item.color : '#eee'), 
                      }}></View>
                    <Text style={{ padding: 8, width: 68, textAlign: 'center', color: '#333' }}>{ fn(item.summ) }</Text>
                    <Text style={{ padding: 8, color: '#333' }}>{ item.name }</Text>
                  </View>
                )
              }}
              />
              <View style={{ flexDirection: 'row', paddingTop: 8, paddingBottom: 32 }}>
                {dataByCat.map((item) => {
                  if(item.is_counted == 1){
                      return (
                        <View key={item.category} style={{ height: 10, width: item.summ*100/expensesCountedTotal+'%', borderRadius: 0,  backgroundColor: item.color ? "#"+item.color : "#aaa" }}></View>)
                    }
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
            <View style={{ flexDirection: "row", alignItems: "center", }}>
              <Text style={{ padding: 12,  width: 78, fontSize: 18, color: "#333", borderRightWidth: 4, borderRightColor: item.color ? "#"+item.color : "#ddd"  }}>
                { item.day < 10 ? '0' + item.day : item.day }/{ item.month < 10 ? '0' + item.month : item.month }</Text>
              <Text style={{ paddingVertical: 12, paddingLeft: 16,  fontSize: 18, color: "#333" }}>
                { fn(item.amount || 0) }
              </Text>
              { item.comment ?
                <Text style={{ paddingVertical: 0, paddingLeft: 12,  fontSize: 12, color: "#aaa", fontStyle: "italic" }}>
                  { item.comment.length > 20 ? item.comment.substring(0, 20) + '...' : item.comment }
                </Text> : null 
              }
            </View>
            <TouchableOpacity
              onPress={()=>{ navigation.navigate('Expense Edit', { item }) }}
              style={{ padding: 12, marginRight: 4, }}
              >
                <Image source={ require('../assets/icons/edit.png') } style={{ height: 24, width: 24, }}/>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getItems}
          />}
        ListFooterComponent={
          <View style={{ padding: 48, }}>
            <Text style={{ textAlign: 'center' }}>...</Text>
          </View>
        }
      />) : null }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;