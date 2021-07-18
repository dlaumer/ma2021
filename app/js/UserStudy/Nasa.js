/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/Nasa.js
--------------
The Nasa Task Load Index (TLX) questionnaire for subjective workload assessment. Holds six questions and the 
answer is given in the form of a slider value

*/
define([
    "esri/core/Accessor",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",

    "urbanmobility/UserStudy/Ueq"

], function (
    Accessor,
    dom, on, domCtr, Ueq) {


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Nasa",

        // Create the basic GUI
        constructor: function (settings, containerHome) {
            this.settings = settings;
            this.containerHome = containerHome;
            domCtr.destroy("containerQuest");

            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, this.containerHome);
            this.containerNasa = domCtr.create("div", { id: "containerNasa", className: "questionnaire2" }, containerQuest);

            this.results = {};
        },

        // Create the six sliders
        init: function () {

            this.container1 = domCtr.create("div", { id: "container1", className: "containerTypeInfo" }, this.containerNasa);

            // The explanation of what to do
            this.container1.innerHTML = `Please assess the tested application by clicking one position 
            per each of the six rating scales which matches your experience. Each line has two 
            endpoint descriptors (for example 'Low' and 'High').
            `

            // HTML code of the sliders, all with values between 0 and 100 with steps of 5
            // The handle of the slider is hidden in the beginning to avoid having a bias
            var row = domCtr.toDom(
                `
                <section class="nasaSection">
					<h3>Mental demand</h3>
					<p>How mentally demanding were the tasks?</p>
                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Low
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="md" list="steplist">
                        High
                    </div>
                </section>
				<section class="nasaSection">
					<h3>Physical demand</h3>
					<p>How physically demanding were the tasks?</p>
                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Low
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="pd">
                        High
                    </div>
				</section>
				<section class="nasaSection">
					<h3>Temporal demand</h3>
                    <p>How hurried or rushed was the pace of the tasks?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Low
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="td">
                        High
                    </div>
				</section>
				<section class="nasaSection">
					<h3>Performance</h3>
                    <p>How successful were you in accomplishing what you were asked to do?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Excellent
                        <input type="range" min="0" max="100" value="50" step="5" class="slider performance" id="pe">
                        Poor
                    </div>
				</section>
				<section class="nasaSection">
					<h3>Effort</h3>
                    <p>How hard did you have to work to accomplish your level of performance?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Low
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="ef">
                        High
                    </div>
				</section>
				<section class="nasaSection">
					<h3>Frustration</h3>
                    <p>How insecure, discouraged, irritated, stressed, and annoyed were you?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                    <div class="sliderContainer">Low
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="fr">
                        High
                    </div>
				</section>		
                `
            )
            domCtr.place(row, this.containerNasa);

            // Button to proceed
            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';

            this.clickHandler();
        },

        // Deals with all the interactions. There is a event listener for each slider.
        clickHandler: function () {


            on(dom.byId("md"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.md = evt.srcElement.value;
                this.checkFinished();
            }.bind(this));

            on(dom.byId("pd"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.pd = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("td"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.td = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("pe"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.pe = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("ef"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.ef = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("fr"), "change", function (evt) {
                evt.srcElement.className = "slider2";   // Show the slider handle
                this.results.fr = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            // When done, move on the next questionnaire, UEQ
            on(this.finishButton, "click", function (evt) {
                var ueq = new Ueq(this.settings, this.containerHome);
                ueq.init(this.results);
            }.bind(this));

        },

        // Check if all of the six sliders have been set, if yes activate the button to proceed
        checkFinished: function () {
            if (Object.keys(this.results).length == 6) {
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.className = "task_button active"
            }
        }
    });
});





