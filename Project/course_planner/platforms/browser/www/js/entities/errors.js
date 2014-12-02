/*
 * Errors that occur in the course planner application.
 */
coursePlanner.errors = {};

/*
 * Error thrown when a scheduling conflict occurs. Takes in a [message]
 * describing the error.
 */
coursePlanner.errors.ScheduleConflictError = function(message) {
    this.name = "Schedule Conflict Error";
    this.message = "Schedule Conflict Error: " + message;
};
coursePlanner.errors.ScheduleConflictError.prototype = new Error();
coursePlanner.errors.ScheduleConflictError.constructor = coursePlanner.errors.ScheduleConflictError;

/*
 * Error thrown when a network error occurs. Takes in a [message]
 * describing the error.
 */
coursePlanner.errors.NetworkError = function(message) {
    this.name = "Network Error";
    this.message = "Network Error: " + message;
};
coursePlanner.errors.NetworkError.prototype = new Error();
coursePlanner.errors.NetworkError.constructor = coursePlanner.errors.NetworkError;

/*
 * Error thrown when a course does not have any scheduling data. Takes in a [message]
 * describing the error.
 */
coursePlanner.errors.UnscheduledCourseError = function(message) {
    this.name = "Unscheduled Course Error";
    this.message = "Unscheduled Course Error: " + message;
};
coursePlanner.errors.UnscheduledCourseError.prototype = new Error();
coursePlanner.errors.UnscheduledCourseError.constructor = coursePlanner.errors.UnscheduledCourseError;

/*
 * Error thrown when a course does not have any scheduling data. Takes in a [message]
 * describing the error.
 */
coursePlanner.errors.DataProcessingError = function(message) {
    this.name = "Unscheduled Course Error";
    this.message = "Unscheduled Course Error: " + message;
};
coursePlanner.errors.DataProcessingError.prototype = new Error();
coursePlanner.errors.DataProcessingError.constructor = coursePlanner.errors.NetworkError;
