app = {
    initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);

        $('#schedule').on('pagebeforecreate', function() {
            app.scheduleControl.initialize();

            $('#schedule_calendar').css({
                height: $(window).height() * 0.5
            });
        });

        $(window).on('resize', function() {
            $('#schedule_calendar').css({
                height: $(window).height() * 0.5
            });
        });
    },

    onDeviceReady: function() {
		FastClick.attach(document.body);
    },
    timeToDateTime: function(timeString) {
        timeArray = timeString.split(':');
        return new Date(0, 0, 0, timeArray[0], timeArray[1], 0, 0);
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

        // A timetable for each day containing ordered arrays of scheduled events.
        var timetable = [];
        timetable[app.DAYS.Monday] = [];
        timetable[app.DAYS.Tuesday] = [];
        timetable[app.DAYS.Wednesday] = [];
        timetable[app.DAYS.Thursday] = [];
        timetable[app.DAYS.Friday] = [];

        // An object containing ordered arrays of time entries for easy lookup/comparison.
        ScheduleEvent = function(timestamp, courseKey, start){
            var timeStamp = timestamp;
            var courseKey = courseKey;
            var isStart = start;

            this.getTimeStamp = function() {
                return timeStamp;
            }
            this.getTimeStampDateTime = function() {
                return app.timeToDateTime(timestamp);
            }

            this.getCourseKey = function() {
                return courseKey;
            }

            this.isStart = function() {
                return isStart;
            }

            this.isEnd = function() {
                return !isStart;
            }
        }

        this.addCourse = function(course) {
            try {
              addCourseToTimetable(course);
              courses[course.getKey()] = course;
            } catch(e) {
              removeCourseFromTimetable(course);
              throw "Error adding course: " + e;
            }
            return this;
        };

        var addCourseToTimetable = function(course) {
            for (var i = 0; i < course.getTimeslots().length; ++i) {
              var courseTimeslot = course.getTimeslots()[i];
              var courseDay = courseTimeslot.getDay();
              var courseStartTime = app.timeToDateTime(courseTimeslot.getStartTime());
              var courseEndTime = app.timeToDateTime(courseTimeslot.getEndTime());
              var daySchedule = timetable[courseDay];

              // Find the index of the first schedule event that follows the current
              // timeslot.
              var j = 0;
              while(j < daySchedule.length) {
                if (daySchedule[j].getTimeStampDateTime() > courseStartTime) {
                    break;
                }
                ++j;
              }

              // If there is no entry later than the start time,
              // there is no conflict for this timeslot.
              if (j == daySchedule.length) {
                  // Add the course to the schedule at the end.
                  daySchedule.push(new ScheduleEvent(courseTimeslot.getStartTime(), course.getKey(), true));
                  daySchedule.push(new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), false));
                  continue;
              }

              var timestamp = daySchedule[j].getTimeStampDateTime();
              if (timestamp > courseStartTime) {
                // If the timestamp after the start time falls before the end time,
                // something happens (start or ends) in the middle of this timeslot.
                // or
                // If the first timetable after the course start is also after the end,
                // check that something isn't ending that was alreay in progress.
                if (timestamp < courseEndTime || daySchedule[j].isEnd()) {
                  throw course.getCourseCode() + " conflicts with "
                    + app.currentSemester.getCourse((daySchedule[j].getCourseKey())).getCourseCode()
                    + ". You can only schedule one of these courses."
                }

                //If there is no conflict, add the course before the event that follows it.
                daySchedule.splice(j, 0, new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), false));
                daySchedule.splice(j, 0, new ScheduleEvent(courseTimeslot.getEndTime(), course.getKey(), true));
              }
            }
        };
        var removeCourseFromTimetable = function(course) {
            for (var i = 0; i < course.getTimeslots().length; ++i) {
                // for each timeslot a course has, find it on the schedule and remove it.
                var currentTimeslot = course.getTimeslots()[i];
                var daySchedule = timetable[currentTimeslot.getDay()];
                for(var j = 0; j < daySchedule.length; ++j) {
                    if(daySchedule[j].getCourseKey() == course.getKey()) {
                        daySchedule.splice(j, 2);
                        // Break out of hte inner loop. We found the timeslot and can continue
                        // the outer loop.
                        break;
                    }
                }
            }
        }
        this.fromStorage = function(courseList) {
            for (var i = 0; i < courseList.length; ++i) {
                course = app.currentSemester.getCourse(courseList[i]);
                this.addCourse(course);
            }
            return this;
        };
        this.toStorage = function() {
            return Object.keys(courses);
        }
        this.removeCourse = function(courseKey) {
            if (courses[courseKey]) {
                removeCourseFromTimetable(courses[courseKey]);
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

            var CM102 = new app.Course()
                .setCourseCode("CM401")
                .setCourseTitle("Interpersonal Communications")
                .setSubject("CM")
                .setSection("B")
                .setSemester(new app.Semester("Fall", "2014"))
                .addTimeslot(new app.Timeslot(app.DAYS.Tuesday, '16:00', '17:30'))
                .addTimeslot(new app.Timeslot(app.DAYS.Thursday, '12:00', '13:30'))
                .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM412")
                .setLocation("address goes here?")
                .setProfessor("Fred Flintstone");

            var CM412 = new app.Course()
                .setCourseCode("CM412")
                .setCourseTitle("Advertising and Culture")
                .setSubject("CM")
                .setSection("A")
                .setSemester(new app.Semester("Fall", "2014"))
                .addTimeslot(new app.Timeslot(app.DAYS.Tuesday, '16:30', '18:00'))
                .addTimeslot(new app.Timeslot(app.DAYS.Thursday, '12:00', '17:30'))
                .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM102")
                .setLocation("address goes here?")
                .setProfessor("Fred Flintstone");

            app.currentSemester
                .addCourse(CP317)
                .addCourse(CP213)
                .addCourse(AC213)
                .addCourse(CM102)
                .addCourse(CM412);
        }
    },

    getScheduleForCurrentSemester: function() {
        var semesterKey = app.currentSemester.getKey();
        if (!localStorage.getItem(semesterKey)) {
            var scheduleStorage = new app.Schedule().toStorage();
            localStorage.setItem(semesterKey, JSON.stringify(scheduleStorage));
        }
        var savedSchedule = JSON.parse(localStorage.getItem(semesterKey));
        return new app.Schedule().fromStorage(savedSchedule);
    },
    updateScheduleForCurrentSemester: function(schedule) {
        var semesterKey = app.currentSemester.getKey();
        localStorage.setItem(semesterKey, JSON.stringify(schedule.toStorage()));
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
          try {
              schedule.addCourse(app.currentSemester.getCourse(courseKey));


              app.updateScheduleForCurrentSemester(schedule);
              app.scheduleControl.populateCourseList();
              app.scheduleControl.populateSemesterList();
              app.scheduleControl.populateSemesterCalendar();
              $('.course_list').listview("refresh");
              $('.schedule_list').listview("refresh");
          } catch (e) {
            alert(e);
          }
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
               // $('#' + menuId).popup('close');

            });

            $('.courselist_popup').popup();

        },
        populateSemesterList: function() {
            var scheduleList = $('.schedule_list');
            scheduleList.empty();
            var currentSchedule = app.getScheduleForCurrentSemester();
            var courseKeys = currentSchedule.getCourseKeys();
            for (var i = 0; i < courseKeys.length; ++i) {
                var course = app.currentSemester.getCourse(courseKeys[i]);
                var linkId = "schedule_list_link_" + course.getKey();
                scheduleList.append('<li data-icon="false" course_key="'+ course.getKey() + '" class="semester_list_item">'
                    + '<a id="' + linkId + '" onclick="this.updatePopup" data-rel="popup" href="#course_popup">' + course.getCourseTitle() + '</a></li>');

                var control = this;
                var updatePopup = function(course) {
                    return function() {
                        control.updatePopup(course);
                    }
                }

                $('#' + linkId).click(updatePopup(course));
            }
        },
        buildCalendarEntry: function(course) {

            var calendarHtml = '<a href="#popup_calendar' + course.getKey() + '" data-rel="popup">';
            calendarHtml += '<div class="details">';
            calendarHtml += '<h2>' + course.getCourseCode() + "</h2>";
            calendarHtml += '<h3>' + course.getCourseTitle() + "</h3>";
            calendarHtml += '</div></a>';

            calendarHtml += this.buildCalendarPopupForCourse(course);
            return calendarHtml;

        },
        updatePopup: function (course, add_to_schedule) {
            var popupContent = '<p>' + course.getCourseTitle() + '</p>';
            for (var j = 0; j < course.getTimeslots().length; ++j) {
                popupContent += '<p class="timeslot">'
                    + course.getTimeslots()[j].getDayString() + ": "
                    + course.getTimeslots()[j].getStartTime() + '-'
                    + course.getTimeslots()[j].getEndTime() + '</p>';
            }

            var detailsLink = '<li><a href="#info">Details</a></li>';
            var removeCourseLink = '<li><a course_key="' + course.getKey() + '"'
                    + ' class="remove_from_calendar_link" href="#">'
                    + 'Remove from Schedule</a></li>';
            var addCourseLink = '<li><a course_key="' + course.getKey() + '"'
                    + ' class="add_to_schedule_link" href="#">'
                    + 'Add to Schedule</a></li>';

            var popup = $('#course_popup');
            popup.find('h2').html(course.getCourseCode());
            popup.find('.popup_content').html(popupContent);
            popup.find('.options_list').empty();
            popup.find('.options_list').append(detailsLink);
            if (!add_to_schedule) {
                popup.find('.options_list').append(removeCourseLink);
            } else {
                popup.find('.options_list').append(addCourseLink);
            }

            $('.remove_from_calendar_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
                popup.popup('close');
            });

            popup.popup();
            popup.find('.options_list').listview().listview('refresh');
        },
        buildCalendarPopupForCourse: function(course) {
            var popup_id = 'popup_calendar' + course.getKey();
            var popup = '<div class="calendar_popup" data-position-to="window" data-role="popup" id="' + popup_id + '" data-theme="e" data-overlay-theme="a">';
                    popup += '<h2>' + course.getCourseCode() + '</h2>';
                    popup += '<p>' + course.getCourseTitle() + '</p>';
                    for (var j = 0; j < course.getTimeslots().length; ++j) {
                        popup += '<p class="timeslot">' + course.getTimeslots()[j].getDayString() + ": " + course.getTimeslots()[j].getStartTime() + '-' + course.getTimeslots()[j].getEndTime() + '</p>';
                    }
                    popup += '<ul class="options_list" data-role="listview" data-inset="true" style="min-width:210px;" data-theme="d">';
                    popup += '<li><a href="#info">Details</a></li>';
                    popup += '<li><a course_key="' + course.getKey() + '"';
                    popup += ' class="remove_from_calendar_link" href="#">Remove from Schedule</a></li>';
                    popup += '</ul></div>';

            $('.remove_from_calendar_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
                $('#' + popup_id).popup();
                $('#' + popup_id).popup('close');
                $('#' + popup_id).popup();
            });
            return popup;

        },
        buildScheduledPopupForCourse: function(course) {
            var popup_id = 'popup_course_schedule' + course.getKey();
            var popup = '<div class="calendar_course_schedule" data-position-to="window" data-role="popup" id="' + popup_id + '" data-theme="e" data-overlay-theme="a">';
                    popup += '<h2>' + course.getCourseCode() + '</h2>';
                    popup += '<p>' + course.getCourseTitle() + '</p>';
                    for (var j = 0; j < course.getTimeslots().length; ++j) {
                        popup += '<p class="timeslot">' + course.getTimeslots()[j].getDayString() + ": " + course.getTimeslots()[j].getStartTime() + '-' + course.getTimeslots()[j].getEndTime() + '</p>';
                    }
                    popup += '<ul class="options_list" data-role="listview" data-inset="true" style="min-width:210px;" data-theme="d">';
                    popup += '<li><a href="#info">Details</a></li>';
                    popup += '<li><a course_key="' + course.getKey() + '"';
                    popup += ' class="remove_from_schedule_link" href="#">Remove from Schedule</a></li>';
                    popup += '</ul></div>';

            $('.remove_from_schedule_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
                $('#' + popup_id).popup();
                $('#' + popup_id).popup('close');
                $('#' + popup_id).popup();

            });

            return popup;

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

                    var timeBlockStart = app.timeToDateTime(timeslot.getStartTime());
                    var timeBlockEnd = app.timeToDateTime(timeslot.getEndTime());
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

                    $('.calendar_popup').popup();
                    $('.options_list').listview().listview('refresh');
                }
            }

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
