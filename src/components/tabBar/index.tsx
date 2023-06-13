import * as React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import rpx from '@/utils/rpx';

import Home from '@/pages/home';
import Mine from '@/pages/mine';
import Info from '@/pages/info';
import Chart from '@/pages/chart';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createMaterialTopTabNavigator();

export default function TabBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#47ab94',
        tabBarShowLabel: false,
        tabBarIndicatorStyle: {
          height: 0,
        },
        animationEnabled: false,
        tabBarBounces: false,
        tabBarPressColor: '#ccc',
      }}
      backBehavior="firstRoute"
      initialRouteName="home"
      tabBarPosition="bottom">
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <Icon name="home-plus-outline" color={color} size={rpx(50)} />
            ) : (
              <Icon name="home-plus-outline" color={'#999'} size={rpx(50)} />
            );
          },
        }}
      />
      <Tab.Screen
        name="info"
        component={Info}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <Icon
                name="calendar-month-outline"
                color={color}
                size={rpx(50)}
              />
            ) : (
              <Icon
                name="calendar-month-outline"
                color={'#999'}
                size={rpx(50)}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="chart"
        component={Chart}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <Icon name="circle-slice-3" color={color} size={rpx(50)} />
            ) : (
              <Icon name="circle-slice-3" color={'#999'} size={rpx(50)} />
            );
          },
        }}
      />
      <Tab.Screen
        name="mine"
        component={Mine}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <Icon
                name="dots-horizontal-circle-outline"
                color={color}
                size={rpx(50)}
              />
            ) : (
              <Icon
                name="dots-horizontal-circle-outline"
                color={'#999'}
                size={rpx(50)}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}
