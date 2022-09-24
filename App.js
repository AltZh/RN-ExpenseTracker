import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeStackScreen from './components/HomeStackScreen';
import ExpenseListScreen from './components/ExpenseListScreen';
import ExpenseCreateScreen from './components/ExpenseCreateScreen';
import ExpenseEditScreen from './components/ExpenseEditScreen';

import IncomeListScreen from './components/IncomeListScreen';
import IncomeEditScreen from './components/IncomeEditScreen';
import IncomeCreateScreen from './components/IncomeCreateScreen';

import CategoryListScreen from './components/CategoryListScreen';
import CategoryEditScreen from './components/CategoryEditScreen';
import CategoryCreateScreen from './components/CategoryCreateScreen';

import CategoryTypeCreateScreen from './components/CategoryTypeCreateScreen';

import DebugScreen from './components/DebugScreen';

import SQLite from 'react-native-sqlite-storage';
import { TouchableOpacity, Text } from 'react-native';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  success=>{console.log(success)},
  error=>{console.log(error)}
)



const App = () => {

  const Stack = createNativeStackNavigator();

  useEffect(()=>{
    createTable();
  }, [])

  const createTable = () => {
    db.transaction((tx) => {
      // tx.executeSql(
      //   "DROP TABLE IF EXISTS "+
      //   "AccountBalance ", []
      // )
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "+
        "AccountBalance "+
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, amount INTEGER(255), updated_at VARCHAR(255))", [],
        ()=>{},
        error =>console.log(error)
      )
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "+
        "Incomes "+
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, amount INTEGER(255), comment TEXT, day VARCHAR(255), month VARCHAR(255), year VARCHAR(255), is_payed INTEGER(11), category INTEGER(255))", [],
        ()=>{},
        error =>console.log(error)
      )
      // tx.executeSql(
      //   "ALTER TABLE Incomes "+
      //   "ADD day INTEGER(11)", []
      // )
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "+
        "IncomeCategories "+
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(10), color VARCHAR(10), icon VARCHAR(255), type INTEGER(11) DEFAULT(1))", []
      )
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "+
        "ExpenseCategories "+
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(10), color VARCHAR(10), icon VARCHAR(255), type INTEGER(11) DEFAULT(1))", []
      )
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS "+
        "Expenses "+
        "(id INTEGER PRIMARY KEY AUTOINCREMENT, date VARCHAR(10), day INTEGER(11), month INTEGER(11), year INTEGER(11), amount INTEGER, category INTEGER,comment TEXT)", []
      )
      // tx.executeSql(
      //   "ALTER TABLE Expenses "+
      //   "ADD is_payed INTEGER(11)", []
      // )
      // tx.executeSql(
      //   "ALTER TABLE Expenses "+
      //   "ADD day INTEGER(11)", []
      // )
      // tx.executeSql(
      //   "ALTER TABLE Expenses "+
      //   "ADD month INTEGER(11)", []
      // )
      // tx.executeSql(
      //   "ALTER TABLE Expenses "+
      //   "ADD year INTEGER(11)", []
      // )
    })
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeStackScreen} options={{ headerTitle: 'Главная сводка' }}/>
          <Stack.Screen name="Debug" component={DebugScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal'}}>
          <Stack.Screen name="Expenses List" component={ExpenseListScreen} 
            options={({ navigation }) => ({
              headerTitle: 'Сводка: расходы',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => { navigation.navigate('Expense Create') }}
                  style={{ 
                    backgroundColor: '#fff', width: 36, height: 48,
                    borderRadius: 24, 
                    justifyContent: "center", alignItems: "center"
                  }}
                >
                  <Text style={{ fontWeight: "600", fontSize: 24, lineHeight: 28, color: '#333'}}>+</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Expense Create" component={ExpenseCreateScreen} options={{ headerTitle: 'Добавить в расходы' }}/>
          <Stack.Screen name="Expense Edit" component={ExpenseEditScreen} options={{ headerTitle: 'Редактировать запись' }}/>
          <Stack.Screen name="Incomes List" component={IncomeListScreen} 
            options={({ navigation }) => ({
              headerTitle: 'Сводка: доходы',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => { navigation.navigate('Income Create') }}
                  style={{ 
                    backgroundColor: '#fff', width: 36, height: 48,
                    borderRadius: 24, 
                    justifyContent: "center", alignItems: "center"
                  }}
                >
                  <Text style={{ fontWeight: "600", fontSize: 24, lineHeight: 28, color: '#333'}}>+</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Income Create" component={IncomeCreateScreen} options={{ headerTitle: 'Добавить в доходы' }} />
          <Stack.Screen name="Income Edit" component={IncomeEditScreen} options={{ headerTitle: 'Редактировать запись' }} />
          <Stack.Screen name="Categories List" component={CategoryListScreen} 
            options={({ navigation }) => ({
              headerTitle: 'Категории',
              headerRight: () => (
                <>
                  <TouchableOpacity
                    onPress={() => { navigation.navigate('CategoryType Create') }}
                    style={{ 
                      backgroundColor: '#fff', width: 36, height: 48,
                      borderRadius: 24, 
                      justifyContent: "center", alignItems: "center"
                    }}
                  >
                    <Text style={{ fontWeight: "600", fontSize: 24, lineHeight: 28, color: '#333'}}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { navigation.navigate('Category Create') }}
                    style={{ 
                      backgroundColor: '#fff', width: 36, height: 48,
                      borderRadius: 24, 
                      justifyContent: "center", alignItems: "center"
                    }}
                    >
                    <Text style={{ fontWeight: "600", fontSize: 24, lineHeight: 28, color: '#333'}}>+</Text>
                  </TouchableOpacity>
                </>
              ),
            })}
          />
          <Stack.Screen name="Category Create" component={CategoryCreateScreen} />
          <Stack.Screen name="Category Edit" component={CategoryEditScreen} />
          <Stack.Screen name="CategoryType Create" component={CategoryTypeCreateScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;