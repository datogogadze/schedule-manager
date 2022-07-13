import React, { useRef } from 'react';
import {
  ScrollView,
  StyleSheet, View,
} from 'react-native';
import moment from 'moment';
import { Button, Card, Text, Modal} from '@ui-kitten/components';
import { createEvent } from '../utils/api-calls';
import OverlaySpinner from './OverlaySpinner';
import { getUser } from '../utils/auth';
import EditEventForm from './EditEventForm';
import { frequencies } from '../utils/select-options';


const CreateEventModal = ({ visible, boardId, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = React.useState(false);


  const refForm = useRef();

  const handleSubmit = async (values) => {
    setLoading(true);
    const user = await getUser();

    const {
      description,
      eventDay,
      frequencyIndex,
      hourFrom,
      hourTo,
      interval,
      isRecurring,
      name,
      recurrenceCount,
      recurrenceEndDate,
      recurrenceEndingIndex,
    } = values;

    const startDayMilliseconds = moment(eventDay).startOf('day').valueOf();
    const startTimeMilliseconds = hourFrom.getHours() * 60 * 60 * 1000 + hourFrom.getMinutes() * 60 * 1000;
    const endTimeMilliseconds = hourTo.getHours() * 60 * 60 * 1000 + hourTo.getMinutes() * 60 * 1000;
    
    const startTime = startDayMilliseconds + startTimeMilliseconds;
    const duration = endTimeMilliseconds - startTimeMilliseconds;

    let rEndDate = null;
    let rFrequency = null;
    let rInterval = null;
    let rCount = null;

    if (isRecurring) {
      rFrequency = frequencies[frequencyIndex];
      rInterval = Number(interval);
      if (recurrenceEndingIndex == 0) {
        rEndDate = moment(recurrenceEndDate).startOf('day').valueOf();
      } else {
        rCount = Number(recurrenceCount);
      }
    }

    createEvent(
      boardId,
      user.id,
      name,
      description,
      startTime,
      rEndDate,
      duration,
      rFrequency,
      rInterval,
      rCount
    ).then(res => {
      setLoading(false);
      const { success } = res.data;
      if (success) {
        onSuccess();
      } else {
        onError('Error while creating board');
      }
    }).catch(e => {
      setLoading(false);
      const { message } = e.response.data;
      console.log(message);
      onError(message);
    });
  };

  const CardHeader = (props) => (
    <View {...props}>
      <Text category='h6'>Create Event</Text>
    </View>
  );
  
  const CardFooter = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <Button
        style={styles.footerControl}
        size='medium'
        status='basic'
        onPress={onClose}
      >
        Cancel
      </Button>
      <Button
        style={styles.footerControl}
        size='medium'
        onPress={() => {
          if (refForm.current) {
            refForm.current.handleSubmit();
          }
        }}
      >
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
      >
          
        <Card style={styles.createEventCard} header={CardHeader} footer={CardFooter } disabled>
          <ScrollView style={styles.scrollView}>
            <EditEventForm refForm={refForm} handleSubmit={handleSubmit} />

          </ScrollView> 
        </Card>
        <OverlaySpinner visible={loading} />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  createEventCard: {
    width: '100%',
    height: '100%'
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
  textInput: {
    marginBottom: 20
  },
  dates: {
    marginTop: 20
  },
  frequency: {
    marginTop: 20
  },
  scrollView: {
    height: '75%'
  },
  modal: {
    width: '80%',
    height: '75%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  inputRow: {
    flexDirection: 'row'
  }
});

export default CreateEventModal;
