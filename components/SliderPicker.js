import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

const Picker = ({data, selected, onChange, width}) => {

    return (
        <FlatList 
            data={data}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              return (
                <View style={{ width, paddingVertical: 4, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{ backgroundColor: '#'+item.color, height: 16, width: 16, borderRadius: 16, marginRight: 8}}></View>
                    <Text>{ item.name }</Text>
                </View>
              )
            }}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            horizontal={true}
            bounces={false}
        />
    )
}

export default Picker;