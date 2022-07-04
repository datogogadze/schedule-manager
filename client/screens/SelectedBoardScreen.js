import { Card, ListItem, Text, Calendar, Icon, Button, Modal } from '@ui-kitten/components';
import { MomentDateService } from '@ui-kitten/moment';
import React, { useEffect } from 'react';
import moment from 'moment';
import 'react-native-get-random-values';
import { v4 } from 'uuid';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView
} from 'react-native';

import Toast from 'react-native-toast-message';
import Header from '../components/Header';
import { getEvents } from '../utils/api-calls';

const dateService = new MomentDateService();

const SelectedBoardScreen = ({ navigation, route }) => {
  const { boardId } = route.params;

  const [eventsCalendar, setEventsCalendar] = React.useState([]);

  const [stickyHeaderIndices, setStickyHeaderIndices] = React.useState([]);

  const [startDate, setStartDate] = React.useState(moment().valueOf());
  const [endDate, setEndDate] = React.useState(moment().add(3, 'weeks').valueOf());

  const [calendarVisible, setCalendarVisible] = React.useState(false);

  const renderItem = ({ item }) => {
    if (item.header) {
      return <ListItem title={
        () => <Text category='h6'>{item.name}</Text>
      }/>;
    } else {
      return (
        <Card
          style={styles.eventCard}
          status='primary'
          footer={() =>
            <Text style={styles.eventCardFooter}>
              {`${item.hourFrom} - ${item.hourTo}`}
            </Text>
          }
        >
          <Text category='s1'>
            { item.name }
          </Text>
        </Card>
      );
    }
  };

  useEffect(() => {
    const arr = [];
    eventsCalendar.map(obj => {
      if (obj.header) {
        arr.push(eventsCalendar.indexOf(obj));
      }
    });
    setStickyHeaderIndices(arr);
  }, [eventsCalendar]);

  useEffect(() => {
    getEvents(boardId, startDate, endDate).then((res) => {
      const { events } = res.data;
      const eventsGroup = {};

      const a = moment(startDate);
      const b = moment(endDate);


      for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
        eventsGroup[m.format('MMMM DD')] = [];
      }

      console.log(eventsGroup);

      events.forEach(event => {
        const day = moment(event.startDate).format('MMMM DD');
        if (day in eventsGroup) {
          eventsGroup[day] = [...eventsGroup[day], event];
        } else {
          eventsGroup[day] = [];
        }
      });
      
      let newEventsCalendar = [];
      console.log(eventsGroup);

      for(const key in eventsGroup) {
        console.log('yay');
        const calendarHeader = {
          id: v4(),
          name: key,
          header: true
        };
        console.log('yay');

        const eventsForDay = eventsGroup[key];
        const calendarItems = eventsForDay.map(event => ({
          id: event.id,
          name: event.name,
          hourFrom: moment(event.startDate).format('hh:mm A'),
          hourTo: moment(event.startDate).add(event.duration, 'milliseconds').format('hh:mm A'),
          header: false,
        }));
        console.log(calendarHeader);
        newEventsCalendar = [...newEventsCalendar, calendarHeader, ...calendarItems];
      }

      console.log(newEventsCalendar);

      setEventsCalendar(newEventsCalendar);


    }).catch(e => {
      console.log(e);
    });
  }, [startDate, endDate]);


  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Header navigation={navigation} text={'TEST'} showMenu backButton/>

        <FlatList
          style={styles.eventList}
          data={eventsCalendar}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          stickyHeaderIndices={stickyHeaderIndices}
        />
        {/* <View> */}
        <Button  size='large' style={styles.calendarButton} accessoryLeft={<Icon style={styles.calendarIconStyle} name='calendar-outline' fill="white" />} onPress={() => setCalendarVisible(!calendarVisible)}>
          Calendar
        </Button>
        {/* </View> */}
        <Modal
          visible={calendarVisible}
          backdropStyle={styles.backdrop}
        >
          <Calendar
            style={{
              backgroundColor: 'white'
            }}
            dateService={dateService}
            date={moment(startDate)}
            onSelect={nextDate => {
              setStartDate(nextDate.valueOf());
              setEndDate(nextDate.add(3, 'weeks').valueOf());
              setCalendarVisible(false);
            }}
          />
        </Modal>
        <Toast/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingTop: 0,
  },
  eventList: {
    height: '85%'
  },
  eventCard: {
    marginVertical: 10,
  },
  eventCardFooter: {
    fontSize: 10,
    padding: 7
  },
  backdrop: {
    backgroundColor: '#F5FCFF88',
  },
  calendarButton: {
    width: 200,
  }
});

export default SelectedBoardScreen;
