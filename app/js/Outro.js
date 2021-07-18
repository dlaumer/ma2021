/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Outro.js
--------------
Finishing screen for the user study, shows thank you message and button to
restart.


*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on"

], function (
    Accessor,
    domCtr, win, on) {


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Outro",

        constructor: function () {

        },

        // Start the end screen
        init: function (settings) {

            this.settings = settings;

            domCtr.destroy("background");
            domCtr.destroy("background_home");

            this.createUI();
            this.clickHandler();
            this.urlParser();

        },

        // Create all the GUI elements
        createUI: function () {

            var background = domCtr.create("div", { id: "background" }, win.body());
            var container = domCtr.create("div", { id: "welcome" }, background);

            domCtr.create("img", { id: "Logo", src: "images/Logo.png" }, container);


            // Include short thank you message
            this.thanks = domCtr.create("div", { id: "thanks", className: "task_desc", innerHTML: "Thank you so much for participating!" }, container);
            // Option to start again
            this.new = domCtr.create("div", { id: "new", className: "link", innerHTML: "Another participant" }, container);

            domCtr.create("hr", { id: "welcomeLine" }, container);

            domCtr.create("div", { id: "description1", className: "description", innerHTML: "Masterthesis by Daniel Laumer" }, container);
            domCtr.create("div", { id: "description2", className: "description", innerHTML: "supervised by Fabian Göbel and Lisa Stähli" }, container);

        },

        clickHandler: function () {

            var that = this;
            on(this.new, "click", function (evt) {
                window.location.href = window.location.href.split("?")[0];
                that.urlParser();
            }.bind(this));

        },

        // Read the url parameters and load the corresponding screen
        urlParser: function () {
            this.urlParams = getJsonFromUrl();
            if (Object.keys(this.urlParams).length == 0) {
                var welcome = new Welcome();
                welcome.init();
            }
        },
    });
});

// Read the current URL
function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
