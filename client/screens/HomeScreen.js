import React from 'react';
import { StyleSheet, View, } from 'react-native';
import { Text, Button} from '@ui-kitten/components';


export default HomeScreen = ({ navigation }) => {
    return< View style={styles.container}>
        <Text>This is home page</Text>
        <Button onPress={() => navigation.navigate('Login')}>Login Page</Button>
    </View>
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });