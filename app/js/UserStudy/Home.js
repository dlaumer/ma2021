/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/Home.js
--------------
Main file for the user study framework. Holds all the instances of the other files in this category.
It defines the order of the different tasks and makes sure that all buttons are only active if the previous 
part was done completely. Holds all the logic for goinf through the study. 
*/
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

    "urbanmobility/Application/App",
    "urbanmobility/UserStudy/UserQuestions",
    "urbanmobility/UserStudy/Nasa",
    "urbanmobility/UserStudy/PreQuest",
    "urbanmobility/UserStudy/PostQuest",
    "urbanmobility/UserStudy/InfoProject",
    "urbanmobility/UserStudy/ConnectionAGO",
    "urbanmobility/Outro",
    "urbanmobility/UserStudy/Video",


], function (
    Accessor,
    domCtr, win, dom, on, App, userStudy, Nasa, PreQuest, PostQuest, InfoProject, UserResults, Outro, Video) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.Home",

        constructor: function () {
        },

        // Prepare everything for the user study. 
        init: function (settings) {
            this.urlParser();

            this.settings = settings;

            // In case we wnat to choose the user ID ourselves by putting it into the url
            if (this.urlParams.userId) {
                // only for debugginf, there all be buttons can be clicked at all times
                if (this.urlParams.userId == "dev") {
                    this.settings.userId = "41";
                    this.settings.dev = true;
                }
                // set the user id to the one chosen 
                else {
                    this.settings.userId = this.urlParams.userId;
                }
            }
            // If nothing is chosen (normal case for users), read the cookie
            else {
                if (document.cookie) {
                    this.settings.userId = document.cookie.split(";")[0].split("=")[1];
                }
                // If there is none, go back to the home screen
                else {
                    window.location.href = window.location.href.split("?")[0];
                    this.urlParser();
                }
            }

            // keep a reference to this class to give to instances of other classes
            this.settings.home = this;

            // destroy welcome page when app is started
            domCtr.destroy("background");

            // Define the status, set all to "not done"
            this.status = {
                "1": 0,
                "2": 0,
                "3": 0,
                "4": 0,
                "5": 0,
                "6": 0,
                "7": 0,
                "8": 0,
            };

            // Define the different permutations to go through for 2D/3D
            var orders = [
                [{ dimension: "2D", version: 1 }, { dimension: "3D", version: 2 }],
                [{ dimension: "2D", version: 2 }, { dimension: "3D", version: 1 }],
                [{ dimension: "3D", version: 1 }, { dimension: "2D", version: 2 }],
                [{ dimension: "3D", version: 2 }, { dimension: "2D", version: 1 }],
            ]
            this.order = orders[parseInt(this.settings.userId) % 4];   // Evenly distribute the order of dimensions and versions
            this.userStudy = new userStudy(this.settings, this.order);
            this.userResultsOnline = new UserResults(this.settings);
            this.userResultsOnline.init();

            this.createUI();
            this.clickHandler();
            var that = this;
            // Define the different permutations to go through for the task questions
            var permutations = [[0, 2, 1, 3],
            [2, 0, 3, 1],
            [3, 1, 0, 2],
            [1, 3, 2, 0],
            [0, 1, 2, 3],
            [3, 2, 1, 0]]

            this.questionOrder = permutations[Math.floor(parseInt(this.settings.userId) / 4) % 6]; // Chose one, the first 4 users get all the same, then the next 4 users too etc. But those 4 all have different permutations for 2D/3D
            this.userStudy.questionOrder = this.questionOrder;

            // Read the status from AGO, in case the page was reloaded.
            that.userResultsOnline.readFeature(this.settings.userId, function (feature) {
                if (feature.attributes.Status != null) {
                    that.settings.dev ? "" : that.status = JSON.parse(feature.attributes.Status);
                    that.questionOrder = JSON.parse(feature.attributes.GeneralInfo);
                    for (let [key, value] of Object.entries(that.status)) {
                        if (value != 1) {
                            that.status[key] = -1;
                            break;
                        }
                    }
                }
                else {
                    that.status["1"] = -1;
                    that.userResultsOnline.updateFeature(that.settings.userId, { "Orders": that.userStudy.order, "ID": that.settings.userId, "GeneralInfo": that.settings.questionOrder, "Status": that.status }, function (info) { console.log(info) })

                }
                that.updateUI();
            })

        },

        // Make all the GUI elements
        createUI: function () {

            var background_home = domCtr.create("div", { id: "background_home" }, win.body());
            var header_home = domCtr.create("div", { id: "header_home" }, background_home);

            domCtr.create("div", { id: "loggedIn", innerHTML: "Your user ID is: &emsp;" + "<span style='color: #F3511B'>" + this.settings.userId + "</span>" }, header_home);
            domCtr.create("img", { id: "logo_home", src: "images/Logo.png" }, header_home);

            this.containerHome = domCtr.create("div", { id: "containerHome" }, background_home);
            this.containerTasks = domCtr.create("div", { id: "containerTasks" }, containerHome);

            var container1 = domCtr.create("div", { id: "container1", className: "containerType" }, containerTasks);
            this.task1 = domCtr.create("div", { id: "task1", className: "task_button", innerHTML: "Information about project" }, container1);

            var container2 = domCtr.create("div", { id: "container2", className: "containerType" }, containerTasks);
            this.task2 = domCtr.create("div", { id: "task2", className: "task_button", innerHTML: "Enter your information" }, container2);

            var container3 = domCtr.create("div", { id: "container3", className: "containerType" }, containerTasks);
            this.task3 = domCtr.create("div", { id: "task3", className: "task_button", innerHTML: "Watch instruction video" }, container3);

            var container4 = domCtr.create("div", { id: "container4", className: "containerType" }, containerTasks);
            this.task4 = domCtr.create("div", { id: "task4", className: "task_button", innerHTML: "Tasks Round 1" }, container4);

            var container5 = domCtr.create("div", { id: "container5", className: "containerType" }, containerTasks);
            this.task5 = domCtr.create("div", { id: "task5", className: "task_button", innerHTML: "Questionnaire" }, container5);

            var container6 = domCtr.create("div", { id: "container6", className: "containerType" }, containerTasks);
            this.task6 = domCtr.create("div", { id: "task6", className: "task_button", innerHTML: "Tasks Round 2" }, container6);

            var container7 = domCtr.create("div", { id: "container7", className: "containerType" }, containerTasks);
            this.task7 = domCtr.create("div", { id: "task7", className: "task_button", innerHTML: "Questionnaire" }, container7);

            var container8 = domCtr.create("div", { id: "container8", className: "containerType" }, containerTasks);
            this.task8 = domCtr.create("div", { id: "task8", className: "task_button", innerHTML: "Final questions" }, container8);

            var footer = domCtr.create("div", { id: "footer", className: "containerType", innerHTML: "Experiencing technical problems? <br>Please let me know at laumerd@ethz.ch" }, containerTasks);

            this.updateUI();

        },

        // manages all the interactions
        clickHandler: function () {

            // One event listener for each of the 8 tasks
            on(this.task1, "click", function (evt) {
                this.status["1"] = 1;
                this.updateUI();
                var infoProject = new InfoProject(this.settings, this.containerHome);
                infoProject.init();
            }.bind(this));

            on(this.task2, "click", function (evt) {
                this.status["2"] = 1;
                this.updateUI();
                var preQuest = new PreQuest(this.settings, this.containerHome);
                preQuest.init();
            }.bind(this));

            on(this.task3, "click", function (evt) {
                this.status["3"] = 1;
                this.updateUI();
                var video = new Video(this.settings, this.containerHome);
                video.init();
            }.bind(this));

            on(this.task4, "click", function (evt) {
                this.userStudy.round = 0;
                var app = new App();
                app.init(this.settings, "userStudy", this.userStudy);
            }.bind(this));

            on(this.task5, "click", function (evt) {
                this.status["5"] = 1;
                this.updateUI();
                var nasa = new Nasa(this.settings, this.containerHome);
                nasa.init();
            }.bind(this));

            on(this.task6, "click", function (evt) {
                this.userStudy.round = 1;
                var app2 = new App();
                app2.init(this.settings, "userStudy", this.userStudy);
            }.bind(this));

            on(this.task7, "click", function (evt) {
                this.status["7"] = 1;
                this.updateUI();
                var nasa2 = new Nasa(this.settings, this.containerHome);
                nasa2.init();
            }.bind(this));

            on(this.task8, "click", function (evt) {
                this.updateUI();
                var postQuest = new PostQuest(this.settings, this.containerHome);
                postQuest.init();
            }.bind(this));

        },

        urlParser: function () {
            this.urlParams = getJsonFromUrl();
            if (Object.keys(this.urlParams).length == 0) {
                var welcome = new Welcome();
                welcome.init();
            }
        },

        // Not used right now
        storeUserInfo: function () {
            var userInfo = {
                email: this.email
            };

            // Multi purpose mail extension
            var mime = "data:application/json;charset=utf-8,";
            var saveLink = document.createElement("a");

            saveLink.setAttribute("href", mime + encodeURI(JSON.stringify(userInfo, null, 4)));
            saveLink.setAttribute("download", "data.json");
            document.body.appendChild(saveLink);

            //Click on the link
            saveLink.click();

            document.body.removeChild(saveLink);

        },

        // Function which is called to finish one task and return to the home screen. 
        // It uploads the results and prepares the GUI for the next steps
        returnToHome: function (userResult) {

            if (this.status["8"] == -1) {
                this.uploadResults(8, userResult);

                domCtr.destroy("containerQuest");
            }
            else if (this.status["7"] == 1) {
                this.uploadResults(7, userResult);
                domCtr.destroy("containerQuest");
            }
            else if (this.status["6"] == -1) {
                this.uploadResults(6, userResult);

                domCtr.destroy("viewDiv");
                domCtr.destroy("userStudy");
                domCtr.destroy("overlay");
                domCtr.destroy("overlayItems");

                dom.byId("background_home").style.display = "block";
            }
            else if (this.status["5"] == 1) {
                this.uploadResults(5, userResult);
                domCtr.destroy("containerQuest");
            }

            else if (this.status["4"] == -1) {
                this.uploadResults(4, userResult);
                domCtr.destroy("viewDiv");
                domCtr.destroy("userStudy");
                domCtr.destroy("overlay");
                domCtr.destroy("overlayItems");
                dom.byId("background_home").style.display = "block";
            }
            else if (this.status["3"] == 1) {
                this.uploadResults(3, userResult);
                domCtr.destroy("containerQuest");
            }
            else if (this.status["2"] == 1) {
                this.uploadResults(2, userResult);
                domCtr.destroy("containerQuest");
            }
            else if (this.status["1"] == 1) {
                domCtr.destroy("containerQuest");
                this.uploadResults(1, userResult);
            }
        },

        // Store the results on AGO
        uploadResults: function (taskNumber, userResult) {
            var that = this;
            var taskDesc = that["task" + taskNumber.toString()].innerHTML;
            that["task" + taskNumber.toString()].innerHTML = "Saving...";
            data = {};
            data["Task" + taskNumber.toString()] = userResult;
            that.userResultsOnline.updateFeature(that.settings.userId, data, function (result) {
                // If it was saved correctluy, change the status to the next task and enable the next button
                if (result) {
                    that.status[taskNumber.toString()] = 1;
                    if (taskNumber != 8) {
                        that.status[(taskNumber + 1).toString()] = -1;
                    }
                    that.userResultsOnline.updateFeature(that.settings.userId, { "Status": that.status }, function (result) {
                        console.log(result);
                    });

                }
                else {
                    that.status[taskNumber.toString()] = -1;
                }
                that["task" + taskNumber.toString()].innerHTML = taskDesc;
                that.updateUI();

            })
        },

        // Use the variable status to update the GUI, meaning what buttons are innactive, which ones are already done and which one can be clicked
        updateUI() {
            for (let [key, value] of Object.entries(this.status)) {
                if (value == 0) {
                    dom.byId("container" + key).children["task" + key].className = "task_button"
                    this.settings.dev ? "" : dom.byId("container" + key).children["task" + key].style.pointerEvents = "none";
                }
                else if (value == -1) {

                    dom.byId("container" + key).children["task" + key].className = "task_button active"
                    dom.byId("container" + key).children["task" + key].style.pointerEvents = "auto";

                }
                else if (value == 1) {
                    dom.byId("container" + key).children["task" + key].className = "task_button done"
                    this.settings.dev ? "" : dom.byId("container" + key).children["task" + key].style.pointerEvents = "none";

                }

                if ((key == "8") && (value == 1)) {
                    var outro = new Outro()
                    outro.init(this.settings);
                    //alert("Finished!");
                }
            }
        },

    });
});

// Read the url
function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}

// Not used right now, makes all possible permutations of an array
function permute(nums) {
    let result = [];
    if (nums.length === 0) return [];
    if (nums.length === 1) return [nums];
    for (let i = 0; i < nums.length; i++) {
        const currentNum = nums[i];
        const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
        const remainingNumsPermuted = permute(remainingNums);
        for (let j = 0; j < remainingNumsPermuted.length; j++) {
            const permutedArray = [currentNum].concat(remainingNumsPermuted[j]);
            result.push(permutedArray);
        }
    }
    return result;
}