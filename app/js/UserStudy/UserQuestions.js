/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/userQuestions.js
--------------
Manages all the tasks for the user with the application, the measuring of the time, clicks and recording 
the answers from the users.

*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on"
], function (
    Accessor,
    domCtr, win, dom, on) {


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
        declaredClass: "urbanmobility.UserQuestions",

        // initialize all the variables for the user study
        constructor: function (settings, order) {

            this.settings = settings;
            this.questions = questions;
            this.order = order;
            this.questionOrder = null;
            this.i = 0;
            this.userResults = {}; 
            this.userResults["order"] = this.order; // Order of the 4 questions
            this.round = 0; // There are two round of 4 questions, which one are we at?
            this.clickPositions = [];   // record where the user clicked
            this.counter = 0;   //  Count the amount of clicks of the user

        },

        // Create the GUI with the transparent foreground and the header with the questions and the input field
        init: function () {
            dom.byId("background_home").style.display = "none";

            this.overlay = domCtr.create("div", { id: "overlay" }, win.body())

            this.overlayItems = domCtr.create("div", { id: "overlayItems" }, win.body())

            this.questionStart = domCtr.create("div", { id: "questionStart" }, this.overlayItems);

            this.questionText = domCtr.create("div", { id: "questionText", innerHTML: "Here would be the question" }, this.questionStart);
            this.startButton = domCtr.create("div", { id: "startButton", className: "task_button", innerHTML: "Loading..." }, this.questionStart);
            this.settings.dev ? "" : this.startButton.style.pointerEvents = 'none';

            this.userStudy = domCtr.create("div", { id: "userStudy" }, win.body())

            this.questionDiv = domCtr.create("div", { id: "questionDiv" }, this.userStudy);
            this.inResult = domCtr.create("input", { id: "inResult", name: "inResult", placeholder: "Enter Result here" }, this.userStudy);
            this.done = domCtr.create("div", { id: "done", className: "task_button", innerHTML: "Done" }, this.userStudy);
            this.settings.dev ? "" : this.done.style.pointerEvents = 'none';

            domCtr.create("hr");

            // Here is one of the errors: the questions are re-ordered based on the permutation (order). But this should only be done in the first round, but this function is called in both rounds...
            this.questions = [this.questions[this.questionOrder[0]], this.questions[this.questionOrder[1]], this.questions[this.questionOrder[2]], this.questions[this.questionOrder[3]]];
            //this.questions = shuffle(this.questions);

            this.questionText.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version - 1];

            // Deal with the interactions
            var that = this;
            on(this.inResult, "input", function () {
                that.done.style.pointerEvents = 'auto';
                that.done.className = "task_button active"
            });

            on(this.done, "click", function () {
                that.endQuestion(that)
            });
            on(this.startButton, "click", function () {
                that.startQuestion()
            });

            // Count all the clicks
            document.addEventListener('click', function (event) {
                that.counter++;
                that.clickPositions.push([event.clientX, event.clientY]);
            });
            return this.userStudy;
        },

        // Checks continuesly if the scene is loaded. If yes, the button is activated
        setSceneInfo: function (scene, view, settings) {
            this.scene = scene;
            this.view = view;
            this.settings = settings;

            var that = this;
            function checkFlag() {
                var flag = that.view.updating;
                if (flag == true) {
                    window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
                } else {
                    that.isReady();
                }
            }
            checkFlag();
        },

        // This function is called when one question is answered and the results from the previous are stored
        newQuestion: function () {

            // reset the input value
            this.inResult.value = ""
            this.i++;
            // if there are some questions left, display the new one 
            if (this.i < this.questions.length) {

                this.settings.dev ? "" : this.done.style.pointerEvents = 'none';
                this.done.className = "task_button"
                this.questionDiv.innerHTML = ""

                this.overlay.style.visibility = "visible";
                this.overlayItems.style.visibility = "visible";
                this.overlayItems.style.opacity = 1;

                this.overlay.style.opacity = 0.8;
                this.questionText.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version - 1];
            }
            // if there is no question left, return to home and store the results
            else {
                this.i = 0;
                this.settings.home.returnToHome(this.userResults);
            }
        },

        // Ths function is called, as soon the user read the question and wants to start to answer it
        startQuestion: function () {
            // Remove the transparent overlay
            dom.byId("overlay").style.visibility = 'hidden'
            this.overlayItems.style.visibility = "hidden";
            this.overlayItems.style.opacity = 0;
            this.overlay.style.opacity = 0;
            // Get the new question
            this.questionDiv.innerHTML = this.questions[this.i].question[this.order[this.round].version - 1];
            this.startTime = new Date();
            this.counter = 0;
            this.clickPositions = []
            var that = this;
            // Start the timer to measure the task completion time
            this.timer = setTimeout(() => { alert("The timelimit was exceeded. Please answer the next question"); that.endQuestion(that) }, 300000);
        },

        // This is called as soon the user inputs the answer to the question
        endQuestion: function (that) {
            // Read the task completion time
            clearTimeout(that.timer);
            var endTime = new Date();
            var timeDiff = (endTime - that.startTime) / 1000; //in ms
            // Store the results of this questions
            that.userResults[that.questions[that.i].id] = {
                order: that.i,
                time: timeDiff,
                results: that.inResult.value,
                clicks: that.counter,
                clickPositions: that.clickPositions.slice(0),
            };
            that.newQuestion()  // Start a new question
        },

        // activates the button to start the question as soon as the scene is loaded fully
        isReady: function () {
            this.startButton.className = "task_button active"

            this.startButton.innerHTML = "Start";
            this.startButton.style.pointerEvents = 'auto';
        },

        // Get the dimension (3D or 2D) of this round
        getDimension: function () {
            return this.order[this.round].dimension;
        }
    });
})
