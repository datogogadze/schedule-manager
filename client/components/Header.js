import React from 'react';
import { StyleSheet, View, Image, SafeAreaView } from 'react-native';
import { Button, Icon, MenuItem, Text } from '@ui-kitten/components';

import Modal from 'react-native-modal';
import { logout, logoutDevice } from '../utils/api-calls';
import { getUser, removeUser } from '../utils/auth';

const logo = require('../assets/logo.png');

const Header = ({ navigation, text, showMenu, backButton }) => {
  const [sideMenuVisible, setSideMenuVisible] = React.useState(false);

  const handleLogout = () => {
    logout()
      .then(async () => {
        const user = await getUser();
        await logoutDevice(user.id, user.device_token);
        await removeUser();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        setSideMenuVisible(false);
      })
      .catch((e) => {
        console.log(e);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        setSideMenuVisible(false);
      });
  };

  const renderHeaderWithLogo = () => (
    <View style={styles.headerContainer}>
      <View style={styles.logoWrapper}>
        <Image style={styles.logo} source={logo} />
      </View>
    </View>
  );

  const renderHeaderWithMenu = () => (
    <View style={styles.headerContainer}>
      {backButton && (
        <View style={styles.backIconWrapper}>
          <Icon
            style={styles.backIcon}
            name="arrow-ios-back-outline"
            fill="black"
            onPress={() => navigation.goBack()}
          />
        </View>
      )}

      <View style={styles.logoWrapper}>
        <Text style={styles.smallHeader} category="h4">
          {text}
        </Text>
      </View>

      <View style={styles.menuIconWrapper}>
        <Icon
          style={styles.menuIcon}
          name="menu-outline"
          fill="black"
          onPress={() => setSideMenuVisible(true)}
        />
      </View>
    </View>
  );

  return (
    <>
      {showMenu ? renderHeaderWithMenu() : renderHeaderWithLogo()}

      {showMenu && (
        <Modal
          style={styles.sideMenu}
          animationIn="slideInRight"
          isVisible={sideMenuVisible}
          animationOut="slideOutRight"
          onSwipeComplete={() => setSideMenuVisible(false)}
          swipeDirection="right"
        >
          <SafeAreaView>
            <View style={styles.sideMenuContent}>
              <Text style={styles.fullName} category="h6">
                Test User
              </Text>
              <Button
                style={styles.logoutButton}
                status="basic"
                accessoryLeft={<Icon name="star" />}
                appearance="ghost"
              >
                View Boards
              </Button>
              <Button
                style={styles.logoutButton}
                status="basic"
                accessoryLeft={<Icon name="star" />}
                appearance="ghost"
              >
                Profile
              </Button>
              <MenuItem
                title="View boards"
                accessoryRight={<Icon name="arrow-ios-forward" />}
                style={styles.menuItem}
              />
              <View style={styles.logoutButtonWrapper}>
                <Button
                  style={styles.logoutButton}
                  status="danger"
                  onPress={handleLogout}
                >
                  Log Out
                </Button>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {!showMenu && (
        <Text style={styles.header} category="h3">
          {text}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 30,
  },
  smallHeader: {},
  smallHeaderWrapper: {
    position: 'absolute',
    left: 0,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  logo: {
    width: 110,
    resizeMode: 'contain',
    height: 100,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  menuIconWrapper: {
    position: 'absolute',
    right: 0,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  backIconWrapper: {
    position: 'absolute',
    left: 0,
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
  sideMenuLogoWrapper: {},
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
    textAlign: 'center',
  },
  menuItem: {
    padding: 30,
  },
});

export default Header;
