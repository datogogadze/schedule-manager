const { RRule, RRuleSet, rrulestr } = require('rrule');

const getRule = (start, freq) => {
  return new RRule({
    dtstart: start,
    freq: freq,
  });
};

class Event {
  constructor(name, start, end, rrule) {
    this.name = name;
    this.start = start;
    this.end = end != undefined ? end : new Date(Date.UTC(2100, 12, 31));
    this.rrule = rrule;
  }
}

let events = [
  new Event(
    '1',
    new Date(Date.UTC(2022, 6, 13, 20, 15)),
    new Date(Date.UTC(2022, 6, 13))
  ),
  new Event(
    '2',
    new Date(Date.UTC(2022, 6, 15, 18, 20)),
    new Date(Date.UTC(2022, 6, 15))
  ),
  new Event(
    '3',
    new Date(Date.UTC(2022, 6, 17, 14, 00)),
    undefined,
    getRule(new Date(Date.UTC(2022, 6, 17, 14, 00)), RRule.WEEKLY).toString()
  ),
];

// const dates = rule.between(
//   new Date(Date.UTC(2022, 6, 20)),
//   new Date(Date.UTC(2022, 7, 13))
// );

const start = new Date(Date.UTC(2022, 6, 20));
const end = new Date(Date.UTC(2022, 7, 13));

const getAllEvents = (start, end) => {
  for (const event of events) {
    if (new Date(event.start) < end && new Date(event.end) > start) {
      console.log(event.nameb);
    }
  }
};

// getAllEvents(start, end);

console.log(RRule.YEARLY);
