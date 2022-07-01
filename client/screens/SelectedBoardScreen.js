import { Card, ListItem, Text } from '@ui-kitten/components';
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';

import Toast from 'react-native-toast-message';
import Header from '../components/Header';


const SelectedBoardScreen = ({ navigation, route }) => {
  const { boardName } = route.params;

  const [events, setEvents] = React.useState([
    { id: 0, name: 'June 10', header: true },
    { id: 1, name: 'Go to school', hourFrom: '9:00 AM', hourTo: '2:00 PM', header: false },
    { id: 2, name: 'Go to basketball', hourFrom: '4:00 PM', hourTo: '5:00 PM', header: false },
    { id: 3, name: 'Go out with friends', hourFrom: '7:00 PM', hourTo: '8:00 PM', header: false },
    { id: 4, name: 'June 11', header: true },
    { id: 5, name: 'Go to school', hourFrom: '9:00 AM', hourTo: '2:00 PM', header: false },
    { id: 6, name: 'Go to football', hourFrom: '4:00 PM', hourTo: '5:00 PM', header: false },
    { id: 7, name: 'Go to music lessons', hourFrom: '7:00 PM', hourTo: '8:00 PM', header: false },
    { id: 8, name: 'June 12', header: true },
    { id: 9, name: 'Go to school', hourFrom: '9:00 AM', hourTo: '2:00 PM', header: false },
    { id: 10, name: 'Go to football', hourFrom: '4:00 PM', hourTo: '5:00 PM', header: false },
    { id: 11, name: 'Go to music lessons', hourFrom: '7:00 PM', hourTo: '8:00 PM', header: false },
    { id: 12, name: 'June 13', header: true },
    { id: 13, name: 'Go to school', hourFrom: '9:00 AM', hourTo: '2:00 PM', header: false },
    { id: 14, name: 'Go to football', hourFrom: '4:00 PM', hourTo: '5:00 PM', header: false },
    { id: 15, name: 'Go to music lessons', hourFrom: '7:00 PM', hourTo: '8:00 PM', header: false },
    { id: 16, name: 'June 14', header: true },
    { id: 17, name: 'Go to school', hourFrom: '9:00 AM', hourTo: '2:00 PM', header: false },
    { id: 18, name: 'Go to football', hourFrom: '4:00 PM', hourTo: '5:00 PM', header: false },
    { id: 19, name: 'Go to music lessons', hourFrom: '7:00 PM', hourTo: '8:00 PM', header: false },
  ]);

  const [stickyHeaderIndices, setStickyHeaderIndices] = React.useState([]);

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
    events.map(obj => {
      if (obj.header) {
        arr.push(events.indexOf(obj));
      }
    });
    setStickyHeaderIndices(arr);
  }, []);


  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Header navigation={navigation} text={boardName} showMenu backButton/>

        <FlatList
          style={styles.eventList}
          data={events}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          stickyHeaderIndices={stickyHeaderIndices}
        />
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
  }
});

export default SelectedBoardScreen;
