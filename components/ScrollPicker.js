import React, {useCallback, useEffect, useState, useRef} from 'react';
import {View, Text, TouchableOpacity, Animated, ActivityIndicator, } from 'react-native';

const Picker = ({data, value, onChange, style}) => {
    
    if(!value) value = 1

    const [isLoading, setIsLoading] = useState(true)

    const flatlistRef = React.useRef();
    const itemheight = 60
    const snapToOffsets = data.map((x, i) => {
      return ((i * (itemheight) * 1))
    })

    const scrollY = React.useRef(new Animated.Value(0)).current;
    const _changeDate = useCallback(({ viewableItems, changed }) => {
        let item = viewableItems[1].item
        onChange(item.id)
    }, []);

    
    
    useEffect(() => {
        const getIndex = (placeholder = 0) => {
            const index = data.findIndex(item => item.id === value);
            if (index === -1) return placeholder;
            return index;
        };
    

        if (flatlistRef.current){
            flatlistRef.current.scrollToOffset({
                offset: itemheight  * (getIndex() - 1), animated: true,
            });
            setIsLoading(false)
        }
    }, [flatlistRef]);

    return (
        <View style={[style, {  height: itemheight * 3, backgroundColor: '#00000003'}]}>
            <Animated.FlatList
                data={data}
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
                        <Animated.View style={{ alignItems: 'center', justifyContent: 'center', height: itemheight, transform: [{ scale: scale }], opacity}}>
                            <Text style={{ fontSize: 28, color: '#333', textAlign: 'center' }}>{item.value}</Text>
                        </Animated.View>
                    )
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                initialNumToRender={data.length}
                scrollEventThrottle={36}
                onViewableItemsChanged={_changeDate}
                snapToOffsets={snapToOffsets}
                showsVerticalScrollIndicator={false}
                bounces={false}
                ref={flatlistRef}
            />
        </View>
    )
}

export default Picker;