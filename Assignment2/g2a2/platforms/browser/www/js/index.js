/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

    }
};


var data = {
    carolyn: {
        about:"This is info about Carolyn.",
        work:"This is info about Carolyn's work.",
        hobby:"This is info about Carolyn's hobbies."
    },
    jack: {
        about:"Jack is a third year student at Wilfrid Laurier University majoring in Computer Science and Physics with the Co-op option. He enjoys long walks on the beach, the occasional game of croquet, and sitting by the fire while relaxing to the soothing sounds of Rod Stewart.",
        work:"Last summer, Jack was an intern at Venngo Inc., working with the back-end developer team. He performed extensive website tests, and created a mobile application used by the sales team for quick access to Venngo sales data.",
        hobby:"Some of Jack's hobbies include skeet shooting, watching professional trampoline tournaments, following Cirque-du-Soleil around on tour, and playing days of video games at a time (especially Legend of Zelda)."
    },
    jordan: {
        about:"This is info about Jordan.",
        work:"This is info about Jordan's work.",
        hobby:"This is info about Jordan's hobbies."
    }
};

var navigateTo = function(dest, options) {
    // changeHash option is implemented for bonus marks. Replaces the page content without updating the
    // navigation history.
    changeOptions = {};
    if (typeof options != 'undefined') {
        if (typeof options['changeHash'] != 'undefined') {
            changeOptions['changeHash'] = options['changeHash'];
        }
    }

    if (dest == "group.html" || dest == "index.html") {
        changeOptions['transition'] = "slide";
    } else {
        changeOptions['transition'] = "slideup";
    }
    $.mobile.pageContainer.pagecontainer("change", dest, changeOptions);
};
/*
// update persistant navbar for about pages.
$(function() {
    $( "[data-role='navbar']" ).navbar();
    $( "[data-role='header'], [data-role='footer']" ).toolbar();
});

// Update the contents of the toolbars
$( document ).on( "pageshow", "[data-role='page']", function() {
    // Get the current page title.
    var current = $( this ).jqmData( "title" );
    // Remove the active indicator from the navbar.
    $( "[data-role='navbar'] a.ui-btn-active" ).removeClass( "ui-btn-active" );
    // Add active class to current nav button
    $( "[data-role='navbar'] a" ).each(function() {
        if ( $( this ).text() === current ) {
            $( this ).addClass( "ui-btn-active" );
        }
    });

    // Don't let the framework replace the document.title with the page-title.
    $(":jqmData(role='page')").attr("data-title", document.title);
});

$( document ).on( "pageshow", "[data-role='footer']", function() {
    debugger;
});
-->*/

$(document).on('pagebeforeshow', '#index', function(){
    debugger;
});

$(document).on('pageshow', '#index', function(){
    debugger;
});
app.initialize();