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

const StackScreen = ({ navigation, route }) => {
  const { item } = route.params;

  const isDarkMode = useColorScheme() === 'dark';
  const [date, setDate] = useState(String(item.day) + '/' + String(item.month) + '/' + String(item.year) || '');
  const [day, setDay] = useState(Number(item.day) || 0);
  const [month, setMonth] = useState(Number(item.month) || 0);
  const [year, setYear] = useState(Number(item.year) || 0);
  const [amountOld, _] = useState(Number(item.amount) || 0);
  const [amount, setAmount] = useState(String(item.amount) || '');
  const [category, setCategory] = useState(item.category ? String(item.category) : '1');
  const [comment, setComment] = useState(item.comment || '');
  const [categories, setCategories] = useState({});
  const [categories_arr, setCategoriesArr] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [catSelectorVisible, setCatSelectorVisible] = useState(false);
  const [dateSelectorVisible, setDateSelectorVisible] = useState(false);

  const updateItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Incomes set amount=?, category=?, comment=?, day=?, month=?, year=? where id=?',
        [amount, category, comment, Number(day), month, year, item.id],
        (tx, results) => {
          //navigation.navigate('Incomes List')
        }
      );
      tx.executeSql(
        'UPDATE AccountBalance SET amount=(amount+'+(Number(amount)-amountOld)+')',
        [],
        (tx, results) => {
          navigation.navigate('Incomes List')
          error=>console.log(error)
        },
        error=>console.log(error)
      );
    })
  }

  const deleteItem = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM Incomes where id=?',
        [item.id],
        (tx, results) => {
          //navigation.navigate('Incomes List')
        }
      );
      tx.executeSql(
        'UPDATE AccountBalance SET amount=(amount-'+amount+')',
        [],
        (tx, results) => {
          navigation.navigate('Incomes List')
          error=>console.log(error)
        },
        error=>console.log(error)
      );
    })
  }
  const getCats = () => {
    db.transaction((tx) => {
        tx.executeSql(
            "SELECT * FROM IncomeCategories",
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
      <View style={{ padding: 16, flexDirection: 'row', }}>
        <TouchableOpacity onPress={deleteItem}>
          <View style={{ padding: 16, backgroundColor: '#faa', borderRadius: 8, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 2, borderBottomColor: '#900' }}>
              <Text style={{ color: '#333', textAlign: "center", fontWeight: "600", width: 36 }}>X</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={updateItem} style={{ flex: 1 }}>
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