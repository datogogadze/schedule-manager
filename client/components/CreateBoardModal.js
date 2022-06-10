import React from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { Button, Card, Text, Modal, Input } from '@ui-kitten/components';

const CreateBoardModal = ({ visible, onClose }) => {
  const CardHeader = (props) => (
    <View {...props}>
      <Text category='h6'>Create Board</Text>
    </View>
  );
  
  const CardFooter = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <Button
        style={styles.footerControl}
        size='medium'
        status='basic'
        onPress={() => onClose(false)}
      >
        Cancel
      </Button>
      <Button
        style={styles.footerControl}
        size='medium'>
        Create
      </Button>
    </View>
  );

  return (
    <>
      <Modal
        style={styles.modal}
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => onClose(false)}
      >
        <Card style={styles.card} header={CardHeader} footer={CardFooter}>
          <Text style={styles.text}>
            Enter the name of the board.
          </Text>
          <Input
            placeholder="Name"
            status="basic"
            style={styles.textInput}
            autoCapitalize="none"
            size="large"
          />
        </Card>
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

export default CreateBoardModal;
