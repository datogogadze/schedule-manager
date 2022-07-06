import React from 'react';
import {
  StyleSheet,
} from 'react-native';
import { Modal, Calendar } from '@ui-kitten/components';
import { MomentDateService } from '@ui-kitten/moment';

const dateService = new MomentDateService();

const CalendarModal = ({ date, onClose, onSelect }) => {

  return (
    <>
      <Modal
        style={styles.modal}
        onBackdropPress={onClose}
        visible={true}
        backdropStyle={styles.backdrop}
      >
        <Calendar
          style={{
            backgroundColor: 'white',
          }}
          dateService={dateService}
          date={date}
          onSelect={onSelect}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#F5FCFF88',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }
});

export default CalendarModal;
