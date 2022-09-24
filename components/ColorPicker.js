import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

const Picker = ({value, onChange}) => {

    //const colors_mixer = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    const colors_mixer = ['c', '7', '3'];
    const [colors, setColors] = useState(['aa0000', 'bb0000']);

    useEffect(()=>{
        let temp = []
        for (let cm of colors_mixer ){
            let color_code = cm;
            for (let cm2 of colors_mixer ){
                color_code = cm + cm2;
                for (let cm3 of colors_mixer ){
                    color_code = cm + cm2 + cm3;
                    temp.push(color_code)
                }
            }
        }
        setColors(temp);
    }, [])
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <FlatList 
                data={colors}
                renderItem={({item, index})=>{
                    return(
                        <View key={index}>
                            <TouchableOpacity
                                onPress={()=>{onChange(item)}}
                                style={{ paddingHorizontal: 8, margin: 0 }}
                                >
                                    { value == item ? 
                                    (
                                        <View style={{ borderRadius: 24, borderWidth: 2, borderColor: '#aaa' }}>
                                            <View style={{ borderRadius: 24, borderWidth: 2, borderColor: '#fff', height: 44, width: 44, backgroundColor:  '#'+item }}></View>
                                        </View>
                                    ) : (
                                        <View style={{ borderRadius: 24, height: 48, width: 48, backgroundColor:  '#'+item }}></View>
                                    )}
                            </TouchableOpacity>
                        </View>
                    )
                }}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

export default Picker;