
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
        declaredClass: "urbanmobility.Video",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, containerHome);
            this.containerVideo = domCtr.create("div", { id: "containerVideo" }, containerQuest);

            this.results = {};
        },

        init: function () {

            //domCtr.create("video", { id: "instructions", src: "images/instructions.mov"}, this.containerVideo);
            this.container1 = domCtr.create("div", { id: "containerVideo" }, this.containerVideo);
            /*
            this.container1.innerHTML = 
            `<video width=100% height="auto" id="instructions" autoplay controls>
                <source src="images/instructions.mov" type="video/mp4">
            Your browser does not support the video tag.
            </video>`
            */
            this.container1.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/Hw5gPbqw1ts?rel=0&autoplay=1&mute=1" 
            title="UrbanMobility" frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
            encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `

            this.container2 = domCtr.create("div", { id: "container1", className: "containerTypeInfo" }, this.containerVideo);

            this.container2.innerHTML = `
            Use left-click and move to change the map position<br>
            Use scrolling to zoom in and out<br>
            Use right-click and move to change the viewing angle (only 3D)<br>`

            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Yes I watched it!" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';
            
            
            this.clickHandler();
        
        },

        clickHandler: function () {

            on(this.finishButton, "click", function (evt) {

                this.settings.home.returnToHome({watched: "yes"});
            }.bind(this));

            this.timer = setTimeout(() => {
                this.finishButton.style.pointerEvents = 'auto';
            this.finishButton.className = "task_button active";
            },128000);

            
            
/*
            var that = this;
            dom.byId('instructions').addEventListener('ended',myHandler,false);
                function myHandler(e) {
                    that.finishButton.style.pointerEvents = 'auto';
                    that.finishButton.className = "task_button active" 
            }*/
        },



    });
});





