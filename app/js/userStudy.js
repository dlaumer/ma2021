
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
            question: "Question 1",
            result: "This is the result"},
            {id: 2,
            question: "Question 2",
            result: "This is the result"},
            {id: 3,
            question: "Question 3",
            result: "This is the result"},
            {id: 4,
            question: "Question 4",
            result: "This is the result"},
        ];

        var userResults = {};

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.userStudy",

            constructor: function (scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;
                this.questions = questions;
                this.i = 0;
                this.userResults = userResults;
            },

            init: function() {
                this.overlay = domCtr.create("div", { id: "overlay"}, win.body())
                this.questionStart = domCtr.create("div", { id: "questionStart", innerHTML: "Here would be the question"}, this.overlay);

                this.startButton = domCtr.create("div", { id: "startButton", className: "link", innerHTML: "Start" },  this.overlay);

                this.userStudy = domCtr.create("div", { id: "userStudy"}, win.body())

                this.question = domCtr.create("div", { id: "question"}, this.userStudy);
                this.inResult = domCtr.create("input", { id: "inResult", name:"inResult",  placeholder:"Enter Result here" }, this.userStudy);
                this.done = domCtr.create("div", { id: "done", className: "link", innerHTML: "Done" }, this.userStudy);

                domCtr.create("hr");

                this.questions = shuffle(this.questions);

                this.questionStart.innerHTML = this.questions[this.i].question;
                
                var that = this;

                on(this.done, "click", function () {
                    that.endQuestion()
                });
                on(this.startButton, "click", function () {
                    that.startQuestion()
                });
                this.counter = 0;

                document.addEventListener('click', function(){
                    that.counter++;
                  }); 
                return this.userStudy;
            },
            

            newQuestion: function() {
            
                this.inResult.value = ""
                    this.i++;
                    if (this.i < this.questions.length) {
                        this.question.innerHTML = ""
    
                        this.overlay.style.display = "flex";
                        this.questionStart.innerHTML = this.questions[this.i].question;
                    }
                    else {
                        alert("No more questions");
                    }
            }, 

            startQuestion: function() {
                dom.byId("overlay").style.display = 'none'
                this.question.innerHTML = this.questions[this.i].question;
                this.startTime = new Date();
                this.counter = 0;
            }, 

            endQuestion: function() {
                if (this.inResult.value == "") {
                    alert("Please enter the result first!");
                }
                else {
                    var endTime = new Date();
                    var timeDiff = (endTime - this.startTime)/1000; //in ms
                    this.userResults[this.questions[this.i].id] = {
                        time: timeDiff,
                        results: this.inResult.value,
                        clicks: this.counter,
                    };
                    console.log( this.userResults);
                    this.newQuestion()

                }
            },


    });
})

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
