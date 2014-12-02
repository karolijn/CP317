/*
 * Controller object that controls the course details schedule page and data.
 */
coursePlanner.courseDetailsControl = {
    course: '',
	
	//Retrieves course object from courseKey
    setCourse: function(courseKey) {
        course = coursePlanner.currentSemester.get().getCourse(courseKey);
    },
	
	//Sets title of the webpage to selected course
    setTitle: function() {
        $('h1.info_title').text(course.getCourseCode);
    },
	
	//Initializes the control
    initialize: function() {
        this.setTitle();
		
        var control = this;
        $(document).on("pageshow", "#info", function(){
            control.populateCourseInfo();
        });
    },
	
	//Populates the course details page with course data
    populateCourseInfo: function() {
		this.setTitle();
        
		//Formats the timeslots from course data
		timeslots = '<tr> <th>Timeslots</th> <td>';
        for (i = 0; i < course.getTimeslots().length; i++) {
            timeslots+= course.getTimeslots()[i].getDayString() +', ' + course.getTimeslots()[i].getStartTime()+', ' +course.getTimeslots()[i].getEndTime() +'<br>';
        }
		
		//Formats the term from course data
		var term = course.getSemester().getTerm();
		if (term == coursePlanner.TERMS.Winter){
			term = "Winter";
		}else if (term == coursePlanner.TERMS.Fall){
			term = "Fall";
		}else if (term = coursePlanner.TERMS.Spring){
			term = "Spring";
		}else{
			term = "Summer";
        }
		
		//Formats details table
		timeslots+='</td> </tr>';
        table_data = '<tr> <th>Course Code</th> <td>'+course.getCourseCode()+'</td> </tr>'+
                     '<tr> <th>Course Title</th> <td>'+course.getCourseTitle()+'</td> </tr>'+
                     '<tr> <th>Subject</th> <td>'+course.getSubject()+'</td> </tr>'+
                     '<tr> <th>Section</th> <td>'+course.getSection()+'</td> </tr>'+
                     '<tr> <th>Semester</th> <td>'+term+', '+ course.getSemester().getYear()+'</td> </tr>'+
                     timeslots+
                     '<tr> <th>Location</th> <td>'+course.getLocation()+'</td> </tr>'+
                     '<tr> <th>Professor</th> <td>'+course.getProfessor()+'</td> </tr>'
        $('table.course_info').html(table_data);
    },
};
