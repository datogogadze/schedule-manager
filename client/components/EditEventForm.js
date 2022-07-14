import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, View
} from 'react-native';
// import Checkbox from 'expo-checkbox';

import { Text, Input, Select, SelectItem, IndexPath, Layout, CheckBox } from '@ui-kitten/components';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Field, Formik } from 'formik';
import { EditEventSchema } from '../utils/formik-schemas';
import { frequencyOptions, recurrenceEndingOptions } from '../utils/select-options';
import moment from 'moment';



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
  notificationTime: null
} }) => {
  const refDescription = useRef();


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
        {({ handleChange, values }) => {

          useEffect(() => {
            handleFormChange(values);
          }, [values]);
          
          return <>
            <Input
              placeholder="Name"
              status="basic"
              style={styles.textInput}
              autoCapitalize="none"
              label="Event Name"
              size="large"
              onChangeText={ handleChange('name')}
              onSubmitEditing={() => refDescription.current.focus()}
              value={values.name}
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
              value={values.description}

              onChangeText={ handleChange('description')}

            />

            <View style={styles.dates}>
              <Text style={styles.text} category='s2'>Day</Text>
              <Field name="eventDay">
                {({ field, form }) => (
                  <DateTimePicker
                    mode="date"
                    onChange={ (event, value) =>  {
                      form.setFieldValue(field.name, value);
                      form.setFieldTouched(field.name, true);
                    }}
                    value={values.eventDay}
                  />
                )}
              </Field>

              <Text style={styles.text} category='s2'>From</Text>
              <Field name="hourFrom">
                {({ field, form }) => (
                  <DateTimePicker
                    mode="time"
                    onChange={ (event, value) =>  {
                      form.setFieldValue(field.name, value);
                      form.setFieldTouched(field.name, true);
                    }}
                    value={values.hourFrom}
                  />
                )}
              </Field>

              <Text style={styles.text} category='s2'>To</Text>
              <Field name="hourTo">
                {({ field, form }) => (
                  <DateTimePicker
                    mode="time"
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

            { values.enableNotification && <Input 
              style={styles.textInput}
              keyboardType = 'numeric'
              label="Minutes before notification"
              placeholder='Minutes'
              onChangeText = { handleChange('notificationTime')}
              value = {values.notificationTime}
            />}

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
            
              <Text>Repeat Every</Text>
              
              <Layout style={styles.inputRow} level='1'>
                <Input 
                  style={styles.textInput}
                  keyboardType = 'numeric'
                  onChangeText = { handleChange('interval')}
                  value = {values.interval}
                />

                <Field name="frequencyIndex">
                  {({ field, form }) => (
                    <Select
                      // {...field}
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

              <Text>Ends</Text>
              <View style={styles.frequency}>
                <Field name="recurrenceEndingIndex">
                  {({ field, form }) => (
                    <Select
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
                <Text>Recurrence end date</Text>
                <Field name="recurrenceEndDate">
                  {({ field, form }) => (
                    <DateTimePicker
                      mode="date"
                      minimumDate={values.eventDay}
                      onChange={ (event, value) =>  {
                        form.setFieldValue(field.name, value);
                        form.setFieldTouched(field.name, true);
                      }}
                      value={values.recurrenceEndDate}
                    />
                  )}
                </Field>
              </> }

              { values.recurrenceEndingIndex == 1 && <>
                <Text>Recurrence count</Text>
                <Input 
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

export default EditEventForm;
