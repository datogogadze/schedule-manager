import {
  Card,
  ListItem,
  Text,
  Icon,
  Button,
  Layout,
} from '@ui-kitten/components';
import React, { useEffect, useMemo, useRef } from 'react';
import moment from 'moment';
import 'react-native-get-random-values';
import { View, StyleSheet, SafeAreaView, FlatList, StatusBar, Platform, RefreshControl } from 'react-native';

import Toast from 'react-native-toast-message';
import Header from '../components/Header';
import { getBoardKids, getEvents } from '../utils/api-calls';
import CreateEventModal from '../components/CreateEventModal';
import OverlaySpinner from '../components/OverlaySpinner';
import CalendarModal from '../components/CalendarModal';
import SelectedEventModal from '../components/SelectedEventModal';
import { ModalOption } from '../utils/enums';
import FilterEventModal from '../components/FilterEventModal';
import { getKidColor } from '../utils/board-kids';
import dateFns from '@ui-kitten/date-fns';


const SelectedBoardScreen = ({ navigation, route }) => {
  const { boardId, boardName } = route.params;

  const [selectedModal, setSelectedModal] = React.useState(ModalOption.None);

  const [selectedEvent, setSelectedEvent] = React.useState(null);

  const [eventsCalendar, setEventsCalendar] = React.useState([]);
 
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [boardKids, setBoardKids] = React.useState([]);
  const [selectedKids, setSelectedKids] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  

  const isMounted = useRef(false);

  const [startDate, setStartDate] = React.useState(
    moment().startOf('day').valueOf()
  );
  
  const [endDate, setEndDate] = React.useState(
    moment().startOf('day').add(2, 'weeks').valueOf() - 1
  );


  const stickyHeaderIndices = useMemo(() => {
    const arr = [];
    eventsCalendar.map((obj) => {
      if (obj.header) {
        arr.push(eventsCalendar.indexOf(obj));
      }
    });
    return arr;
  }, [eventsCalendar]);

  useEffect(() => {
    getBoardKids(boardId).then(res => {
      const { success, kids } = res.data;
      if (success) {
        setBoardKids(kids);
        setSelectedKids(kids.map(kid => kid.id));
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
  }, []);

  useEffect(() => {
    setSelectedKids(boardKids.map(kid => kid.id));
  }, [boardKids]);

  useEffect(() => {
    fetchEvents(initialLoad);
  }, [selectedKids]);

  useEffect(() => {
    if (isMounted.current) {
      fetchEvents(initialLoad);
    } else {
      isMounted.current = true;
    }
    
  }, [startDate, endDate]);

  const fetchEvents = (withReload = true) => {
    if (withReload) {
      setLoading(true);
    }

    getEvents(boardId, startDate, endDate, selectedKids)
      .then((res) => {
        const { events } = res.data;
        const eventsGroup = {};

        const a = moment(startDate);
        const b = moment(endDate);

        for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
          eventsGroup[m.format('MMMM DD - dddd')] = {dateVal: m.startOf('day').valueOf(), events: []};
        }

        events.forEach((event) => {
          const day = moment(event.start_date).format('MMMM DD - dddd');
          if (day in eventsGroup) {
            eventsGroup[day]['events'] = [...eventsGroup[day]['events'], event];
          } else {
            eventsGroup[day] = {dateVal: moment(event.start_date).startOf('day').valueOf(), events: []};
          }
        });

        let newEventsCalendar = [];

        for (const key of Object.keys(eventsGroup).sort((a, b) => eventsGroup[a].dateVal - eventsGroup[b].dateVal)) {
          const calendarHeader = {
            id: key,
            name: key,
            header: true,
          };

          const eventsForDay = eventsGroup[key]['events'];
          eventsForDay.sort((a, b) => a.start_date - b.start_date);
          const calendarItems = eventsForDay.map((event) => ({
            id: event.event_id + event.current_event_timestamp,
            name: event.name,
            hourFrom: moment(event.start_date).format('hh:mm A'),
            hourTo: moment(event.start_date)
              .add(event.duration, 'minutes')
              .format('hh:mm A'),
            header: false,
            color: getKidColor(boardKids, event.kid_id),
            event
          }));


          if (calendarItems.length == 0) {
            const noEventsPlaceholder = {
              id: key + ' no event',
              name: 'No events for this day',
              header: false,
            };

            newEventsCalendar = [
              ...newEventsCalendar,
              calendarHeader,
              noEventsPlaceholder
            ];
          } else {
            newEventsCalendar = [
              ...newEventsCalendar,
              calendarHeader,
              ...calendarItems,
            ];
          }

        }
        setEventsCalendar(newEventsCalendar);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
        setRefreshing(false);
      });
  };

  const renderItem = ({ item }) => {
    if (item.header) {
      return <ListItem key={item.id} title={() => <Text category="h6">{item.name}</Text>} />;
    } if (!item.event) {
      return <ListItem key={item.id} style={styles.noEvents} title={() => <Text category="s1" appearance='hint'>{item.name}</Text>} />;
    }else {
      return (
        <Card
          key={item.id}
          style={styles.eventCard}
          status={item.color}
          footer={() => (
            <Text style={styles.eventCardFooter}>
              {`${item.hourFrom} - ${item.hourTo}`}
            </Text>
          )}
          onPress={() => {
            setSelectedEvent(item.event);
            setSelectedModal(ModalOption.Select);
          }}
        >
          <Text category="s1">{item.name}</Text>
        </Card>
      );
    }
  };

  const renderModalContent = (modal) => {
    if (modal == ModalOption.Calendar) {
      return <CalendarModal
        date={moment(startDate)}
        dateService={dateFns}
        onClose={() => setSelectedModal(ModalOption.None)}
        onSelect={(nextDate) => {
          const offset = new Date().getTimezoneOffset();
          const offsetHours = offset / 60;
          setStartDate(moment(nextDate).add(offsetHours, 'hours').valueOf());
          setEndDate(nextDate.add(3, 'weeks').valueOf());
          setSelectedModal(ModalOption.None);
        }}
      />;
    } else if(modal == ModalOption.Create) {
      return <CreateEventModal
        boardId={boardId}
        boardKids={boardKids}
        visible={modal == ModalOption.Create}
        onSuccess={() => {
          setSelectedModal(ModalOption.None);
          fetchEvents();
        }}
        onClose={() => setSelectedModal(ModalOption.None)}
        onError={(message) => {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: message,
          });
        }}
      />;
    } else if(modal == ModalOption.Select) {
      return <SelectedEventModal
        boardId={boardId}
        boardKids={boardKids}
        selectedEvent={selectedEvent}
        visible={modal == ModalOption.Select}
        onSuccess={() => {
          setSelectedModal(ModalOption.None);
          fetchEvents();
        }}
        onClose={() => setSelectedModal(ModalOption.None)}
        onError={(message) => {
          Toast.show({
            type: 'error',
            text1: 'Whoops',
            text2: message,
          });
        }}
      />;
    } else if(modal == ModalOption.Filter) {
      return <FilterEventModal
        boardId={boardId}
        boardKids={boardKids}
        selectedKids={selectedKids}
        setSelectedKids={setSelectedKids}
        selectedEvent={selectedEvent}
        visible={modal == ModalOption.Filter}
        onSuccess={() => {
          setSelectedModal(ModalOption.None);
          fetchEvents();
        }}
        onClose={() => setSelectedModal(ModalOption.None)}
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
        <Header navigation={navigation} text={boardName} boardId={boardId} showMenu backButton />

        <FlatList
          style={styles.eventList}
          data={eventsCalendar}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          stickyHeaderIndices={Platform.OS !== 'android' ? stickyHeaderIndices : null}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0}
          onStartReachedThreshold={0}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchEvents(false);
              }}
            />
          }
          onEndReached={ () => {
            setEndDate(moment(endDate).startOf('day').add(1, 'days').add(2, 'weeks').valueOf() - 1);
          }}
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
            onPress={() => setSelectedModal(ModalOption.Calendar)}
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
            onPress={() => {
              if (boardKids?.length > 0) {
                setSelectedModal(ModalOption.Create);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Whoops',
                  text2: 'There must be kids on the board to create events',
                });
              }
            }}
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
            onPress={() => {
              if (boardKids?.length > 0) {
                setSelectedModal(ModalOption.Filter);
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Whoops',
                  text2: 'There must be kids on the board to filter',
                });
              }
            }}

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
  safe: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  container: {
    padding: 30,
    paddingTop: 0,
    height: '100%'
  },
  noEvents: {
    marginTop: 15,
    marginBottom: 15,
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
