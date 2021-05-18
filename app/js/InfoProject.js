
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
        declaredClass: "urbanmobility.InfoProject",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className : "questionnaire"}, containerHome);
            this.containerInfoProject = domCtr.create("div", { id: "containerInfoProject"}, containerQuest);

            this.results ={};
        },

        init: function() {
            
            var container1 = domCtr.create("div", { id: "container1", className: "containerTypeQuest", innerHTML: "Here is some info"}, this.containerInfoProject);

            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Yes I read it!" },  this.containerQuest);

            this.clickHandler();
        }, 

        clickHandler: function () {

            on(this.finishButton, "click", function (evt) {
                this.settings.home.returnToHome();
            }.bind(this));
           
        },



    });
});





