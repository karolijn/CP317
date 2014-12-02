/*
 * Controller object that controls the semester page and data.
 */
coursePlanner.semesterControl = {
    //Initialize new semester
    setSemester: function() {
        //set chosen semester
        var chosenTerm = $("#semesters").val();
        var year = chosenTerm.slice(0,4);
        var season = coursePlanner.utilities.getSeason(chosenTerm.slice(4));

        coursePlanner.currentSemester.set(new coursePlanner.Semester(season, year));

        //show loader on ajax request start
        $(document).ajaxStart(function() {
            $.mobile.loading( "show" );
        });

        //get available courses for chosen term
        this.getCourses(chosenTerm);

        //set title for schedule page header
        coursePlanner.scheduleControl.setTitle();

        //remove loader, change page, and refresh course lists on ajax request stop
        $(document).ajaxStop(function() {

            $.mobile.loading( "hide" );

            $.mobile.pageContainer.pagecontainer("change", "index.html#schedule");
            $('.course_list').listview("refresh");
            $('.schedule_list').listview("refresh");

        });

    },
    //Make AJAX YQL request to get list of available semesters
    getSemesters:function() {
        //hide previous semester error message if shown
        $("#loadSemestersError").hide();
        $.ajax({
            type:'GET',
            url: 'https://query.yahooapis.com/v1/public/yql?q=select+%2A+from+html+where+url%3D%22https%3A%2F%2Ftelaris.wlu.ca%2Fssb_prod%2Fbwckschd.p_disp_dyn_sched%22&format=json&diagnostics=true&callback',
            dataType:'json'
        }).done(function( data ) {
            var semeseterSelectMenu = data["query"]["results"]["body"]["div"]["3"]["form"]["table"]["tr"]["td"]["select"]["option"];

            //loop through all returned data
            for (var item in semeseterSelectMenu) {
                var x = semeseterSelectMenu[item];

                //for each item, add option value to the #semesters drop down
                if (x["value"] != "") {
                    var content = x["content"].split(" ");
                    var newOption = "<option value='" + x["value"]+ "'>" + content[0] + " " + content[1] + "</option>";
                    $("#semesters").append(newOption);
                }
            }

            //refresh semesters dropdown and show 'GO' button
            $("#semesters").selectmenu("refresh");
            $('#goToSchedulesPageBtn').show();
        }).fail(function() {
            //show error message and button on ajax request fail
            $("#loadSemestersError").show();
        });
    },
    //Make AJAX YQL request to get available courses for the given semester
    getCourses:function(term_in) {
        //hide previous courses error message if shown
        $("#loadCoursesError").hide();

        //list of course codes to use for AJAX url
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

        //loop through course codes to make requests
        for (var i = 0; i < courseCodes.length; i++) {
            this.makeCourseRequest(term_in, courseCodes[i]);
        }
    },
    //make course requests for the given array of course codes
    makeCourseRequest:function(term_in,courseCode) {
        //setup url to make request
        var theUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20htmlpost%20where%20url%3D'https%3A%2F%2Ftelaris.wlu.ca%2Fssb_prod%2Fbwckschd.p_get_crse_unsec'%20and%20postdata%3D'term_in%3D" + term_in + "%26sel_subj%3Ddummy%26sel_day%3Ddummy%26sel_schd%3Ddummy%26sel_insm%3Ddummy%26sel_camp%3Ddummy%26sel_levl%3Ddummy%26sel_sess%3Ddummy%26sel_instr%3Ddummy%26sel_ptrm%3Ddummy%26sel_attr%3Ddummy%26sel_camp%3D%2525";
        for (var i = 0; i < courseCode.length; i++) {
            theUrl = theUrl + '%26sel_subj%3D' + courseCode[i];
        }
        theUrl = theUrl + "%26sel_crse%3D%26sel_title%3D%26sel_levl%3D%2525%26begin_hh%3D00%26begin_mi%3D00%26begin_ap%3Dx%26end_hh%3D00%26end_mi%3D00%26end_ap%3Dx'%20and%20xpath%3D%22%2F%2Fdiv%5B%40class%3D'pagebodydiv'%5D%2F%2Ftable%5B%40class%3D'datadisplaytable'%5D%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
       
        //make AJAX request
        $.ajax({
            type:'GET',
            url: theUrl,
            dataType:'json'
        }).done(function( data ) {
            //if request fails, retry request
            if (data["query"]["count"] == 0) {
               coursePlanner.semesterControl.makeCourseRequest(term_in,courseCode);
            } else {
                var tables = data["query"]["results"]["postresult"]["table"];

                //loop through returned tables to extract and set various course data
                for (var i = 0; i < tables.length; i++) {
                    if ((i % 2 == 0) && (i != tables.length - 1)) {

                        var course = new coursePlanner.Course();

                        try {
                            //set course title, course code, subject, section and semester
                            var courseHeader = tables[i]["tr"][0]["th"]["a"]["content"];
                            var splitCourseHeader = courseHeader.split(" - ");
                            course.setCourseTitle(splitCourseHeader[0]);
                            var code = splitCourseHeader[2];
                            course.setCourseCode(code);
                            course.setSubject(code.slice(0,2));
                            course.setSection(splitCourseHeader[3]);
                            course.setSemester(new coursePlanner.Semester(coursePlanner.utilities.getSeason(term_in.slice(4)), term_in.slice(0,4)));
                        } catch (error) {

                        }

                        try {
                            //set course location, professor, and timeslots
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

                        }

                        //get current semester, add course to it and set current semester updated with new course
                        var semester = coursePlanner.currentSemester.get();
                        semester.addCourse(course);
                        coursePlanner.currentSemester.set(semester);
                    }
                }
            }
        }).fail(function() {
            //if AJAX request fails, show error message that some courses may not have been added
           $("#loadCoursesError").show();
        });
    },
    //initialize new semesterControl object
    initialize: function() {
        this.getSemesters();
    }
};