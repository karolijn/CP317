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
    POSTAL_CODE_URL: 'http://hopper.wlu.ca/~choang/iPhone/http/getLocationFromFile.php?zip=',
    createPostalCodeUrl: function(postal_code) {
        return app.POSTAL_CODE_URL + postal_code;
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();

       // $('#home').on('pageinit', function() {
            $('#postal_code_form').submit(function() {
                var searchCode = $("input[name='postal_code_search']").val();
                $.ajax(app.createPostalCodeUrl(searchCode), {}).done(function(response) {
                    var responseString = "The postal code at " + searchCode
                        + " is located at " + response;
                    alert(responseString);
                });
                return false;
            });
       // });
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
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

    }
};

app.initialize();