/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/PostQuest.js
--------------
Holds the input form for the questions after doing the different tasks. The input fields include open 
answer boxes and dropdown menus.

*/
define([
    "esri/core/Accessor",

    "dojo/on",
    "dojo/dom-construct"

], function (
    Accessor,
    on, domCtr) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.PostQuest",

        // Create the basic GUI
        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, containerHome);
            this.containerPostQuest = domCtr.create("div", { id: "containerPostQuest", className: "questionnaire2" }, containerQuest);

            this.results = {};
        },

        // Create the detailed GUI
        init: function () {

            // First add info about the user personas
            this.container1 = domCtr.create("div", { id: "container1", className: "containerTypeInfo" }, this.containerPostQuest);
            this.container1.innerHTML = `
            <h3>User personas</h3>
            To help the development process, I created three fictional user personas before starting to design the product.
            They are how I imagine some potential future users of such a product. Those personas helped me to identify the needs, 
            motivations and prepositions of the users. <br><br>
            
            Please quickly read the description of those fictional people and decide which 
            person you identify with most. Of course never one person will fit perfectly, but nevertheless try to decide for one persona. 
            `

            // Define the different permutations to show the three personas
            var permutations = [
                [1, 2, 3],
                [1, 3, 2],
                [2, 1, 3],
                [2, 3, 1],
                [3, 1, 2],
                [3, 2, 1]
            ]

            // Show the three personas, but with different order based on the user ID
            var order = permutations[parseInt(this.settings.userId) % 6];
            domCtr.create("img", { id: "user_persona_1", src: "images/user_persona_" + (order[0] + 3).toString() + ".png" }, this.containerPostQuest);
            domCtr.create("img", { id: "user_persona_2", src: "images/user_persona_" + (order[1] + 3).toString() + ".png" }, this.containerPostQuest);
            domCtr.create("img", { id: "user_persona_3", src: "images/user_persona_" + (order[2] + 3).toString() + ".png" }, this.containerPostQuest);


            // Ask the user what persona they think they belong
            var container4 = domCtr.create("div", { id: "container4", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "Which user persona do you most identify with?" }, container4);
            var row = domCtr.toDom(
                `<select name="user_persona" id="user_persona" tabindex="1" class="quest_input">
                <option value="" disabled selected>Select your persona</option>
                <option value="1">Hansruedi Müller</option>
                <option value="2">Milica Horvat - Babić</option>
                <option value="3">Susanne Schneider</option>
            </select>`)
            this.task4 = domCtr.place(row, container4);

            this.container8 = domCtr.create("div", { id: "container8", className: "containerTypeInfo", innerHTML: "<h3>Decision making</h3>" }, this.containerPostQuest);

            // Question if the app changed the opinion
            var container9 = domCtr.create("div", { id: "container9", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task9_desc = domCtr.create("div", { id: "task9_desc", className: "task_desc", innerHTML: "Did this application change your personal opinion about the Rosengartenproject vote of last year?" }, container9);
            var row = domCtr.toDom(
                `<select name="change_vote" id="change_vote" tabindex:"2" class="quest_input">
                <option value="" disabled selected>Select your option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="none">I did/could not vote last year</option>
            </select>`)
            this.task9 = domCtr.place(row, container9);

            // Open answer field to provide explanation 
            var container10 = domCtr.create("div", { id: "container10", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task10_desc = domCtr.create("div", { id: "task10_desc", className: "task_desc", innerHTML: "If you answered yes before, why?" }, container10);
            this.task10 = domCtr.create("textarea", { id: "task10", className: "quest_input", name: "name", tabindex: "3", placeholder: "Why?" }, container10);
            this.task10.style.border = "1px solid grey";

            // Likert scale question to ask if such app could help to change the opinion of the public
            var container13 = domCtr.create("div", { id: "container13", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task13_desc = domCtr.create("div", { id: "task13_desc", className: "task_desc", innerHTML: "Such an application can help to change the opinion of the public for votes like this." }, container13);
            var row = domCtr.toDom(
                `<select name="change_vote2" id="change_vote2" tabindex:"2" class="quest_input">
                <option value="" disabled selected></option>
                <option value="1">I strongly disagree</option>
                <option value="2">I disagree</option>
                <option value="3">Neither agree or disagree</option>
                <option value="4">I agree</option>
                <option value="5">I strongly agree</option>
            </select>`)
            this.task13 = domCtr.place(row, container13);

            this.container11 = domCtr.create("div", { id: "container11", className: "containerTypeInfo", innerHTML: "<h3>General questions</h3>" }, this.containerPostQuest);

            // Open answer field for comments
            var container12 = domCtr.create("div", { id: "container12", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task12_desc = domCtr.create("div", { id: "task12_desc", className: "task_desc", innerHTML: "Do you have any more comments?" }, container12);
            this.task12 = domCtr.create("textarea", { id: "task12", className: "quest_input", name: "name", tabindex: "4", placeholder: "Your comments" }, container12);
            this.task12.style.border = "1px solid grey";

            // Question if the user wants more info
            var container6 = domCtr.create("div", { id: "container6", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "Are you interested in more information and the final result of this study?" }, container6);
            var row = domCtr.toDom(
                `<select name="vote" id="vote" tabindex="5" class="quest_input">
                <option value="" disabled selected>Select your option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>`)
            this.task6 = domCtr.place(row, container6);

            // Email to provide the user with more info
            this.container7 = domCtr.create("div", { id: "container7", className: "containerTypeQuest" }, this.containerPostQuest);
            this.task7_desc = domCtr.create("div", { id: "task7_desc", className: "task_desc", innerHTML: "Please enter your email: " }, this.container7);
            this.task7 = domCtr.create("input", { id: "task7", className: "quest_input", type: "email", name: "name", tabindex: "6", placeholder: "Email address" }, this.container7);
            this.container7.style.display = 'none';

            // Button to proceed to the end of the study
            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';

            this.clickHandler();
        },

        // Deal with the interactions
        // There is a event listener for each question
        clickHandler: function () {

            on(this.task4, "input", function (evt) {
                this.results.user_persona = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));


            on(this.task9, "input", function (evt) {
                this.results.change_vote = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.task13, "input", function (evt) {
                this.results.change_vote2 = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));


            on(this.task10, "input", function (evt) {
                this.results.why = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task12, "input", function (evt) {
                this.results.comments = evt.target.value;
                this.checkFinished();
            }.bind(this));

            // If the user wants more info, enable the email field. If no, hide it!
            on(this.task6, "input", function (evt) {
                this.results.more_info = evt.target.value;
                evt.target.style.border = "1px solid grey";


                if (evt.target.value == "yes") {
                    this.container7.style.display = 'flex';
                }
                else {
                    this.container7.style.display = 'none';
                }

                this.results.opinion = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task7, "input", function (evt) {
                this.results.email = evt.target.value;
                evt.target.style.border = "1px solid grey";

                this.checkFinished();
            }.bind(this));

            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome(this.results);
            }.bind(this));

        },

        // Check if all necessary fields have been answered, some are not compulsary
        checkFinished: function () {
            keys = Object.keys(this.results);
            if (keys.includes("user_persona") && keys.includes("change_vote") && keys.includes("change_vote2") && keys.includes("more_info")) {
                if (this.results.more_info == "yes" && !keys.includes("email")) {
                    this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';
                    this.finishButton.className = "task_button";
                    return;
                }
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.className = "task_button active";
            }
        },

    });
});





