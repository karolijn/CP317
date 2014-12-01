coursePlanner.exportToiCalControl =  {
    exportCalendar: function() {
        var starttime = '';
        var endtime = '';
        var month = '';
        var cal = "BEGIN:VCALENDAR\n"+
                  "VERSION:2.0\n"+
                  "PRODID:-//Our Company//NONSGML v1.0//EN\n";
        var currentSchedule = coursePlanner.utilities.getScheduleForCurrentSemester();
        var courseKeys = currentSchedule.getCourseKeys();
        for (var j = 0; j < courseKeys.length; ++j) {
            var course = coursePlanner.currentSemester.get().getCourse(courseKeys[j]);
            if (course.getSemester().getTerm() == "Winter"){
                month = "01";
            }
            else if(course.getSemester().getTerm() == "Fall"){
                month = "09";
            }
            else if(course.getSemester().getTerm() == "Spring"){
                month = "05";
            }
            else{
                month = "01";
            }
            for (i = 0; i < course.getTimeslots().length; i++) {
                //getting and formatting the start time. eg 8:30 to 0830 or 12:00 to 1200
                starttime = course.getTimeslots()[i].getStartTime();
                if (starttime.length == 4){
                    starttime  = "0"+ starttime.substring(0,1) + starttime.substring(2,4);
                }
                else{
                    starttime = starttime.substring(0,2) + starttime.substring(3,5);
                }
                //getting and formatting the end time. eg 8:30 to 0830 or 12:00 to 1200
                var endtime = course.getTimeslots()[i].getEndTime();

                if (endtime.length == 4){
                    endtime = "0" + endtime.substring(0,1) + endtime.substring(2,4);
                }
                else{
                    endtime = endtime.substring(0,2) + endtime.substring(3,5);
                }
                cal += "BEGIN:VEVENT\n"+
                       "UID:me@gmail.com\n"+
                       "DTSTAMP:"+course.getSemester().getYear()+month+"01T"+starttime +"00Z\n"+
                       "ORGANIZER;CN="+ course.getProfessor() +":MAILTO:me@gmail.com\n"+
                       "DTSTART:" + course.getSemester().getYear()+month+"01T"+starttime +"00Z\n"+
                       "\nRRULE:FREQ=WEEKLY;BYDAY=" + course.getTimeslots()[i].getDayString().substring(0, 2).toUpperCase(); +
                       "\nDTEND:" + course.getSemester().getYear()+month+"01T"+endtime +"00Z\n"+
                       "\nLOCATION:" + course.getLocation() +
                       "\nSUMMARY:"+ course.getCourseTitle() +
                       "\nEND:VEVENT\n\n";

            }
        }
        cal+= "END:VCALENDAR\n\n";

        window.open( "data:text/calendar;charset=utf8," + escape(cal));
    }
};
