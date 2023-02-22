import React, { useContext, useEffect, useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'
import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { database } from '../configs/firebase';
import { StartPosition } from '../Config';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import LandscapeLogo from '../components/LandscapeLogo';
import CreateJoinPlayerMatching from '../components/CreateJoinPlayerMatching';



function CreateRoom({ navigation, route, }) {


    const { myPlayerId, setMyPlayerId, activePlayerId, playBackSteps, setPlayBackSteps, taskIndex } = useContext(AuthContext);

    const [roomName, setRoomName] = useState()
    var f = 1;
    async function handleButtonPress() {
        let n = await Math.floor(100000 + Math.random() * 900000).toString()
        // console.log(n);
        if (n.length > 0) {
            // create new thread using firebase & firestore

            const docRef = await doc(database, "rooms", n);
            const d = await (await getDoc(docRef)).data()
            if (d != undefined) {

                handleButtonPress();
                return;
            }
            await setDoc(doc(database, 'rooms', "123456"), { // TODO:change this

                name: n,
                latestMessage: {
                    text: `${n} created. Welcome!`,
                    // createdAt: new Date().getTime()
                },
                GameInfo: {
                    player1Id: 1,
                    player2Id: 2,
                    player1Points: StartPosition,
                    player2Points: StartPosition,


                },
                diceMove: 1,
                activePlayerId: activePlayerId,
                taskIndex: 0,
                playBackSteps: 2
            }).then(() => {

                // send an api request to backend to store room info:

                setMyPlayerId(1);
                setRoomName(n);

                navigation.navigate('Game', { roomName: "123456" }) //TODO:
            })
        }
    }


    useEffect(() => {
        handleButtonPress()
    }, [])


    return (
        <View style={{ flex: 1 }}>
            <LinearGradient colors={['#FFFF', '#DB4A39']} locations={[0.5, 0.9]} start={{ x: 1, y: 0 }} end={{ x: 0.2, y: 0.9 }} style={styles.linearGradient}>

                <View style={{ height: "60%" }}>
                    <LinearGradient colors={['#0073C5', '#9069FF']} style={[styles.linearGradient, {
                        borderBottomLeftRadius: 50,
                        borderBottomRightRadius: 50,
                        elevation: 20
                    }]}>

                        <LandscapeLogo></LandscapeLogo>


                        <View style={styles.gameplayersDiv}>
                            <CreateJoinPlayerMatching playerId={1} />
                            <Text style={{ fontWeight: 'bold', color: "#FFF", marginBottom: 60, }}>VS</Text>
                            <CreateJoinPlayerMatching playerId={2} />
                        </View>

                    </LinearGradient>
                </View>
                <View style={{ marginTop: 50 }}>

                    <View style={styles.roomIdText}><Text style={styles.roomIdTextVal}>Room Id:</Text></View>
                    <View style={styles.roomIdValContainer}><Text style={styles.roomIdVal}>{roomName}</Text></View>
                    {/* <Button onPress={handleButtonPress} title="create"></Button> */}
                </View>
            </LinearGradient>
        </View>
    )
}

export default CreateRoom

const styles = StyleSheet.create({
    linearGradient: {
        flex: 1,
    },
    gameplayersDiv: {
        marginTop: 10,
        flex: 1,
        flexDirection: 'row',
        // backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    roomIdText: { flexDirection: "row", justifyContent: "center", slefAlign: "center", marginLeft: "auto", marginRight: "auto", alignItems: 'center', backgroundColor: "#FFF", paddingVertical: 10, borderRadius: 25, width: "30%", height: 50, maxHeight: 50, marginVertical: 20, elevation: 10 },

    roomIdValContainer: { flexDirection: "row", justifyContent: "center", slefAlign: "center", marginLeft: "auto", marginRight: "auto", alignItems: 'center', backgroundColor: "#FFF", paddingVertical: 10, borderRadius: 15, elevation: 20, width: "70%", height: 50, maxHeight: 50, marginVertical: 20 },

    roomIdTextVal: {
        fontWeight: "bold",
        color: "#D50000",
        fontSize: 18
    },
    roomIdVal: {
        fontWeight: "bold",
        color: "#0048D5",
        fontSize: 18
    }

})