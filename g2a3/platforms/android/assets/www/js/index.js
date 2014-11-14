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
 *
 * Assignment 3
 * Group 2
 * Carolyn Marshall, Jack Cohen, Jordan Saadon
 * November 18, 2014
 * CP317
 *
 * Application that looks up a postal code and displays its location.
 *
 */
var app = {
    POSTAL_CODE_URL: 'http://hopper.wlu.ca/~choang/iPhone/http/getLocationFromFile.php?zip=',

    // Method to build the postal code query url from a given [postal_code] string.
    createPostalCodeUrl: function(postal_code) {
        return app.POSTAL_CODE_URL + postal_code;
    },
    // Application Constructor
    initialize: function() {

        // Binds submit handler to postal code form.
        // Sends an ajax request to the postal code url and
        // displays an alert with the result.
        $('#postal_code_form').submit(function() {
            var searchCode = $("input[name='postal_code_search']").val();
            $.ajax(app.createPostalCodeUrl(searchCode), {}).done(function(response) {
                var responseString = "The postal code at " + searchCode
                    + " is located at " + response;
                alert(responseString);
            });
            return false;
        });
    },
};

app.initialize();