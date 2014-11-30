/**
 * Class representing a course. A course has a unique
 * combination of semester, course code and section.
 */
coursePlanner.Course = function() {
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
        professor = value;
        return this;
    };
};
