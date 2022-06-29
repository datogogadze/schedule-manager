module.exports = class Event {
  constructor(
    board_id,
    kid_id,
    name,
    description,
    start_date,
    end_date,
    duration,
    recurrence_pattern
  ) {
    this.board_id = board_id;
    this.kid_id = kid_id;
    this.name = name;
    this.description = description;
    this.start_date = start_date;
    this.end_date = end_date;
    this.duration = duration;
    this.recurrence_pattern = recurrence_pattern;
  }
};
