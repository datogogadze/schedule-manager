import { Button, Card, Icon, Layout, Text } from '@ui-kitten/components';
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from 'react-native';

import Toast from 'react-native-toast-message';
import CreateBoardModal from '../components/CreateBoardModal';

import Header from '../components/Header';
import JoinBoardModal from '../components/JoinBoardModal';
import OverlaySpinner from '../components/OverlaySpinner';
import { getUserBoards, loginDevice } from '../utils/api-calls';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getUser, setUser, setDeviceToken } from '../utils/auth';

const BoardsScreen = ({ navigation }) => {
  const [boards, setBoards] = React.useState([]);
  const [createBoardModalOpen, setCreateBoardModalOpen] = React.useState(false);
  const [joinBoardModalOpen, setJoinBoardModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isInitial, setIsInitial] = React.useState(true);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBoards();
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const registerForPushNotificationsAsync = async () => {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        if (token) {
          const user = await getUser();
          await loginDevice(user.id, token, user.session_expires);
          await setDeviceToken(token);
        } else {
          alert('Can not send notifications to this device');
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (err) {
      console.log(
        'Device login error',
        err,
        err.request ? 'path: ' + err.request._url : ''
      );
    }
  };

  useEffect(async () => {
    registerForPushNotificationsAsync();
  }, []);

  const fetchBoards = () => {
    getUserBoards()
      .then((res) => {
        setBoards(res.data.boards);
        setLoading(false);
        setIsInitial(false);
        setRefreshing(false);
      })
      .catch((e) => {
        setLoading(false);
        setIsInitial(false);
        setRefreshing(false);
        const { data, status } = e.response;
        const { message } = data;
        if (status === 401) {
          navigation.navigate('Login');
        }
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: message,
        });
      });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header text="My Boards" navigation={navigation} smallHeader showMenu />
        <ScrollView
          style={styles.boardsWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchBoards();
            }} />
          }
        >
          {boards.length > 0 &&
            boards.map((board) => (
              <Card
                style={styles.board}
                key={board.id}
                onPress={() =>
                  navigation.navigate('SelectedBoard', {
                    boardId: board.id,
                    boardName: board.name
                  })
                }
              >
                <Text category="h6">{board.name}</Text>
              </Card>
            ))}
          {!isInitial && boards.length == 0 && (
            <Text>You have no boards. Join or create one.</Text>
          )}
        </ScrollView>

        { createBoardModalOpen && <CreateBoardModal
          onClose={() => setCreateBoardModalOpen(false)}
          onSuccess={(board) => {
            setCreateBoardModalOpen(false);
            navigation.navigate('SelectedBoard', { boardId: board.id, boardName: board.name });
          }}
        /> }

        { joinBoardModalOpen && <JoinBoardModal
          onClose={() => setJoinBoardModalOpen(false)}
          onSuccess={(board) => {
            setJoinBoardModalOpen(false);
            navigation.navigate('SelectedBoard', { boardId: board.id, boardName: board.name });
          }}
        /> }

        <Layout style={styles.buttonsWrapper} level="1">
          <Button
            style={styles.button}
            size="medium"
            status="primary"
            accessoryLeft={<Icon name="plus-circle-outline" />}
            onPress={() => setCreateBoardModalOpen(true)}
          >
            Create
          </Button>

          <Button
            style={styles.button}
            size="medium"
            status="primary"
            appearance="outline"
            accessoryLeft={<Icon name="person-add-outline" />}
            onPress={() => setJoinBoardModalOpen(true)}
          >
            Join
          </Button>
        </Layout>
        <OverlaySpinner visible={loading} />
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

export default BoardsScreen;
