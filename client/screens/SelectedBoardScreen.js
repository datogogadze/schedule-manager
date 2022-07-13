import {
  Card,
  ListItem,
  Text,
  Icon,
  Button,
  Layout,
} from '@ui-kitten/components';
import React, { useEffect } from 'react';
import moment from 'moment';
import 'react-native-get-random-values';
import { v4 } from 'uuid';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';

import Toast from 'react-native-toast-message';
import Header from '../components/Header';
import { getEvents } from '../utils/api-calls';
import CreateEventModal from '../components/CreateEventModal';
import OverlaySpinner from '../components/OverlaySpinner';
import CalendarModal from '../components/CalendarModal';
import SelectedEventModal from '../components/SelectedEventModal';


const ModalOptions = {
  NONE: 'NONE',
  CALENDAR: 'CALENDAR',
  CREATE: 'CREATE',
  FILTER: 'FILTER',
  SELECT: 'SELECT'
};

const SelectedBoardScreen = ({ navigation, route }) => {
  const { boardId } = route.params;

  const [selectedModal, setSelectedModal] = React.useState(ModalOptions.NONE);

  const [selectedEvent, setSelectedEvent] = React.useState(null);

  const [eventsCalendar, setEventsCalendar] = React.useState([]);

  const [stickyHeaderIndices, setStickyHeaderIndices] = React.useState([]);
  
  const [loading, setLoading] = React.useState(false);

  const [startDate, setStartDate] = React.useState(
    moment().startOf('day').valueOf()
  );
  const [endDate, setEndDate] = React.useState(
    moment().startOf('day').add(3, 'weeks').valueOf() - 1
  );

  useEffect(() => {
    const arr = [];
    eventsCalendar.map((obj) => {
      if (obj.header) {
        arr.push(eventsCalendar.indexOf(obj));
      }
    });
    setStickyHeaderIndices(arr);
  }, [eventsCalendar]);

  useEffect(() => {
    fetchEvents();
  }, [startDate, endDate]);

  const fetchEvents = () => {
    setLoading(true);
    getEvents(boardId, startDate, endDate)
      .then((res) => {
        const { events } = res.data;
        const eventsGroup = {};

        const a = moment(startDate);
        const b = moment(endDate);

        for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
          eventsGroup[m.format('MMMM DD')] = [];
        }

        events.forEach((event) => {
          const day = moment(event.start_date).format('MMMM DD');
          if (day in eventsGroup) {
            eventsGroup[day] = [...eventsGroup[day], event];
          } else {
            eventsGroup[day] = [];
          }
        });

        let newEventsCalendar = [];

        for (const key in eventsGroup) {
          const calendarHeader = {
            id: v4(),
            name: key,
            header: true,
          };

          const eventsForDay = eventsGroup[key];
          const calendarItems = eventsForDay.map((event) => ({
            id: v4(),
            name: event.name,
            hourFrom: moment(event.start_date).format('hh:mm A'),
            hourTo: moment(event.start_date)
              .add(event.duration, 'minutes')
              .format('hh:mm A'),
            header: false,
            event
          }));
          newEventsCalendar = [
            ...newEventsCalendar,
            calendarHeader,
            ...calendarItems,
          ];
        }
        setEventsCalendar(newEventsCalendar);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };

  const renderItem = ({ item }) => {
    if (item.header) {
      return <ListItem key={item.id} title={() => <Text category="h6">{item.name}</Text>} />;
    } else {
      return (
        <Card
          key={item.id}
          style={styles.eventCard}
          status="primary"
          footer={() => (
            <Text style={styles.eventCardFooter}>
              {`${item.hourFrom} - ${item.hourTo}`}
            </Text>
          )}
          onPress={() => {
            setSelectedEvent(item.event);
            setSelectedModal(ModalOptions.SELECT);
          }}
        >
          <Text category="s1">{item.name}</Text>
        </Card>
      );
    }
  };

  const renderModalContent = (modal) => {
    if (modal == ModalOptions.CALENDAR) {
      return <CalendarModal
        date={moment(startDate)}
        onClose={() => setSelectedModal(ModalOptions.NONE)}
        onSelect={(nextDate) => {
          setStartDate(nextDate.valueOf());
          setEndDate(nextDate.add(3, 'weeks').valueOf());
          setSelectedModal(ModalOptions.NONE);
        }}
      />;
    } else if(modal == ModalOptions.CREATE) {
      return <CreateEventModal
        boardId={boardId}
        visible={modal == ModalOptions.CREATE}
        onSuccess={() => {
          setSelectedModal(ModalOptions.NONE);
          fetchEvents();
        }}
        onClose={() => setSelectedModal(ModalOptions.NONE)}
        onError={(message) => {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: message,
          });
        }}
      />;
    } else if(modal == ModalOptions.SELECT) {
      return <SelectedEventModal
        boardId={boardId}
        selectedEvent={selectedEvent}
        visible={modal == ModalOptions.SELECT}
        onSuccess={() => {
          setSelectedModal(ModalOptions.NONE);
          fetchEvents();
        }}
        onClose={() => setSelectedModal(ModalOptions.NONE)}
        onError={(message) => {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: message,
          });
        }}
      />;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header navigation={navigation} text={'TEST'} showMenu backButton />

        <FlatList
          style={styles.eventList}
          data={eventsCalendar}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={stickyHeaderIndices}
          showsVerticalScrollIndicator={false}

        />

        <Layout style={styles.buttonGroup} level='1'>
          <Button
            size="giant"
            appearance='ghost'
            style={styles.calendarButton}
            accessoryLeft={
              <Icon
                style={styles.calendarIconStyle}
                name="calendar-outline"
              />
            }
            onPress={() => setSelectedModal(ModalOptions.CALENDAR)}
          />
          <Button
            size="giant"
            style={styles.calendarButton}
            appearance='ghost'

            accessoryLeft={
              <Icon
                style={styles.calendarIconStyle}
                name="plus-circle"
              />
            }
            onPress={() => setSelectedModal(ModalOptions.CREATE)}
          />
          <Button
            size="giant"
            style={styles.calendarButton}
            appearance='ghost'

            accessoryLeft={
              <Icon
                style={styles.calendarIconStyle}
                name="funnel-outline"
              />
            }
          />
        </Layout>

        { renderModalContent(selectedModal) }

        <Toast />
      </View>
      <OverlaySpinner visible={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
    paddingTop: 0,
    height: '100%'
  },
  eventList: {
    height: '85%',
  },
  eventCard: {
    marginVertical: 10,
  },
  eventCardFooter: {
    fontSize: 10,
    padding: 7,
  },
  backdrop: {
    backgroundColor: '#F5FCFF88',
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    left: 30,
    bottom: 0,
    justifyContent: 'space-between'
  },
  calendarIconStyle: {
    width: 100,
    height: 100
  },
});

export default SelectedBoardScreen;
