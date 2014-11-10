app = {
    initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);

        $('#schedule').on('pagebeforecreate', function() {
            app.scheduleControl.initialize();

            $('#schedule_calendar').css({
                height: $(window).height() * 0.5
            });
        });

      /*  $('#schedule').on('pageinit', function() {
            $("#calendar").floatThead({
                scrollContainer: function ($table) {
                    return $table.closest('#schedule_calendar');
                }
            });
        });*/

        $(window).on('resize', function() {
            $('#schedule_calendar').css({
                height: $(window).height() * 0.5
            });
        });
    },

    onDeviceReady: function() {
		FastClick.attach(document.body);
    },

    Course: function() {
        this.courseCode;
        this.courseTitle;
        this.subject;
        this.semester;
        this.timeslots = [];
        this.description;
        this.location;
        this.professor;
        this.getKey = function() {
            return this.semester.getKey() + this.courseCode; };
    },

    Schedule: function Schedule() {
        this.courses = {};
    },

    Semester: function Semester(term, year) {
        this.term = term;
        this.year = year;
        this.courses = {};
        this.getKey = function() {
            return 'course_planner_' + term + year;
        }
    },

    currentSemester: null,

    Timeslot: function (day, startTime, endTime) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    },

    DAYS: {
        Monday: 0,
        Tuesday: 1,
        Wednesday: 2,
        Thursday: 3,
        Friday: 4,
        Saturday: 5,
        Sunday: 6
    },

    TERMS: {
        Winter: 0,
        Fall: 1,
        Spring: 2,
        Summer: 3,
    },

    selectSemesterControl: {
        //Initialize new semester
        setSemester: function() {
            app.currentSemester = new app.Semester(app.TERMS.Fall, "2014");
            this.loadFakeCourses();
        },
        //TODO: replace this with an actual query to loris.
        loadFakeCourses: function() {
            var CP317 = new app.Course();
            CP317.courseCode = "CP317";
            CP317.courseTitle = "Software Engineering";
            CP317.subject = "CP";
            CP317.semester = new app.Semester("Fall", "2014");
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Monday, '11:30', '13:00'));
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Wednesday, '13:30', '15:00'));
            CP317.description = "A class to take";
            CP317.location = "address goes here?";
            CP317.professor = "Albus Dumbledore"

            var CP213 = new app.Course();
            CP213.courseCode = "CP213";
            CP213.courseTitle = "Another SWE Course";
            CP213.subject = "CP";
            CP213.semester = new app.Semester("Fall", "2014");
            CP213.timeslots.push(new app.Timeslot(app.DAYS.Monday, '8:30', '9:30'));
            CP213.timeslots.push(new app.Timeslot(app.DAYS.Wednesday, '8:30', '9:30'));
            CP213.timeslots.push(new app.Timeslot(app.DAYS.Friday, '8:30', '9:30'));
            CP213.description = "A course about SWE";
            CP213.location = "address goes here?";
            CP213.professor = "Albus Dumbledore"

            var AC213 = new app.Course();
            AC213.courseCode = "AC213";
            AC213.subject = "AC";
            AC213.courseTitle = "Other Subject"
            AC213.semester = new app.Semester("Fall", "2014");
            AC213.timeslots.push(new app.Timeslot(app.DAYS.Tuesday, '16:00', '17:30'));
            AC213.timeslots.push(new app.Timeslot(app.DAYS.Thursday, '16:00', '17:30'));
            AC213.description = "An AC course";
            AC213.location = "address goes here?";
            AC213.professor = "Albus Dumbledore";
            app.currentSemester.courses[CP317.getKey()] = CP317;
            app.currentSemester.courses[CP213.getKey()] = CP213;
            app.currentSemester.courses[AC213.getKey()] = AC213;
        }
    },

    getScheduleForCurrentSemester: function() {
        var semesterKey = app.currentSemester.getKey();
        if (!localStorage.getItem(semesterKey)) {
            var newSchedule = new app.Schedule();
            localStorage.setItem(semesterKey, JSON.stringify(newSchedule));
        }
        return JSON.parse(localStorage.getItem(semesterKey));
    },
    updateScheduleForCurrentSemester: function(schedule) {
        var semesterKey = app.currentSemester.getKey();
        localStorage.setItem(semesterKey, JSON.stringify(schedule));
    },
    scheduleControl: {
        addCourseToSchedule: function(courseKey) {
          var schedule = app.getScheduleForCurrentSemester();
          schedule.courses[courseKey] = app.currentSemester.courses[courseKey];

          app.updateScheduleForCurrentSemester(schedule);
          app.scheduleControl.populateCourseList();
          app.scheduleControl.populateSemesterList();
          app.scheduleControl.populateSemesterCalendar();
          $('.course_list').listview("refresh");
          $('.schedule_list').listview("refresh");
        },
        removeCourseFromSchedule: function(courseKey) {
          var schedule = app.getScheduleForCurrentSemester();
          delete schedule.courses[courseKey];
          app.updateScheduleForCurrentSemester(schedule);
          app.scheduleControl.populateCourseList();
          app.scheduleControl.populateSemesterList();
          app.scheduleControl.populateSemesterCalendar();
          $('.course_list').listview("refresh");
          $('.schedule_list').listview("refresh");
        },
        populateCourseList: function() {
            var courseList = $('.course_list');

            if (app.currentSemester == null) {
                $.mobile.pageContainer.pagecontainer("change", '#home');
            }
            var schedule = app.getScheduleForCurrentSemester();

            courseList.empty();
            $('.courselist_popup').remove();

            for (var i = 0; i < Object.keys(app.currentSemester.courses).length; ++i) {
                var course = app.currentSemester.courses[Object.keys(app.currentSemester.courses)[i]];
                if(!schedule.courses[course.getKey()]) { // Skip the courses in the schedule.
                    var menuId = "popup_" + course.getKey();
                    var listItem = '<li class="course_list_item"><a href="#' + menuId + '" data-rel="popup" data-role="button" data-inline="true" data-transition="slideup" data-icon="gear" data-theme="e">'
                        + course.courseTitle + '</a></li>';
                    var coursePopup = '<div class="courselist_popup" data-role="popup" id="' + menuId + '" data-theme="d">';
                    coursePopup += '<ul data-role="listview" data-inset="true" style="min-width:210px;" data-theme="d">';
                    coursePopup += '<li><a href="#info">Details</a></li>';
                    coursePopup += '<li><a course_key="' + course.getKey() + '"';
                    coursePopup += ' class="add_to_schedule_link" href="#">Add to Schedule</a></li>';
                    coursePopup += '</ul></div>';

                    $('.course_list').append(listItem);
                    $('#schedule').append(coursePopup).trigger('pagecreate');
                }
            }

            $('.add_to_schedule_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.addCourseToSchedule(courseKey);

            });

            $('.courselist_popup').popup()

        },
        populateSemesterList: function() {
            var scheduleList = $('.schedule_list');
            scheduleList.empty();
            var currentSchedule = app.getScheduleForCurrentSemester();
            for (var i = 0; i < Object.keys(currentSchedule.courses).length; ++i) {
                var course = app.currentSemester.courses[Object.keys(currentSchedule.courses)[i]];
                scheduleList.append('<li course_key="'+ course.getKey() + '" class="semester_list_item"><a href="#">' + course.courseTitle + '</a></li>');
            }
            if (!currentSchedule.courses || currentSchedule.courses.length == 0) {
                scheduleList.append('<li><a href="#"></a></li>');
            }
            $('.semester_list_item').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
            });
        },
        buildCalendarEntry: function(course) {

            var calendarHtml = '<a href="#popup_"' + course.getKey() + '" data-rel="popup" data-role="button" '
            calendarHtml += 'data-inline="true" data-transition="slideup" data-icon="gear" data-theme="a">';
            calendarHtml += '<div class="details">';
            calendarHtml += '<h2>' + course.courseCode + "</h2>";
            calendarHtml += '<h3>' + course.courseTitle + "</h3>";
            calendarHtml += '</div></a>';

        },

        populateSemesterCalendar: function() {
            var colorEntries = ['red', 'green', 'blue', 'yellow', 'green', 'orange', 'pink'];
            var calendarIncrement = 10;
            var scheduleCalendar = $('#schedule_calendar');
            scheduleCalendar.empty();
            //TODO: get the min and max times
            //TODO: figure out if Sat & Sun need to be displayed

            minTime = new Date(0, 0, 0, 8, 0, 0, 0);
            maxTime = new Date(0, 0, 0, 21, 0, 0, 0);
            var showWeekend = false;

            var incrementTime = function(time, increment_in_minutes) {
                return new Date(time.getTime() + increment_in_minutes * 60000);
            };

            if ($('#calendar-header').size() == 0) {
                var tableHeader = "<table style='table-layout: fixed; width: 100%' id='calendar-header'>"
                tableHeader += '<thead><tr>';
                tableHeader += '<th style="min-width: 45px;width: 45px;"></th>';
                tableHeader += '<th>Monday</th>';
                tableHeader += '<th>Tuseday</th>';
                tableHeader += '<th>Wednesday</th>';
                tableHeader += '<th>Thursday</th>';
                tableHeader += '<th>Friday</th>';
                tableHeader += '</tr></thead></table>';
                $(tableHeader).insertBefore(scheduleCalendar);
            }

            var table = '<table style="table-layout: fixed; width: 100%" id="calendar">';

            for(var i = minTime; i < maxTime; i = incrementTime(i, calendarIncrement)) {
               // console.log(i);
                var borderClass = '';
                var timeLabel = '';
                table += '<tr class="' + i.getHours() + i.getMinutes() + '">';
                if (i.getMinutes() % 30 == 0) {
                    if (i.getMinutes() == 30) {
                        borderClass += 'table-border-top-light';
                        timeLabel = i.getHours() + ":" + i.getMinutes();
                    } else if (i.getMinutes() == 0) {
                        borderClass += 'table-border-top-dark';
                        timeLabel = i.getHours() + ":00";
                    }
                    table += '<td rowspan="'+ 30 / calendarIncrement +'" style="min-width: 45px; width: 45px" class="' + borderClass + '">';
                    table += timeLabel;
                    table += '</td>';
                }

               // add a cell in 10 minute increments
               for (var j = 0; j < (showWeekend ? 7 : 5); ++j) {
                   var borderClassColumn = borderClass;
                   if (j % 2 == 0) {
                     borderClassColumn += ' table-bg';
                   }
                   table += '<td class="' + borderClassColumn +' day' + j +'"></td>';// class="day' + j + '">a</td>';
                }
               table += "</tr>";
            }
            table += "</table>";
            scheduleCalendar.append(table);


            // Add current courses to schedule.
            var currentSchedule = app.getScheduleForCurrentSemester();
            for (var i = 0; i < Object.keys(currentSchedule.courses).length; ++i) {
                var course = app.currentSemester.courses[Object.keys(currentSchedule.courses)[i]];
                for (var j = 0; j < course.timeslots.length; ++j) {
                    var timeslot = course.timeslots[j];

                    var timeBlockStart = app.scheduleControl.timeToDateTime(timeslot.startTime);
                    var timeBlockEnd = app.scheduleControl.timeToDateTime(timeslot.endTime);
                    var rowSpan = 1;
                    var timeBlock = 'tr.' + timeBlockStart.getHours() + timeBlockStart.getMinutes() + ' > td.day' + timeslot.day;
                    for (var a = incrementTime(timeBlockStart, calendarIncrement); a < timeBlockEnd; a = incrementTime(a, calendarIncrement)) {
                        rowSpan += 1;
                        // for each row spanned, remove the corresponding cell in the calendar.
                        var mergeBlock = 'tr.' + a.getHours() + a.getMinutes() + ' > td.day' + timeslot.day;
                        $(mergeBlock).remove();
                    }
                    $(timeBlock).attr('rowspan', rowSpan);
                    $(timeBlock).css({'background-color': colorEntries[i]});
                    $(timeBlock).html(this.buildCalendarEntry(course));
                }
            }

        },
        timeToDateTime: function(timeString) {
            timeArray = timeString.split(':');
            return new Date(0, 0, 0, timeArray[0], timeArray[1], 0, 0);
        },

        initialize: function() {
            this.populateCourseList();
            this.populateSemesterList();
            this.populateSemesterCalendar();
        },
    },
};
