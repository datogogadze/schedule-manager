import React from 'react';
import {StyleSheet, View} from 'react-native';
import { Spinner } from '@ui-kitten/components';


const OverlaySpinner = ({ visible }) => {
  return (
    <>
      { visible && <View style={styles.loading}>
        <Spinner size='giant'/>
      </View> }
    </>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5FCFF88'
  }
});

export default OverlaySpinner;
