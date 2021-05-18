
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
        declaredClass: "urbanmobility.PostQuest",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className : "questionnaire"}, containerHome);
            this.containerPreQuest = domCtr.create("div", { id: "containerPreQuest"}, containerQuest);

            this.results ={};
        },

        init: function() {
            
            var container1 = domCtr.create("div", { id: "container1", className: "containerTypeQuest"}, this.containerPreQuest);
            this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "What is your opinion?" }, container1);
            this.task1 = domCtr.create("input", { id: "task1", className: "quest_input", name:"name",  placeholder:"Your opinion"}, container1);

            
            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Done" },  this.containerQuest);
            this.finishButton.style.pointerEvents = 'none';


            this.clickHandler();
        }, 

        clickHandler: function () {


            on(this.task1, "input", function (evt) {
                this.results.opinion = evt.target.value;
                this.checkFinished();
            }.bind(this));


            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome();
            }.bind(this));
           
        },

        checkFinished: function() {
            if (Object.keys(this.results).length == 1) {
                this.finishButton.style.pointerEvents = 'auto';
                this.finishButton.style.background = this.settings.colors.project;
            }
        }, 



    });
});





