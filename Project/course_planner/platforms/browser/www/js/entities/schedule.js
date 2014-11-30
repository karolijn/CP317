/**
 * Class representing a schedule. A schedule is unique to the current localstorage
 * and semester combination.
 */
coursePlanner.Schedule = function() {
    var courses = {};

    // A timetable for each day containing ordered arrays of scheduled events.
    // this is a private object used for course collision detection.
    var timetable = [];
    timetable[coursePlanner.DAYS.Monday] = [];
    timetable[coursePlanner.DAYS.Tuesday] = [];
    timetable[coursePlanner.DAYS.Wednesday] = [];
    timetable[coursePlanner.DAYS.Thursday] = [];
    timetable[coursePlanner.DAYS.Friday] = [];

    /**
    * Structure containing ordered arrays of time entries for easy lookup/comparison.
    */
    ScheduleEvent = function(timestamp, courseKey, start){
        var timeStamp = timestamp;
        var courseKey = courseKey;
        var isStart = start;

        this.getTimeStamp = function() {
            return timeStamp;
        }
        this.getTimeStampDateTime = function() {
            return coursePlanner.utilities.timeToDateTime(timestamp);
        }

        this.getCourseKey = function() {
            return courseKey;
        }

        this.isStart = function() {
            return isStart;
        }

        this.isEnd = function() {
            return !isStart;
        }
    }

    // Add [course] to the current schedule.
    this.addCourse = function(course) {
        try {
          addCourseToTimetable(course);
          courses[course.getKey()] = course;
        } catch(e) {
          removeCourseFromTimetable(course);
          throw "Error adding course: " + e;
        }
        return this;
    };

    // Private method to add the course to a timetable. This is used for
    // collision detection.
    var addCourseToTimetable = function(course) {
        if (course.getTimeslots().length < 1) {
            alert(course.getCourseCode() + "'s timeslots are TBD. It will be added to the course list but cannot be scheduled.")
        }
        for (var i = 0; i < course.getTimeslots().length; ++i) {
          var courseTimeslot = course.getTimeslots()[i];
          var courseDay = courseTimeslot.getDay();
          var courseStartTime = coursePlanner.utilities.timeToDateTime(courseTimeslot.getStartTime());
          var courseEndTime = coursePlanner.utilities.timeToDateTime(courseTimeslot.getEndTime());
          var daySchedule = timetable[courseDay];

          // Find the index of the first schedule event that follows the current
          // timeslot.
          var j = 0;
          while(j < daySchedule.length) {
            if (daySchedule[j].getTimeStampDateTime() > courseStartTime) {
                break;
            }
            ++j;
          }

          // If there is no entry later than the start time,
          // there is no conflict for this timeslot.
          if (j == daySchedule.length) {
              // Add the course to the schedule at the end.
              daySchedule.push(new ScheduleEvent(courseTimeslot.getStartTime(), course.getKey(), true));
              daySchedule.push(new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), false));
              continue;
          }

          var timestamp = daySchedule[j].getTimeStampDateTime();
          if (timestamp > courseStartTime) {
            // If the timestamp after the start time falls before the end time,
            // something happens (start or ends) in the middle of this timeslot.
            // or
            // If the first timetable after the course start is also after the end,
            // check that something isn't ending that was alreay in progress.
            if (timestamp < courseEndTime || daySchedule[j].isEnd()) {
              throw course.getCourseCode() + " conflicts with "
                + coursePlanner.currentSemester.get().getCourse((daySchedule[j].getCourseKey())).getCourseCode()
                + ". You can only schedule one of these courses."
            }

            //If there is no conflict, add the course before the event that follows it.
            daySchedule.splice(j, 0, new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), false));
            daySchedule.splice(j, 0, new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), true));
          }
        }
    };

    // Private method to remove a course from the timetable.
    var removeCourseFromTimetable = function(course) {
        for (var i = 0; i < course.getTimeslots().length; ++i) {
            // for each timeslot a course has, find it on the schedule and remove it.
            var currentTimeslot = course.getTimeslots()[i];
            var daySchedule = timetable[currentTimeslot.getDay()];
            for(var j = 0; j < daySchedule.length; ++j) {
                if(daySchedule[j].getCourseKey() == course.getKey()) {
                    daySchedule.splice(j, 2);
                    // Break out of hte inner loop. We found the timeslot and can continue
                    // the outer loop.
                    break;
                }
            }
        }
    }
    this.fromStorage = function(courseList) {
        for (var i = 0; i < courseList.length; ++i) {
            course = coursePlanner.currentSemester.get().getCourse(courseList[i]);
            this.addCourse(course);
        }
        return this;
    };
    this.toStorage = function() {
        return Object.keys(courses);
    }
    this.removeCourse = function(courseKey) {
        if (courses[courseKey]) {
            removeCourseFromTimetable(courses[courseKey]);
            delete courses[courseKey];
        }
    };
    this.getCourses = function() {
        return courses;
    };
    this.getCourse = function(courseKey) {
        return courses[courseKey];
    };
    this.getCourseKeys = function() {
        return Object.keys(courses);
    };
    this.clearCourses = function() {
        courses = {};
    };
};
