/*
 * Controller object that controls the course details schedule page and data.
 */
coursePlanner.courseDetailsControl = {
    course: '',
    setCourse: function(courseKey) {
        course = coursePlanner.currentSemester.get().getCourse(courseKey);
    },
    setTitle: function() {
        $('h1.info_title').text(course.getCourseCode);
    },
    initialize: function() {
        this.setTitle();

        // Wait until after the dom has been rendered to populate the calendar
        // so the cell heights are calculated properly.
        var control = this;
        $(document).on("pageshow", "#info", function(){
            control.populateCourseInfo();
        });
    },
    populateCourseInfo: function() {
        timeslots = '<tr> <th>Timeslots</th> <td>';
        for (i = 0; i < course.getTimeslots().length; i++) {
            timeslots+= course.getTimeslots()[i].getDayString() +', ' + course.getTimeslots()[i].getStartTime()+', ' +course.getTimeslots()[i].getEndTime() +'<br>';
        }
        timeslots+='</td> </tr>';
        table_data = '<tr> <th>Course Code</th> <td>'+course.getCourseCode()+'</td> </tr>'+
                     '<tr> <th>Course Title</th> <td>'+course.getCourseTitle()+'</td> </tr>'+
                     '<tr> <th>Subject</th> <td>'+course.getSubject()+'</td> </tr>'+
                     '<tr> <th>Section</th> <td>'+course.getSection()+'</td> </tr>'+
                     '<tr> <th>Semester</th> <td>'+course.getSemester().getTerm()+', '+ course.getSemester().getYear()+'</td> </tr>'+
                     timeslots+
                     '<tr> <th>Description</th> <td>'+course.getDescription()+'</td> </tr>'+
                     '<tr> <th>Location</th> <td>'+course.getLocation()+'</td> </tr>'+
                     '<tr> <th>Professor</th> <td>'+course.getProfessor()+'</td> </tr>'
        $('table.course_info').html(table_data);
    },
};
