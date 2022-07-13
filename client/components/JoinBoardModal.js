import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, Modal, Input } from '@ui-kitten/components';
import OverlaySpinner from './OverlaySpinner';
import { joinBoard } from '../utils/api-calls';

const JoinBoardModal = ({ visible, onClose, onSuccess, onError }) => {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleJoinBoard = () => {
    setLoading(true);
    joinBoard(code, 'father')
      .then((res) => {
        setLoading(false);
        const { success, board_id } = res.data;
        if (success) {
          onSuccess(board_id);
        } else {
          onError('Error while creating board');
        }
      })
      .catch((e) => {
        setLoading(false);
        const { message } = e.response.data;
        onError(message);
      });
  };

  const CardHeader = (props) => (
    <View {...props}>
      <Text category="h6">Join Board</Text>
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
        onPress={handleJoinBoard}
      >
        Join
      </Button>
    </View>
  );

  return (
    <>
      <Modal
        style={styles.modal}
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={onClose}
      >
        <Card style={styles.card} header={CardHeader} footer={CardFooter}>
          <Text style={styles.text}>Enter the code of the board.</Text>
          <Input
            placeholder="Name"
            status="basic"
            style={styles.textInput}
            autoCapitalize="none"
            size="large"
            value={code}
            onChangeText={(text) => setCode(text)}
          />
        </Card>
        <OverlaySpinner visible={loading} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: '85%',
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

export default JoinBoardModal;
