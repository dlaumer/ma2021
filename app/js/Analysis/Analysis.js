define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",
    "urbanmobility/UserStudy/ConnectionAGO",



], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, UserResults) {

        var questions = [
            {id: 1,
            question: [
                "Public transport: What is the average occupancy at Hardbrücke after the project is built?",
                "Public transport : What is the average occupancy between Bucheggplatz and Milchbuck after the project is built?"],
            result: [29,19]},
            {id: 2,
                question: [
                    "Public transport: Without the project, what will be the average occupancy between Bucheggplatz and Rosengarten at 12:00?",
                    "Public transport: Without the project, what will be the average occupancy between Rosengarten and Escher-Wyss-Platz at 12:00?"],
            result: [32, 26]},
            {id: 3,
                question: [
                    "Traffic: How many cars drive currently (now) on average on the Hardbrücke at 8:00?",
                    "Traffic: How many cars drive currently (now) on average on the Rosengarten at 8:00?"],
            result: [455, 1175]},
            {id: 4,
                question: [
                    "Traffic: With the project, how many cars would still use the section between Rosengartenstrasse and Bucheggplatz on average per day?",
                    "Traffic: With the project, how many cars would use the new Rosengarten tunnel on average per day?"],
            result: [2302, 22320]},
        ];

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.Analysis",

            constructor: function () {
                this.set.userID = 54;
                this.clicks = null;

            },

            init: function (settings) {
                this.settings = settings;

                domCtr.destroy("background");
                this.createUI();
                this.inputHandler();

                // minimal heatmap instance configuration

                this.containerHeight = this.gui.clientHeight;
                this.containerWidth = this.gui.clientWidth;
                
                this.heatmapInstance = h337.create({
                // only container is required, the rest will be defaults
                container: this.guiContainer
                });

                this.userResults = new UserResults(this.settings);
                this.userResults.init();
                this.userResults.readFeatures().then((feats => {
                    this.readData(feats).then((features) => {
                        this.features = features;
                        this.getClickData("userId");

                    })
                }));

                var that = this;
                window.addEventListener('resize', debounce(function(event){
                    document.getElementsByClassName("heatmap-canvas")[0].remove();
                    that.heatmapInstance = h337.create({
                        // only container is required, the rest will be defaults
                        container: this.guiContainer
                    });
                    that.getClickData("");
                }));
            },

            createUI: function () {

                var background_home = domCtr.create("div", { id: "background_home"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home"},  background_home);
                domCtr.create("div", { id: "userId_desc", className: "task_desc", innerHTML: "User ID:" }, header_home);
                var row = domCtr.toDom(
                    `<select name="userId" id="userId" class="quest_input">
                    </select>`)
                this.userIdSelect = domCtr.place(row, header_home);
                this.userIdSelect.style.border = "1px solid grey";

                domCtr.create("div", { id: "question_desc", className: "task_desc", innerHTML: "Question:" }, header_home);
                var row = domCtr.toDom(
                    `<select name="question" id="question" class="quest_input">
                    </select>`)
                this.questionSelect = domCtr.place(row, header_home);
                this.questionSelect.style.border = "1px solid grey";

                domCtr.create("div", { id: "dimension_desc", className: "task_desc", innerHTML: "Dimension:" }, header_home);
                var row = domCtr.toDom(
                    `<select name="dimension" id="dimension" class="quest_input">
                    </select>`)
                this.dimensionSelect = domCtr.place(row, header_home);
                this.dimensionSelect.style.border = "1px solid grey";

                this.containerAnalysis = domCtr.create("div", { id: "containerAnalysis"}, background_home);
                this.infoContainer = domCtr.create("div", { id: "infoContainer"}, this.containerAnalysis);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Question:</b>" },  this.infoContainer);
                this.questionDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Answer:" },  this.infoContainer);
                this.answerDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Correct Answer:</b>" },  this.infoContainer);
                this.correctAnswerDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Time:</b>" },  this.infoContainer);
                this.timeDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Clicks:</b>" },  this.infoContainer);
                this.clicksDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Order of Question:</b>" },  this.infoContainer);
                this.orderQuestionDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Order</b>:" },  this.infoContainer);
                this.orderDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Comment</b>:" },  this.infoContainer);
                this.commentDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);
                domCtr.create("div", {className: "task_desc", innerHTML: "<b>Email</b>:" },  this.infoContainer);
                this.emailDiv = domCtr.create("div", {id: "questionDiv", className: "task_desc", innerHTML: "" },  this.infoContainer);


                this.guiContainer = domCtr.create("div", { id: "guiContainer"}, this.containerAnalysis);
                this.gui = domCtr.create("img", { id: "gui", src: "images/2D.png"}, this.guiContainer);
            },

            inputHandler: function() {
                on(this.userIdSelect, "change", function (evt) {
                    this.set.userID = evt.target.value;
                    this.getClickData("userId");

                }.bind(this));

                on(this.questionSelect, "change", function (evt) {
                    this.set.question = evt.target.value;
                    this.getClickData("question");

                }.bind(this));

                on(this.dimensionSelect, "change", function (evt) {
                    this.set.dimension = evt.target.value;
                    this.getClickData("dimension");

                }.bind(this));

                var that = this;
                document.addEventListener('keydown', function(e) {
                    switch (e.code) {
                        case "ArrowUp":
                            that.userIdSelect.selectedIndex =  that.userIdSelect.selectedIndex - 1;
                            that.getClickData("userId")
                            break;
                        case "ArrowDown":
                            that.userIdSelect.selectedIndex =  that.userIdSelect.selectedIndex + 1;
                            that.getClickData("userId")
                            break;
                    }
                });
            },

            readData: function(feats) {
                return new Promise((resolve, reject) => {
                    features = {};
                    var outliers = [63, 247];
                    for (feature in feats) {
                        var att = feats[feature].attributes
                        if (att.ID > 53) {
                            if (!outliers.includes(att.ID) && att.Task1 != null && att.Task2 != null && att.Task3 != null && att.Task4 != null && att.Task5 != null && att.Task6 != null && att.Task7 != null && att.Task8 != null) {
                                features[att.ID] = feats[feature];
                                var option = document.createElement("option");
                                option.text = att.ID;
                                this.userIdSelect.add(option);
                            }
                        }
                    }
                    resolve(features)
                })
            }, 

            getUserData: function(userId) {
                var data = this.features[userId].attributes;

                var order = JSON.parse(data.Orders);
                
                var results = JSON.parse(data["Task4"])

                var orderQuestions = [0,0,0,0]
                for (i in results) {
                    if (results[i].order != null) {
                        orderQuestions[results[i].order] = i;
                    }
                }

                for (j in orderQuestions) {
                    var option = document.createElement("option");
                    option.text = orderQuestions[j];
                    this.questionSelect[j] = option
                }

                var option = document.createElement("option");
                option.text = order[0].dimension;
                this.dimensionSelect[0] = option
                var option = document.createElement("option");
                option.text = order[1].dimension;
                this.dimensionSelect[1] = option

                this.getClickData(userId, orderQuestions[0], order[0].dimension)

            },

            getClickData: function(changedValue) {

                userID = this.userIdSelect.value;
                question = this.questionSelect.value;
                dimension = this.dimensionSelect.value;
                
                var data = this.features[userID].attributes;

                var order = JSON.parse(data.Orders);
                var task = "Task4";
                var version = parseInt(order[0].version)-1;
                if (order[1].dimension == dimension) {
                    task = "Task6";
                    version = parseInt(order[1].version)-1;
                }
                var results = JSON.parse(data[task])

                var orderQuestions = [0,0,0,0]
                for (i in results) {
                    if (results[i].order != null) {
                        orderQuestions[results[i].order] = i;
                    }
                }
                for (j in orderQuestions) {
                    var option = document.createElement("option");
                    option.text = orderQuestions[j];
                    this.questionSelect[j] = option
                }
                if (changedValue != "userId") {
                    this.questionSelect.value = question;
                }

                var option = document.createElement("option");
                option.text = order[0].dimension;
                this.dimensionSelect[0] = option
                var option = document.createElement("option");
                option.text = order[1].dimension;
                this.dimensionSelect[1] = option
                if (changedValue != "userId") {
                    this.dimensionSelect.value = dimension;
                }

                userID = this.userIdSelect.value;
                question = this.questionSelect.value;
                dimension = this.dimensionSelect.value;

                if (dimension == "2D") {
                    this.gui.src="images/2D.png"
                }
                else {
                    this.gui.src="images/3D.png"
                }


                this.containerHeight = this.gui.clientHeight;
                this.containerWidth = this.gui.clientWidth;
                
                this.clickPositions = results[question].clickPositions;
                this.clicks = results[question].clicks;
                this.screen = JSON.parse(data.Task1).screen;
                console.log(this.screen);
                console.log(this.clickPositions);
                this.clickPositionsNorm = []
                for (i in this.clickPositions) {
                    this.clickPositionsNorm.push({
                        x: Math.floor(this.containerWidth / this.screen.width * this.clickPositions[i][0]),
                        y: Math.floor(this.containerHeight / this.screen.height * this.clickPositions[i][1]), 
                        value: 1
                    })
                }
                this.updateHeatmap(this.clickPositionsNorm);

                this.questionDiv.innerHTML = questions[question - 1].question[version];
                this.answerDiv.innerHTML = results[question].results;
                this.correctAnswerDiv.innerHTML = questions[question -1].result[version];
                this.timeDiv.innerHTML = results[question].time;
                this.clicksDiv.innerHTML = results[question].clicks;
                this.orderQuestionDiv.innerHTML = orderQuestions;
                this.orderDiv.innerHTML = data.Orders;
                var task8 = JSON.parse(data.Task8);
                Object.keys(task8).includes("comments")? this.commentDiv.innerHTML = task8.comments: this.commentDiv.innerHTML = "";
                Object.keys(task8).includes("email")?this.emailDiv.innerHTML = task8.email:this.emailDiv.innerHTML = "";
                console.log(results);


            },

            updateHeatmap: function(clickPositionsNorm) {

                // heatmap data format
                var data = {
                    max: 1,
                    data: clickPositionsNorm
                };
                // if you have a set of datapoints always use setData instead of addData
                // for data initialization
                this.heatmapInstance.setData(data);
            }
        })
    })

    function debounce(func){
        var timer;
        return function(event){
        if(timer) clearTimeout(timer);
        timer = setTimeout(func,500,event);
        };
    }