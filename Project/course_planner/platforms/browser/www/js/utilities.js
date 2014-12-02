/*
 * General utility object to abstract conversions and common behaviours.
 */
coursePlanner.utilities = {};

/*
* Utility function to convert from 24:00h [timeString] to a DateTime object.
*/
coursePlanner.utilities.timeToDateTime = function(timeString) {
    timeArray = timeString.split(':');
    return new Date(0, 0, 0, timeArray[0], timeArray[1], 0, 0);
};

/*
* Utility function to get the previous schedule already made for a given semester
* from local storage.
*/
coursePlanner.utilities.getScheduleForCurrentSemester = function() {
    var semesterKey = coursePlanner.currentSemester.get().getKey();
    if (!localStorage.getItem(semesterKey)) {
        var scheduleStorage = new coursePlanner.Schedule().toStorage();
        localStorage.setItem(semesterKey, JSON.stringify(scheduleStorage));
    }
    var savedSchedule = JSON.parse(localStorage.getItem(semesterKey));
    return new coursePlanner.Schedule().fromStorage(savedSchedule);
};

/*
* Utility function to save the current schedule for a given semester to local
* storage.
*/
coursePlanner.utilities.updateScheduleForCurrentSemester = function(schedule) {
    var semesterKey = coursePlanner.currentSemester.get().getKey();
    localStorage.setItem(semesterKey, JSON.stringify(schedule.toStorage()));
};

/*
* Utility function to convert season from ajax request to coursePlanner.TERMS value.
*/
coursePlanner.utilities.getSeason = function(term_month) {
  var season;
  if (term_month == "01") {
    season = coursePlanner.TERMS.Winter;
  } else if (term_month == "05") {
    season = coursePlanner.TERMS.Spring;
  } else {
    season = coursePlanner.TERMS.Fall;
  }
  return season;
};

/*
* Utility function to convert day from ajax request to coursePlanner.DAYS value.
*/
coursePlanner.utilities.getDay = function(code) {
  var day;
  if (code == "M") {
    day = coursePlanner.DAYS.Monday;
  } else if (code == "T") {
    day = coursePlanner.DAYS.Tuesday;
  } else if (code == "W") {
    day = coursePlanner.DAYS.Wednesday;
  } else if (code == "R") {
    day = coursePlanner.DAYS.Thursday;
  } else {
    day = coursePlanner.DAYS.Friday;
  }
  return day;
};

/*
* Utility function to convert 12 hour time string to 24 hour time string.
*/
coursePlanner.utilities.getTime = function(timeString) {
  var returnedTime;
  var time = timeString.slice(0, timeString.indexOf(" "));
  var timeOfDay = timeString.slice(timeString.length - 2);
  if (timeOfDay.search("a") == -1) {
    var timesArray = time.split(":");
    var hourInt;
    if (timesArray[0] != "12") {
      hourInt = parseInt(timesArray[0]);
      hourInt = hourInt + 12;
    } else {
      hourInt = timesArray[0];
    }
    var minutes = timesArray[1];
    returnedTime = hourInt + ":" + minutes;
  } else {
    var timesArray = time.split(":");
    var hourInt;
    if (timesArray[0] == "12") {
      hourInt = 0;
    } else {
      hourInt = timesArray[0];
    }
    var minutes = timesArray[1];
    returnedTime = hourInt + ":" + minutes;
  }
  return returnedTime;
};