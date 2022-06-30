import React from 'react';
import {
  StyleSheet,
  View,
  Image
} from 'react-native';
import { Button, Icon, List, ListItem,  MenuItem,  Text } from '@ui-kitten/components';

import Modal from 'react-native-modal';
import { logout } from '../utils/api-calls';

const logo = require('../assets/logo.png');
const data =[
  {
    title: 'Boards',
  },
  {
    title: 'Boards',
  },
  {
    title: 'Boards',
  },
];

const Header = ({ navigation, text, showMenu, smallHeader }) => {
  const [sideMenuVisible, setSideMenuVisible] = React.useState(false);

  const handleLogout = () => {
    logout().then(() => {
      navigation.navigate('Login');
    }).catch(e => {
      console.log(e);
    });
  };

  return (
    <>
      <View style={styles.imageContainer}>
        { !!smallHeader && <View style={styles.smallHeaderWrapper}>
          <Text style={styles.smallHeader} category="h5">
            { text }
          </Text>
        </View> }
       
        <View style={styles.logoWrapper}>
          <Image style={styles.logo} source={logo} />
        </View>
        { showMenu && <View style={styles.menuIconWrapper} >
          <Icon style={styles.menuIcon} name='menu-outline' fill="black" onPress={() => setSideMenuVisible(true)}/>
        </View> }
      </View>

      { showMenu && <Modal
        style={styles.sideMenu}
        animationIn="slideInRight"
        isVisible={sideMenuVisible}
        animationOut="slideOutRight"
        onSwipeComplete={() => setSideMenuVisible(false)}
        swipeDirection="right"  
      >
        <View style={styles.sideMenuContent}>
          <Text style={styles.fullName} category='h6'>Test User</Text>
          <MenuItem
            title='View boards'
            accessoryRight={<Icon name='arrow-ios-forward'/>}
            style={styles.menuItem}
          />
          <View style={styles.logoutButtonWrapper}>
            <Button style={styles.logoutButton} status='danger' onPress={handleLogout}>Log Out</Button>
          </View>
        </View>
      </Modal> }

      { !smallHeader && <Text style={styles.header} category="h3">
        { text }
      </Text> }
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  smallHeader: {

  },
  smallHeaderWrapper: {
    position: 'absolute',
    left: 0
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
  menuIcon: {
    width: 30,
    height: 30,
  },
  menuIconWrapper: {
    position: 'absolute',
    right: 0
  },
  sideMenu: {
    backgroundColor: 'white',
    margin: 0, // This is the important style you need to set
    // alignItems: undefined,
    // justifyContent: undefined,
    height: '100%',
    alignSelf: 'flex-end',
    width: '70%',
    paddingTop: 35,
  },
  sideMenuContent: {
    width: '100%',
    height: '100%',
  },
  backdrop: {
    backgroundColor: '#F5FCFF88',
  },
  logoutButton: {
    width: '80%',
  },
  logoutButtonWrapper: {
    marginTop: 20,
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullName: {
    textAlign: 'center'
  },
  menuItem: {
    padding: 30
  }
});

export default Header;
