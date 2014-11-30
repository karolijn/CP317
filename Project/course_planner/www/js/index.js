coursePlanner = {}

importScript = function(path) {
    var script = document.createElement('script');
    script.src = path;
    document.head.appendChild(script);
}

importScript('../www/js/utilities.js');
importScript('../www/js/enums.js');
importScript('../www/js/entities/timeslot.js');
importScript('../www/js/entities/course.js');
importScript('../www/js/entities/errors.js');
importScript('../www/js/entities/schedule.js');
importScript('../www/js/entities/semester.js');
importScript('../www/js/controllers/course_details_control.js');
importScript('../www/js/controllers/schedule_control.js');
importScript('../www/js/controllers/semester_control.js');
importScript('../www/js/controllers/export_to_ical_control.js');


/*
 * Initialization of the application.
 */
coursePlanner.initialize = function() {
    //Fill Select Semesters Dropdown menu
    $('#home').on('pageload', function() {
        coursePlanner.semesterControl.initialize();
    });

    // Initialize and size the schedule calendar on the schedule page.
    $('#schedule').on('pagebeforecreate', function() {
        coursePlanner.scheduleControl.initialize();

        $('#schedule_calendar').css({
            height: $(window).height() * 0.5
        });
    });

    // Resize the calendar on window resize.
    $(window).on('resize', function() {
        $('#schedule_calendar').css({
            height: $(window).height() * 0.5
        });
    });

    // Adjust the course info div on the info page on load.
    $('#info').on('pagebeforecreate', function() {
        coursePlanner.courseDetailsControl.initialize();
        $('#course_info').css({
            width: $(window).width()
        });
    });


};

/*
 * The current active semester for the coursePlanner.
 */
coursePlanner.currentSemester = (function() {
    var currentSemester = null;
    return {
        get: function() {
            return currentSemester;
        },
        set: function(semester) {
            currentSemester = semester;
        }
    };
})();