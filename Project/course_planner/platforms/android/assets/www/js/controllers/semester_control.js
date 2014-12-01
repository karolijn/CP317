/*
 * Controller object that controls the semester page and data.
 */
coursePlanner.semesterControl = {
    //Initialize new semester
    setSemester: function() {
        var chosenTerm = $("#semesters").val();
        var year = chosenTerm.slice(0,4);
        var season = coursePlanner.utilities.getSeason(chosenTerm.slice(4));

        coursePlanner.currentSemester.set(new coursePlanner.Semester(season, year));
        $(document).ajaxStart(function() {
            // show a loader or something here so it looks like the page is doing something.
        });
        this.getCourses(chosenTerm);

        coursePlanner.scheduleControl.setTitle();

        $(document).ajaxStop(function() {
            $.mobile.pageContainer.pagecontainer("change", "index.html#schedule");
            $('.course_list').listview("refresh");
            $('.schedule_list').listview("refresh");
        });
        // coursePlanner.currentSemester.set(new coursePlanner.Semester(coursePlanner.TERMS.Fall, "2014"));
        // this.loadFakeCourses();
    },
    getSemesters:function() {
        $.ajax({
            type:'GET',
            url: 'https://query.yahooapis.com/v1/public/yql?q=select+%2A+from+html+where+url%3D%22https%3A%2F%2Ftelaris.wlu.ca%2Fssb_prod%2Fbwckschd.p_disp_dyn_sched%22&format=json&diagnostics=true&callback',
            dataType:'json'
        }).done(function( data ) {
            var semeseterSelectMenu = data["query"]["results"]["body"]["div"]["3"]["form"]["table"]["tr"]["td"]["select"]["option"];

            for (var item in semeseterSelectMenu) {
                var x = semeseterSelectMenu[item];

                if (x["value"] != "") {
                    var content = x["content"].split(" ");
                    var newOption = "<option value='" + x["value"]+ "'>" + content[0] + " " + content[1] + "</option>";
                    $("#semesters").append(newOption);
                }
            }
          //  $("select").selectmenu('refresh');
        });
    },
    getCourses:function(term_in) {
        var courseCodes = [['AN','AB','AR'],['AF','AS','BH','BI'],
                        ['BF','BU','MB'],['CH','CO','GC','CL'],
                        ['CS','CP','CC','CQ'],['KS','DH','EL','EC'],
                        ['EU','EM','EN','ES'],['FS','FI','FR','GG'],
                        ['GL','GM','GV'],['GS','GR','HE','HS'],
                        ['HI','HP','HN'],['HR','ID','UU','IP'],
                        ['IT','JN','KP'],['LL','LA','LY','MF'],
                        ['MS','MA','MX'],['ML','MI','MU','MZ'],
                        ['NE','ED','NO'],['OL','PP','PC','PO'],
                        ['PS','RE','SC'],['SJ','SE','SL','SK'],
                        ['CT','SY','SP','TM'],['TH','36','AP','04'],
                        ['CX','05','MW'],['PM','20','WS','YC']];

        for (var i = 0; i < courseCodes.length; i++) {
            this.makeCourseRequest(term_in, courseCodes[i]);
        }
    },
    makeCourseRequest:function(term_in,courseCode) {
        var theUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20htmlpost%20where%20url%3D'https%3A%2F%2Ftelaris.wlu.ca%2Fssb_prod%2Fbwckschd.p_get_crse_unsec'%20and%20postdata%3D'term_in%3D" + term_in + "%26sel_subj%3Ddummy%26sel_day%3Ddummy%26sel_schd%3Ddummy%26sel_insm%3Ddummy%26sel_camp%3Ddummy%26sel_levl%3Ddummy%26sel_sess%3Ddummy%26sel_instr%3Ddummy%26sel_ptrm%3Ddummy%26sel_attr%3Ddummy%26sel_camp%3D%2525";
        for (var i = 0; i < courseCode.length; i++) {
            theUrl = theUrl + '%26sel_subj%3D' + courseCode[i];
        }

        theUrl = theUrl + "%26sel_crse%3D%26sel_title%3D%26sel_levl%3D%2525%26begin_hh%3D00%26begin_mi%3D00%26begin_ap%3Dx%26end_hh%3D00%26end_mi%3D00%26end_ap%3Dx'%20and%20xpath%3D%22%2F%2Fdiv%5B%40class%3D'pagebodydiv'%5D%2F%2Ftable%5B%40class%3D'datadisplaytable'%5D%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

        $.ajax({
            type:'GET',
            url: theUrl,
            dataType:'json'
        }).done(function( data ) {

            if (data["query"]["count"] == 0) {
                makeCourseRequest(term_in,courseCode);
            } else {
                var tables = data["query"]["results"]["postresult"]["table"];

                for (var i = 0; i < tables.length; i++) {
                    if ((i % 2 == 0) && (i != tables.length - 1)) {

                        var course = new coursePlanner.Course();

                        try {
                            var courseHeader = tables[i]["tr"][0]["th"]["a"]["content"];
                            var splitCourseHeader = courseHeader.split(" - ");
                            course.setCourseTitle(splitCourseHeader[0]);
                            var code = splitCourseHeader[2];
                            course.setCourseCode(code);
                            course.setSubject(code.slice(0,2));
                            course.setSection(splitCourseHeader[3]);
                            course.setSemester(new coursePlanner.Semester(coursePlanner.utilities.getSeason(term_in.slice(4)), term_in.slice(0,4)));

                        } catch (error) {
                            // console.log("first table - error - " + courseCode + " - " + error);
                        }

                        try {
                            var courseInfo = tables[i]["tr"][1]["td"]["table"]["tr"][1]["td"];
                            if ("p" in courseInfo[3]) {
                                course.setLocation(courseInfo[3]["p"]);
                            } else {
                                course.setLocation("TBA");
                            }

                            if ("p" in courseInfo[6]) {
                                course.setProfessor(courseInfo[6]["p"]["content"].replace(" (","").replace(")",""));
                            } else {
                                course.setProfessor("TBA");
                            }

                            var times = courseInfo[1]["p"];
                            var days = courseInfo[2]["p"];

                            var hasTimes = (typeof(times) === 'string');

                            if (hasTimes) {
                                var timesArray = times.split(" - ");
                                var daysArray = days.split("");
                                for (var j = 0; j < daysArray.length; j++) {
                                    course.addTimeslot(new coursePlanner.Timeslot(coursePlanner.utilities.getDay(daysArray[j]),coursePlanner.utilities.getTime(timesArray[0]),coursePlanner.utilities.getTime(timesArray[1])));
                                }
                            } else {

                            }
                        } catch (error) {
                            // console.log("second table - error - " + courseCode + " - " + error);
                        }

                        var semester = coursePlanner.currentSemester.get();
                        semester.addCourse(course);
                        coursePlanner.currentSemester.set(semester);
                    }
                }
            }
        });
    },
    // loadFakeCourses: function() {
    //     var CP317 = new coursePlanner.Course()
    //         .setCourseCode("CP317")
    //         .setCourseTitle("Software Engineering")
    //         .setSubject("CP")
    //         .setSection("A")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Monday, '11:30', '13:00'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Wednesday, '13:30', '15:00'))
    //         .setDescription("A class to take")
    //         .setLocation("address goes here?")
    //         .setProfessor("Albus Dumbledore");

    //     var CP213 = new coursePlanner.Course()
    //         .setCourseCode("CP213")
    //         .setCourseTitle("Another SWE Course")
    //         .setSubject("CP")
    //         .setSection("A")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Monday, '8:30', '9:30'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Wednesday, '8:30', '9:30'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Friday, '8:30', '9:30'))
    //         .setDescription("A course about SWE")
    //         .setLocation("address goes here?")
    //         .setProfessor("Albus Dumbledore");

    //     var AC213 = new coursePlanner.Course()
    //         .setCourseCode("AC213")
    //         .setCourseTitle("Other Subject")
    //         .setSubject("AC")
    //         .setSection("A")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:00', '17:30'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '16:00', '17:30'))
    //         .setDescription("An AC course")
    //         .setLocation("address goes here?")
    //         .setProfessor("Albus Dumbledore");

    //     var CM102 = new coursePlanner.Course()
    //         .setCourseCode("CM401")
    //         .setCourseTitle("Interpersonal Communications")
    //         .setSubject("CM")
    //         .setSection("B")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:00', '17:30'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '12:00', '13:30'))
    //         .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM412")
    //         .setLocation("address goes here?")
    //         .setProfessor("Fred Flintstone");

    //     var CM412 = new coursePlanner.Course()
    //         .setCourseCode("CM412")
    //         .setCourseTitle("Advertising and Culture")
    //         .setSubject("CM")
    //         .setSection("A")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Tuesday, '16:30', '18:00'))
    //         .addTimeslot(new coursePlanner.Timeslot(coursePlanner.DAYS.Thursday, '12:00', '17:30'))
    //         .setDescription("A course about interpersonal communications for the business context. This course conflicts with AC213 and CM102")
    //         .setLocation("address goes here?")
    //         .setProfessor("Fred Flintstone");


    //     var emptyCourse = new coursePlanner.Course()
    //         .setCourseCode("EM400")
    //         .setCourseTitle("Empty Course")
    //         .setSubject("EM")
    //         .setSection("A")
    //         .setSemester(new coursePlanner.Semester("Fall", "2014"))
    //         .setDescription("A test empty course without timeslots and a TBA location/professor")
    //         .setLocation("TBA")
    //         .setProfessor("TBA");

    //     var semester = coursePlanner.currentSemester.get();
    //     semester.addCourse(CP317)
    //         .addCourse(CP213)
    //         .addCourse(AC213)
    //         .addCourse(CM102)
    //         .addCourse(CM412)
    //         .addCourse(emptyCourse);
    //     coursePlanner.currentSemester.set(semester);
    // },
    initialize: function() {
        this.getSemesters();
    }
};