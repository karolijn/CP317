app = {
    initialize: function() {
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
        this.getTermString = function() {
            return Object.keys(app.TERMS).filter(function(key) {
                return app.TERMS[key] === term;
            })[0];
        }
        this.getYear = function() {
            return year;
        };
        this.getCourses = function() {
            return courses;
        };
        this.toString = function() {
            return this.getTermString() + " " + year;
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
            if (app.currentSemester == null) {
                $.mobile.pageContainer.pagecontainer("change", '#home');
            }

            var schedule = app.getScheduleForCurrentSemester();
            var listId = 'course_list';
            var courseList = $('#' + listId);
            courseList.empty();
            var courseKeys = app.currentSemester.getCourseKeys();
            for (var i = 0; i < courseKeys.length; ++i) {
                var course = app.currentSemester.getCourse(courseKeys[i]);
                if (!schedule.getCourse(course.getKey())) { // Skip the courses in the schedule.
                    var control = this;
                    var updatePopup = function(course) {
                        return function() {
                            control.updatePopup(course, true /* add to schedule */);
                        }
                    }

                    this.addCourseListItem(course, listId, updatePopup(course));
                }
            }
        },
        addCourseListItem: function(course, listId, action) {
            var linkId = listId + course.getKey();
            var link = '<a id="' + linkId +'" href="#course_popup" data-rel="popup">'
                + course.getCourseCode() + ' ' + course.getCourseTitle() + '</a>';
            var listItem = '<li data-icon="false" course_key="' + course.getKey() + '"'
               + ' class="course_list_item">' + link + '</li>';

            $('#' + listId).append(listItem);
            $('#' + linkId).click(function() {
                action();
            });
        },
        populateSemesterList: function() {
            var listId = 'schedule_list';
            var scheduleList = $('#' + listId);
            scheduleList.empty();
            var currentSchedule = app.getScheduleForCurrentSemester();
            var courseKeys = currentSchedule.getCourseKeys();
            for (var i = 0; i < courseKeys.length; ++i) {
                var course = app.currentSemester.getCourse(courseKeys[i]);
                var control = this;
                var updatePopup = function(course) {
                    return function() {
                        control.updatePopup(course, false /* add to schedule */);
                    }
                }

                this.addCourseListItem(course, listId, updatePopup(course));
            }
        },
        populateCalendarEntry: function(course, timeslotCell, timeslotId) {
            var colorEntries = ['#7AB5A8', '#478E7E', '#256E5D', '#0D4D3F', '#002D23'];
            var control = this;
            var updatePopup = function(course) {
                return function() {
                    control.updatePopup(course, false /* add to schedule */);
                }();
            }
            var entryId = "calendar_entry_" + course.getKey() + timeslotId;
            var calendarHtml = '<a class="calendar_entry" calendar_entry="' + course.getKey()
                +'" id="' + entryId + '" href="#course_popup" data-rel="popup">';
            calendarHtml += '<div class="details">';
            calendarHtml += '<h2>' + course.getCourseCode() + "</h2>";
            calendarHtml += '<h3>' + course.getCourseTitle() + "</h3>";
            calendarHtml += '</div></a>';

            $(timeslotCell).html(calendarHtml);

            // adjust entry height to fill table cell.
            $('#' + entryId).height($(timeslotCell).height());

            $('#' + entryId).click(function() {
                updatePopup(course)
            });

            $("a.calendar_entry").hover(function() {
                var course_entry = $(this).attr('calendar_entry');
                $("[calendar_entry='" + course_entry + "']" ).addClass("selected");
            }, function() {
                var course_entry = $(this).attr('calendar_entry');
                $("[calendar_entry='" + course_entry + "']" ).removeClass("selected");
            });
        },
        refreshPopup: function() {
            var popup = $('#course_popup');
            popup.find('.options_list').listview().listview('refresh');
            popup.find('.options_list').listview('refresh');
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
                    + ' class="remove_from_schedule_link" href="#">'
                    + 'Remove from Schedule</a></li>';
            var addCourseLink = '<li><a course_key="' + course.getKey() + '"'
                    + ' class="add_to_schedule_link" href="#">'
                    + 'Add to Schedule</a></li>';

            var popup = $('#course_popup');
            popup.find('h1').html(course.getCourseCode());
            popup.find('.popup_content').html(popupContent);


            popup.find('ul').empty();
            popup.find('ul').append(detailsLink);
            if (!add_to_schedule) {
                popup.find('ul').append(removeCourseLink);
            } else {
                popup.find('ul').append(addCourseLink);
            }

            $('.remove_from_schedule_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.removeCourseFromSchedule(courseKey);
                popup.popup();
                popup.popup('close');
            });

            $('.add_to_schedule_link').click(function(event) {
                var courseKey = event.currentTarget.attributes['course_key'].value;
                app.scheduleControl.addCourseToSchedule(courseKey);
                popup.popup();
                popup.popup('close');
            });

            popup.popup();
            popup.find('ul').listview().listview('refresh', true);
            popup.find('ul').listview('refresh', true);
        },
        populateSemesterCalendar: function() {
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
                tableHeader += '<th>MON</th>';
                tableHeader += '<th>TUES</th>';
                tableHeader += '<th>WED</th>';
                tableHeader += '<th>THURS</th>';
                tableHeader += '<th>FRI</th>';
                tableHeader += '</tr></thead></table>';
                $(tableHeader).insertBefore(scheduleCalendar);
            }

            var table = '<table style="table-layout: fixed; width: 100%" id="calendar">';

            for(var i = minTime; i < maxTime; i = incrementTime(i, calendarIncrement)) {
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
                        var mergeBlock = 'tr.' + a.getHours() + a.getMinutes() + ' > td.day' + timeslot.getDay();
                        $(mergeBlock).remove();
                    }
                    $(timeBlock).attr('rowspan', rowSpan);
                    this.populateCalendarEntry(course, timeBlock, j);
                }
            }

        },
        setTitle: function() {
            $('h1.semester_title').text(app.currentSemester.toString());
        },
        initialize: function() {
            this.setTitle();
            this.initCourseList();
            this.populateCourseList();
            this.populateSemesterList();

            // Wait until after the dom has been rendered to populate the calendar
            // so the cell heights are calculated properly.
            var control = this;
            $(document).on("pageshow", "#schedule", function(){
                control.populateSemesterCalendar();
            });
        },
    },
};
