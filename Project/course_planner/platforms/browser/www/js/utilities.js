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

coursePlanner.utilities.getScheduleForCurrentSemester = function() {
    var semesterKey = coursePlanner.currentSemester.get().getKey();
    if (!localStorage.getItem(semesterKey)) {
        var scheduleStorage = new coursePlanner.Schedule().toStorage();
        localStorage.setItem(semesterKey, JSON.stringify(scheduleStorage));
    }
    var savedSchedule = JSON.parse(localStorage.getItem(semesterKey));
    return new coursePlanner.Schedule().fromStorage(savedSchedule);
};


coursePlanner.utilities.updateScheduleForCurrentSemester = function(schedule) {
    var semesterKey = coursePlanner.currentSemester.get().getKey();
    localStorage.setItem(semesterKey, JSON.stringify(schedule.toStorage()));
};