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
  const [date, setDate] = useState('- Выберите дату');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
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

  const months = {
    1:'Янв',
    2:'Фев',
    3:'Мар',
    4:'Апр',
    5:'Май',
    6:'Июн',
    7:'Июл',
    8:'Авг',
    9:'Сен',
    10:'Окт',
    11:'Ноя',
    12:'Дек',
  }

  const populateDates = () => {
    let temp = []

    temp.push({ 'id': 0, 'value':'', 'day':0, 'month':0, 'year':0, 'full': ''})
    for (var i = 1; i < 32; i++){
      let obj = { 'id': i, 'value':i+'/9/2022', 'day':i, 'month':9, 'year':2022, 'full': i+' '+months[9]+' \'22'}
      temp.push(obj)
    }
    temp.push({ 'id': 32, 'value':'', 'day':0, 'month':0, 'year':0, 'full': ''})
    
    setDates(temp)
  }
  const [dates, setDates] = useState([])

  useEffect(()=>{
    getCats()
    populateDates()
  }, [])

  const flatlistRef = React.useRef();
  const itemheight = 60
  const startScroll = itemheight;
  
  useEffect(() => {
    if (flatlistRef.current) flatlistRef.current.scrollToOffset({
        offset:startScroll, animated: false
    });
  }, [flatlistRef]);

  const snapToOffsets = dates.map((x, i) => {
    return ((i * (itemheight) * 1) + startScroll)
  })
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const _changeDate = useCallback(({ viewableItems, changed }) => {
      let item = viewableItems[1].item
      setDate(item.day + '.' + item.month + '.' + item.year)
      setDay(String(item.day))
      setMonth(String(item.month))
      setYear(String(item.year)) 
      setDate(item.value);
    }, []);

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
                <View style={{  height: itemheight * 3, backgroundColor: '#00000007'}}>
                  <Animated.FlatList
                    ref={flatlistRef}
                    data={dates}
                    keyExtractor={item => item.id}
                    renderItem={({item, index}) => {
                      const inputRange = [
                        itemheight * (index - 2),
                        itemheight * (index - 1),
                        itemheight * (index + 1),
                      ];
                      const scale = scrollY.interpolate({
                        inputRange,
                        outputRange: [.85, 1, .85],
                        extrapolate:'clamp'
                      });
                      const opacity = scrollY.interpolate({
                        inputRange,
                        outputRange: [.65, 1, .65],
                        extrapolate:'clamp'
                      });
                      return (
                        <TouchableOpacity
                          style={{ height: itemheight, alignItems: 'center' }}
                          onPress={()=>{
                            setDateSelectorVisible(false)
                          }}
                          >
                            <Animated.View style={{ height: itemheight, transform: [{ scale: scale }], opacity}}>
                              <Text style={{ fontSize: 28, color: '#333', textAlign: 'center' }}>{item.full}</Text>
                            </Animated.View>
                        </TouchableOpacity>
                      )
                    }}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                      { useNativeDriver: true }
                    )}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={_changeDate}
                    snapToOffsets={snapToOffsets}
                    bounces={false}
                  />
                </View>
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