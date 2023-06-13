import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';

const App = () => {
  return (
    <SafeAreaView>
      {/* <StatusBar backgroundColor="transparent" /> */}
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Text>chart</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
