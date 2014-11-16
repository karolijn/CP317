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

    /**
     * Class representing a course. A course has a unique
     * combination of semester, course code and section.
     */
    Course: function() {
        var courseCode = '';
        var courseTitle = '';
        var section = '';
        var subject = '';
        var semester = null;
        var timeslots = [];
        var description = '';
        var location = '';
        var professor = '';

        this.getCourseCode = function() {
            return courseCode;
        };
        this.getCourseTitle = function() {
            return courseTitle;
        };
        this.getSubject = function() {
            return subject;
        };
        this.getSection = function() {
            return section;
        };
        this.getSemester = function() {
            return semester;
        };
        this.getTimeslots = function() {
            return timeslots;
        };
        this.getDescription = function() {
            return description;
        };
        this.getLocation = function() {
            return location;
        };
        this.getProfessor = function() {
            return professor;
        };
        this.getKey = function() {
            if (semester != null) {
                return semester.getKey() + courseCode;
            }
            return null;
        };

        this.setCourseCode = function(value) {
            courseCode = value;
            return this;
        };
        this.setCourseTitle= function(value) {
            courseTitle = value;
            return this;
        };
        this.setSubject = function(value) {
            subject = value;
            return this;
        };
        this.setSection = function(value) {
            section = value;
            return this;
        };
        this.setSemester = function(value) {
            semester = value;
            return this;
        };
        this.addTimeslot= function(value) {
            timeslots.push(value);
            return this;
        };
        this.setDescription= function(value) {
            description = value;
            return this;
        };
        this.setLocation= function(value) {
            location = value;
            return this;
        };
        this.setProfessor = function(value) {
            provessor = value;
            return this;
        };
    },
    Schedule: function() {
        var courses = {};
        this.addCourse = function(course) {
            courses[course.getKey()] = course;
            return this;
        };
        this.addAllCourses = function(courseList) {
            courses = courseList;
            return this;
        };
        this.removeCourse = function(courseKey) {
            if (courses[courseKey]) {
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
    },
    Semester: function(term, year) {
        var term = term;
        var year = year;
        var courses = {};
        this.addCourse = function(course) {
            courses[course.getKey()] = course;
            return this;
        };
        this.addAllCourses = function(courseList) {
            courses = courseList;
            return this;
        };
        this.getTerm = function() {
            return term;
        };
        this.getYear = function() {
            return year;
        };
        this.getCourses = function() {
            return courses;
        };
        this.toString = function() {
            return term + " " + year;
        };
        this.removeCourse = function(courseKey) {
            courses[courseKey].delete();
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
        this.getKey = function() {
            return 'course_planner_' + term + year;
        };
    },

    currentSemester: null,

    /**
     * Timeslot representing a single classtime.
     * Courses may have many timeslots for each [day] the course
     * meets and the [starTime] and [endTime] for those meetings.
     */
    Timeslot: function(day, startTime, endTime) {
        var day = day;
        var startTime = startTime;
        var endTime = endTime;
        this.getDay = function() {
            return day;
        };
        this.getDayString = function() {
            return Object.keys(app.DAYS).filter(function(key) {
                return app.DAYS[key] === day;
            })[0];
        }
        this.getStartTime = function() {
            return startTime;
        };
        this.getEndTime = function() {
            return endTime;
        };
    },

    DAYS: {
        Monday: 0,
        Tuesday: 1,
        Wednesday: 2,
        Thursday: 3,
        Friday: 4,
        Saturday: 5,
        Sunday: 6,
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
            var CP317 = new app.Course()
                .setCourseCode("CP317")
                .setCourseTitle("Software Engineering")
                .setSubject("CP")
                .setSection("A")
                .setSemester(new app.Semester("Fall", "2014"))
                .addTimeslot(new app.Timeslot(app.DAYS.Monday, '11:30', '13:00'))
                .addTimeslot(new app.Timeslot(app.DAYS.Wednesday, '13:30', '15:00'))
                .setDescription("A class to take")
                .setLocation("address goes here?")
                .setProfessor("Albus Dumbledore");

            var CP213 = new app.Course()
                .setCourseCode("CP213")
                .setCourseTitle("Another SWE Course")
                .setSubject("CP")
                .setSection("A")
                .setSemester(new app.Semester("Fall", "2014"))
                .addTimeslot(new app.Timeslot(app.DAYS.Monday, '8:30', '9:30'))
                .addTimeslot(new app.Timeslot(app.DAYS.Wednesday, '8:30', '9:30'))
                .addTimeslot(new app.Timeslot(app.DAYS.Friday, '8:30', '9:30'))
                .setDescription("A course about SWE")
                .setLocation("address goes here?")
                .setProfessor("Albus Dumbledore");

            var AC213 = new app.Course()
                .setCourseCode("AC213")
                .setCourseTitle("Other Subject")
                .setSubject("AC")
                .setSection("A")
                .setSemester(new app.Semester("Fall", "2014"))
                .addTimeslot(new app.Timeslot(app.DAYS.Tuesday, '16:00', '17:30'))
                .addTimeslot(new app.Timeslot(app.DAYS.Thursday, '16:00', '17:30'))
                .setDescription("An AC course")
                .setLocation("address goes here?")
                .setProfessor("Albus Dumbledore");

            app.currentSemester
                .addCourse(CP317)
                .addCourse(CP213)
                .addCourse(AC213);
        }
    },

    getScheduleForCurrentSemester: function() {
        var semesterKey = app.currentSemester.getKey();
        if (!localStorage.getItem(semesterKey)) {
            localStorage.setItem(semesterKey, JSON.stringify({}));
        }
        var savedCourses = JSON.parse(localStorage.getItem(semesterKey));
        return new app.Schedule().addAllCourses(savedCourses);
    },
    updateScheduleForCurrentSemester: function(schedule) {
        var semesterKey = app.currentSemester.getKey();
        localStorage.setItem(semesterKey, JSON.stringify(schedule.getCourses()));
    },
    scheduleControl: {
        initCourseList: function() {
            $('#schedule').on({
                pageinit: function(event) {
                    $('#course_list').listview().filterable('option', 'filterCallback', this.filterCourseList);
                }
            });
        },
        filterCourseList: function(index, filter) {
            if (filter.indexOf("subject: ") == 0) {
                            //search by subject
            } else {
                var searchText = $('#course_list').children()[index].textContent;
                return searchText.toLowerCase().indexOf( filter ) === -1;
            }
        },
        addCourseToSchedule: function(courseKey) {
          var schedule = app.getScheduleForCurrentSemester();
          schedule.addCourse(app.currentSemester.getCourse(courseKey));

          app.updateScheduleForCurrentSemester(schedule);
          app.scheduleControl.populateCourseList();
          app.scheduleControl.populateSemesterList();
          app.scheduleControl.populateSemesterCalendar();
          $('.course_list').listview("refresh");
          $('.schedule_list').listview("refresh");
        },
        removeCourseFromSchedule: function(courseKey) {
          var schedule = app.getScheduleForCurrentSemester();
          schedule.removeCourse(courseKey);
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

            for (var i = 0; i < app.currentSemester.getCourseKeys().length; ++i) {
                var course = app.currentSemester.getCourse(app.currentSemester.getCourseKeys()[i]);
                if (!schedule.getCourse(course.getKey())) { // Skip the courses in the schedule.
                    var menuId = "popup_" + course.getKey();
                    var listItem = '<li class="course_list_item"><a href="#' + menuId + '" data-rel="popup" data-role="button" data-inline="true" data-transition="slideup" data-icon="gear" data-theme="e">'
                        + course.getCourseCode() + ' ' + course.getCourseTitle() + '</a></li>';
                    var coursePopup = '<div class="courselist_popup" data-position-to="window" data-role="popup" id="' + menuId + '" data-theme="e" data-overlay-theme="a">';
                    coursePopup += '<h2>' + course.getCourseCode() + '</h2>';
                    coursePopup += '<p>' + course.getCourseTitle() + '</p>';
                    for (var j = 0; j < course.getTimeslots().length; ++j) {
                        coursePopup += '<p class="timeslot">' + course.getTimeslots()[j].getDayString() + ": " + course.getTimeslots()[j].getStartTime() + '-' + course.getTimeslots()[j].getEndTime() + '</p>';
                    }
                    coursePopup += '<ul class="options_list" data-role="listview" data-inset="true" style="min-width:210px;" data-theme="d">';
                    coursePopup += '<li><a href="#info">Details</a></li>';
                    coursePopup += '<li><a course_key="' + course.getKey() + '"';
                    coursePopup += ' class="add_to_schedule_link" href="#">Add to Schedule</a></li>';
                    coursePopup += '</ul></div>';

                    $('.course_list').append(listItem);


                    $('.options_list').listview().listview('refresh');
                    $('.options_list').listview('refresh')
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
            var courseKeys = currentSchedule.getCourseKeys();
            for (var i = 0; i < courseKeys.length; ++i) {
                var course = app.currentSemester.getCourse(courseKeys[i]);
                scheduleList.append('<li data-icon="false" course_key="'+ course.getKey() + '" class="semester_list_item"><a href="#">' + course.getCourseTitle() + '</a></li>');
            }
            //if (!currentSchedule.getCourseKeys().length == 0) {
            //    scheduleList.append('<li><a href="#"></a></li>');
           // }
            $('.semester_list_item').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
            });
        },
        buildCalendarEntry: function(course) {

            var calendarHtml = '<a href="#popup_"' + course.getKey() + '" data-rel="popup" data-role="button" '
            calendarHtml += 'data-inline="true" data-transition="slideup" data-icon="gear" data-theme="a">';
            calendarHtml += '<div class="details">';
            calendarHtml += '<h2>' + course.getCourseCode() + "</h2>";
            calendarHtml += '<h3>' + course.getCourseTitle() + "</h3>";
            calendarHtml += '</div></a>';

        },

        populateSemesterCalendar: function() {
            var colorEntries = ['#7AB5A8', '#478E7E', '#256E5D', '#0D4D3F', '#002D23'];
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
                tableHeader += '<th>Tuesday</th>';
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
            var courseKeys = currentSchedule.getCourseKeys();
            for (var i = 0; i < courseKeys.length; ++i) {
                var course = app.currentSemester.getCourse(courseKeys[i]);
                for (var j = 0; j < course.getTimeslots().length; ++j) {
                    var timeslot = course.getTimeslots()[j];

                    var timeBlockStart = app.scheduleControl.timeToDateTime(timeslot.getStartTime());
                    var timeBlockEnd = app.scheduleControl.timeToDateTime(timeslot.getEndTime());
                    var rowSpan = 1;
                    var timeBlock = 'tr.' + timeBlockStart.getHours() + timeBlockStart.getMinutes() + ' > td.day' + timeslot.getDay();
                    for (var a = incrementTime(timeBlockStart, calendarIncrement); a < timeBlockEnd; a = incrementTime(a, calendarIncrement)) {
                        rowSpan += 1;
                        // for each row spanned, remove the corresponding cell in the calendar.
                        var mergeBlock = 'tr.' + a.getHours() + a.getMinutes() + ' > td.day' + timeslot.getDay()
                        ;
                        $(mergeBlock).remove();
                    }
                    $(timeBlock).attr('rowspan', rowSpan);
                    $(timeBlock).css({'background-color': colorEntries[i % colorEntries.length]});
                    $(timeBlock).html(this.buildCalendarEntry(course));
                }
            }

        },
        timeToDateTime: function(timeString) {
            timeArray = timeString.split(':');
            return new Date(0, 0, 0, timeArray[0], timeArray[1], 0, 0);
        },
        initialize: function() {
            this.initCourseList();
            this.populateCourseList();
            //TODO(carolyn): move this somewhere.
            $('h2 .semester_name').text = app.currentSemester.toString();
            this.populateSemesterList();
            this.populateSemesterCalendar();
        },
    },
};
