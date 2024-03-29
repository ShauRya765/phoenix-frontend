import { Audio } from 'expo-av';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { Animated, Easing, Text, Touchable, TouchableOpacity, View } from 'react-native'

import DiceOne from "../../assets/dice1.png";
import DiceTwo from "../../assets/dice2.png";
import DiceThree from "../../assets/dice3.png";

import { AuthContext } from '../context/AuthContext';
import { getString } from '../language/Strings';
function DiceComponent({ showTask, isOffline = false, diceMove, setDisableDice, disableDice, setDiceMove, playMove, changePlayerId, roomName }) {

    const [rollSound, setRollSound] = useState(null)





    const diceArray = [DiceOne, DiceTwo, DiceThree]
    const { activePlayerId, setActivePlayerId, myPlayerId, setMyPlayerId, language, soundOn, database } = useContext(AuthContext);
    var a = false



    const rollDice = async () => {


        // startRotateImage();
        const rndInt = Math.floor(Math.random() * (3) + 1)
        setDiceMove(rndInt)

        // console.log(activePlayerId);
        if (isOffline) {
            setTimeout(() => {
                playMove(rndInt, activePlayerId);
                setDisableDice(true);
            }, 300);
        } else {
            setTimeout(async () => {
                await updateDoc(doc(database, 'rooms', roomName), {



                    diceMove: rndInt


                }).then((data) => {
                    // setActivePlayerId((activePlayerId) % 2 + 1);
                })
                await playMove(rndInt, activePlayerId);
                setDisableDice(true);
                a = false
            }, 500);
        }





    }


    const startRotateImage = () => {
        // rollDice();
        if (a == false) {
            a = true

            Animated.timing(
                spinValue,
                {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear, // Easing is an additional import from react-native
                    useNativeDriver: false  // To make use of native driver for performance
                }
            ).start(async () => {
                setDisableDice(true);


                soundOn && Audio.Sound.createAsync(
                    require('../../assets/rollDice.mp3'),
                    { shouldPlay: true }
                ).then((res) => {
                    res.sound.setOnPlaybackStatusUpdate((status) => {
                        if (!status.didJustFinish) return;
                        res.sound.unloadAsync().catch(() => { });
                    });
                }).catch((error) => { });

                setTimeout(() => {

                    rollDice()
                }, 50)
            });
        }

    }

    let spinValue = new Animated.Value(0);
    // const spinValue = React.useRef(new Animated.Value(0)).current;

    // First set up animation 


    // Next, interpolate beginning and end values (in this case 0 and 1)
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    console.log("Dice:" + myPlayerId, activePlayerId);
    return (

        <View style={{ flex: 1, alignSelf: 'center', backgroundColor: ((myPlayerId != activePlayerId)) ? "#DB4A39" : "#3DBE29", padding: "3%", borderRadius: 10, bottom: -30 }}>
            <TouchableOpacity disabled={(a || disableDice || isOffline) && (!showTask) ? false : myPlayerId != activePlayerId} onPress={() => {

                startRotateImage()
            }

            }>
                <Animated.Image
                    style={{
                        alignSelf: "center",
                        transform: [{ rotate: spin }], height: 80, width: 80,

                    }}
                    source={diceArray[diceMove - 1]}
                /><Text style={{ fontSize: 12, flex: 1, alignSelf: "center", color: "#FFF", fontWeight: "bold" }}>{getString('rollTheDice', language)}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default DiceComponent