import React from 'react';
import {
  StyleSheet,
  View,
  Image
} from 'react-native';
import { Text } from '@ui-kitten/components';

const logo = require('../assets/logo.png');

const Header = ({ text }) => {
  return (
    <>
      <View style={styles.imageContainer}>
        <Image style={styles.logo} source={logo} />
      </View>

      <Text style={styles.header} category="h3">
        { text }
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    width: 110,
    resizeMode: 'contain',
  },
});

export default Header;
