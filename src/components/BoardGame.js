import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import { Alert, Dimensions, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Icons from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { EndPosition, flags, mines, StartPosition, taskList } from '../Config';
import { useFirstRender } from '../customhooks/useFirstRender';
import { AuthContext } from '../context/AuthContext';
import blueTile from '../../assets/blueTile.png';
import redTile from '../../assets/redTile2.png';
import bomb from '../../assets/bomb.png'
import trophy from '../../assets/trophy.png'
import start from '../../assets/start.png'
import flag from '../../assets/gflag.png'
import pawn from '../../assets/pawn.png'
import pawn2 from '../../assets/pawn2.png'

function BoardGame({ setShowTask, setShowTaskId, setGameEnded, player1, setPlayer1, player2, changePlayerId, playBackMove, diceVal }) {
    const { activePlayerId, myPlayerId, taskIndex } = useContext(AuthContext);

    const [matrix, setMatrix] = useState([])
    const windowWidth = Dimensions.get('window').width;

    const firstRender = useFirstRender();

    const create2DMatrix = () => {

        var a = [];


        for (let i = 0; i < 5; i++) {
            a[i] = [0, 0, 0, 0, 0];
        }

        for (let i = 0; i < 5; i++) {

            a[flags[i][0]][flags[i][1]] = 1
        }

        for (let i = 0; i < 5; i++) {

            a[mines[i][0]][mines[i][1]] = -1
        }



        a[0][4] = 3;
        a[4][0] = 2;

        setMatrix(a)





    }

    const reachedFlag = (activeUserId, i) => {
        console.log(activeUserId, "reached flag")
        // const rndInt = Math.floor(Math.random() * (2) + 1);
        setShowTaskId(taskIndex);


        setTimeout(() => {

            setShowTask(true);
            changePlayerId(myPlayerId != activePlayerId);

        }, 200);


    }


    const reachedMine = (activeUserId) => {





        // showMineMessage(true);
        // setTimeout(() => {
        //     showMineMessage(False);
        // }, 1000);

        const a = setTimeout(async () => {
            // const rndInt = Math.floor(Math.random() * (3) + 1);
            // console.log("Random back" + rndInt, activeUserId);
            await playBackMove(2, activeUserId);
            changePlayerId(myPlayerId != activePlayerId);
        }, 200);

        return () => clearTimeout(a);


    }




    useEffect(() => {
        const unsubscribe = setTimeout(() => {

            let activePId = (activePlayerId);
            console.log(activePlayerId, player1, player2, " check");
            if (!(player2[0] == StartPosition[0] && player2[1] == StartPosition[1] && player1[0] == StartPosition[0] && player1[1] == StartPosition[1])) {
                // TODO: confirm this thing == or != because activePlayerId changes before this

                if (activePId == 1) {
                    console.log("rr 1");
                    if (player1[0] == EndPosition[0] && player1[1] == EndPosition[1]) {
                        Alert.alert("Player 1 Won the game", "Both the players will go for luch together and Player 2 will have to pay.")
                        setGameEnded(true);
                        return;
                    }

                    for (let i = 0; i < 5; i++) {
                        if (player1[0] == flags[i][0] && player1[1] == flags[i][1]) {
                            console.log("flag for 1", player2);
                            reachedFlag(activePId, i);

                            return;

                        } else if (player1[0] == mines[i][0] && player1[1] == mines[i][1]) {
                            reachedMine(activePId)
                            return;
                        }
                    }



                }
                else if (activePId == 2) {
                    console.log("rr 2");
                    if (player2[0] == EndPosition[0] && player2[1] == EndPosition[1]) {
                        Alert.alert("Player 2 Won the game", "Player 1 has to buy a movie for Player 2 and both have to go together for a movie.");
                        setGameEnded(true);
                        return;
                    }
                    for (let i = 0; i < 5; i++) {
                        if (player2[0] == flags[i][0] && player2[1] == flags[i][1]) {
                            console.log("flag for 2", player2);
                            reachedFlag(activePId, i);
                            return;

                        } else if (player2[0] == mines[i][0] && player2[1] == mines[i][1]) {
                            reachedMine(activePId);
                            console.log("mine for 2", player2);
                            return;
                        }
                    }
                }
                changePlayerId();
            }

        }, 300);
        return () => clearTimeout(unsubscribe);

    }, [player1, player2])

    useEffect(() => {
        create2DMatrix();
    }, [])


    const pawnMovement = (index1, index2) => {
        return ((index1 == player1[0] && index2 == player1[1]) || (index1 == player2[0] && index2 == player2[1])) &&
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                {(index1 == player1[0] && index2 == player1[1]) && <Image source={pawn} style={{
                    height: 40, width: 40, resizeMode: "center", margin: 0, padding: 0,
                }}></Image>}
                {(index1 == player2[0] && index2 == player2[1]) && <Image source={pawn2} style={{
                    height: 40, width: 40, resizeMode: "center", margin: 0, padding: 0,
                }}></Image>}
            </View>


    }


    return (
        <View style={{
            marginTop: '5%', marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: "2%",
            backgroundColor: '#0073C5', width: windowWidth * 0.95, height: windowWidth * 0.95,
            padding: 5,
            borderRadius: 5
        }}>
            {
                matrix.map((i, index1) => (
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        {i.map((j, index2) => (

                            <ImageBackground source={((index1 + index2) % 2 == 0) ? blueTile : redTile} resizeMode="cover" style={[styles.image, styles.bgImage]}>

                                <View key={index1 * 5 + index2} style={styles.box}>

                                    {j == 1 ? <ImageBackground source={flag} style={[{ resizeMode: "cover", width: "100%", height: "100%" }, styles.internalImages]}>{pawnMovement(index1
                                        , index2)}</ImageBackground> :
                                        (j == -1 ? <ImageBackground source={bomb} style={{ resizeMode: "cover", width: "100%", height: "100%" }}>{pawnMovement(index1
                                            , index2)}</ImageBackground> :
                                            j == 3 ? <ImageBackground source={trophy} style={{ resizeMode: "cover", width: "100%", height: "100%" }}>{pawnMovement(index1
                                                , index2)}</ImageBackground> :
                                                j == 2 ? <ImageBackground source={start} style={{ resizeMode: "cover", width: "100%", height: "100%" }}>{pawnMovement(index1
                                                    , index2)}</ImageBackground> : pawnMovement(index1, index2))}




                                </View>
                            </ImageBackground>

                        ))}
                    </View >


                ))
            }
        </View>
    )
}


const styles = StyleSheet.create({
    box1: {
        backgroundColor: "#FED766",
    },
    box2: {
        backgroundColor: "#FF5376",
    },
    box: {
        // height: 20,
        // width: 20

        padding: 3,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: "20%",

    },
    image: {
        flex: 1
    },
    bgImage: {
        shadowColor: '#171717',
        shadowOffset: { width: -2, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        margin: 1
    },
    internalImages: {
        flex: 1,

        // backgroundColor: "#FFF",
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'center'
    }

})

export default BoardGame