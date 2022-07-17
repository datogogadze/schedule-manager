import React, { useMemo, useRef } from 'react';
import {
  ScrollView,
  StyleSheet, View,
} from 'react-native';
import moment from 'moment';
import { RRule } from 'rrule';
import { Button, Card, Text, Modal, OverflowMenu, MenuItem, Select, IndexPath, SelectItem, CheckBox } from '@ui-kitten/components';
import { deleteEvent, updateEventAll, updateEventFuture, updateEventSingle } from '../utils/api-calls';
import OverlaySpinner from './OverlaySpinner';
import EditEventForm from './EditEventForm';
import { frequencies, frequencyOptions } from '../utils/select-options';
import Toast from 'react-native-toast-message';
import { getKidColor } from '../utils/board-kids';


const FilterEventModal = ({ boardKids, selectedKids, setSelectedKids, visible, onClose }) => { 
  console.log(visible);
  const CardHeader = (props) => (
    <View {...props}>
      <Text category='h6'>Filter</Text>
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
        Close
      </Button>
      <Button
        style={styles.footerControl}
        size='medium'
        onPress={ () => setSelectedKids(boardKids.map(kid => kid.id))}
      >  
        Reset Filters
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
          <Text style={styles.filterText} category='s1'>Show events of</Text> 
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
            { boardKids.map(kid => {
              const isChecked = selectedKids?.includes(kid.id);
              
              return <CheckBox
                key={kid.id}
                checked={isChecked}
                style={styles.selectedKidCheckbox}
                onChange={(checked) => {
                  if (checked) {
                    setSelectedKids([...selectedKids, kid.id]);
                  } else {
                    setSelectedKids(selectedKids.filter(selectedKidId => selectedKidId != kid.id));
                  }
                }}
                status={getKidColor(boardKids, kid.id)}
              >
                {kid.display_name}
              </CheckBox>;
            }) }
          </ScrollView> 
        </Card>
        <Toast />
        {/* <OverlaySpinner visible={loading} /> */}
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
  filterText: {
    marginBottom: 15
  },
  frequency: {
    marginTop: 20
  },
  scrollView: {
    height: '65%'
  },
  selectedKidCheckbox: {
    marginTop: 7,
    marginBottom: 7,
    marginLeft: 7
  },
  modal: {
    width: '85%',
    height: '55%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  inputRow: {
    flexDirection: 'row'
  }
});

export default FilterEventModal;
