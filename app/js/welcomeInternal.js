/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Welcome.js
--------------
Simple startup screen, shows logo, name and a several buttons to start the different screens. 
Those are the application in 2D or 3D (or 3D and dark mode), the user study and the analysis of the user study (analysis or comments)

*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on",

    "urbanmobility/Application/App",
    "urbanmobility/UserStudy/Home",
    "urbanmobility/UserStudy/ConnectionAGO",
    "urbanmobility/Analysis/Analysis",
    "urbanmobility/Analysis/Comments"



], function (
    Accessor,
    domCtr, win, on, App, Home, UserResults, Analysis, Comments) {

    // application settings
    var settings = {
        url: "https://egregis.maps.arcgis.com",           // portal URL for config
        layerNames: {   // The names of the layers in the webscene/webmap on ArGIS Online. Used to retrieve the layers
            pt: "Public Transport",
            traffic: "Traffic",
            air: "Air Pollution",
            traffic_pro: "Traffic_pro",
            streets_pro: "New Rosengarten Tunnel",
            pt_stops: "Public Transport Stops",
            pt_lines: "Public Transport Lines"

        },
        colors: {   // There is a color scheme for the app, this are the four colors
            now: "#17BEBB",
            no_project: "#0E7C7B",
            project: "#F3511B",
            highlight: "#E0CA3C",
        }
    };


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Welcome",

        constructor: function () {

        },

        // Start the start screen
        init: function () {

            this.settings = settings;
            this.createUI();
            this.clickHandler();
            this.urlParser();

        },

        // Create the GUI of the start screen
        createUI: function () {

            var background = domCtr.create("div", { id: "background" }, win.body());
            var container = domCtr.create("div", { id: "welcome" }, background);
            // Add the logo
            domCtr.create("img", { id: "Logo", src: "images/Logo.png" }, container);
            var containerLinks = domCtr.create("div", { id: "containerLinks" }, container);

            // There are six options, the 2D version, the 3D version, the 3d version in dark mode, the user study, the analysis and the comments
            this.version1 = domCtr.create("div", { id: "version1", className: "link", innerHTML: "2D" }, containerLinks);
            this.version2 = domCtr.create("div", { id: "version2", className: "link", innerHTML: "3D" }, containerLinks);
            this.version3 = domCtr.create("div", { id: "version3", className: "link", innerHTML: "3D (dark mode)" }, containerLinks);
            this.userStudyButton = domCtr.create("div", { id: "userStudyButton", className: "link", innerHTML: "Start User Study" }, container);
            var containerLinks2 = domCtr.create("div", { id: "containerLinks2" }, container);

            this.analysis = domCtr.create("div", { id: "analysis", className: "link", innerHTML: "Analysis" }, containerLinks2);
            this.comments = domCtr.create("div", { id: "comments", className: "link", innerHTML: "Comments" }, containerLinks2);
            domCtr.create("div", { id: "description3", className: "description", innerHTML: "(Note: Not designed for mobile devices)" }, container);

            domCtr.create("hr", { id: "welcomeLine" }, container);

            // Some info about the project
            domCtr.create("div", { id: "description1", className: "description", innerHTML: "Masterthesis by Daniel Laumer" }, container);
            domCtr.create("div", { id: "description2", className: "description", innerHTML: "supervised by Fabian Göbel and Lisa Stähli" }, container);


        },

        // Deal with the interactions
        clickHandler: function () {

            on(this.version1, "click", function (evt) {
                window.location.href = window.location.href + "?2D";
            }.bind(this));

            on(this.version2, "click", function (evt) {
                window.location.href = window.location.href + "?3D";
            }.bind(this));

            on(this.version3, "click", function (evt) {
                window.location.href = window.location.href + "?3D&dark";
            }.bind(this));

            // If we start a new user study, create a new row on AGO and create a new uniue user ID!
            on(this.userStudyButton, "click", function (evt) {
                this.userStudyButton.innerHTML = "Loading...";
                var userResults = new UserResults();
                userResults.init(this.settings)
                userResults.addFeature(function (objectId) {
                    document.cookie = "userId=" + objectId.toString();
                    if (document.cookie == "") {
                        window.location.href = window.location.href + "?userStudy&userId=" + objectId;
                    }
                    else {
                        window.location.href = window.location.href + "?userStudy";
                    }
                });
            }.bind(this));

            on(this.analysis, "click", function (evt) {
                window.location.href = window.location.href + "?analysis";
            }.bind(this));

            on(this.comments, "click", function (evt) {
                window.location.href = window.location.href + "?comments";
            }.bind(this));

        },

        // The app works with url parameters. They are changed based on the interaction of the user and then this function is called, to see what page should be loaded
        urlParser: function () {
            var urlParams = Object.keys(getJsonFromUrl());
            // Case 3D or 2D: start the application
            if (urlParams.length >= 1 && (urlParams[0] === "2D" || urlParams[0] === "3D")) {
                var app = new App();
                app.init(this.settings, urlParams, null);
            }
            // case user study: start the homescreen of the user study
            else if (urlParams.length >= 1 && (urlParams[0] === "userStudy")) {
                var home = new Home();
                home.init(this.settings);
            }
            // case analysis
            else if (urlParams.length >= 1 && (urlParams[0] === "analysis")) {
                var analysis = new Analysis();
                analysis.init(this.settings, urlParams, null);
            }
            // case comments 
            else if (urlParams.length >= 1 && (urlParams[0] === "comments")) {
                var comments = new Comments();
                comments.init(this.settings, urlParams, null);
            }
        },
    });
});

// Read the current url!
function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
