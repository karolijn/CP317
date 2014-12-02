/*
 * Controller object that controls the current schedule page and data.
 */
coursePlanner.scheduleControl = {
	initCourseList: function() {
        $('#schedule').on({
            pageinit: function(event) {
                $('#course_list').listview().filterable('option', 'filterCallback', this.filterCourseList);
            }
        });
    },
    //method used to filter courses from the unscheduled course list using the search text field
    filterCourseList: function(index, filter) {
        var searchText = $('#course_list').children()[index].textContent;
        return searchText.toLowerCase().indexOf( filter ) === -1;
    },
    //method used to add course to schedule
    addCourseToSchedule: function(courseKey) {
      var schedule = coursePlanner.utilities.getScheduleForCurrentSemester();
      try {
          schedule.addCourse(coursePlanner.currentSemester.get().getCourse(courseKey));

          coursePlanner.utilities.updateScheduleForCurrentSemester(schedule);
          coursePlanner.scheduleControl.populateCourseList();
          coursePlanner.scheduleControl.populateSemesterList();
          coursePlanner.scheduleControl.populateSemesterCalendar();
          $('.course_list').listview("refresh");
          $('.schedule_list').listview("refresh");
      } catch (e) {
        alert(e.message);
      }
    },
    //method used to remove course from schedule
    removeCourseFromSchedule: function(courseKey) {
      var schedule = coursePlanner.utilities.getScheduleForCurrentSemester();
      schedule.removeCourse(courseKey);
      coursePlanner.utilities.updateScheduleForCurrentSemester(schedule);
      coursePlanner.scheduleControl.populateCourseList();
      coursePlanner.scheduleControl.populateSemesterList();
      coursePlanner.scheduleControl.populateSemesterCalendar();
      $('.course_list').listview("refresh");
      $('.schedule_list').listview("refresh");
    },
    //method called to fill the unscheduled course list
    populateCourseList: function() {
        if (coursePlanner.currentSemester.get() == null) {
            $.mobile.pageContainer.pagecontainer("change", '#home');
        }

        var schedule = coursePlanner.utilities.getScheduleForCurrentSemester();
        var listId = 'course_list';
        var courseList = $('#' + listId);
        courseList.empty();
        var courseKeys = coursePlanner.currentSemester.get().getCourseKeys();
        for (var i = 0; i < courseKeys.length; ++i) {
            var course = coursePlanner.currentSemester.get().getCourse(courseKeys[i]);
            if (!schedule.getCourse(course.getKey())) { // Skip the courses in the schedule.
                var control = this;
                var updatePopup = function(course) {
                    return function() {
                        control.updatePopup(course, false /* is scheduled */);
                    }
                }

                this.addCourseListItem(course, listId, updatePopup(course));
            }
        }
    },
    //method called by populateCourseList method to add single item to the unscheduled course list
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
    //method called to fill the list of scheduled courses
    populateSemesterList: function() {
        var listId = 'schedule_list';
        var scheduleList = $('#' + listId);
        scheduleList.empty();
        var currentSchedule = coursePlanner.utilities.getScheduleForCurrentSemester();
        var courseKeys = currentSchedule.getCourseKeys();
        for (var i = 0; i < courseKeys.length; ++i) {
            var course = coursePlanner.currentSemester.get().getCourse(courseKeys[i]);
            var control = this;
            var updatePopup = function(course) {
                return function() {
                    control.updatePopup(course, true /* is scheduled */);
                }
            }

            this.addCourseListItem(course, listId, updatePopup(course));
        }
    },
    //method called by populateSemesterCalendar to add entry to schedule calendar
    populateCalendarEntry: function(course, timeslotCell, timeslotId) {
        var colorEntries = ['#7AB5A8', '#478E7E', '#256E5D', '#0D4D3F', '#002D23'];
        var control = this;
        var updatePopup = function(course) {
            return function() {
                control.updatePopup(course, true /* is scheduled */);
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
    //method used to fill popups with proper details
    updatePopup: function (course, isScheduled) {
        var popupContent = '<p>' + course.getCourseTitle() + '</p>';
        for (var j = 0; j < course.getTimeslots().length; ++j) {
            popupContent += '<p class="timeslot">'
                + course.getTimeslots()[j].getDayString() + ": "
                + course.getTimeslots()[j].getStartTime() + '-'
                + course.getTimeslots()[j].getEndTime() + '</p>';
        }

        var detailsLink = '<li><a href="#info" a course_key="' + course.getKey() + '"class="course_info_link">Details</a></li>';
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
        if (isScheduled) {
            popup.find('ul').append(removeCourseLink);
        } else {
            popup.find('ul').append(addCourseLink);
        }

        $('.course_info_link').click(function(event) {
            var courseKey = event.currentTarget.attributes['course_key'].value;
            coursePlanner.courseDetailsControl.setCourse(courseKey);
        });

        $('.remove_from_schedule_link').click(function(event) {
            var courseKey = event.currentTarget.attributes['course_key'].value;
            coursePlanner.scheduleControl.removeCourseFromSchedule(courseKey);
            popup.popup();
            popup.popup('close');
        });

        $('.add_to_schedule_link').click(function(event) {
            var courseKey = event.currentTarget.attributes['course_key'].value;
            coursePlanner.scheduleControl.addCourseToSchedule(courseKey);
            popup.popup();
            popup.popup('close');
        });

        popup.popup();
        popup.find('ul').listview().listview('refresh', true);
        popup.find('ul').listview('refresh', true);
    },
    //method used to fill schedule calendar
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
        var currentSchedule = coursePlanner.utilities.getScheduleForCurrentSemester();
        var courseKeys = currentSchedule.getCourseKeys();
        for (var i = 0; i < courseKeys.length; ++i) {
            var course = coursePlanner.currentSemester.get().getCourse(courseKeys[i]);
            for (var j = 0; j < course.getTimeslots().length; ++j) {
                var timeslot = course.getTimeslots()[j];

                var timeBlockStart = coursePlanner.utilities.timeToDateTime(timeslot.getStartTime());
                var timeBlockEnd = coursePlanner.utilities.timeToDateTime(timeslot.getEndTime());
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
    //method used to set title of schedule page to current semester
    setTitle: function() {
        $('h1.semester_title').text(coursePlanner.currentSemester.get().toString());
    },
    //method used to initialize scheduleControl object
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
};
