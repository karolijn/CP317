/*
 * Errors that occur in the course planner application.
 */
coursePlanner.errors = {};

/*
 * Error thrown a scheduling conflict occurs.
 */
coursePlanner.errors.ScheduleConflictError = function(message) {
    this.name = "Schedule Conflict Error";
    this.message = "Schedule Conflict Error: " + message;
};
coursePlanner.errors.ScheduleConflictError.prototype = new Error();
coursePlanner.errors.ScheduleConflictError.constructor = coursePlanner.errors.ScheduleConflictError;

/*
 * Error thrown when a network error occurs.
 */
coursePlanner.errors.NetworkError = function(message) {
    this.name = "Network Error";
    this.message = "Network Error: " + message;
};
coursePlanner.errors.NetworkError.prototype = new Error();
coursePlanner.errors.NetworkError.constructor = coursePlanner.errors.NetworkError;

/*
 * Error thrown when a course does not have any scheduling data.
 */
coursePlanner.errors.UnscheduledCourseError = function(message) {
    this.name = "Unscheduled Course Error";
    this.message = "Unscheduled Course Error: " + message;
};
coursePlanner.errors.UnscheduledCourseError.prototype = new Error();
coursePlanner.errors.UnscheduledCourseError.constructor = coursePlanner.errors.UnscheduledCourseError;

/*
 * Error thrown when a course does not have any scheduling data.
 */
coursePlanner.errors.DataProcessingError = function(message) {
    this.name = "Unscheduled Course Error";
    this.message = "Unscheduled Course Error: " + message;
};
coursePlanner.errors.DataProcessingError.prototype = new Error();
coursePlanner.errors.DataProcessingError.constructor = coursePlanner.errors.NetworkError;
