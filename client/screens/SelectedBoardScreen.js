import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import Toast from 'react-native-toast-message';
import Header from '../components/Header';


const SelectedBoardScreen = ({ route }) => {
  const { boardName } = route.params;
  return (
    <View style={styles.container}>
      <Header text={boardName} />
      <Toast/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
  }
});

export default SelectedBoardScreen;
