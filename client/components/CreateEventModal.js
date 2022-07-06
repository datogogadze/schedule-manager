import React, { useMemo, useRef } from 'react';
import {
  ScrollView,
  StyleSheet, View,
} from 'react-native';
import moment from 'moment';
import { Button, Card, Text, Modal, Input } from '@ui-kitten/components';
import { createEvent } from '../utils/api-calls';
import OverlaySpinner from './OverlaySpinner';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getUser } from '../utils/auth';

const CreateEventModal = ({ visible, boardId, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = React.useState(false);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const [day, setDay] = React.useState(new Date());
  const [hourFrom, setHourFrom] = React.useState(new Date());
  const [hourTo, setHourTo] = React.useState(new Date());

  const [startTime, duration] = useMemo(() => {
    const startDayMilliseconds = moment(day).startOf('day').valueOf();
    const startTimeMilliseconds = hourFrom.getHours() * 60 * 60 * 1000 + hourFrom.getMinutes() * 60 * 1000;
    const endTimeMilliseconds = hourTo.getHours() * 60 * 60 * 1000 + hourTo.getMinutes() * 60 * 1000;
    
    const s = startDayMilliseconds + startTimeMilliseconds;
    const d = endTimeMilliseconds - startTimeMilliseconds;

    return [s, d];
  }, [day, hourFrom, hourTo]);

  const refDescription = useRef();


  const handleCreateEvent = async () => {
    setLoading(true);
    const user = await getUser();

    createEvent(
      boardId,
      user.id,
      name,
      description,
      startTime,
      null,
      duration
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
        onPress={handleCreateEvent}
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
            <Input
              placeholder="Name"
              status="basic"
              style={styles.textInput}
              autoCapitalize="none"
              label="Event Name"
              size="large"
              onChangeText={(value) => setName(value)}
              onSubmitEditing={() => refDescription.current.focus()}
            />

            <Input
              placeholder="Description"
              label="Description"
              status="basic"
              style={styles.textInput}
              autoCapitalize="none"
              size="large"
              multiline
              numberOfLines={5}
              ref={refDescription}
              onChangeText={(value) => setDescription(value)}

            />

            <View style={styles.dates}>
              <Text style={styles.text} category='s2'>Day</Text>
              <DateTimePicker
                mode="date"
                onChange={(event, value) => setDay(value)}
                value={day}
              />

              <Text style={styles.text} category='s2'>From</Text>
              <DateTimePicker
                mode="time"
                onChange={(event, value) => setHourFrom(value)}
                value={hourFrom}
              />

              <Text style={styles.text} category='s2'>To</Text>
              <DateTimePicker
                mode="time"
                minimumDate={hourFrom}
                onChange={(event, value) => setHourTo(value)}
                value={hourTo}
              />
            </View>   
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
  scrollView: {
    height: '75%'
  },
  modal: {
    width: '80%',
    height: '75%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
});

export default CreateEventModal;
