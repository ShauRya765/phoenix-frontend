import React, { useContext, useEffect, useRef, useState } from 'react'
import { Alert, AppState, ImageBackground, StyleSheet, View } from 'react-native'
import BoardGame from '../components/BoardGame';
import BottomComponent from '../components/BottomComponent';
import ScreenOverlayComponent from '../components/ScreenOverlayComponent';
import TaskShowComponent from '../components/TaskShowComponent';
import { boards, Cols, EndPosition, totalTasks, Rows, StartPosition } from '../Config';
import { LinearGradient } from 'expo-linear-gradient';
import LandscapeLogo from '../components/LandscapeLogo';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import bgImg from '../../assets/gameBackgroundImage.png'
import pawn1 from '../../assets/pawn1.png'
import pawn2 from '../../assets/pawn2.png'
import pawn3 from '../../assets/pawn3.png'
import pawn4 from '../../assets/pawn4.png'
import { StackActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InternetAlert from '../components/InternetAlert';
import { Audio } from 'expo-av';
// import firestore from '@react-native-firebase/firestore'
const Game = ({ navigation, route }) => {

    const { roomName, player1Details, player2Details } = route.params;
    const [player1, setPlayer1] = useState(StartPosition)
    const [player2, setPlayer2] = useState(StartPosition)
    const [diceMove, setDiceMove] = useState(1)
    const [diceVal, setDiceVal] = useState(1)
    const pawns = [pawn1, pawn2, pawn3, pawn4];
    // const pawns = [pawn1, pawn3, pawn4, pawn6];
    const [player1Pawn, setPlayer1Pawn] = useState(pawn1);
    const [player2Pawn, setPlayer2Pawn] = useState(pawn4);

    const [gameEnded, setGameEnded] = useState(false);
    const [disableDice, setDisableDice] = useState(false)
    const [showTask, setShowTask] = useState(false)
    const [showTaskId, setShowTaskId] = useState(0)
    // const [leftToRight1, setLeftToRight1] = useState(true)
    let rn = (roomName)
    var rndInt1 = ((parseInt(rn[0]) + parseInt(rn[1]) + parseInt(rn[2]) + parseInt(rn[3]) + parseInt(rn[4]) + parseInt(rn[5])) % 6).toString();
    var flags = boards[rndInt1].flags
    var mines = boards[rndInt1].mines
    var firstTime = false;

    const { database, isConnected, checkConnection, taskList, activePlayerId, setActivePlayerId, myPlayerId, setMyPlayerId, taskIndex, setTaskIndex, language, soundOn, totalTasks } = useContext(AuthContext);

    function playSound(sound) {
        console.log('Playing ');
        Audio.Sound.createAsync(
            sound,
            { shouldPlay: true }
        ).then((res) => {
            res.sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.didJustFinish) return;
                res.sound.unloadAsync().catch(() => { });
            });
        }).catch((error) => { });
    }

    const checkFlag = (resArr) => {
        for (let i = 0; i < 6; i++) {
            if (resArr[0] == flags[i][0] && resArr[1] == flags[i][1]) {


                soundOn && playSound(require('../../assets/flag.mp3'))

            }
        }
    }



    const playMove = async (moveVal, playerID) => {
        let tempArr = [];
        if (playerID == 1) tempArr = player1;
        else tempArr = player2;

        let c = moveVal;
        let initValj = -1;

        let resArr = [];

        for (let i = tempArr[0]; i >= 0 && c > 0; i--) {

            if (initValj == -1) initValj = tempArr[1];
            else initValj = -1;

            if (i % 2 == 0) {
                let j = initValj == -1 ? 0 : initValj;
                for (; j < Cols && c > 0; j++) {
                    c--;
                }
                if (c == 0) {
                    if (j < Cols)
                        resArr = [i, j];
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {

                        if (i <= 0 && j >= Cols - 1)
                            resArr = EndPosition
                        // playerID == 1 ? setPlayer1(EndPosition) : setPlayer2(EndPosition);

                        else
                            resArr = [i - 1, j - 1]
                        // playerID == 1 ? setPlayer1([i - 1, j - 1]) : setPlayer2([i - 1, j - 1]);

                    }

                }
            } else {
                let j = initValj == -1 ? Cols - 1 : initValj;

                for (; j >= 0 && c > 0; j--) {
                    c--;
                }

                if (c == 0) {
                    if (j >= 0)
                        resArr = [i, j]
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {
                        resArr = [i - 1, j + 1]
                        // playerID == 1 ? setPlayer1([i - 1, j + 1]) : setPlayer2([i - 1, j + 1]);
                    }

                }
            }



        }

        await updateDoc(doc(database, 'rooms', roomName), {

            name: roomName,
            latestMessage: {
                text: `${diceVal + 1} 123456 created. Welcome!`,
                // createdAt: new Date().getTime(),

            },



            GameInfo: {
                player1Id: player1Details.id,
                player2Id: player2Details.id,
                player1Points: playerID == 1 ? resArr : player1,
                player2Points: playerID == 2 ? resArr : player2,

            },
            activePlayerId: (activePlayerId)

        }).then((data) => {

            playerID == 1 ? setPlayer1(resArr) : setPlayer2(resArr);
            // setActivePlayerId((activePlayerId) % 2 + 1);
            // changePlayerId();
            console.log("Play move", playerID, resArr);
        })

        checkFlag(resArr);




        firstTime = true;
    }



    const goBackByOne = (moveVal, playerID) => {
        console.log("goback call");
        let tempArr = [];
        if (playerID == 1) tempArr = player1;
        else tempArr = player2;

        let c = moveVal;
        let initValj = -1;
        let resArr = [];
        // console.log(player1, player2)
        for (let i = tempArr[0]; i < Rows && c > 0; i++) {

            if (initValj == -1) initValj = tempArr[1];
            else initValj = -1;

            if (i % 2 == 1) {
                let j = initValj == -1 ? 0 : initValj;
                for (; j < Cols && c > 0; j++) {
                    c--;
                }
                if (c == 0) {
                    if (j < Cols)
                        resArr = [i, j]
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {
                        resArr = [i + 1, j - 1];
                        // playerID == 1 ? setPlayer1([i + 1, j - 1]) : setPlayer2([i + 1, j - 1]);

                    }

                }
            } else {
                let j = initValj == -1 ? Cols - 1 : initValj;

                for (; j >= 0 && c > 0; j--) {
                    c--;
                }

                if (c == 0) {
                    if (j >= 0)
                        resArr = [i, j];
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {
                        if (i >= Rows - 1 && j <= 0)
                            resArr = StartPosition;
                        // playerID == 1 ? setPlayer1(StartPosition) : setPlayer2(StartPosition);
                        else
                            resArr = [i + 1, j + 1]
                        // playerID == 1 ? setPlayer1([i + 1, j + 1]) : setPlayer2([i + 1, j + 1]);
                    }

                }
            }



        }

        return resArr;

    }

    const checkMine = (resArr, mines) => {
        console.log("mine check");
        for (let i = 0; i < 6; i++) {
            if (resArr[0] == mines[i][0] && resArr[1] == mines[i][1]) {

                return true;
            }
        }

        return false;
    }


    const playBackMove = async (moveVal, playerID, mines) => {
        console.log("back call");
        let tempArr = [];
        if (playerID == 1) tempArr = player1;
        else tempArr = player2;

        let c = moveVal;
        let initValj = -1;
        let resArr = [];
        // console.log(player1, player2)
        for (let i = tempArr[0]; i < Rows && c > 0; i++) {

            if (initValj == -1) initValj = tempArr[1];
            else initValj = -1;

            if (i % 2 == 1) {
                let j = initValj == -1 ? 0 : initValj;
                for (; j < Cols && c > 0; j++) {
                    c--;
                }
                if (c == 0) {
                    if (j < Cols)
                        resArr = [i, j]
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {
                        resArr = [i + 1, j - 1];
                        // playerID == 1 ? setPlayer1([i + 1, j - 1]) : setPlayer2([i + 1, j - 1]);

                    }

                }
            } else {
                let j = initValj == -1 ? Cols - 1 : initValj;

                for (; j >= 0 && c > 0; j--) {
                    c--;
                }

                if (c == 0) {
                    if (j >= 0)
                        resArr = [i, j];
                    // playerID == 1 ? setPlayer1([i, j]) : setPlayer2([i, j]);
                    else {
                        if (i >= Rows - 1 && j <= 0)
                            resArr = StartPosition;
                        // playerID == 1 ? setPlayer1(StartPosition) : setPlayer2(StartPosition);
                        else
                            resArr = [i + 1, j + 1]
                        // playerID == 1 ? setPlayer1([i + 1, j + 1]) : setPlayer2([i + 1, j + 1]);
                    }

                }
            }



        }


        if (checkMine(resArr, mines) == true) {
            resArr = goBackByOne(moveVal - 1, playerID);
        }

        // if (firstTime == true) {

        // setTimeout(() => {
        await updateDoc(doc(database, 'rooms', roomName), {

            name: roomName,
            latestMessage: {
                text: `${roomName}  created. Welcome!`,
                // createdAt: new Date().getTime(),

            },
            GameInfo: {
                player1Id: player1Details.id,
                player2Id: player2Details.id,
                player1Points: playerID == 1 ? resArr : player1,
                player2Points: playerID == 2 ? resArr : player2,


            },
            activePlayerId: (activePlayerId)

        }).then((data) => {
            playerID == 1 ? setPlayer1(resArr) : setPlayer2(resArr);
            // setActivePlayerId((activePlayerId) % 2 + 1);
            // changePlayerId();
            console.log("Playback", playerID, resArr);
        })





        // }, 1000);
        // firstTime = false;
        // }
        // firstTime = true;
    }

    const changePlayerId = async (update = false, backUpdate = false) => {

        setDisableDice(false)
        let r = (activePlayerId) % 2 + 1;

        var d = {

        }

        if (update == true) {

            d.taskIndex = (taskIndex + 1) % totalTasks
        }

        console.log("cccc", myPlayerId, activePlayerId);
        if (myPlayerId != activePlayerId) {

            d.activePlayerId = r
        }


        await updateDoc(doc(database, 'rooms', roomName), d).then((data) => {
            if (myPlayerId != activePlayerId) {
                setActivePlayerId((activePlayerId) % 2 + 1);
            }
            if (update == true) {
                setTaskIndex((taskIndex + 1) % totalTasks)
            }

        })





    }

    const resetForReplay = () => {
        setPlayer1(StartPosition)
        setPlayer2(StartPosition)
        setGameEnded(false)

    }


    useEffect(() => {
        const ref = doc(database, 'rooms', roomName)
        const unsubscribe = onSnapshot(ref, (snapshot) => {

            if (snapshot && !snapshot.metadata.hasPendingWrites) {

                // console.log(snapshot.metadata.hasPendingWrites);
                if (snapshot.data().GameInfo.player1Points != player1)
                    setPlayer1(snapshot.data().GameInfo.player1Points)

                if (snapshot.data().GameInfo.player2Points != player2)
                    setPlayer2(snapshot.data().GameInfo.player2Points)


                setActivePlayerId(snapshot.data().activePlayerId)

                setDiceMove(snapshot.data().diceMove)

                setTaskIndex(snapshot.data().taskIndex)

                if (snapshot.data().winningUpdate == true) {
                    navigation.dispatch(
                        StackActions.replace
                            ('Win', { winPlayer: snapshot.data().winningPlayer, roomName: roomName })
                    )
                }
            }

            // console.log(snapshot.data().latestMessage.text)
        })

        return () => unsubscribe();
    }, []);

    // useEffect(() => {
    //     socket.on('event-name', (data) => {
    //         if (data) {

    //             // console.log(snapshot.metadata.hasPendingWrites);
    //             if (data.GameInfo.player1Points != player1)
    //                 setPlayer1(data)

    //             if (data.GameInfo.player2Points != player2)
    //                 setPlayer2(data.GameInfo.player2Points)


    //             setActivePlayerId(data.activePlayerId)

    //             setDiceMove(data.diceMove)

    //             setTaskIndex(data.taskIndex)

    //             if (data.winningUpdate == true) {
    //                 navigation.dispatch(
    //                     StackActions.replace
    //                         ('Win', { winPlayer: data.winningPlayer, roomName: roomName })
    //                 )
    //             }
    //         }


    //     });

    // const ref = doc(database, 'rooms', roomName)
    // const unsubscribe = onSnapshot(ref, (snapshot) => {

    //     if (snapshot && !snapshot.metadata.hasPendingWrites) {

    //         // console.log(snapshot.metadata.hasPendingWrites);
    //         if (snapshot.data().GameInfo.player1Points != player1)
    //             setPlayer1(snapshot.data().GameInfo.player1Points)

    //         if (snapshot.data().GameInfo.player2Points != player2)
    //             setPlayer2(snapshot.data().GameInfo.player2Points)


    //         setActivePlayerId(snapshot.data().activePlayerId)

    //         setDiceMove(snapshot.data().diceMove)

    //         setTaskIndex(snapshot.data().taskIndex)

    //         if (snapshot.data().winningUpdate == true) {
    //             navigation.dispatch(
    //                 StackActions.replace
    //                     ('Win', { winPlayer: snapshot.data().winningPlayer, roomName: roomName })
    //             )
    //         }
    //     }

    //     // console.log(snapshot.data().latestMessage.text)
    // })

    // return () => unsubscribe();
    // }, []);

    // console.log(route.params.data);



    const hasUnsavedChanges = Boolean('');

    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (e.data.action.type == "GO_BACK") {
                    // if (!hasUnsavedChanges) {
                    //     // If we don't have unsaved changes, then we don't need to do anything
                    //     return;
                    // }

                    // Prevent default behavior of leaving the screen
                    e.preventDefault();

                    // Prompt the user before leaving the screen
                    Alert.alert(
                        'Are you sure?',
                        'You will loose this match if you leave.',
                        [
                            { text: "Don't leave", style: 'cancel', onPress: () => { } },
                            {
                                text: 'Leave',
                                style: 'destructive',
                                // If the user confirmed, then we dispatch the action we blocked earlier
                                // This will continue the action that had triggered the removal of the screen
                                onPress: () =>
                                    navigation.dispatch(
                                        StackActions.replace
                                            ('Win', { winPlayer: (myPlayerId % 2) + 1, roomName: roomName })
                                    )

                            },
                        ]
                    );
                }
            }),
        [navigation, hasUnsavedChanges]
    );




    return (
        <SafeAreaView style={styles.container}>
            <InternetAlert checkConnection={checkConnection} language={language} isConnected={isConnected} />

            {/* <LinearGradient colors={['#0073C5', '#9069FF']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.linearGradient}> */}
            <ImageBackground source={bgImg} resizeMode="cover" style={styles.image}>
                <LandscapeLogo />
                <BoardGame navigation={navigation} roomName={roomName} setPlayer1Pawn={setPlayer1Pawn} setPlayer2Pawn={setPlayer2Pawn} player2Pawn={player2Pawn} pawns={pawns} player1Pawn={player1Pawn} diceVal={diceVal} setShowTask={setShowTask} setShowTaskId={setShowTaskId} setGameEnded={setGameEnded} changePlayerId={changePlayerId} activePlayerId={activePlayerId} setActivePlayerId={setActivePlayerId} player2={player2} setPlayer2={setPlayer2} player1={player1} setPlayer1={setPlayer1} playMove={playMove} playBackMove={playBackMove}></BoardGame>
                <BottomComponent navigation={navigation} showTask={showTask} player1Details={player1Details} player2Details={player2Details} player2Pawn={player2Pawn} pawns={pawns} player1Pawn={player1Pawn} roomName={roomName} disableDice={disableDice} setDisableDice={setDisableDice} resetForReplay={resetForReplay} gameEnded={gameEnded} setGameEnded={setGameEnded} changePlayerId={changePlayerId} activePlayerId={activePlayerId} setActivePlayerId={setActivePlayerId} diceMove={diceMove} setDiceMove={setDiceMove} playMove={playMove} player1={player1} player2={player2}></BottomComponent>
                {showTask && <ScreenOverlayComponent />}
                {showTask && <TaskShowComponent task={taskList[showTaskId]} setShowTask={setShowTask}></TaskShowComponent>}
            </ImageBackground>
            {/* </LinearGradient> */}
        </SafeAreaView>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,

        // backgroundColor: "#083D77"
    },

    image: {
        flex: 1,
        // justifyContent: 'center',
    },

    linearGradient: {
        flex: 1,

    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 300,
    },

});

export default Game