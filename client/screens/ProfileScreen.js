import { Text } from '@ui-kitten/components';
import React  from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import Toast from 'react-native-toast-message';

import Header from '../components/Header';
import OverlaySpinner from '../components/OverlaySpinner';

const ProfileScreen = ({ navigation, route }) => {
  const { user } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header text="Profile" navigation={navigation} smallHeader showMenu backButton />

        <Text style={styles.infoHeader} category='h5'>Personal Information</Text>


        <View style={styles.textGroup}>
          <Text style={styles.text} category='s1'>First Name</Text>
          <Text style={styles.text} category='p1'>{  user.first_name }</Text>
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.text} category='s1'>Last Name</Text>
          <Text style={styles.text} category='p1'>{  user.last_name }</Text>
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.text} category='s1'>Email Name</Text>
          <Text style={styles.text} category='p1'>{  user.email }</Text>
        </View>
        
        <OverlaySpinner visible={false} />
        <Toast />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingTop: 0,
    height: '100%',
  },
  safe: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    marginBottom: 30,
  },
  infoHeader: {
    marginTop: 20,
    marginBottom: 20
  },
  textGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  logo: {
    width: 140,
    resizeMode: 'contain',
  },
  textInput: {
    marginBottom: 20,
  },
  text: {
    marginTop: 15
  },
  button: {
    width: '45%',
  },
  buttonsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  boardsWrapper: {
    marginTop: 10,
    height: '77%',
  },
  board: {
    marginTop: 7,
    marginBottom: 7,
  },
});

export default ProfileScreen;
