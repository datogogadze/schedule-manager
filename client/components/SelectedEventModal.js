import React, { useEffect, useMemo, useRef } from 'react';
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


const menuItemOptionsAll = [
  {
    title: 'This event',
    type: 'single'
  },
  {
    title: 'This and following events',
    type: 'future'
  },
  {
    title: 'All events',
    type: 'all'
  },
];

const SelectedEventModal = ({ visible, selectedEvent, boardId, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [deleteMenuVisible, setDeleteMenuVisible] = React.useState(false);
  const [menuItemOptions, setMenuItemOptions] = React.useState(menuItemOptionsAll);
  const [formValues, setFormValues] = React.useState({});

  const refForm = useRef();

  const initialValues = useMemo(() => {
    const {
      name,
      description,
      start_date,
      duration,
      recurrence_pattern
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
    
    return {
      name: name,
      description: description,
      eventDay: new Date(start_date),
      hourFrom: new Date(start_date),
      hourTo: new Date(start_date + duration),
      isRecurring,
      interval: interval.toString(),
      frequencyIndex,
      recurrenceEndingIndex,
      recurrenceEndDate,
      recurrenceCount: recurrenceCount.toString()
    };
  }, selectedEvent.id);

  useEffect(() => {
    if (!initialValues.isRecurring && formValues.isRecurring) {
      setMenuItemOptions([
        menuItemOptionsAll[0]
      ]);
    } else if (initialValues.interval != formValues.interval || initialValues.frequencyIndex != formValues.frequencyIndex) {
      setMenuItemOptions([
        menuItemOptionsAll[1],
        menuItemOptionsAll[2],
      ]);
    } else {
      setMenuItemOptions([...menuItemOptionsAll]);
    }
  }, [formValues]);

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
            onPress={() => setMenuVisible(true)}
          >
            Save
          </Button>}
          visible={menuVisible}
          placement={'top'}
          onBackdropPress={() => setMenuVisible(false)}
        >
          { menuItemOptions.map((item, i) => <MenuItem key={i} title={item.title} onPress={() => {
            handleUpdate(item.type);
            setMenuVisible(false);
          }} />) }
        </OverflowMenu>
      </>}
    </View>
  );

  const handleFormChange = (values) => {
    setFormValues({...values});
  };

  const handleDelete = (type) => {
    setLoading(true);
    console.log(selectedEvent.event_id, selectedEvent.start_date, type);
    deleteEvent(selectedEvent.event_id, selectedEvent.start_date, type).then(res => {
      setLoading(false);
      const { success } = res.data;
      if (success) {
        onSuccess();
      } else {
        onError('Error while updating board');
      }
    }).catch(e => {
      setLoading(false);
      const { message } = e.response.data;
      console.log(message);
      onError(message);
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
      notificationTime
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
      eventNotificationTime = notificationTime;
    } 
  
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
    if (type == 'single') {     
      updateEventSingle(selectedEvent.event_id, selectedEvent.start_date, updatedEvent).then(res => {
        setLoading(false);
        const { success } = res.data;
        if (success) {
          onSuccess();
        } else {
          onError('Error while updating board');
        }
      }).catch(e => {
        setLoading(false);
        const { message } = e.response.data;
        console.log(message);
        onError(message);
      });
    } else if (type == 'future') {
      updateEventFuture(selectedEvent.event_id, selectedEvent.start_date, updatedEvent).then(res => {
        setLoading(false);
        const { success } = res.data;
        if (success) {
          onSuccess();
        } else {
          onError('Error while updating board');
        }
      }).catch(e => {
        setLoading(false);
        const { message } = e.response.data;
        console.log(message);
        onError(message);
      });
    } else if (type == 'all') {
      updateEventAll(selectedEvent.event_id, selectedEvent.start_date, updatedEvent).then(res => {
        setLoading(false);
        const { success } = res.data;
        if (success) {
          onSuccess();
        } else {
          onError('Error while updating board');
        }
      }).catch(e => {
        setLoading(false);
        const { message } = e.response.data;
        console.log(message);
        onError(message);
      });
    }
  };

  // const handleSubmit = (values) => {
  // //   // console.log(v);
  // //   // console.log(isEqual(v, initialValues));

  // //   // const requestBody = {
  // //   //   event
  // //   // }
  // //   const newEvent = {...event};
  // //   console.log(event);
  // //   if (updateType == 'single') {
  // //     console.log('yppp', values);
  // //     // updateEventSingle();
  // //   }
  // }; 


  return (
    <>
      <Modal
        style={styles.modal}
        visible={visible}
        backdropStyle={styles.backdrop}
      >
          
        <Card style={styles.createEventCard} header={CardHeader} footer={CardFooter } disabled>
          <ScrollView style={styles.scrollView}>
            
            { !isEditing && <>
              <Text style={styles.text} category='s1'>Description</Text>
              <Text style={styles.text} category='p1'>{ selectedEvent.description }</Text>

              <Text style={styles.text} category='s1'>Star Time</Text>
              <Text style={styles.text} category='p1'>{ moment(selectedEvent.start_date).format('MMMM Do YYYY, h:mm:ss A') }</Text>

              <Text style={styles.text} category='s1'>Duration</Text>
              <Text style={styles.text} category='p1'>{ moment.utc(selectedEvent.duration).format('h:mm:ss') }</Text>
            </> }

            { isEditing && <EditEventForm refForm={refForm} handleFormChange={handleFormChange} initialValues={initialValues} /> }
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

export default SelectedEventModal;
