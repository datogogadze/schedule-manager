import { Button, Card, Icon, Layout, Text } from '@ui-kitten/components';
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';


import Toast from 'react-native-toast-message';
import CreateBoardModal from '../components/CreateBoardModal';

import Header from '../components/Header';
import JoinBoardModal from '../components/JoinBoardModal';



const BoardsScreen = ({ navigation }) => {
  const [boards, setBoards] = React.useState([
    { id: 1, name: 'Board 1' },
    { id: 2, name: 'Board 2' },
    { id: 3, name: 'Board 3' },
    { id: 4, name: 'Board 4' },
    { id: 5, name: 'Board 5' },
    { id: 6, name: 'Board 6' },
    { id: 7, name: 'Board 7' },
  ]);

  const [createBoardModalOpen, setCreateBoardModalOpen] = React.useState(false);
  const [joinBoardModalOpen, setJoinBoardModalOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <Header text="Your Boards" />
      <ScrollView style={styles.boardsWrapper}>
        { boards.map(board => (
          <Card
            style={styles.board}
            key={board.id}
            onPress={() => navigation.navigate('SelectedBoard', {
              boardName: board.name,
            })}
          >
            <Text category='h6'>
              {board.name}
            </Text>
          </Card>
        ))}
      </ScrollView>

      <CreateBoardModal
        visible={createBoardModalOpen} 
        onClose ={() => setCreateBoardModalOpen(false)}
      />
      
      <JoinBoardModal
        visible={joinBoardModalOpen} 
        onClose ={() => setJoinBoardModalOpen(false)}
      />

      <Layout style={styles.buttonsWrapper} level='1'>
        <Button
          style={styles.button}
          size='medium'
          status='primary'
          accessoryLeft={<Icon name='plus-circle-outline'/>}
          onPress={() => setCreateBoardModalOpen(true)}
        >
          Create
        </Button>

        <Button
          style={styles.button}
          size='medium'
          status='primary'
          appearance='outline'
          accessoryLeft={<Icon name='person-add-outline'/>}
          onPress={() => setJoinBoardModalOpen(true)}
        >
          Join
        </Button>
      </Layout>
      <Toast/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
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
    width: '45%'
  },
  buttonsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  boardsWrapper: {
    marginTop: 10,
    height: '68%'
  },
  board: {
    marginTop: 7,
    marginBottom: 7,
  }
});

export default BoardsScreen;
