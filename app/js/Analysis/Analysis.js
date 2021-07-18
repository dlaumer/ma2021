/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Analysis/Analysis.js
--------------
Facilitates looking at the responses from the users. Loads the results from
one user and also provides a heatmap of the recorded click events.

*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on",

    "urbanmobility/UserStudy/ConnectionAGO"


], function (
    Accessor,
    domCtr, win, on, UserResults) {

    // List of all the 8 questions
    var questions = [
        {
            id: 1,
            question: [
                "Public transport: What is the average occupancy at Hardbrücke after the project is built?",
                "Public transport : What is the average occupancy between Bucheggplatz and Milchbuck after the project is built?"],
            result: [29, 19]
        },
        {
            id: 2,
            question: [
                "Public transport: Without the project, what will be the average occupancy between Bucheggplatz and Rosengarten at 12:00?",
                "Public transport: Without the project, what will be the average occupancy between Rosengarten and Escher-Wyss-Platz at 12:00?"],
            result: [32, 26]
        },
        {
            id: 3,
            question: [
                "Traffic: How many cars drive currently (now) on average on the Hardbrücke at 8:00?",
                "Traffic: How many cars drive currently (now) on average on the Rosengarten at 8:00?"],
            result: [455, 1175]
        },
        {
            id: 4,
            question: [
                "Traffic: With the project, how many cars would still use the section between Rosengartenstrasse and Bucheggplatz on average per day?",
                "Traffic: With the project, how many cars would use the new Rosengarten tunnel on average per day?"],
            result: [2302, 22320]
        },
    ];

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Analysis",

        // 
        constructor: function () {
            this.set.userID = 54;      // The first user ID to be displayed
            this.clicks = null;
        },

        // Start the analysis page
        init: function (settings) {
            this.settings = settings;

            domCtr.destroy("background");
            this.createUI();
            this.inputHandler();

            // minimal heatmap instance configuration
            this.containerHeight = this.gui.clientHeight;
            this.containerWidth = this.gui.clientWidth;

            this.heatmapInstance = h337.create({
                // only container is required, the rest will be defaults
                container: this.guiContainer
            });

            // Read all the entries from AGO
            this.userResults = new UserResults(this.settings);
            this.userResults.init();
            this.userResults.readFeatures().then((feats => {
                this.readData(feats).then((features) => {
                    this.features = features;
                    this.getClickData("userId");

                })
            }));

            // handle resizing of the browser window
            var that = this;
            window.addEventListener('resize', debounce(function (event) {
                document.getElementsByClassName("heatmap-canvas")[0].remove();
                that.heatmapInstance = h337.create({
                    // only container is required, the rest will be defaults
                    container: this.guiContainer
                });
                that.getClickData("");
            }));
        },


        // Create the GUI elements
        createUI: function () {

            var background_home = domCtr.create("div", { id: "background_home" }, win.body());
            // The header holds the selection of the user ID, the question and the dimension (2D or 3D)
            var header_home = domCtr.create("div", { id: "header_home" }, background_home);
            domCtr.create("div", { id: "userId_desc", className: "task_desc", innerHTML: "User ID:" }, header_home);
            var row = domCtr.toDom(
                `<select name="userId" id="userId" class="quest_input">
                    </select>`)
            this.userIdSelect = domCtr.place(row, header_home);
            this.userIdSelect.style.border = "1px solid grey";

            domCtr.create("div", { id: "question_desc", className: "task_desc", innerHTML: "Question:" }, header_home);
            var row = domCtr.toDom(
                `<select name="question" id="question" class="quest_input">
                    </select>`)
            this.questionSelect = domCtr.place(row, header_home);
            this.questionSelect.style.border = "1px solid grey";

            domCtr.create("div", { id: "dimension_desc", className: "task_desc", innerHTML: "Dimension:" }, header_home);
            var row = domCtr.toDom(
                `<select name="dimension" id="dimension" class="quest_input">
                    </select>`)
            this.dimensionSelect = domCtr.place(row, header_home);
            this.dimensionSelect.style.border = "1px solid grey";

            // There are many fields to show different results and elements of the user study (like task completion time etc)
            this.containerAnalysis = domCtr.create("div", { id: "containerAnalysis" }, background_home);
            this.infoContainer = domCtr.create("div", { id: "infoContainer" }, this.containerAnalysis);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Question:</b>" }, this.infoContainer);
            this.questionDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Answer:" }, this.infoContainer);
            this.answerDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Correct Answer:</b>" }, this.infoContainer);
            this.correctAnswerDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Time:</b>" }, this.infoContainer);
            this.timeDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Clicks:</b>" }, this.infoContainer);
            this.clicksDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Order of Question:</b>" }, this.infoContainer);
            this.orderQuestionDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Order</b>:" }, this.infoContainer);
            this.orderDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>User Persona</b>:" }, this.infoContainer);
            this.userPersonaDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Comment</b>:" }, this.infoContainer);
            this.commentDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);
            domCtr.create("div", { className: "task_desc", innerHTML: "<b>Email</b>:" }, this.infoContainer);
            this.emailDiv = domCtr.create("div", { id: "questionDiv", className: "task_desc", innerHTML: "" }, this.infoContainer);


            this.guiContainer = domCtr.create("div", { id: "guiContainer" }, this.containerAnalysis);
            this.gui = domCtr.create("img", { id: "gui", src: "images/2D.png" }, this.guiContainer);
        },

        // Deals with the interactions
        inputHandler: function () {
            on(this.userIdSelect, "change", function (evt) {
                this.set.userID = evt.target.value;
                this.getClickData("userId");

            }.bind(this));

            on(this.questionSelect, "change", function (evt) {
                this.set.question = evt.target.value;
                this.getClickData("question");

            }.bind(this));

            on(this.dimensionSelect, "change", function (evt) {
                this.set.dimension = evt.target.value;
                this.getClickData("dimension");

            }.bind(this));

            var that = this;
            // Enables to use the key buttons to change between user IDs
            document.addEventListener('keydown', function (e) {
                switch (e.code) {
                    case "ArrowUp":
                        that.userIdSelect.selectedIndex = that.userIdSelect.selectedIndex - 1;
                        that.getClickData("userId")
                        break;
                    case "ArrowDown":
                        that.userIdSelect.selectedIndex = that.userIdSelect.selectedIndex + 1;
                        that.getClickData("userId")
                        break;
                }
            });
        },

        // Read and parse the data for each user
        readData: function (feats) {
            return new Promise((resolve, reject) => {
                features = {};
                var outliers = [63, 247];
                for (feature in feats) {
                    var att = feats[feature].attributes
                    if (att.ID > 53) {
                        if (!outliers.includes(att.ID) && att.Task1 != null && att.Task2 != null && att.Task3 != null && att.Task4 != null && att.Task5 != null && att.Task6 != null && att.Task7 != null && att.Task8 != null) {
                            features[att.ID] = feats[feature];
                            // Add the user IDs to the dropdown
                            var option = document.createElement("option");
                            option.text = att.ID;
                            this.userIdSelect.add(option);
                        }
                    }
                }
                resolve(features)
            })
        },

        // Get all the information of one user. Parse the results of the different tasks
        getClickData: function (changedValue) {

            userID = this.userIdSelect.value;
            question = this.questionSelect.value;
            dimension = this.dimensionSelect.value;

            var data = this.features[userID].attributes;

            // Parse the results from the two rounds of questions
            var order = JSON.parse(data.Orders);
            var task = "Task4";
            var version = parseInt(order[0].version) - 1;
            if (order[1].dimension == dimension) {
                task = "Task6";
                version = parseInt(order[1].version) - 1;
            }
            var results = JSON.parse(data[task])

            var orderQuestions = [0, 0, 0, 0]
            for (i in results) {
                if (results[i].order != null) {
                    orderQuestions[results[i].order] = i;
                }
            }
            for (j in orderQuestions) {
                var option = document.createElement("option");
                option.text = orderQuestions[j];
                this.questionSelect[j] = option
            }
            if (changedValue != "userId") {
                this.questionSelect.value = question;
            }
            // Add the questions and dimensions to the drop down in the correct order they have been presented to the user
            var option = document.createElement("option");
            option.text = order[0].dimension;
            this.dimensionSelect[0] = option
            var option = document.createElement("option");
            option.text = order[1].dimension;
            this.dimensionSelect[1] = option
            if (changedValue != "userId") {
                this.dimensionSelect.value = dimension;
            }

            userID = this.userIdSelect.value;
            question = this.questionSelect.value;
            dimension = this.dimensionSelect.value;

            // Load the correct background image for the heatmap
            if (dimension == "2D") {
                this.gui.src = "images/2D.png"
            }
            else {
                this.gui.src = "images/3D.png"
            }

            // Translate the coordinates to the heatmap size
            this.containerHeight = this.gui.clientHeight;
            this.containerWidth = this.gui.clientWidth;

            this.clickPositions = results[question].clickPositions;
            this.clicks = results[question].clicks;
            this.screen = JSON.parse(data.Task1).screen;
            console.log(this.screen);
            console.log(this.clickPositions);
            this.clickPositionsNorm = []
            for (i in this.clickPositions) {
                this.clickPositionsNorm.push({
                    x: Math.floor(this.containerWidth / this.screen.width * this.clickPositions[i][0]),
                    y: Math.floor(this.containerHeight / this.screen.height * this.clickPositions[i][1]),
                    value: 1
                })
            }
            this.updateHeatmap(this.clickPositionsNorm);

            // Fill in all the other info
            this.questionDiv.innerHTML = questions[question - 1].question[version];
            this.answerDiv.innerHTML = results[question].results;
            this.correctAnswerDiv.innerHTML = questions[question - 1].result[version];
            this.timeDiv.innerHTML = results[question].time;
            this.clicksDiv.innerHTML = results[question].clicks;
            this.orderQuestionDiv.innerHTML = orderQuestions;
            this.orderDiv.innerHTML = data.Orders;
            var task8 = JSON.parse(data.Task8);
            var userPersonas = { "1": "Intermediate", "2": "Professional", "3": "Layperson" };
            this.userPersonaDiv.innerHTML = userPersonas[task8.user_persona];
            Object.keys(task8).includes("comments") ? this.commentDiv.innerHTML = task8.comments : this.commentDiv.innerHTML = "";
            Object.keys(task8).includes("email") ? this.emailDiv.innerHTML = task8.email : this.emailDiv.innerHTML = "";
            console.log(results);

        },

        // Paint the heatmap new
        updateHeatmap: function (clickPositionsNorm) {

            // heatmap data format
            var data = {
                max: 1,
                data: clickPositionsNorm
            };
            // if you have a set of datapoints always use setData instead of addData
            // for data initialization
            this.heatmapInstance.setData(data);
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