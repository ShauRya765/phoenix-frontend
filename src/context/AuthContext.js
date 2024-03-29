import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { avatarImage, BASE_URL, FB_APP_ID, taskList1, bigTaskList1, socketURL } from '../Config';
import NetInfo from "@react-native-community/netinfo";
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import 'react-native-get-random-values'
import { nanoid } from 'nanoid'
import io from 'socket.io-client';

import { enBigTaskList1, enTaskList1 } from '../language/en';
import { frBigTaskList1, frTaskList1 } from '../language/fr';
import { databaseAmerica, databaseEurope, firebaseConfigAmerica, firebaseConfigEurope } from '../configs/firebase';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [database, setDatabase] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [splashLoading, setSplashLoading] = useState(true)
    const [activePlayerId, setActivePlayerId] = useState(1);
    const [myPlayerId, setMyPlayerId] = useState(1);
    const [userInfo, setUserInfo] = useState(null);
    const [language, setLanguage] = useState('en');
    const [region, setRegion] = useState('America');
    const [soundOn, setSoundOn] = useState(true)
    const [isGuestUser, setIsGuestUser] = useState(false);
    const [playBackSteps, setPlayBackSteps] = useState(2)
    const [taskIndex, setTaskIndex] = useState(0)

    const [totalTasks, setTotalTasks] = useState(enTaskList1.length)
    const [taskList, setTaskList] = useState(language == 'en' ? enTaskList1 : frTaskList1)
    const [bigTask, setBigTask] = useState(language == 'en' ? enBigTaskList1[0] : frBigTaskList1[0])

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [userExist, setUserExist] = useState(false);
    const [userData, setUserData] = useState();
    const [isAvatar, setIsAvatar] = useState(null);
    const [isConnected, setIsConnected] = useState(false)
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: Constants.manifest.extra.IOS_KEY,
        iosClientId: Constants.manifest.extra.ANDROID_KEY,
        expoClientId: Constants.manifest.extra.EXPO_CLIENT_ID
    })

    const socket = io(socketURL);

    // FACEBOOK LOGIN CODE
    // const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    //     clientId: FB_APP_ID,
    // });

    // useEffect(() => {
    //     if (fbResponse && fbResponse.type === "success" && fbResponse.authentication) {
    //         AsyncStorage.setItem('facebookAccessToken', JSON.stringify(fbResponse.authentication.accessToken)).then();
    //         setUserExist(false);
    //         setFacebookUserData(fbResponse).then()
    //     }
    // }, [fbResponse]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        })

        return () => {
            unsubscribe();
        }
    }, [])


    useEffect(() => {
        setTaskList(language === 'en' ? enTaskList1 : frTaskList1)
        setBigTask(language === 'en' ? enBigTaskList1[0] : frBigTaskList1[0])
    }, [language])


    useEffect(() => {
        if (response?.type === 'success') {
            AsyncStorage.setItem('googleAccessToken', JSON.stringify(response.authentication.accessToken)).then();
            setUserExist(false);
            setGoogleUserLoginData(response).then();
        }
    }, [response]);

    const setUserDetails = async (userDetails, data) => {
        await axios.post(`${BASE_URL}/api/loginByOAuth`, userDetails).then(async (apiRes) => {
            const coinsData = {
                "userId": data.id,
                "userCoins": 1000,
                "operation": "add"
            }
            if (apiRes.data.message !== 'User Exists. Please log in.') {
                await axios.post(`${BASE_URL}/api/changeUserCoins`, coinsData);
            }

            const userDataRes = {
                id: apiRes.data.data.id,
                family_name: apiRes.data.data.family_name,
                given_name: apiRes.data.data.given_name,
                name: apiRes.data.data.name,
                email: apiRes.data.data.email,
                verified_email: apiRes.data.data.verified_email,
                profileImage: apiRes.data.data.profileImage,
                userName: apiRes.data.data.userName
            }
            await AsyncStorage.setItem('userInfo', JSON.stringify(userDataRes));

            setUserExist(true);
            setIsUserLoggedIn(true);
            console.log("res::" + userDetails);
            setUserData(userDetails)
        });
    }

    const checkConnection = () => {
        NetInfo.fetch().then(async (state) => {
            if (state.isConnected) {
                setIsConnected(true)
            }
        });
    }


    // FACEBOOK LOGIN CODE
    // const setFacebookUserData = async (fbResponse) => {
    //     const userInfoResponse = await fetch(
    //         `https://graph.facebook.com/me?access_token=${fbResponse.authentication.accessToken}&fields=id,name,email`
    //     );
    //     await userInfoResponse.json().then(async data => {
    //         const username = (data.name.replace(/ /g, '').substring(0, 5) + Math.floor(Math.random() * 100000)).substring(0, 10).toLowerCase();
    //         const userDetails = {
    //             id: data.id,
    //             family_name: data.name.replace(/ /g, ''),
    //             given_name: data.name.replace(/ /g, ''),
    //             name: data.name,
    //             email: data.email,
    //             verified_email: true,
    //             profileImage: avatarImage[Math.floor(Math.random() * avatarImage.length)],
    //             userName: username
    //         }
    //         setUserDetails(userDetails, data).then();
    //     });
    //
    // }

    const setGoogleUserLoginData = async (response) => {
        let userInfoResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: { Authorization: `Bearer ${response.authentication.accessToken}` }
        })

        userInfoResponse.json().then(async data => {
            const username = (data.given_name.replace(/ /g, '').substring(0, 5) + Math.floor(Math.random() * 100000)).substring(0, 10).toLowerCase();
            const userDetails = {
                id: data.id,
                family_name: data.family_name,
                given_name: data.given_name,
                name: data.name,
                email: data.email,
                verified_email: data.verified_email,
                profileImage: avatarImage[Math.floor(Math.random() * avatarImage.length)],
                userName: username
            }


            setUserDetails(userDetails, data).then();
            await AsyncStorage.setItem('isGuestUser', "false");
            setIsGuestUser(false);
        })

    }

    useEffect(() => {
        if (region == 'America') {
            setDatabase(databaseAmerica)

        } else if (region == 'Europe') {

            setDatabase(databaseEurope)

        }
    }, [region])


    const handleGuestLogin = () => {
        const username = ('guest' + Math.floor(Math.random() * 100000)).substring(0, 10).toLowerCase();
        const userDetails = {
            id: nanoid(16),
            family_name: 'guest',
            given_name: username,
            name: username,
            email: username + `@${nanoid(5)}.com`,
            verified_email: true,
            profileImage: avatarImage[Math.floor(Math.random() * avatarImage.length)],
            userName: username
        }

        const data = {
            id: userDetails.id
        }
        setUserDetails(userDetails, data).then();
        AsyncStorage.setItem('isGuestUser', "true").then(() => {
            setIsGuestUser(true);
        });
    }

    const logout = async () => {
        setIsLoading(true);
        setUserExist(false);
        setIsUserLoggedIn(false);
        setUserData(null);
        await AsyncStorage.clear();
        setIsLoading(false);
    }


    const isLoggedIn = async () => {
        setIsLoading(true);
        setSplashLoading(true);
        setTimeout(() => {
            setSplashLoading(false);
        }, 5000);

        // AsyncStorage.clear();

        NetInfo.fetch().then(async (state) => {
            if (!state.isConnected) {
                console.log("connection")
                Alert.alert("Internet Required", "Please connect to the internet, and restart the app")
                setIsLoading(false)
            } else {
                try {
                    await AsyncStorage.getItem('userInfo').then(async (res) => {
                        if (res) {
                            setUserInfo(res);
                            const response = JSON.parse(res);
                            const userDetails = {
                                id: response.id,
                                family_name: response.family_name,
                                given_name: response.given_name,
                                name: response.name,
                                email: response.email,
                                verified_email: response.verified_email,
                                profileImage: response.picture,
                                userName: response.username
                            }
                            await axios.post(`${BASE_URL}/api/loginByOAuth`, userDetails).then((apiRes) => {
                                if (apiRes.data.message === 'User Exists. Please log in.') {
                                    setUserExist(true);
                                    setIsUserLoggedIn(true);
                                    setUserData(userDetails);
                                }
                            })
                            AsyncStorage.getItem('language').then((res) => {
                                if (res == null) setLanguage("en");
                                else setLanguage(res)
                            })
                            AsyncStorage.getItem('isGuestUser').then((res) => {
                                if (res && res === "true") {
                                    setIsGuestUser(true);
                                } else {
                                    setIsGuestUser(false);
                                }
                            })
                            AsyncStorage.getItem('region').then((res) => {
                                console.log(res);
                                if (res) {
                                    setRegion(res);
                                }
                            })
                        } else {
                            setIsUserLoggedIn(false);
                        }
                    })
                } catch (e) {
                    // console.log("Yes" + e);
                    setIsLoading(false);
                }
            }
        });
    }

    useEffect(() => {
        isLoggedIn().then();
    }, []);

    return (
        <AuthContext.Provider value={{
            bigTask,
            setBigTask,
            setTaskList,
            taskList,
            taskIndex,
            setTaskIndex,
            playBackSteps,
            setPlayBackSteps,
            myPlayerId,
            setMyPlayerId,
            activePlayerId,
            setActivePlayerId,
            setIsLoading,
            isLoading,
            splashLoading,
            logout,
            promptAsync,
            isUserLoggedIn,
            userExist,
            userInfo,
            isAvatar,
            checkConnection,
            setUserData,
            userData,
            setIsAvatar,
            language,
            setLanguage,
            handleGuestLogin,
            isConnected,
            soundOn,
            setSoundOn,
            socket,
            region, setRegion,
            database,
            totalTasks, setTotalTasks, isGuestUser
        }}>{children}
        </AuthContext.Provider>

    )
}

