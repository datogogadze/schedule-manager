import { Text, Button, Divider, ListItem, List, Icon } from '@ui-kitten/components';
import React, { useEffect }  from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Clipboard,
  StatusBar
} from 'react-native';

import Toast from 'react-native-toast-message';

import Header from '../components/Header';
import OverlaySpinner from '../components/OverlaySpinner';
// import Clipboard from '@react-native-clipboard/clipboard';

import { getBoard, getBoardUsers, removeUserFromBoard } from '../utils/api-calls';

const BoardDetailsScreen = ({ navigation, route }) => {
  const { boardId, userId } = route.params;


  const [loading, setLoading] = React.useState(true);
  const [board, setBoard] = React.useState(null);
  const [users, setUsers] = React.useState([]);

  console.log('board', board);

  // onPress={() => Clipboard.setString('mail@mail.com')}

  useEffect(() => {
    const reqests = [
      getBoardUsers(boardId).then(res => {
        const { users } = res.data;
        setUsers(users);
      }).catch(e => {
        const { message } = e.response.data;

        Toast.show({
          type: 'error',
          text1: 'შეცდომა',
          text2: message,
        });
      }),
  
      getBoard(boardId).then(res => {
        const { board } = res.data;
        setBoard(board);
      }).catch(e => {
        const { message } = e.response.data;

        Toast.show({
          type: 'error',
          text1: 'შეცდომა',
          text2: message,
        });
      })
    ];

    Promise.all(reqests).finally(() => setLoading(false));
  }, []);

  const handleLeaveBoard = () => {
    setLoading(true);
    removeUserFromBoard(boardId, userId).then(res => {
      const { success } = res.data;
      if (success) {
        navigation.navigate('Boards');
      }
      setLoading(false);
    }).catch(e => {
      setLoading(false);
      const { message } = e.response.data;

      Toast.show({
        type: 'error',
        text1: 'შეცდომა',
        text2: message,
      });
    });
  };

  const handleCopyCode = () => {
    Clipboard.setString(board.code);
    Toast.show({
      type: 'info',
      text1: 'კოდი დაკოპირებულია',
    });
  };

  const renderItem = ({ item }) => (
    <ListItem
      title={item.display_name + (item.id === userId ? ' (მე)' : '')}
    />
  );
  
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header text={board?.name} navigation={navigation} smallHeader showMenu backButton/>
        { board && <>
          <Text style={styles.infoHeader} category='h5'>კალენდრის ინფორმაცია</Text>


          <View style={styles.textGroup}>
            <Text style={styles.text} category='s1'>სახელი</Text>
            <Text style={styles.text} category='p1'>{ board.name }</Text>
          </View>

          <View style={styles.textGroup}>
            <Text style={styles.text} category='s1'>გვარი</Text>
            <View style={styles.code} onPress={handleCopyCode}>
              <Text style={styles.codeText} category='s1' onPress={handleCopyCode}>{ board.code }</Text>
              <Icon name="copy-outline" style={styles.copyIcon} fill="#3366FE" />
            </View>
          </View>
          <Divider/>

          <Text style={styles.infoHeader} category='h6'>კალენდრის მომხმარებლები</Text>

          <List
            style={{backgroundColor: 'white'}}
            data={users}
            ItemSeparatorComponent={Divider}
            renderItem={renderItem}
          />


          <Button
            size="large"
            status="danger"
            onPress={handleLeaveBoard}
          >
            {board?.creator_id == userId ? 'კალენდარის წაშლა' : 'კალენდარის დატოვება'}
          </Button>
        </> }

      </View>
      <Toast />
      <OverlaySpinner visible={loading} />
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
  textGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20
  },
  text: {
    marginTop: 15
  },
  header: {
    marginBottom: 30,
  },
  infoHeader: {
    marginTop: 20,
    marginBottom: 20
  },
  code: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',

  },
  codeText: {
    color: '#3366FE',
    alignContent: 'center',
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
  copyIcon: {
    width: 20,
    height: 20,
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

export default BoardDetailsScreen;
