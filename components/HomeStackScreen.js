import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Dimensions,
  TouchableOpacity,  
  RefreshControl, 
  TextInput,
  Pressable,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";

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
  const isDarkMode = useColorScheme() === 'dark';
  const [startingBalance, setStartingBalance] = useState(0); //4839666
  const [data, setData] = useState([]);
  const [dataLabels, setDataLabels] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(startingBalance);
  const [currentBalanceUpdatedAt, setCurrentBalanceUpdatedAt] = useState('');

  const [incomesByCat, setIncomesByCat] = useState([]);
  const [incomesSumTotal, setIncomesSumTotal] = useState(0);
  const [incomesSumByCat, setIncomesSumByCat] = useState([]);

  const [expensesByCat, setExpensesByCat] = useState([]);
  const [expensesCountedTotal, setExpensesCountedTotal] = useState(0);
  const [expensesSumTotal, setExpensesSumTotal] = useState(0);
  const [expensesSumByCat, setExpensesSumByCat] = useState(0);

  const checkAccount = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "SELECT amount, updated_at FROM AccountBalance",
            [],
            (tx, results) => {
              setCurrentBalanceUpdatedAt(results.rows.item(0).updated_at)
                return setCurrentBalance(results.rows.item(0).amount)
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
            return setIncomesByCat(temp)
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

            return setExpensesByCat(temp)
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
      <ScrollView>
        {data.length > 0 ? 
        (<View>
          <LineChart
            data={{
              labels: dataLabels,
              datasets: [
                { data }
              ]
            }}
            width={Dimensions.get("window").width} // from react-native
            height={220}
            yAxisLabel="+"
            yAxisSuffix="k"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundColor: "#9DC100",
              backgroundGradientFrom: "#4FC5F0",
              backgroundGradientTo: "#3DD8D9",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            bezier
            style={{
              marginVertical: 0,
              borderRadius: 0
            }}
          />
        </View>) : null }
        
        <View style={{ paddingVertical: 0, borderBottomColor: "#e1e1e1", borderBottomWidth: 40}}>
          <View style={{ paddingVertical: 48, backgroundColor: "#fff" }}>
              <Text style={{ fontSize: 24, color: '#333', textAlign: "center" }}>Текущий Баланс</Text>
              <Text style={{ paddingVertical: 16, fontSize: 48, fontWeight: "500", color: "#333", justifyContent: "center", textAlign: "center" }}>{ fn(currentBalance) }</Text>
              <Text style={{ fontSize: 12, color: '#333', textAlign: "center" }}>{ currentBalanceUpdatedAt }</Text>
          </View>
          {incomesSumTotal > 0 && expensesSumTotal > 0 ?
            <View style={{ flexDirection: "row", justifyContent: "space-between"}}>
              <View style={{ flex: .7 + Number(incomesSumTotal/expensesSumTotal),  paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#3c0a" }}>
                  <Text style={{ color: '#333' }}>+ { fn(incomesSumTotal || 0) }</Text>
              </View>
              <View style={{ flex: .7 + Number(expensesSumTotal/incomesSumTotal), flexDirection: "row", }}>
                { expensesSumTotal-expensesCountedTotal > 0 ? 
                  <>
                    <View style={{ flex: 1 + expensesCountedTotal/expensesSumTotal, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#fa0a" }}></View>
                    <View style={{ flex: 1 + expensesSumTotal/(expensesCountedTotal + 1), flexDirection: "row", justifyContent: 'flex-end', paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#fa06" }}>
                      <Text style={{ color: '#333', textAlign: "right" }}>- { fn(expensesSumTotal-expensesCountedTotal || 0) }</Text>
                      <Text style={{ color: '#333', textAlign: "right" }}> / { fn(expensesSumTotal || 0) }</Text>
                    </View>
                  </>
                  : 
                  <>
                    <View style={{ flex: 1, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#fa0a" }}>
                      <Text style={{ color: '#333', textAlign: "right" }}>- { fn(expensesSumTotal || 0) }</Text>
                    </View>
                  </>
                }
              </View>
            </View> : null 
          }
          <View>
            <TouchableOpacity onPress={()=>{ navigation.navigate('Expense Create')}} style={{ marginVertical: 0}}>
              <View style={{ padding: 16, backgroundColor: '#eee' }}>
                  <Text style={{ textAlign: "right", fontWeight: "500", color: '#333' }}>Добавить в расходы &rarr;</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{ navigation.navigate('Debug')}} style={{ marginVertical: 0}}>
              <View style={{ padding: 16, backgroundColor: '#eee' }}>
                  <Text style={{ textAlign: "right", fontWeight: "500", color: '#333' }}>Корректировка баланса &rarr;</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ paddingVertical: 0, borderBottomColor: "#e1e1e1", borderBottomWidth: 40}}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, color: '#333', textAlign: "center" }}>Сводка по доходам</Text>
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
          {incomesByCat.map((item, index) => (
            <View key={index} style={{ padding: 0, marginBottom: 12, 
              width: 75 + (item.summ*25/incomesSumTotal)+'%', 
              backgroundColor: '#'+item.color+'3', 
              flexDirection: "row", alignItems: "center", borderRadius: 6 }}>
              <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 32, 
                backgroundColor: '#'+item.color, 
                }}></View>
              <Text style={{ padding: 8, width: 68, textAlign: 'center', color: '#333' }}>{ fn(item.summ) }</Text>
              <Text style={{ padding: 8, color: '#333' }}>{ item.name }</Text>
            </View>
          ))}
          <View>
            <TouchableOpacity onPress={()=>{ navigation.navigate('Incomes List')}} style={{ marginVertical: 0}}>
              <View style={{ padding: 16, backgroundColor: '#eee' }}>
                  <Text style={{ textAlign: "right", fontWeight: "500", color: '#333' }}>Посмотреть все доходы &rarr;</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingVertical: 0, borderBottomColor: "#e8e8e8", borderBottomWidth: 40}}>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, color: '#333', textAlign: "center" }}>Сводка по расходам</Text>
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
          {expensesByCat.map((item, index) => (
            <View key={index} style={{ padding: 0, marginBottom: 12, 
              width: item.is_counted == 1 ? 60 + (item.summ*40/expensesCountedTotal)+'%' : '100%', 
              backgroundColor: (item.is_counted ? '#'+item.color+'3' : '#fff'), 
              flexDirection: "row", alignItems: "center", borderRadius: 6 }}>
              <View style={{ marginLeft: 8, width: 16, height: 16, borderRadius: 32, 
                backgroundColor: (item.is_counted ? '#'+item.color : '#eee'), 
                }}></View>
              <Text style={{ padding: 8, width: 68, textAlign: 'center', color: '#333' }}>{ fn(item.summ) }</Text>
              <Text style={{ padding: 8, color: '#333' }}>{ item.name }</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', paddingTop: 8, paddingBottom: 32 }}>
            {expensesByCat.map((item) => {
              if(item.is_counted == 1){
                  return (
                    <View key={item.category} style={{ height: 10, width: item.summ*100/expensesCountedTotal+'%', borderRadius: 0,  backgroundColor: item.color ? "#"+item.color : "#aaa" }}></View>)
                }
            })}
          </View>
          <View>
            <TouchableOpacity onPress={()=>{ navigation.navigate('Expense Create')}} style={{ marginVertical: 0}}>
              <View style={{ padding: 16, backgroundColor: '#eee' }}>
                  <Text style={{ textAlign: "right", fontWeight: "500", color: '#333' }}>Добавить в расходы &rarr;</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{ navigation.navigate('Expenses List')}} style={{ marginVertical: 0}}>
              <View style={{ padding: 16, backgroundColor: '#eee' }}>
                  <Text style={{ textAlign: "right", fontWeight: "500", color: '#333' }}>Посмотреть все расходы &rarr;</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>


        <View style={{ padding: 0, }}>
          <TouchableOpacity onPress={()=>{ navigation.navigate('Categories List')}} style={{ marginVertical: 0}}>
            <View style={{ padding: 16, backgroundColor: '#eee' }}>
                <Text style={{ textAlign: "center", fontWeight: "500" }}>Список категорий</Text>
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={checkAccount} style={{ marginVertical: 0}}>
            <View style={{ padding: 16, backgroundColor: '#eee' }}>
                <Text style={{ textAlign: "center", fontWeight: "500" }}>Update</Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;