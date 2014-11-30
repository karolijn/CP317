/*
 * Controller object that controls the semester page and data.
 */
coursePlanner.semesterControl = {
    //Initialize new semester
    setSemester: function() {
        coursePlanner.currentSemester.set(new coursePlanner.Semester(coursePlanner.TERMS.Fall, "2014"));
        this.loadFakeCourses();
    },
    //TODO: replace this with an actual query to loris.
    loadFakeCourses: function() {
        var CP317 = new coursePlanner.Course()
            .setCourseCode("CP317")
            .setCourseTitle("Software Engineering")
            .setSubject("CP")
            .setSection("A")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Monday, '11:30', '13:00'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Wednesday, '13:30', '15:00'))
            .setDescription("A class to take")
            .setLocation("address goes here?")
            .setProfessor("Albus Dumbledore");

        var CP213 = new coursePlanner.Course()
            .setCourseCode("CP213")
            .setCourseTitle("Another SWE Course")
            .setSubject("CP")
            .setSection("A")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Monday, '8:30', '9:30'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Wednesday, '8:30', '9:30'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Friday, '8:30', '9:30'))
            .setDescription("A course about SWE")
            .setLocation("address goes here?")
            .setProfessor("Albus Dumbledore");

        var AC213 = new coursePlanner.Course()
            .setCourseCode("AC213")
            .setCourseTitle("Other Subject")
            .setSubject("AC")
            .setSection("A")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:00', '17:30'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '16:00', '17:30'))
            .setDescription("An AC course")
            .setLocation("address goes here?")
            .setProfessor("Albus Dumbledore");

        var CM102 = new coursePlanner.Course()
            .setCourseCode("CM401")
            .setCourseTitle("Interpersonal Communications")
            .setSubject("CM")
            .setSection("B")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:00', '17:30'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '12:00', '13:30'))
            .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM412")
            .setLocation("address goes here?")
            .setProfessor("Fred Flintstone");

        var CM412 = new coursePlanner.Course()
            .setCourseCode("CM412")
            .setCourseTitle("Advertising and Culture")
            .setSubject("CM")
            .setSection("A")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:30', '18:00'))
            .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '12:00', '17:30'))
            .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM102")
            .setLocation("address goes here?")
            .setProfessor("Fred Flintstone");


        var emptyCourse = new coursePlanner.Course()
            .setCourseCode("EM400")
            .setCourseTitle("Empty Course")
            .setSubject("EM")
            .setSection("A")
            .setSemester(new coursePlanner.Semester("Fall", "2014"))
            .setDescription("A test empty course without timeslots and a TBA location/professor")
            .setLocation("TBA")
            .setProfessor("TBA");

        var semester = coursePlanner.currentSemester.get();
        semester.addCourse(CP317)
            .addCourse(CP213)
            .addCourse(AC213)
            .addCourse(CM102)
            .addCourse(CM412)
            .addCourse(emptyCourse);
        coursePlanner.currentSemester.set(semester);
    }
};