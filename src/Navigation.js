import React, { useContext } from 'react'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


/// bring all screens

import Home from './screens/Home';
import Splash from './screens/Splash';
import Login from './screens/Login';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Game from './screens/Game';
import CreateRoom from './screens/CreateRoom';
import JoinRoom from './screens/JoinRoom';
import Win from './screens/Win';
import { Avatar } from "./screens/Avatar";
import Offline from './screens/Offline';
import BuyCoins from './screens/BuyCoins';
import RedeemCoins from "./screens/RedeemCoins";


const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { isUserLoggedIn, splashLoading, userExist } = useContext(AuthContext);
    return (
        <NavigationContainer>

            <Stack.Navigator screenOptions={{
                headerShown: false,
                // unmountOnBlur: true
            }}>

                {splashLoading ?
                    <Stack.Screen
                        name="Splash"
                        component={Splash}
                    ></Stack.Screen> : isUserLoggedIn ?
                        userExist ? (<Stack.Group>

                            <Stack.Screen
                                name="Home"
                                component={Home}

                            />
                            <Stack.Screen
                                name="BuyCoins"
                                component={BuyCoins}

                            />
                                <Stack.Screen
                                    name="RedeemCoins"
                                    component={RedeemCoins}

                                />
                            <Stack.Screen
                                name="CreateRoom"
                                component={CreateRoom}

                            />
                            <Stack.Screen
                                name="JoinRoom"
                                component={JoinRoom}

                            />
                            <Stack.Screen
                                name="Offline"
                                component={Offline}

                            />

                            <Stack.Screen
                                name="Game"
                                component={Game}

                            />

                            <Stack.Screen
                                name="Avatar"
                                component={Avatar}

                            />
                            <Stack.Screen
                                name="Win"
                                component={Win}

                            />

                        </Stack.Group>) :
                            // <></>
                            <Stack.Screen
                                name="Game"
                                component={Game}

                            />


                        : (
                            <Stack.Screen
                                name="Login"
                                component={Login}

                            ></Stack.Screen>
                        )
                }


            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation