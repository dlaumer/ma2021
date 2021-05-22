
define([
    "esri/core/Accessor",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

], function (
    Accessor,
    dom, on, domCtr, win, domStyle) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.PreQuest",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className : "questionnaire"}, containerHome);
            this.containerPreQuest = domCtr.create("div", { id: "containerPreQuest",  className : "questionnaire2"}, containerQuest);

            this.results ={};
        },

        init: function() {
            
            var container1 = domCtr.create("div", { id: "container1", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "What is your age?" }, container1);
            this.task1 = domCtr.create("input", { id: "task1", className: "quest_input", name:"name",  placeholder:"Your Age"}, container1);

            var container2 = domCtr.create("div", { id: "container2", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task2_desc = domCtr.create("div", { id: "task2_desc", className: "task_desc", innerHTML: "What is your gender?" }, container2);
            //this.task2 = domCtr.create("input", { id: "task2", className: "quest_input", name:"name",  placeholder:"Your Gender"}, container2);
            var row = domCtr.toDom(
            `<select name="gender" id="gender" class="quest_input">
                <option value="" disabled selected>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>`)
            this.task2 = domCtr.place(row, container2);

            var container3 = domCtr.create("div", { id: "container3", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task3_desc = domCtr.create("div", { id: "task3_desc", className: "task_desc", innerHTML: "What is your profession?" }, container3);
            this.task3 = domCtr.create("input", { id: "task3", className: "quest_input", name:"name",  placeholder:"Your Profession"}, container3);

            var container4 = domCtr.create("div", { id: "container4", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "What is your current education?" }, container4);
            //this.task2 = domCtr.create("input", { id: "task2", className: "quest_input", name:"name",  placeholder:"Your Gender"}, container2);
            var row = domCtr.toDom(
            `<select name="education" id="education" class="quest_input">
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

            var container5 = domCtr.create("div", { id: "container5", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task5_desc = domCtr.create("div", { id: "task5_desc", className: "task_desc", innerHTML: "How would you rate your experience with webmaps?" }, container5);
            //this.task2 = domCtr.create("input", { id: "task2", className: "quest_input", name:"name",  placeholder:"Your Gender"}, container2);
            var row = domCtr.toDom(
            `<select name="experience" id="experience" class="quest_input">
                <option value="" disabled selected>Select your experience</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>`)
            this.task5 = domCtr.place(row, container5);

            var container6 = domCtr.create("div", { id: "container6", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "What is your city of residence?" }, container6);
            this.task6 = domCtr.create("input", { id: "task6", className: "quest_input", name:"name",  placeholder:"Your residence"}, container6);

            var container7 = domCtr.create("div", { id: "container7", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task7_desc = domCtr.create("div", { id: "task7_desc", className: "task_desc", innerHTML: "How would you rate your knowledge of the area of <br> Rosengarten / Bucheggplatz?" }, container7);
            //this.task2 = domCtr.create("input", { id: "task2", className: "quest_input", name:"name",  placeholder:"Your Gender"}, container2);
            var row = domCtr.toDom(
            `<select name="knowledge" id="knowledge" class="quest_input">
                <option value="" disabled selected>Select your knowledge</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>`)
            this.task7 = domCtr.place(row, container7);

            var container8 = domCtr.create("div", { id: "container8", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task8_desc = domCtr.create("div", { id: "task8_desc", className: "task_desc", innerHTML: "Have you heard of the Rosengartentunnel / -tram project before?" }, container8);
            //this.task2 = domCtr.create("input", { id: "task2", className: "quest_input", name:"name",  placeholder:"Your Gender"}, container2);
            var row = domCtr.toDom(
            `<select name="rosengarten" id="rosengarten" class="quest_input">
                <option value="" disabled selected>Select your option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>`)
            this.task8 = domCtr.place(row, container8);


            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" },  this.containerQuest);
            //this.finishButton.style.pointerEvents = 'none';


            this.clickHandler();
        }, 

        clickHandler: function () {


            on(this.task1, "input", function (evt) {
                this.results.age = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task2, "change", function (evt) {
                this.results.gender = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task3, "input", function (evt) {
                this.results.profession = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task4, "change", function (evt) {
                this.results.education = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task5, "change", function (evt) {
                this.results.experience = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task6, "input", function (evt) {
                this.results.residence = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task7, "change", function (evt) {
                this.results.knowledge = evt.target.value;
                this.checkFinished();
            }.bind(this));

            on(this.task8, "change", function (evt) {
                this.results.rosengarten = evt.target.value;
                this.checkFinished();
            }.bind(this));


            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome(this.results);
            }.bind(this));
           
        },

        checkFinished: function() {
            if (Object.keys(this.results).length == 8) {
                this.finishButton.className = "task_button active";
            }
        }, 



    });
});





