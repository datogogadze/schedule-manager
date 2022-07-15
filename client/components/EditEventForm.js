import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, View, Keyboard
} from 'react-native';
// import Checkbox from 'expo-checkbox';

import { Text, Input, Select, SelectItem, IndexPath, Layout, CheckBox } from '@ui-kitten/components';
import DateTimePicker from '@react-native-community/datetimepicker';
import TimePicker from 'react-native-simple-time-picker';
import { Field, Formik } from 'formik';
import { EditEventSchema } from '../utils/formik-schemas';
import { frequencyOptions, recurrenceEndingOptions } from '../utils/select-options';
import moment from 'moment';
import { min } from 'lodash';



const EditEventForm = ({ refForm, handleSubmit = () => {}, handleFormChange = () => {}, initialValues = {
  name: '',
  description: '',
  eventDay: new Date(),
  hourFrom: new Date(),
  hourTo: moment().add(1, 'hours').toDate(),
  isRecurring: false,
  interval: '1',
  frequencyIndex: 0,
  recurrenceEndingIndex: 0,
  recurrenceEndDate: new Date(),
  recurrenceCount: '1',
  enableNotification: false,
  notificationFrequencyIndex: 0,
  notificationTimeDay: '0',
  notificationTimeHour: '00',
  notificationTimeMinute: '15',
} }) => {
  const refDescription = useRef();
  const refNotificationTimeHour = useRef();
  const refNotificationTimeMinute = useRef();


  return (
    <>
      <Formik
        innerRef={refForm}
        initialValues={initialValues}
        validationSchema={EditEventSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
      >
        {({ handleChange, values, errors }) => {
          useEffect(() => {
            handleFormChange(values);
          }, [values]);
    
          return <>
            <Input
              placeholder="Name"
              status={errors.name ? 'danger' : 'basic'}
              style={styles.textInput}
              autoCapitalize="none"
              label="Event Name"
              size="large"
              caption={errors.name || ' '}
              onChangeText={ handleChange('name')}
              onSubmitEditing={() => refDescription.current.focus()}
              value={values.name}
            />

            <Input
              placeholder="Description"
              label="Description"
              status={errors.description ? 'danger' : 'basic'}
              style={styles.textInput}
              autoCapitalize="none"
              size="large"
              caption={errors.description || ' '}
              multiline
              ref={refDescription}
              value={values.description}
              onSubmitEditing={Keyboard.dismiss} 

              onChangeText={ handleChange('description')}

            />

            <View style={styles.dates}>
              <View style={styles.datePickerWrapper}>
                <Text style={styles.text} category='s2'>Day</Text>
                <Field name="eventDay">
                  {({ field, form }) => (
                    <DateTimePicker
                      style={styles.datePicker}
                      mode="date"
                      onChange={ (event, value) =>  {
                        form.setFieldValue(field.name, value);
                        form.setFieldTouched(field.name, true);
                      }}
                      value={values.eventDay}
                    />
                  )}
                </Field>
              </View>
              
              <View style={styles.datePickerWrapper}>
                <Text style={styles.text} category='s2'>From</Text>
                <Field name="hourFrom">
                  {({ field, form }) => (
                    <DateTimePicker
                      mode="time"
                      style={styles.datePicker}
                      onChange={ (event, value) =>  {
                        form.setFieldValue(field.name, value);
                        form.setFieldTouched(field.name, true);
                      }}
                      value={values.hourFrom}
                    />
                  )}
                </Field>
              </View>

              <View style={styles.datePickerWrapper}>
                <Text style={styles.text} category='s2'>To</Text>
                <Field name="hourTo">
                  {({ field, form }) => (
                    <DateTimePicker
                      mode="time"
                      style={styles.datePicker}
                      onChange={ (event, value) =>  {
                        form.setFieldValue(field.name, value);
                        form.setFieldTouched(field.name, true);
                      }}
                      minimumDate={moment(values.hourFrom).add(1, 'minute').toDate()}
                      value={values.hourTo}
                    />
                  )}
                </Field>
              </View>
            </View>

            <Field name="enableNotification">
              {({ field, form }) => (
                <CheckBox
                  {...field}
                  style={styles.checkbox}
                  checked={values.enableNotification}
                  onChange={(v) => {
                    form.setFieldValue(field.name, v);
                    form.setFieldTouched(field.name, true);
                  }}
                >
                  Enable Notification
                </CheckBox> 
              )}
            </Field>

            { values.enableNotification && <Text style={{marginBottom: 20}} category='s1'>
              Remind me before
            </Text> } 

            { values.enableNotification && <Layout style={styles.inputRow} level='1'>
              <Input 
                label='Days'
                style={{ width: '20%', marginRight: 20}} 
                caption={errors.notificationTimeDay || ' '}
                status={errors.notificationTimeDay ? 'danger' : 'basic'}
                keyboardType = 'numeric'
                onChangeText = { (value) => {
                  let nextVal = value;

                  if (value.length > 0) {
                    nextVal = Math.min(Number(value), 7).toString();
                  }
                  if (value.length >= 2) return refNotificationTimeHour.current.focus();
                  handleChange('notificationTimeDay')(nextVal);
                  if (value.length >= 1) refNotificationTimeHour.current.focus();
                }}
                value = {values.notificationTimeDay}
                onFocus={() => handleChange('notificationTimeDay')('')}
                onBlur={() => {
                  if (values.notificationTimeDay == '') {
                    handleChange('notificationTimeDay')('0');
                  }
                }}
              />
              <Input 
                label='Hours'
                style={{ width: '20%', marginRight: 20}}
                caption={errors.notificationTimeHour || ' '}
                status={errors.notificationTimeHour ? 'danger' : 'basic'}
                keyboardType = 'numeric'
                onChangeText = { (value) => {
                  let nextVal = value;

                  if (value.length > 0) {
                    nextVal = Math.min(Number(value), 23).toString();
                  }
                  if (value.length >= 3) return refNotificationTimeMinute.current.focus();
                  handleChange('notificationTimeHour')(nextVal);

                  if (value.length >= 2) refNotificationTimeMinute.current.focus();
                }}
                ref={refNotificationTimeHour}
                value = {values.notificationTimeHour}
                onFocus={() => handleChange('notificationTimeHour')('')}
                onBlur={() => {
                  if (values.notificationTimeHour == '') {
                    handleChange('notificationTimeHour')('00');
                  }
                }}
              />
              <Input 
                label='Minutes'
                style={{ width: '20%', marginRight: 20}}
                caption={errors.notificationTimeMinute || ' '}
                status={errors.notificationTimeMinute ? 'danger' : 'basic'}
                keyboardType = 'numeric'
                onChangeText = { (value) => {
                  let nextVal = value;

                  if (value.length > 0) {
                    nextVal = Math.min(Number(value), 59).toString();
                  }
                  if (value.length >= 3) return Keyboard.dismiss();
                  handleChange('notificationTimeMinute')(nextVal);
                  if (value.length >= 2) Keyboard.dismiss();
                }}
                ref={refNotificationTimeMinute}
                value = {values.notificationTimeMinute}
                onFocus={() => handleChange('notificationTimeMinute')('')}
                onBlur={() => {
                  if (values.notificationTimeMinute == '') {
                    handleChange('notificationTimeMinute')('00');
                  }
                }}
              />
            </Layout> }

            <Field name="isRecurring">
              {({ field, form }) => (
                <CheckBox
                  {...field}
                  style={styles.checkbox}
                  checked={values.isRecurring}
                  onChange={(v) => {
                    form.setFieldValue(field.name, v);
                    form.setFieldTouched(field.name, true);
                  }}
                >
                  Recurring
                </CheckBox> 
              )}
            </Field>

            { values.isRecurring && <>
              <Layout style={styles.inputRow} level='1'>
                <Input 
                  label='Repeats Every'
                  style={{ marginRight: 20}}
                  status={errors.interval ? 'danger' : 'basic'}
                  keyboardType = 'numeric'
                  onChangeText = { handleChange('interval')}
                  value = {values.interval}
                />

                <Field name="frequencyIndex">
                  {({ field, form }) => (
                    <Select
                      // {...field}
                      style={{flexGrow: 1}}
                      label=' '
                      selectedIndex={ new IndexPath(values.frequencyIndex) }
                      value={frequencyOptions[values.frequencyIndex]}
                      onSelect={ (v) => {
                        form.setFieldValue(field.name, v.row);
                        form.setFieldTouched(field.name, true);
                      }}
                    >
                      { frequencyOptions.map((option, i) => <SelectItem key={i} title={option}/>) }
                    </Select>
                  )}
                </Field>
              </Layout>

              <View style={styles.recurrenceEndDate}>
                <Field name="recurrenceEndingIndex">
                  {({ field, form }) => (
                    <Select
                      label='Ends'
                      selectedIndex={ new IndexPath(values.recurrenceEndingIndex) }
                      value={recurrenceEndingOptions[values.recurrenceEndingIndex]}
                      onSelect={ (v) => {
                        form.setFieldValue(field.name, v.row);
                        form.setFieldTouched(field.name, true);
                      }}
                    >
                      { recurrenceEndingOptions.map((option, i) => <SelectItem key={i} title={option}/>) }
                    </Select>
                  )}
                </Field>
                
              </View>

              { values.recurrenceEndingIndex == 0 && <>
                <View style={styles.datePickerWrapper}>
                  <Text style={styles.text} category='s2'>Recurrence end date</Text>
                  <Field name="recurrenceEndDate">
                    {({ field, form }) => (
                      <DateTimePicker
                        mode="date"
                        style={styles.datePicker}
                        minimumDate={values.eventDay}
                        onChange={ (event, value) =>  {
                          form.setFieldValue(field.name, value);
                          form.setFieldTouched(field.name, true);
                        }}
                        value={values.recurrenceEndDate}
                      />
                    )}
                  </Field>
                </View>
                
              </> }

              { values.recurrenceEndingIndex == 1 && <>
                <Input
                  label='Recurrence Count'
                  status={errors.recurrenceCount ? 'danger' : 'basic'}
                  style={styles.textInput}
                  keyboardType = 'numeric'
                  onChangeText = { handleChange('recurrenceCount')}
                  value = {values.recurrenceCount}
                /> 
              </> }
            </> }
          </>;
        }}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
  createEventCard: {
    width: '100%',
    height: '100%'
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
  datePickerWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  datePicker: {
    flexGrow: 1
  },
  recurrenceEndDate: {
    marginTop: 20,
    marginBottom: 20
  },
  scrollView: {
    height: '75%'
  },
  checkbox: {
    marginBottom: 15
  },
  modal: {
    width: '80%',
    height: '75%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  inputRow: {
    flexDirection: 'row',
  }
});

export default EditEventForm;
