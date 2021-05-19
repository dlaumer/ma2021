
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/App",

], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, App) {


        var orders = [
            [{dimension: "2D", version: 1}, {dimension: "3D", version: 2}],
            [{dimension: "2D", version: 2}, {dimension: "3D", version: 1}],
            [{dimension: "3D", version: 1}, {dimension: "2D", version: 2}],
            [{dimension: "3D", version: 2}, {dimension: "2D", version: 1}],
        ]
        
        var questions = [
            {id: 1,
            question: [
                "What is the average occupancy between Albisriederplatz and Letzigrund after the project is built?",
                "What is the average occupancy between Bucheggplatz and Milchbuck after the project is built?"],
            result: "This is the result"},
            {id: 2,
                question: [
                    "Without the project, would the occupancy between Bucheggplatz and Rosengarten turn critical? (critical = over 50%)",
                    "Without the project, would the occupancy between Rosengarten and Escher-Wyss-Platz turn critical ? (critical = over 50%)"],
            result: "This is the result"},
            {id: 3,
                question: [
                    "How many cars drive currently on average on the Hardbrücke at 8am?",
                    "How many cars drive currently on average on the Rosengarten at 8am?"],
            result: "This is the result"},
            {id: 4,
                question: [
                    "With the project, how many cars would still use the Rosengartenstrasse per day?",
                    "With the project, how many cars would use the new tunnel per day?"],
            result: "This is the result"},
        ];

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.userStudy",

            constructor: function (settings) {
               
                this.settings = settings;
                this.questions = questions;
                this.order = orders[Math.floor(Math.random()*4)];
                this.i = 0;
                this.userResults = {};
                this.userResults["order"] = this.order;
                this.userResults["screen"] = {
                    width: window.screen.width,
                    height: window.screen.height,
                };
                this.round = 0;
            },

            init: function() {
                dom.byId("background_home").style.display = "none";

                this.overlay = domCtr.create("div", { id: "overlay"}, win.body())
                
                this.overlayItems = domCtr.create("div", { id: "overlayItems"}, win.body())

                this.questionStart = domCtr.create("div", { id: "questionStart", innerHTML: "Here would be the question"}, this.overlayItems);
                this.startButton = domCtr.create("div", { id: "startButton", className: "link", innerHTML: "Loading..." },  this.overlayItems);
                //this.startButton.style.pointerEvents = 'none';

                this.userStudy = domCtr.create("div", { id: "userStudy"}, win.body())

                this.questionDiv = domCtr.create("div", { id: "questionDiv"}, this.userStudy);
                this.inResult = domCtr.create("input", { id: "inResult", name:"inResult",  placeholder:"Enter Result here" }, this.userStudy);
                this.done = domCtr.create("div", { id: "done", className: "link", innerHTML: "Done" }, this.userStudy);
                //this.done.style.pointerEvents = 'none';

                domCtr.create("hr");

                this.questions = shuffle(this.questions);

                this.questionStart.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version-1];
                
                var that = this;

                on(this.inResult, "input", function () {
                    that.done.style.pointerEvents = 'auto';
                    that.done.style.background = that.settings.colors.project;
                });

                on(this.done, "click", function () {
                    that.endQuestion()
                });
                on(this.startButton, "click", function () {
                    that.startQuestion()
                });
                this.counter = 0;

                document.addEventListener('click', function(event){
                    that.counter++;
                  }); 
                return this.userStudy;
            },
            
            setSceneInfo: function (scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;

                var that = this;
                function checkFlag() {
                    var flag = that.view.updating;
                    if(flag == true) {
                        window.setTimeout(checkFlag, 100); /* this checks the flag every 100 milliseconds*/
                    } else {
                        that.isReady();
                    }
                }

                checkFlag();
            },


            newQuestion: function() {
            
                this.inResult.value = ""
                    this.i++;
                    if (this.i < this.questions.length) {

                        //this.done.style.pointerEvents = 'none';
                        this.done.style.background = null;

                        this.questionDiv.innerHTML = ""
    
                        this.overlay.style.visibility = "visible";
                        this.overlayItems.style.visibility = "visible";
                        this.overlayItems.style.opacity = 1;

                        this.overlay.style.opacity = 0.8;
                        this.questionStart.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version-1];
                    }
                    else {
                        this.round = 1;
                        this.i = 0;
                        this.settings.home.returnToHome(this.userResults);
                    }
            }, 

            startQuestion: function() {
                dom.byId("overlay").style.visibility = 'hidden'
                this.overlayItems.style.visibility = "hidden";
                this.overlayItems.style.opacity = 0;
                this.overlay.style.opacity = 0;

                this.questionDiv.innerHTML = this.questions[this.i].question[this.order[this.round].version-1];
                this.startTime = new Date();
                this.counter = 0;
            }, 

            endQuestion: function() {
               
                var endTime = new Date();
                var timeDiff = (endTime - this.startTime)/1000; //in ms
                this.userResults[this.questions[this.i].id] = {
                    time: timeDiff,
                    results: this.inResult.value,
                    clicks: this.counter,
                };
                this.newQuestion()

            },

            isReady: function() {
                this.startButton.style.background = this.settings.colors.project;
                this.startButton.style.opacity = 1;

                this.startButton.innerHTML = "Start";
                this.startButton.style.pointerEvents = 'auto';
            },

            getDimension: function() {
                return this.order[this.round].dimension;
            }


    });
})

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
