/*
 * Controller object that controls exporting the schedule.
 */
coursePlanner.exportToiCalControl =  {
    exportCalendar: function() {
        var starttime = '';
        var endtime = '';
        var month = '';

		//iCal header
        var cal = "BEGIN:VCALENDAR"+
                  "\nVERSION:2.0"+
                  "\nPRODID:-//Laurier//NONSGML v1.0//EN";
        var currentSchedule = coursePlanner.utilities.getScheduleForCurrentSemester();
        var courseKeys = currentSchedule.getCourseKeys();

		//Gets semester and formats the month
        for (var j = 0; j < courseKeys.length; ++j) {
            var course = coursePlanner.currentSemester.get().getCourse(courseKeys[j]);
            if (course.getSemester().getTerm() == coursePlanner.TERMS.Winter){
                month = "01";
            }
            else if(course.getSemester().getTerm() == coursePlanner.TERMS.Fall){
                month = "09";
            }
            else if(course.getSemester().getTerm() == coursePlanner.TERMS.Spring){
                month = "05";
            }
            else{
                month = "07";
            }
            for (i = 0; i < course.getTimeslots().length; i++) {
                //Getting and formatting the start time. eg 8:30 to 0830 or 12:00 to 1200
                starttime = course.getTimeslots()[i].getStartTime();
                if (starttime.length == 4){
                    starttime  = "0"+ starttime.substring(0,1) + starttime.substring(2,4);
                }
                else{
                    starttime = starttime.substring(0,2) + starttime.substring(3,5);
                }
                //Getting and formatting the end time. eg 8:30 to 0830 or 12:00 to 1200
                var endtime = course.getTimeslots()[i].getEndTime();

                if (endtime.length == 4){
                    endtime = "0" + endtime.substring(0,1) + endtime.substring(2,4);
                }
                else{
                    endtime = endtime.substring(0,2) + endtime.substring(3,5);
                }

				//Timeslot for each course
                cal += "\nBEGIN:VEVENT"+
                       "\nUID:me@gmail.com"+
                       "\nDTSTAMP:"+course.getSemester().getYear()+month+"01T"+starttime +"00"+
                       "\nORGANIZER;CN="+ course.getProfessor() +":MAILTO:me@gmail.com"+
                       "\nDTSTART:" + course.getSemester().getYear()+month+"01T"+starttime +"00"+
                       "\nRRULE:FREQ=WEEKLY;BYDAY=" + course.getTimeslots()[i].getDayString().substring(0, 2).toUpperCase() +
                       "\nDTEND:" + course.getSemester().getYear()+month+"01T"+endtime +"00"+
                       "\nLOCATION:" + course.getLocation() +
                       "\nSUMMARY:"+ course.getCourseTitle() +
                       "\nEND:VEVENT";

            }
        }

		//iCal footer
        cal+= "\nEND:VCALENDAR";


		//Opens a file to save iCal data
		var filename = "calendar.ics";
		var uri = "data:text/calendar;charset=utf8," + encodeURI(cal)
		var link = document.createElement('a');
		if (typeof link.download === 'string') {
			document.body.appendChild(link); // Firefox requires the link to be in the body
			link.download = filename;
			link.href = uri;
			link.click();
			document.body.removeChild(link); // remove the link when done
		}
        } else {

            uri = "http://docs.google.com/viewer?url= "+ uri;
            location.replace(uri);
		}

        //window.open( "data:text/calendar;charset=utf8," + encodeURI(cal));
    }
};
