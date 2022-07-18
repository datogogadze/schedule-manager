import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, View, Keyboard, Platform, Button
} from 'react-native';
// import Checkbox from 'expo-checkbox';

import { Text, Input, Select, SelectItem, IndexPath, Layout, CheckBox } from '@ui-kitten/components';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Field, Formik } from 'formik';
import { EditEventSchema } from '../utils/formik-schemas';
import { frequencyOptions, recurrenceEndingOptions } from '../utils/select-options';
import moment from 'moment';



const EditEventForm = ({ isEditing, boardKids, refForm, handleSubmit = () => {}, handleFormChange = () => {}, initialValues = {
  name: '',
  description: '',
  kidIndex: null,
  eventDay: moment().startOf('day').toDate(),
  hourFrom: moment().toDate(),
  durationMinute: '00',
  durationHour: '01',
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
  const refDurationMinute = useRef();

  const [showEventDay, setShowEventDay] = React.useState(false);
  const [showEventStartTime, setShowEventStartTime] = React.useState(false);
  const [showRecurrenceEndDate, setShowRecurrenceEndDate] = React.useState(false);


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
              placeholder="სახელი"
              status={errors.name ? 'danger' : 'basic'}
              style={styles.textInput}
              autoCapitalize="none"
              label="ივენთის სახელი"
              size="large"
              caption={errors.name || ' '}
              onChangeText={ handleChange('name')}
              onSubmitEditing={() => refDescription.current.focus()}
              value={values.name}
            />

            <Input
              placeholder="აღწერა"
              label="აღწერა"
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

            { !isEditing && <Field name="kidIndex">
              {({ field, form }) => (
                <Select
                  style={{flexGrow: 1}}
                  label='ბავშვი'
                  status={errors.kidIndex ? 'danger' : 'basic'}
                  caption={errors.kidIndex || ' '}
                  selectedIndex={ new IndexPath(values.kidIndex) }
                  value={boardKids[values.kidIndex]?.['display_name'] || 'აირჩიეთ ბავშვი'}
                  onSelect={ (v) => {
                    form.setFieldValue(field.name, v.row);
                    form.setFieldTouched(field.name, true);
                  }}
                >
                  { boardKids.map((kid, i) => <SelectItem key={i} title={kid['display_name']}/>) }
                </Select>
              )}
            </Field> }

            <View style={styles.dates}>
              <View style={styles.datePickerWrapper}>
                <Text style={styles.text} category='s2'>დაწყების დღე</Text>
                <Field name="eventDay">
                  {({ field, form }) => Platform.OS == 'android' && !showEventDay ? (
                    <Button onPress={() => setShowEventDay(true)} title={moment(values[field.name]).format('MMM D YYYY')} />
                  ) : (
                    <DateTimePicker
                      style={styles.datePicker}
                      mode="date"
                      onChange={ (event, value) =>  {
                        setShowEventDay(false);
                        if (value) {
                          form.setFieldValue(field.name, value);
                          form.setFieldTouched(field.name, true);
                        }
                      }}
                      value={values.eventDay}
                    />
                  )}
                </Field>
              </View>
              
              <View style={styles.datePickerWrapper}>
                <Text style={styles.text} category='s2'>დაწყების დრო</Text>
                
                <Field name="hourFrom">
                  {({ field, form }) => Platform.OS == 'android' && !showEventStartTime ? (
                    <Button onPress={() => setShowEventStartTime(true)} title={moment(values[field.name]).format('LT')} />
                  ) : (
                    <DateTimePicker
                      style={styles.datePicker}
                      mode="time"
                      onChange={ (event, value) =>  {
                        setShowEventStartTime(false);
                        if (value) {
                          form.setFieldValue(field.name, value);
                          form.setFieldTouched(field.name, true);
                        }
                      }}
                      value={values.hourFrom}
                    />
                  )}
                </Field>
              </View>


              <Text style={{marginBottom: 20}} category='s1'>
                ხანგრძლივობა
              </Text>

              <Layout style={styles.inputRow} level='1'>
                <Input 
                  label='საათი'
                  style={{ width: '20%', marginRight: 20}}
                  caption={errors.durationHour || ' '}
                  status={errors.durationHour ? 'danger' : 'basic'}
                  keyboardType = 'numeric'
                  onChangeText = { (value) => {
                    let nextVal = value;

                    if (value.length > 0) {
                      nextVal = Math.min(Number(value), 23).toString();
                    }
                    if (value.length >= 3) return refDurationMinute.current.focus();
                    handleChange('durationHour')(nextVal);

                    if (value.length >= 2) refDurationMinute.current.focus();
                  }}

                  value = {values.durationHour}
                  onFocus={() => handleChange('durationHour')('')}
                  onBlur={() => {
                    if (values.durationHour == '') {
                      handleChange('durationHour')('00');
                    } else if (values.durationHour.length == 1) {
                      handleChange('durationHour')('0' + values.durationHour);
                    }
                  }}
                />
                <Input 
                  label='წუთი'
                  style={{ width: '20%', marginRight: 20}}
                  caption={errors.durationMinute || ' '}
                  status={errors.durationMinute ? 'danger' : 'basic'}
                  keyboardType = 'numeric'
                  onChangeText = { (value) => {
                    let nextVal = value;

                    if (value.length > 0) {
                      nextVal = Math.min(Number(value), 59).toString();
                    }
                    if (value.length >= 3) return Keyboard.dismiss();
                    handleChange('durationMinute')(nextVal);
                    if (value.length >= 2) Keyboard.dismiss();
                  }}
                  ref={refDurationMinute}
                  value = {values.durationMinute}
                  onFocus={() => handleChange('durationMinute')('')}
                  onBlur={() => {
                    if (values.durationMinute == '') {
                      handleChange('durationMinute')('00');
                    } else if (values.durationMinute.length == 1) {
                      handleChange('durationMinute')('0' + values.durationMinute);
                    }
                  }}
                />
              </Layout>
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
                  ნოთიფიკაციის ჩართვა
                </CheckBox> 
              )}
            </Field>

            { values.enableNotification && <Text style={{marginBottom: 20}} category='s1'>
              შემახსენე
            </Text> } 

            { values.enableNotification && <Layout style={styles.inputRow} level='1'>
              <Input 
                label='დღე'
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
                label='საათი'
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
                  } else if (values.notificationTimeHour.length == 1) {
                    handleChange('notificationTimeHour')('0' + values.notificationTimeHour);
                  }
                }}
              />
              <Input 
                label='წუთი'
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
                  } else if (values.notificationTimeMinute.length == 1) {
                    handleChange('notificationTimeMinute')('0' + values.notificationTimeMinute);
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
                  განმეორებითი
                </CheckBox> 
              )}
            </Field>

            { values.isRecurring && <>
              <Layout style={styles.inputRow} level='1'>
                <Input 
                  label='გამეორდეს ყოველი'
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
                      label='მთავრდება'
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
                  <Text style={styles.text} category='s2'>გამეორების ბოლო ვადა</Text>
                  <Field name="recurrenceEndDate">
                    {({ field, form }) => Platform.OS == 'android' && !showRecurrenceEndDate ? (
                      <Button onPress={() => setShowRecurrenceEndDate(true)} title={moment(values[field.name]).format('MMM D YYYY')} />
                    ) : (
                      <DateTimePicker
                        style={styles.datePicker}
                        mode="date"
                        onChange={ (event, value) =>  {
                          setShowRecurrenceEndDate(false);
                          if (value) {
                            form.setFieldValue(field.name, value);
                            form.setFieldTouched(field.name, true);
                          }
                        }}
                        value={values.recurrenceEndDate}
                      />
                    )}
                  </Field>
                </View>
                
              </> }

              { values.recurrenceEndingIndex == 1 && <>
                <Input
                  label='გამეორების რაოდენობა'
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
    marginBottom: 15
  }
});

export default EditEventForm;
