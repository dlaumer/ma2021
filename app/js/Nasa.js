
define([
    "esri/core/Accessor",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "urbanmobility/Ueq",


], function (
    Accessor,
    dom, on, domCtr, win, domStyle, Ueq) {


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Nasa",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            this.containerHome = containerHome;
            domCtr.destroy("containerQuest");

            this.containerQuest = domCtr.create("div", { id: "containerQuest", className : "questionnaire"}, this.containerHome);
            this.containerNasa = domCtr.create("div", { id: "containerNasa",  className : "questionnaire2"}, containerQuest);

            this.results = {};
        },

        init: function() {
            var row = domCtr.toDom(
                `
                <section class="nasaSection">
					<h3>Mental demand</h3>
					<p>How mentally demanding was the task?</p>
                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="md" list="steplist">
                </section>
				<section class="nasaSection">
					<h3>Physical demand</h3>
					<p>How physically demanding was the task?</p>
                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="pd">
				</section>
				<section class="nasaSection">
					<h3>Temporal demand</h3>
                    <p>How hurried or rushed was the pace of the task?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="td">
				</section>
				<section class="nasaSection">
					<h3>Performance</h3>
                    <p>How successful were you in accomplishing what you were asked to do?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider performance" id="pe">
				</section>
				<section class="nasaSection">
					<h3>Effort</h3>
                    <p>How hard did you have to work to accomplish your level of performance?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="ef">
				</section>
				<section class="nasaSection">
					<h3>Frustration</h3>
                    <p>How insecure, discouraged, irritated, stressed, and annoyed were you?</p>

                    <div class="sliderticks">
                        <p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p><p></p>
                    </div>
                        <input type="range" min="0" max="100" value="50" step="5" class="slider" id="fr">
				</section>		
                `
            )
            domCtr.place(row, this.containerNasa);

            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" },  this.containerQuest);
            //this.finishButton.style.pointerEvents = 'none';

            this.clickHandler();
        }, 

        clickHandler: function () {


            on(dom.byId("md"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.md = evt.srcElement.value;
                this.checkFinished();
            }.bind(this));

            on(dom.byId("pd"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.pd = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("td"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.td = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("pe"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.pe = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("ef"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.ef = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(dom.byId("fr"), "change", function (evt) {
                console.log(evt.srcElement.value);
                this.results.fr = evt.srcElement.value;
                this.checkFinished();

            }.bind(this));

            on(this.finishButton, "click", function (evt) {
                var ueq = new Ueq(this.settings, this.containerHome);
                ueq.init(this.results);
            }.bind(this));
           
        },

        checkFinished: function() {
            if (Object.keys(this.results).length == 6) {
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.style.background = this.settings.colors.project;
            }
        }



    });
});





