import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, Modal, Input } from '@ui-kitten/components';
import { createBoard } from '../utils/api-calls';
import OverlaySpinner from './OverlaySpinner';
import Toast from 'react-native-toast-message';


const CreateBoardModal = ({ onClose, onSuccess }) => {
  const [boardName, setBoardName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleCreateBoard = () => {
    setLoading(true);
    createBoard(boardName, 'father')
      .then((res) => {
        setLoading(false);
        const { success, board } = res.data;

        if (success) {
          onSuccess(board);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: 'Error while creating board',
          });
        }
      })
      .catch((e) => {
        setLoading(false);
        const { message } = e.response.data;
        // onError(message);
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: message,
        });
      });
  };

  const CardHeader = (props) => (
    <View {...props}>
      <Text category="h6">Create Board</Text>
    </View>
  );

  const CardFooter = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <Button
        style={styles.footerControl}
        size="medium"
        status="basic"
        onPress={onClose}
      >
        Cancel
      </Button>
      <Button
        style={styles.footerControl}
        size="medium"
        onPress={handleCreateBoard}
      >
        Create
      </Button>
    </View>
  );

  return (
    <>
      <Modal
        style={styles.modal}
        visible
        backdropStyle={styles.backdrop}
      >
        <Card style={styles.card} header={CardHeader} footer={CardFooter}>
          <Text style={styles.text}>Enter the name of the board.</Text>
          <Input
            placeholder="Name"
            status="basic"
            style={styles.textInput}
            autoCapitalize="none"
            size="large"
            value={boardName}
            onChangeText={(text) => setBoardName(text)}
          />
        </Card>
        <Toast />
        <OverlaySpinner visible={loading} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: '100%',
    height: '90%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  card: {
    // height: '50%'
    width: '85%'
  },
  text: {
    marginBottom: 12,
  },
  backdrop: {
    backgroundColor: '#F5FCFF88',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerControl: {
    marginHorizontal: 2,
  },
});

export default CreateBoardModal;
