
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
       
        
        var questions = [
            {id: 1,
            question: [
                "Public transport: What is the average occupancy between Albisriederplatz and Hardbrücke after the project is built?",
                "Public transport : What is the average occupancy of between Bucheggplatz and Milchbuck after the project is built?"],
            result: "This is the result"},
            {id: 2,
                question: [
                    "Public transport: Without the project, would the occupancy between Bucheggplatz and Rosengarten turn critical? (critical = over 50%)",
                    "Public transport: Without the project, would the occupancy between Rosengarten and Escher-Wyss-Platz turn critical ? (critical = over 50%)"],
            result: "This is the result"},
            {id: 3,
                question: [
                    "Traffic: How many cars drive currently (now) on average on the Hardbrücke at 8am?",
                    "Traffic: How many cars drive currently (now) on average on the Rosengarten at 8am?"],
            result: "This is the result"},
            {id: 4,
                question: [
                    "Traffic: With the project, how many cars would still use the Rosengartenstrasse per day?",
                    "Traffic: With the project, how many cars would use the new Rosengarten tunnel per day?"],
            result: "This is the result"},
        ];

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.userStudy",

            constructor: function (settings, order) {
               
                this.settings = settings;
                this.questions = questions;
                this.order = order;
                this.i = 0;
                this.userResults = {};
                this.userResults["order"] = this.order;
                this.round = 0;
                this.clickPositions = [];
                this.counter = 0;

            },

            init: function() {
                dom.byId("background_home").style.display = "none";

                this.overlay = domCtr.create("div", { id: "overlay"}, win.body())
                
                this.overlayItems = domCtr.create("div", { id: "overlayItems"}, win.body())

                this.questionStart = domCtr.create("div", { id: "questionStart"}, this.overlayItems);
                
                this.questionText = domCtr.create("div", { id: "questionText", innerHTML: "Here would be the question"}, this.questionStart);
                this.startButton = domCtr.create("div", { id: "startButton", className: "task_button", innerHTML: "Loading..." },  this.questionStart);
                this.settings.dev ? "" : this.startButton.style.pointerEvents = 'none';

                this.userStudy = domCtr.create("div", { id: "userStudy"}, win.body())

                this.questionDiv = domCtr.create("div", { id: "questionDiv"}, this.userStudy);
                this.inResult = domCtr.create("input", { id: "inResult", name:"inResult",  placeholder:"Enter Result here" }, this.userStudy);
                this.done = domCtr.create("div", { id: "done", className: "task_button", innerHTML: "Done" }, this.userStudy);
                this.settings.dev ? "" : this.done.style.pointerEvents = 'none';

                domCtr.create("hr");

                this.questions = shuffle(this.questions);

                this.questionText.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version-1];
                
                var that = this;

                on(this.inResult, "input", function () {
                    that.done.style.pointerEvents = 'auto';
                    that.done.className = "task_button active"
                });

                on(this.done, "click", function () {
                    that.endQuestion(that)
                });
                on(this.startButton, "click", function () {
                    that.startQuestion()
                });

                document.addEventListener('click', function(event){
                    that.counter++;
                    that.clickPositions.push([event.clientX, event.clientY]);
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

                        this.settings.dev ? "" : this.done.style.pointerEvents = 'none';
                        this.done.className = "task_button"
                        this.questionDiv.innerHTML = ""
    
                        this.overlay.style.visibility = "visible";
                        this.overlayItems.style.visibility = "visible";
                        this.overlayItems.style.opacity = 1;

                        this.overlay.style.opacity = 0.8;
                        this.questionText.innerHTML = "Please answer this question: <br>" + this.questions[this.i].question[this.order[this.round].version-1];
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
                this.clickPositions = []
                var that = this;
                this.timer = setTimeout(() => {alert("The timelimit was exceeded. Please answer the next question"); that.endQuestion(that)},120000);
            }, 

            endQuestion: function(that) {
               
                clearTimeout(that.timer);
                var endTime = new Date();
                var timeDiff = (endTime - that.startTime)/1000; //in ms
                that.userResults[that.questions[that.i].id] = {
                    order: that.i,
                    time: timeDiff,
                    results: that.inResult.value,
                    clicks: that.counter,
                    clickPositions: that.clickPositions.slice(0),
                };
                console.log(that.userResults[that.questions[that.i].id]);
                that.newQuestion()

            },

            isReady: function() {
                this.startButton.className = "task_button active"

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
  
