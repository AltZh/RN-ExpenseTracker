import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Animated, ActivityIndicator} from 'react-native';
import ScrollPicker from './ScrollPicker';

const Picker = ({day, month, year, onChange, onDayChange, onMonthChange, onYearChange}) => {
    let current_year = new Date().getFullYear();

    const [isLoading, setIsLoading] = useState(true)

    const [selectedDay, setSelectedDay]     = useState(day);
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [selectedYear, setSelectedYear]   = useState(year);

    const [days, setDays] = useState([])
    const [years, setYears] = useState([])

    const months = [
        { id:0, value:'' },
        { id:1, value:'Янв' },
        { id:2, value: 'Фев'},
        { id:3, value: 'Мар'},
        { id:4, value: 'Апр'},
        { id:5, value: 'Май'},
        { id:6, value: 'Июн'},
        { id:7, value: 'Июл'},
        { id:8, value: 'Авг'},
        { id:9, value: 'Сен'},
        { id:10, value: 'Окт'},
        { id:11, value: 'Ноя'},
        { id:12, value: 'Дек'},
        { id:13, value: ''},
    ]

    const populateDays = () => {
        let temp = []
        setIsLoading(true)

        temp.push({ 'id': 0, 'value':'' })
        for (var i = 1; i < 32; i++){
            let obj = { 'id': i, 'value':i }
            temp.push(obj)
        }
        temp.push({ 'id': i+1, 'value':'' })
        
        setDays(temp)
        setIsLoading(false)
    }

    const populateYears = () => {
        let temp = []
        setIsLoading(true)

        temp.push({ 'id': 0, 'value':'' })
        for (var i = current_year; i > current_year - 2; i--){
            let obj = { 'id': i, 'value':i }
            temp.push(obj)
        }
        temp.push({ 'id': i-1, 'value':'' })
        
        setYears(temp)
        setIsLoading(false)
    }
    
    useEffect(()=>{
        onChange(selectedDay+"/"+selectedMonth+"/"+selectedYear)
        onMonthChange(selectedMonth)
        onYearChange(selectedYear)
    }, [selectedDay, selectedMonth, selectedYear])
    
    useEffect(()=>{
        onDayChange(selectedDay)
    }, [selectedDay])
    
    useEffect(()=>{
        onMonthChange(selectedMonth)
    }, [selectedMonth])
    
    useEffect(()=>{
        onYearChange(selectedYear)
    }, [selectedYear])

    useEffect(()=>{
        populateDays()
        populateYears()
    }, [])

    return (
        <View style={{ height: 180, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            { isLoading ? <ActivityIndicator color="#333" size={42} /> : (
            <>
                <ScrollPicker style={{ flex: 1 }} data={days} value={day} onChange={setSelectedDay}/>
                <ScrollPicker style={{ flex: 1 }} data={months} value={month} onChange={setSelectedMonth} />
                <ScrollPicker style={{ flex: 1 }} data={years} value={year} onChange={setSelectedYear}/>
            </>)}
        </View>
    )
}

export default Picker;