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
        Monday: 1,
        Tuesday: 2,
        Wednesay: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
        Sunday: 7
    },

    TERMS: {
        Winter: 1,
        Fall: 2,
        Spring: 3,
        Summer: 4,
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
            CP213.description = "A class to take";
            CP213.location = "address goes here?";
            CP213.professor = "Albus Dumbledore"

            var AC213 = new app.Course();
            AC213.courseCode = "AC213";
            AC213.subject = "AC";
            AC213.courseTitle = "Other Subject"
            AC213.semester = new app.Semester("Fall", "2014");
            AC213.timeslots.push(new app.Timeslot(app.DAYS.Tuesday, '16:00', '17:30'));
            AC213.timeslots.push(new app.Timeslot(app.DAYS.Thursday, '16:00', '17:30'));
            AC213.description = "A class to take";
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
    scheduleControl: {
        populateCourseList: function() {

            var courseList = $('.course_list');

            if (app.currentSemester == null) {
                $.mobile.pageContainer.pagecontainer("change", '#home');
            }
            for (var i = 0; i < Object.keys(app.currentSemester.courses).length; ++i) {
                var course = app.currentSemester.courses[Object.keys(app.currentSemester.courses)[i]];
                $('.course_list').append('<li><a href="#">' + course.courseTitle + '</a></li>');
            }
        },
        populateSemesterList: function() {
            var scheduleList = $('.schedule_list');
            var currentSchedule = app.getScheduleForCurrentSemester();
            for (var i = 0; i < Object.keys(currentSchedule.courses).length; ++i) {
                var course = currentSchedule.courses[Object.keys(currentSchedule.courses)[i]];
                    scheduleList.append('<li><a href="here">' + course.courseTitle + '</a></li>');
            }

            if (!currentSchedule.courses || currentSchedule.courses.length == 0) {
                scheduleList.append('<li><a href="#"></a></li>');
            }
        },
        populateSemesterCalendar: function() {
            var scheduleCalendar = $('#schedule_calendar');

            //TODO: get the min and max times
            //TODO: figure out if Sat & Sun need to be displayed

            minTime = new Date(0, 0, 0, 8, 0, 0, 0);
            maxTime = new Date(0, 0, 0, 21, 0, 0, 0);
            var showWeekend = false;

            var incrementTime = function(time, increment_in_minutes) {
                return new Date(time.getTime() + increment_in_minutes * 60000);
            };

            var table = "<table id='calendar-header'>"
            table += '<thead><tr>';
            table += '<th></th>';
            table += '<th>Monday</th>';
            table += '<th>Tuseday</th>';
            table += '<th>Wednesday</th>';
            table += '<th>Thursday</th>';
            table += '<th>Friday</th>';
            table += '</tr></thead></table><table id="calendar">';
            for(var i = minTime; i < maxTime; i = incrementTime(i, 10)) {
               // console.log(i);
                var borderClass = '';
                var timeLabel = '';
                if (i.getMinutes() == 30) {
                    borderClass += 'table-border-top-light';
                    timeLabel = i.getHours() + ":" + i.getMinutes();
                } else if (i.getMinutes() == 0) {
                    borderClass += 'table-border-top-dark';
                    timeLabel = i.getHours() + ":00";
                } else {
                    timeLabel = i.getHours() + ":" + i.getMinutes();
                }
                table += '<tr>';
                table += '<td class="' + borderClass + '">';
                table += timeLabel;
                table += '</td>';
               // add a cell in 10 minute increments
               for (var j = 0; j < (showWeekend ? 7 : 5); ++j) {
                   var borderClassColumn = borderClass;
                   if (j % 2 == 0) {
                     borderClassColumn += ' table-bg';
                   }
                   table += '<td class="' + borderClassColumn +'">&nbsp</td>'// class="day' + j + '">a</td>';
                }
               table += "</tr>";
            }
            table += "</table>";
            scheduleCalendar.append(table);

        },
        initialize: function() {
            this.populateCourseList();
            this.populateSemesterList();
            this.populateSemesterCalendar();
        },
    },
};
