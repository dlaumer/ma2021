/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/PreQuest.js
--------------
Holds the input form for the inital questions before the actual study. Some questions are open answer, some 
are in the form of a dropdown

*/
define([
    "esri/core/Accessor",

    "dojo/on",
    "dojo/dom-construct"

], function (
    Accessor,
    on, domCtr) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.PreQuest",

        // Create the basic GUI
        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, containerHome);
            this.containerPreQuest = domCtr.create("div", { id: "containerPreQuest", className: "questionnaire2" }, containerQuest);

            this.results = {};
        },

        // Create teh GUI, all the different questions
        init: function () {

            // Question 1: Age
            var container1 = domCtr.create("div", { id: "container1", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "What is your age?" }, container1);
            this.task1 = domCtr.create("input", { id: "task1", className: "quest_input", name: "name", tabindex: "1", placeholder: "Your Age" }, container1);

            // Question 2: Gender
            var container2 = domCtr.create("div", { id: "container2", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task2_desc = domCtr.create("div", { id: "task2_desc", className: "task_desc", innerHTML: "What is your gender?" }, container2);
            var row = domCtr.toDom(
                `<select name="gender" id="gender" tabindex="2" class="quest_input">
                <option value="" disabled selected>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>`)
            this.task2 = domCtr.place(row, container2);

            // Question 3: Profession
            var container3 = domCtr.create("div", { id: "container3", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task3_desc = domCtr.create("div", { id: "task3_desc", className: "task_desc", innerHTML: "What is your profession?" }, container3);
            this.task3 = domCtr.create("input", { id: "task3", className: "quest_input", name: "name", tabindex: "3", placeholder: "e.g. Civil Eng. Student" }, container3);

            // Question 4: Education
            var container4 = domCtr.create("div", { id: "container4", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "What is your current education?" }, container4);
            var row = domCtr.toDom(
                `<select name="education" id="education" tabindex="4" class="quest_input">
                <option value="" disabled selected>Select your education</option>
                <option value="highschool">Highschool (Sekundarstufe)</option>
                <option value="gymnasium">Higher School (Gymnasium)</option>
                <option value="apprenticeship">Apprenticeship (Lehre)</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
                <option value="phd">PhD degree</option>
                <option value="other">None of the above</option>
            </select>`)
            this.task4 = domCtr.place(row, container4);

            // Question 5: Experience with digital maps (Likert scale)
            var container5 = domCtr.create("div", { id: "container5", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task5_desc = domCtr.create("div", { id: "task5_desc", className: "task_desc", innerHTML: "I am very experienced with digital maps." }, container5);
            var row = domCtr.toDom(
                `<select name="knowledge" id="knowledge" tabindex="5" class="quest_input">
                    <option value="" disabled selected></option>    
                    <option value="1">I strongly disagree</option>
                    <option value="2">I disagree</option>
                    <option value="3">Neither agree or disagree</option>
                    <option value="4">I agree</option>
                    <option value="5">I strongly agree</option>
                </select>`)
            this.task5 = domCtr.place(row, container5);

            // Question 6: Knowledge of Rosengarten area
            var container7 = domCtr.create("div", { id: "container7", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task7_desc = domCtr.create("div", { id: "task7_desc", className: "task_desc", innerHTML: "I know the area of Rosengarten/ Bucheggplatz very well." }, container7);
            var row = domCtr.toDom(
                `<select name="knowledge" id="knowledge" tabindex="6" class="quest_input">
                <option value="" disabled selected></option>    
                <option value="1">I strongly disagree</option>
                <option value="2">I disagree</option>
                <option value="3">Neither agree or disagree</option>
                <option value="4">I agree</option>
                <option value="5">I strongly agree</option>
            </select>`)
            this.task7 = domCtr.place(row, container7);

            // Question 7: Knowledge of Rosengarten project
            var container8 = domCtr.create("div", { id: "container8", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task8_desc = domCtr.create("div", { id: "task8_desc", className: "task_desc", innerHTML: "I already know alot about the Rosengartentunnel / -tram project." }, container8);
            var row = domCtr.toDom(
                `<select name="rosengarten" id="rosengarten" tabindex="7"  class="quest_input">
            <option value="" disabled selected></option>
            <option value="1">I strongly disagree</option>
            <option value="2">I disagree</option>
            <option value="3">Neither agree or disagree</option>
            <option value="4">I agree</option>
            <option value="5">I strongly agree</option>
            </select>`)
            this.task8 = domCtr.place(row, container8);

            // Question 8: Did the user vote last year?
            var container6 = domCtr.create("div", { id: "container6", className: "containerTypeQuest" }, this.containerPreQuest);
            this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "Did you vote during the vote about the Rosengartenproject one year ago?" }, container6);
            var row = domCtr.toDom(
                `<select name="vote" id="vote" tabindex="8"  class="quest_input">
                <option value="" disabled selected>Select your option</option>
                <option value="yes">Yes, I voted</option>
                <option value="no">No, I did not vote</option>
                <option value="none">I am not sure</option>
            </select>`)
            this.task6 = domCtr.place(row, container6);

            // Button to proceed
            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", tabindex: 9, innerHTML: "Done" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';


            this.clickHandler();
        },

        // Handle all the interactions
        clickHandler: function () {

            // For every question there is a listener, and if something is changed, the new data is written to the results object
            on(this.task1, "input", function (evt) {
                this.results.age = evt.target.value;
                evt.target.style.border = "1px solid grey";
                this.checkFinished();
            }.bind(this));

            on(this.task2, "change", function (evt) {
                this.results.gender = evt.target.value;
                evt.target.style.border = "1px solid grey";
                this.checkFinished();
            }.bind(this));

            on(this.task3, "input", function (evt) {
                this.results.profession = evt.target.value;
                evt.target.style.border = "1px solid grey";
                this.checkFinished();
            }.bind(this));

            on(this.task4, "change", function (evt) {
                this.results.education = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.task5, "change", function (evt) {
                this.results.experience = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.task6, "input", function (evt) {
                this.results.vote = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.task7, "change", function (evt) {
                this.results.knowledge = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.task8, "change", function (evt) {
                this.results.rosengarten = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));


            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome(this.results);
            }.bind(this));

        },

        // Checks, if the results object has all of the 8 properties, meaning that all questions have been answered
        checkFinished: function () {
            if (Object.keys(this.results).length == 8) {
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.className = "task_button active";
            }
        },
    });
});





