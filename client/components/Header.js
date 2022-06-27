import React from 'react';
import {
  StyleSheet,
  View,
  Image
} from 'react-native';
import { Button, Icon, List, ListItem,  Text } from '@ui-kitten/components';

import Modal from 'react-native-modal';

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

const Header = ({ text, user = {fullName: 'Test Name'} }) => {
  const [sideMenuVisible, setSideMenuVisible] = React.useState(false);

  const renderItemIcon = (props) => (
    <Icon {...props} name='person'/>
  );


  const renderItem = ({ item, index }) => (
    <ListItem
      title={`${item.title} ${index + 1}`}
      accessoryLeft={renderItemIcon}
    />
  );
  return (
    <>
      <View style={styles.imageContainer}>
        <View style={styles.logoWrapper}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.menuIconWrapper} >
          <Icon style={styles.menuIcon} name='menu-outline' fill="black" onPress={() => setSideMenuVisible(true)}/>
        </View>
      </View>

      <Modal
        style={styles.sideMenu}
        animationIn="slideInRight"
        isVisible={sideMenuVisible}
        animationOut="slideOutRight"
        onSwipeComplete={() => setSideMenuVisible(false)}
        swipeDirection="right"  
      >
        <View style={styles.sideMenuContent}>
          {/* <List
            style={styles.container}
            data={data}
            renderItem={renderItem}
          /> */}
          <Text style={styles.text} category='s1'>{user.fullName}</Text>
          <View style={styles.logoutButtonWrapper}>
            <Button style={styles.logoutButton} status='danger'>Log Out</Button>
          </View>
        </View>
      </Modal>

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
  }
});

export default Header;
