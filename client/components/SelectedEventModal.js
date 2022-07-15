import React, { useMemo, useRef } from 'react';
import {
  ScrollView,
  StyleSheet, View,
} from 'react-native';
import moment from 'moment';
import { RRule } from 'rrule';
import { Button, Card, Text, Modal, OverflowMenu, MenuItem } from '@ui-kitten/components';
import { deleteEvent, updateEventAll, updateEventFuture, updateEventSingle } from '../utils/api-calls';
import OverlaySpinner from './OverlaySpinner';
import EditEventForm from './EditEventForm';
import { frequencies } from '../utils/select-options';
import Toast from 'react-native-toast-message';

const UPDATE_TYPE_SINGLE = 'single';
const UPDATE_TYPE_FUTURE = 'future';
const UPDATE_TYPE_ALL = 'all';

const updateRequestFunctions = {
  [UPDATE_TYPE_SINGLE]: updateEventSingle,
  [UPDATE_TYPE_FUTURE]: updateEventFuture,
  [UPDATE_TYPE_ALL]: updateEventAll
};

const menuItemOptionsAll = [
  {
    title: 'This event',
    type: UPDATE_TYPE_SINGLE
  },
  {
    title: 'This and following events',
    type: UPDATE_TYPE_FUTURE
  },
  {
    title: 'All events',
    type: UPDATE_TYPE_ALL
  },
];

const SelectedEventModal = ({ visible, selectedEvent, boardId, onClose, onSuccess }) => {
  const [loading, setLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = React.useState(false);
  const [menuItemOptions, setMenuItemOptions] = React.useState([]);
  const [formValues, setFormValues] = React.useState({});

  const refForm = useRef();

  const menuVisible = useMemo(() => {
    return menuItemOptions.length > 0;
  }, [menuItemOptions]);

  const initialValues = useMemo(() => {
    const {
      name,
      description,
      start_date,
      duration,
      recurrence_pattern,
      notification_time
    } = selectedEvent;


    let isRecurring = false;
    let interval = 1;
    let frequencyIndex = 0;
    let recurrenceEndingIndex = 0;
    let recurrenceCount = 1;
    let recurrenceEndDate = new Date();

    if (recurrence_pattern) {
      isRecurring = true;
      const rule = RRule.parseString(recurrence_pattern);

      const {
        freq,
        until,
        count
      } = rule;

      interval = rule.interval;
      frequencyIndex = 3 - freq;
      if (count) {
        recurrenceEndingIndex = 1;
        recurrenceCount = count;
      } else {
        recurrenceEndDate = new Date(until);
      }

    }

    let enableNotification = false;
    let notificationTimeDay = '0';
    let notificationTimeHour = '00';
    let notificationTimeMinute = '15';

    if (notification_time) {
      enableNotification = true;
      let time = notification_time;

      notificationTimeDay = Math.floor(time / (24 * 60)).toString();
      time -= notificationTimeDay * 24 * 60;
      notificationTimeHour = Math.floor(time / 60).toString();
      time -= notificationTimeHour * 60;
      notificationTimeMinute = time.toString();
    }
    
    return {
      name: name,
      description: description,
      eventDay: new Date(start_date),
      hourFrom: new Date(start_date),
      hourTo: new Date(start_date + duration * 60000),
      isRecurring,
      interval: interval.toString(),
      frequencyIndex,
      recurrenceEndingIndex,
      recurrenceEndDate,
      recurrenceCount: recurrenceCount.toString(),
      enableNotification,
      notificationTimeDay,
      notificationTimeHour,
      notificationTimeMinute,
    };
  }, selectedEvent.id);

  const handleFormChange = (values) => {
    setFormValues({...values});
  };

  const handleSubmit = (values) => {
    setFormValues(values);
    if (!initialValues.isRecurring && !values.isRecurring) {
      setMenuItemOptions([
        menuItemOptionsAll[0]
      ]);
    } else if (!initialValues.isRecurring && values.isRecurring) {
      setMenuItemOptions([
        menuItemOptionsAll[0]
      ]);
    } else if (initialValues.interval != values.interval || initialValues.frequencyIndex != values.frequencyIndex) {
      setMenuItemOptions([
        menuItemOptionsAll[1],
        menuItemOptionsAll[2],
      ]);
    } else {
      setMenuItemOptions([...menuItemOptionsAll]);
    }
  };

  const handleDelete = (type) => {
    setLoading(true);
    deleteEvent(selectedEvent.event_id, selectedEvent.current_event_timestamp, type).then(res => {
      setLoading(false);
      const { success } = res.data;
      if (success) {
        onSuccess();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: 'Error while deleting event',
        });
      }
    }).catch(e => {
      setLoading(false);
      const { message } = e.response.data;
      console.log(message);
      Toast.show({
        type: 'error',
        text1: 'Whoops',
        text2: message,
      });
    });
  };

  const handleUpdate = (type) => {
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
      enableNotification,
      notificationTimeDay,
      notificationTimeHour,
      notificationTimeMinute
    } = formValues;
  
    const startDayMilliseconds = moment(eventDay).startOf('day').valueOf();
    const startTimeMilliseconds = hourFrom.getHours() * 60 * 60 * 1000 + hourFrom.getMinutes() * 60 * 1000;
    const endTimeMilliseconds = hourTo.getHours() * 60 * 60 * 1000 + hourTo.getMinutes() * 60 * 1000;
      
    const startTime = startDayMilliseconds + startTimeMilliseconds;
    const duration = Math.floor((endTimeMilliseconds - startTimeMilliseconds) / 60000);
  
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

    let eventNotificationTime = null;


    if (enableNotification) {
      eventNotificationTime = Number(notificationTimeDay) * 24  * 60 + Number(notificationTimeHour) * 60 + Number(notificationTimeMinute);
    } 

    console.log('eventNotificationTime', eventNotificationTime);
  
    const updatedEvent = {
      board_id: boardId,
      kid_id: selectedEvent.kid_id,
      name,
      description,
      start_date: startTime,
      count: rCount,
      duration,
      frequency: rFrequency,
      interval: rInterval,
      end_date: rEndDate,
      notification_time: eventNotificationTime
    };

    setLoading(true);

    updateRequestFunctions[type](selectedEvent.event_id, selectedEvent.current_event_timestamp, updatedEvent).then(res => {
      setLoading(false);
      const { success } = res.data;
      if (success) {
        onSuccess();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Whoops',
          text2: 'Error while updating event',
        });
      }
    }).catch(e => {
      setLoading(false);
      const { message } = e.response.data;
      console.log(message);
      Toast.show({
        type: 'error',
        text1: 'Whoops',
        text2: message,
      });
    });

  };

  const CardHeader = (props) => (
    <View {...props}>
      <Text category='h6'>{ selectedEvent.name }</Text>
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
      { !isEditing && <>
        <OverflowMenu
          anchor={() => <Button
            style={styles.footerControl}
            size='medium'
            status='danger'
            onPress={ () => setDeleteMenuVisible(true) }
          >  
          Delete
          </Button>}
          visible={deleteMenuVisible}
          placement={'top'}
          onBackdropPress={() => setDeleteMenuVisible(false)}
        >
          { menuItemOptionsAll.map((item, i) => <MenuItem key={i} title={item.title} onPress={() => {
            handleDelete(item.type);
            setDeleteMenuVisible(false);
          }} />) }
        </OverflowMenu>

        <Button
          style={styles.footerControl}
          size='medium'
          onPress={ () => setIsEditing(true) }
        >  
        Edit
        </Button>
      </> }
      { isEditing && <>
        <Button
          style={styles.footerControl}
          size='medium'
          status='basic'
          onPress={ () => setIsEditing(false) }
        >
          Discard
        </Button>

        <OverflowMenu
          anchor={() => <Button
            style={styles.footerControl}
            size='medium'
            onPress={() => {
              refForm.current.handleSubmit();
            }}
          >
            Save
          </Button>}
          visible={menuVisible}
          placement={'top'}
          onBackdropPress={() => setMenuItemOptions([])}
        >
          { menuItemOptions.map((item, i) => <MenuItem key={i} title={item.title} onPress={() => {
            handleUpdate(item.type);
            setMenuItemOptions([]);
          }} />) }
        </OverflowMenu>
      </>}
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
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
            
            { !isEditing && <>
              <Text style={styles.text} category='s1'>Description</Text>
              <Text style={styles.text} category='p1'>{ selectedEvent.description }</Text>

              <Text style={styles.text} category='s1'>Star Time</Text>
              <Text style={styles.text} category='p1'>{ moment(selectedEvent.start_date).format('MMMM Do YYYY, h:mm:ss A') }</Text>

              <Text style={styles.text} category='s1'>Duration</Text>
              <Text style={styles.text} category='p1'>{ moment.utc(moment.duration(selectedEvent.duration, 'minutes').asMilliseconds()).format('H:mm') }</Text>
            </> }

            { isEditing && <EditEventForm refForm={refForm} handleSubmit={handleSubmit} handleFormChange={handleFormChange} initialValues={initialValues} /> }
          </ScrollView> 
        </Card>
        <Toast />
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
    width: '85%',
    height: '75%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  inputRow: {
    flexDirection: 'row'
  }
});

export default SelectedEventModal;
