import { Text } from '@ui-kitten/components';
import React  from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import Toast from 'react-native-toast-message';

import Header from '../components/Header';
import OverlaySpinner from '../components/OverlaySpinner';

const ProfileScreen = ({ navigation, route }) => {
  const { user } = route.params;

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Header text="Profile" navigation={navigation} smallHeader showMenu />
        <Text style={styles.text} category='h5'>Personal Information</Text>

        <Text style={styles.text} category='s1'>First Name</Text>
        <Text style={styles.text} category='p1'>{ user.first_name }</Text>

        <Text style={styles.text} category='s1'>Last Name</Text>
        <Text style={styles.text} category='p1'>{ user.last_name }</Text>

        <Text style={styles.text} category='s1'>Email</Text>
        <Text style={styles.text} category='p1'>{ user.email }</Text>
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
  header: {
    marginBottom: 30,
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
