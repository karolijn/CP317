coursePlanner = {}

/*
 * Initialization of the application.
 */
coursePlanner.initialize = function() {
    //Fill Select Semesters Dropdown menu
    $('#home').on('pagebeforecreate', function() {
        $('#goToSchedulesPageBtn').hide();
        $('.networkError').hide();
        coursePlanner.semesterControl.initialize();
    });

    // Initialize and size the schedule calendar on the schedule page.
    $('#schedule').on('pagebeforecreate', function() {
        coursePlanner.scheduleControl.initialize();
        $('#schedule_calendar').css({
            height: $(window).height() * 0.5
        });
    });

    //reset search bar when returning to schedule page
    $('#schedule').on('pagebeforeshow', function() {
        $('#course_name_filter').val("").keyup();
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