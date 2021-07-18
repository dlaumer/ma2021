/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Analysis/Comments.js
--------------
 Extracts all the entries from users which entered something in the open answer comment box and displays 
 those comments. The comments can be ordered into different categories

*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on",

    "urbanmobility/UserStudy/ConnectionAGO",

], function (
    Accessor,
    domCtr, win, on, UserResults) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Comments",

        constructor: function () {

        },

        // Start the comment screen
        init: function (settings) {
            this.settings = settings;

            // This is the information, what comment falls into which category. A comment can be in several categories
            this.filter = { "General": [210, 219, 234, 244, 267, 281, 283, 289, 290, 309, 321, 335, 344, 348, 353, 354, 377], "Positive": [54, 146, 193, 196, 198, 209, 234, 244, 259, 289, 290, 309, 321, 334, 335, 348, 354, 364, 377, 387], "Negative": [54, 57, 234, 267, 289, 290, 309, 335, 354, 365], "Hardbr\u00fccke": [54, 140, 149, 195, 234, 278, 290, 292, 321, 344], "Direction": [54, 56, 149, 290], "Comparison": [123], "See answer": [143, 322], "2D vs 3D": [155, 198], "Future": [200, 267], "Firefox": [240, 325], "Technical Problems": [54, 353, 365, 387] }

            domCtr.destroy("background");
            this.createUI();
            this.inputHandler();

            // Get the connection with AGO and read all the entries
            this.userResults = new UserResults(this.settings);
            this.userResults.init();
            this.userResults.readFeatures().then((feats => {
                this.readData(feats).then((features) => {
                    this.features = features;
                    this.makeDivs("All");
                })
            }));
        },

        // Create the detailed GUI elements
        createUI: function () {

            this.background_comments = domCtr.create("div", { id: "background_comments" }, win.body());
            // header holds a drop down menu to choose the category
            var header_home = domCtr.create("div", { id: "header_home", innerHTML: "<h1>Comments</h1>" }, this.background_comments);
            var row = domCtr.toDom(
                `<select name="userId" id="userId" class="quest_input">
                    <option value="All" selected>All</option>
                    </select>`)
            this.categorySelect = domCtr.place(row, header_home);
            this.categorySelect.style.border = "1px solid grey";
            var filterKeys = Object.keys(this.filter)
            // Display the comments
            for (i in filterKeys) {
                var option = document.createElement("option");
                option.text = filterKeys[i];
                this.categorySelect.add(option);
            }
        },

        // Deal with the interactions
        inputHandler: function () {

            on(this.categorySelect, "change", function (evt) {
                var category = evt.target.value;
                console.log(category);
                this.makeDivs(category);

            }.bind(this));

            // Enable to use the keys to select the category. Not implemented yet
            document.addEventListener('keydown', function (e) {
                switch (e.code) {
                    case "ArrowUp":

                        break;
                    case "ArrowDown":

                        break;
                }
            });
        },

        // Read all the features and parse them to just get the Id, comments and the user persona
        readData: function (feats) {
            var userPersonas = { "1": "Intermediate", "2": "Professional", "3": "Layperson" };
            return new Promise((resolve, reject) => {
                features = {};
                var outliers = [63, 247];
                for (feature in feats) {
                    var att = feats[feature].attributes
                    if (att.ID > 53) {
                        if (!outliers.includes(att.ID) && att.Task8 != null) {
                            var task8 = JSON.parse(att.Task8);
                            if (Object.keys(task8).includes("comments") && task8["comments"] != "") {
                                features[att.ID] = "(" + userPersonas[task8["user_persona"]] + ") " + task8["comments"];
                            }
                        }
                    }
                }
                resolve(features)
            })
        },

        // Prepare all the boxes with the comments
        makeDivs: function (category) {
            domCtr.destroy("container_comments");
            var container_comments = domCtr.create("div", { id: "container_comments" }, this.background_comments);
            for (i in this.features) {
                // Only take the ones of this category
                if (category == "All" || this.filter[category].includes(parseInt(i))) {
                    var content = "<b>" + i.toString() + "</b>: " + this.features[i]
                    domCtr.create("div", { className: "comments", innerHTML: content }, container_comments);
                }
            }
        }
    })
})

function debounce(func) {
    var timer;
    return function (event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 500, event);
    };
}