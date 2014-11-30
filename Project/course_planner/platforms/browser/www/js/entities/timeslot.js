/**
* Timeslot representing a single classtime.
* Courses may have many timeslots for each [day] the course
* meets and the [starTime] and [endTime] for those meetings.
*/
coursePlanner.Timeslot = function(day, startTime, endTime) {
    var day = day;
    var startTime = startTime;
    var endTime = endTime;
    this.getDay = function() {
        return day;
    };
    this.getDayString = function() {
        return Object.keys(coursePlanner.DAYS).filter(function(key) {
            return coursePlanner.DAYS[key] === day;
        })[0];
    }
    this.getStartTime = function() {
        return startTime;
    };
    this.getEndTime = function() {
        return endTime;
    };
};