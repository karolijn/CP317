/**
 * Class representing a semester. A semester is unique to the [year] and [term] and
 * contains all available courses.
 */
coursePlanner.Semester = function(term, year) {
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
        return Object.keys(coursePlanner.TERMS).filter(function(key) {
            return coursePlanner.TERMS[key] === term;
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
        return 'coursePlanner_' + term + year;
    };
};
