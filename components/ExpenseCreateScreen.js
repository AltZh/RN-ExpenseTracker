import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Animated,
  TextInput,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  FlatList,
  Modal,
} from 'react-native';

import SQLite from 'react-native-sqlite-storage';
import DatePicker from './DatePicker';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  ()=>{},
  error=>{console.log(error)}
)

const StackScreen = ({ navigation }) => {
  
  let current_date = new Date();
  let current_day = current_date.getDate();
  let current_month = current_date.getMonth()+1;
  let current_year = current_date.getFullYear();

  const isDarkMode = useColorScheme() === 'dark';
  const [date, setDate] = useState(current_day+'/'+current_month+'/'+current_year);
  const [day, setDay] = useState(current_day);
  const [month, setMonth] = useState(current_month);
  const [year, setYear] = useState(current_year);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('1');
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({});
  const [categories_arr, setCategoriesArr] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [catSelectorVisible, setCatSelectorVisible] = useState(false);
  const [dateSelectorVisible, setDateSelectorVisible] = useState(false);

  const addItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO Expenses (amount, category, comment, day, month, year) VALUES (?,?,?,?,?,?)',
        [amount, category, comment, day, month, year],
        (tx, results) => {
          //navigation.navigate('Expenses List')
        }
      );
      tx.executeSql(
        'UPDATE AccountBalance SET amount=(amount-'+amount+')',
        [],
        (tx, results) => {
          navigation.navigate('Expenses List')
          error=>console.log(error)
        },
        error=>console.log(error)
      );
    })
  }

  const getCats = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "SELECT * FROM ExpenseCategories",
            [],
            (tx, results) => {
              let temp  = {}
              let temp2 = []
              for (let i = 0; i < results.rows.length; ++i){
                temp[results.rows.item(i).id] = results.rows.item(i);
                temp2.push(results.rows.item(i));
              }
              setCategories(temp)
              setCategoriesArr(temp2)
              return setIsLoaded(true) 
            }
        );
    })
  }

  useEffect(()=>{
    getCats()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff"}}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, padding: 8 }}>
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={catSelectorVisible}
          onRequestClose={() => {
            setCatSelectorVisible(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#0003' }}>
            <Pressable
                style={{ flex: 1 }}
                onPress={() => setCatSelectorVisible(false)} />
            <View style={{ flex: 3, position: 'relative', backgroundColor: '#fff', borderRadius: 12, elevation: 5 }}>
              <TouchableOpacity style={{ height: 18, marginBottom: 18, justifyContent: 'center', alignItems: 'center' }} onPress={() => setCatSelectorVisible(false)}>
                <View style={{ borderRadius: 6, height:6, width: 48, backgroundColor: "#aaa" }}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, padding: 12, width: 48, height: 48, }} onPress={() => setCatSelectorVisible(false)}>
                <Image source={require('../assets/icons/delete-sign.png')} style={{ height: 24, width: 24 }}/>
              </TouchableOpacity>
              <View>
                <FlatList
                  data={categories_arr}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => {
                    let cat   = item
                    let index = cat.id
                    return (
                      <TouchableOpacity style={{ padding: 4 }}
                        onPress={()=>{
                          setCategory(index)
                          setCatSelectorVisible(false)
                        }}
                        >
                        <View style={{ paddingVertical: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center'}}>
                          <View style={{ 
                            borderWidth: category == String(index) ? 3 : 0,  backgroundColor: '#'+cat.color, height: 16, width: 16, borderRadius: 16, marginRight: 8}}></View>
                          <Text style={{ fontWeight: category == index ? '600' : '400', fontSize: 18  }}>{ cat.name }</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={dateSelectorVisible}
          onRequestClose={() => {
            setDateSelectorVisible(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#0003' }}>
            <Pressable
                style={{ flex: 1 }}
                onPress={() => setDateSelectorVisible(false)} />
            <View style={{ flex: 1, position: 'relative', backgroundColor: '#fff', borderRadius: 12, elevation: 5 }}>
              <TouchableOpacity style={{ height: 18, marginBottom: 18, justifyContent: 'center', alignItems: 'center' }} onPress={() => setDateSelectorVisible(false)}>
                <View style={{ borderRadius: 6, height:6, width: 48, backgroundColor: "#aaa" }}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, padding: 12, width: 48, height: 48, }} onPress={() => setDateSelectorVisible(false)}>
                <Image source={require('../assets/icons/delete-sign.png')} style={{ height: 24, width: 24 }}/>
              </TouchableOpacity>
              <View style={{ flex: 1, justifyContent: 'space-around', }}>
                <Text style={{  fontSize: 24, color: '#333', textAlign: 'center' }}>Дата:</Text>
                <DatePicker 
                  day={day} 
                  month={month} 
                  year={year} 
                  onChange={setDate} 
                  onDayChange={setDay}
                  onMonthChange={setMonth}
                  onYearChange={setYear}
                />
              </View>
            </View>
          </View>
        </Modal>
        
        <TouchableOpacity
          onPress={()=>{ setDateSelectorVisible(true) }}
          >
          <Text style={{ padding: 16, borderBottomWidth: 1, fontSize: 18, color: '#333' }}>{date}</Text>
        </TouchableOpacity>
        <TextInput 
          style={{ borderBottomWidth: 1, fontSize: 18,padding: 18, marginBottom: 8 }} 
          value={amount} 
          onChangeText={setAmount}
          placeholder="Сумма"
          keyboardType='phone-pad'></TextInput>
        
        <TextInput 
            style={{ padding: 16, borderBottomWidth: 1, marginBottom: 32 }} 
            value={comment} 
            onChangeText={setComment}
            multiline={true}
            placeholder="Комментарий"
            keyboardType='default'></TextInput>
            
        <TouchableOpacity style={{ padding: 8 }}
          onPress={()=>{
            setCatSelectorVisible(true)
          }}
          >
          <View style={{ paddingVertical: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center'}}>
            { isLoaded ?
            (<>
              <View style={{ borderWidth: 0,  backgroundColor: '#'+ categories[category].color, height: 16, width: 16, borderRadius: 16, marginRight: 8 }}></View>
              <Text style={{ fontSize: 18, color: '#333'  }}>{ categories[category].name }</Text>
            </>) : null }
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={addItem}>
          <View style={{ padding: 16, backgroundColor: '#ffa', borderRadius: 8, borderBottomWidth: 2, borderBottomColor: '#990' }}>
              <Text style={{ color: '#333', textAlign: "center", fontWeight: "600" }}>ДОБАВИТЬ</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
});

export default StackScreen;