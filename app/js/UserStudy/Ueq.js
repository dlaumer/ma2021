/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/UEQ.js
--------------
The User Experience Questionnaire (UEQ) to measure different aspects of the impression in the user. The input is
given by 5 radio buttons between contrasting adjectives

*/
define([
    "esri/core/Accessor",

    "dojo/on",
    "dojo/dom-construct",
], function (
    Accessor,
    on, domCtr) {

    // List of the contrasting adjectives defined by the UEQ
    var categories =
        [
            ["annoying ", "enjoyable "],
            ["not understandable ", "understandable "],
            ["creative ", "dull "],
            ["easy to learn ", "difficult to learn "],
            ["valuable ", "inferior "],
            ["boring ", "exciting "],
            ["not interesting ", "interesting "],
            ["unpredictable ", "predictable "],
            ["fast ", "slow "],
            ["inventive ", "conventional "],
            ["obstructive ", "supportive "],
            ["good ", "bad "],
            ["complicated ", "easy "],
            ["unlikable ", "pleasing "],
            ["usual ", "leading edge "],
            ["unpleasant ", "pleasant "],
            ["secure ", "notsecure "],
            ["motivating ", "demotivating "],
            ["meets expectations ", "does not meet expectations "],
            ["inefficient ", "efficient "],
            ["clear ", "confusing "],
            ["impractical ", "practical "],
            ["organized ", "cluttered "],
            ["attractive ", "unattractive "],
            ["friendly ", "unfriendly "],
            ["conservative ", "innovative "],
        ]
    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Ueq",

        // Create the basic GUI 
        constructor: function (settings, containerHome) {
            this.categories = categories;
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, containerHome);
            this.containerUeq = domCtr.create("div", { id: "containerUeq", className: "questionnaire2" }, containerQuest);
        },

        // Create all the GUI
        init: function (results) {
            // Button to proceed, disable it for now
            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';

            this.results = results;
            this.results.ueq = new Array(this.categories.length).fill(null);

            // Description of what to do
            this.container1 = domCtr.create("div", { id: "container1", className: "containerTypeInfo" }, this.containerUeq);

            this.container1.innerHTML = `Please fill in the following questionnaire. It consists of 
            pairs of contrasting attributes that may apply to the application you just tested. <br><br>
            
            The circles between the attributes represent gradations between the opposites. 
            You can express your agreement with the attributes by clicking the circle that most 
            closely reflects your impression.<br><br>

            <b>Example:</b>
            `
            // Add one pair of adjectives with the 5 radio buttons as example
            var example = this.makeExampleItem(0);
            example.style.pointerEvents = 'none';
            domCtr.place(example, this.containerUeq);
            this.container2 = domCtr.create("div", { id: "container2", className: "containerTypeInfo" }, this.containerUeq);

            // More description and instructions
            this.container2.innerHTML = `This response would mean that you rate the app more annoying 
            than enjoyable.<br><br>
            Please decide spontaneously. Don’t think too long about your decision to make sure that 
            you convey your original impression. Sometimes you may not be completely sure about your 
            agreement with a particular attribute or you may find that the attribute does not apply 
            completely to the particular product. Nevertheless, please tick a circle in every line.
            It is your personal opinion that counts. Please remember: there is no wrong or right 
            answer!<br><br>
            `
            // Loop over all adjective-pairs and create the radio buttons
            for (i = 0; i < this.categories.length; i++) {
                domCtr.place(this.makeItem(i), this.containerUeq);
            }

            this.clickHandler();
        },

        // Deal with the interactions
        clickHandler: function () {

            var that = this;
            // There is a event listener for each single of the 5 radio buttons for all categories
            for (i = 0; i < that.categories.length; i++) {
                var radioButtons = document.getElementsByName(i);   // Get the 5 radio buttons

                // Loop over the 5 radio buttons
                for (var j = 0; radioButtons[j]; j++) {
                    radioButtons[j].onclick = f;

                    function f() {
                        that.results.ueq[this.name] = parseInt(this.value); // Store the results
                        that.checkFinished();
                    }
                }
            }

            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome(this.results);
            }.bind(this));

        },

        // Check that no entry of the list of results is null
        checkFinished: function () {
            if (this.results.ueq.every(function (i) { return i !== null; })) {
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.className = "task_button active";
            }
        },

        // make one element of pair of adjectives with the radio buttons
        makeItem: function (i) {
            var containerItem = domCtr.create("div", { className: "containerItem" });
            domCtr.create("div", { className: "textLeft", innerHTML: this.categories[i][0] }, containerItem);
            var radioButtons = domCtr.create("div", { className: "radioButtons" }, containerItem);
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "1" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "2" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "3" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "4" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "5" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "6" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", name: i, value: "7" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("div", { className: "textRight", innerHTML: this.categories[i][1] }, containerItem);

            return containerItem;
        },

        // very similar to the one before, but one button is already selected and it cannot be changed
        makeExampleItem: function (i) {
            var containerItem = domCtr.create("div", { className: "containerItem" });
            domCtr.create("div", { className: "textLeft", innerHTML: this.categories[i][0] }, containerItem);
            var radioButtons = domCtr.create("div", { className: "radioButtonsExample" }, containerItem);
            domCtr.create("input", { type: "radio", className: "radio", value: "1" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", value: "2" }, domCtr.create("label", { className: "radio-inline" }, radioButtons)).checked = true;
            domCtr.create("input", { type: "radio", className: "radio", value: "3" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", value: "4" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", value: "5" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", value: "6" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("input", { type: "radio", className: "radio", value: "7" }, domCtr.create("label", { className: "radio-inline" }, radioButtons));
            domCtr.create("div", { className: "textRight", innerHTML: this.categories[i][1] }, containerItem);

            return containerItem;
        },

    });
});





