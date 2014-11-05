app = {

    initialize: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
		FastClick.attach(document.body);
    },

    Course: function() {
        this.courseCode;
        this.subject;
        this.semester;
        this.timeslots = [];
        this.description;
        this.location;
        this.professor;
    },

    Semester: function Semester(term, year) {
        this.term = term;
        this.year = year;
        this.courses = [];
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
            CP317.subject = "CP";
            CP317.semester = new app.Semester("Fall", "2014");
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Monday, '11:30', '13:00'));
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Wednesday, '13:30', '15:00'));
            CP317.description = "A class to take";
            CP317.location = "address goes here?";
            CP317.professor = "Albus Dumbledore"

            var CP213 = new app.Course();
            CP317.courseCode = "CP213";
            CP317.subject = "CP";
            CP317.semester = new app.Semester("Fall", "2014");
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Monday, '8:30', '9:30'));
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Wednesday, '8:30', '9:30'));
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Friday, '8:30', '9:30'));
            CP317.description = "A class to take";
            CP317.location = "address goes here?";
            CP317.professor = "Albus Dumbledore"

            var AC213 = new app.Course();
            CP317.courseCode = "AC213";
            CP317.subject = "AC";
            CP317.semester = new app.Semester("Fall", "2014");
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Tuesday, '16:00', '17:30'));
            CP317.timeslots.push(new app.Timeslot(app.DAYS.Thursday, '16:00', '17:30'));
            CP317.description = "A class to take";
            CP317.location = "address goes here?";
            CP317.professor = "Albus Dumbledore";
            app.currentSemester.courses.push(CP317);
            app.currentSemester.courses.push(CP213);
            app.currentSemester.courses.push(AC213);
        }
    }
};
