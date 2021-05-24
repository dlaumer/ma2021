// Cookies oder local storage


define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/App",
    "urbanmobility/welcome",
    "urbanmobility/userStudy",
    "urbanmobility/Nasa",
    "urbanmobility/Ueq",
    "urbanmobility/PreQuest",
    "urbanmobility/PostQuest",
    "urbanmobility/InfoProject",
    "urbanmobility/UserResults",
    "urbanmobility/Outro",
    "urbanmobility/Video",






], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, App, welcome, userStudy, Nasa, Ueq, PreQuest, PostQuest, InfoProject, UserResults, Outro, Video) {
            
        return Accessor.createSubclass({
            declaredClass: "urbanmobility.Home",

            constructor: function () {
            },

            init: function (settings) {
                this.urlParser();

                this.settings = settings;
                
                if (this.urlParams.userId) {
                    if (this.urlParams.userId == "dev") {
                        this.settings.userId = "40";
                        this.settings.dev = true;
                    }
                    else {
                        this.settings.userId = this.urlParams.userId;
                    }
                }
                else {
                    if (document.cookie) {
                        this.settings.userId = document.cookie.split(";")[0].split("=")[1];
                    }
                    else {
                        window.location.href = window.location.href.split("?")[0];
                        this.urlParser();
                    }
                }
                
                this.settings.home = this;

                // destroy welcome page when app is started
                domCtr.destroy("background");
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

                var orders = [
                    [{dimension: "2D", version: 1}, {dimension: "3D", version: 2}],
                    [{dimension: "2D", version: 2}, {dimension: "3D", version: 1}],
                    [{dimension: "3D", version: 1}, {dimension: "2D", version: 2}],
                    [{dimension: "3D", version: 2}, {dimension: "2D", version: 1}],
                ]
                this.order = orders[parseInt(this.settings.userId) % 4];   // Evenly distribute the order of dimensions and versions
                this.userStudy = new userStudy(this.settings, this.order);
                this.userResultsOnline = new UserResults(this.settings);
                this.userResultsOnline.init();
                
                //this.storeUserInfo()
                this.createUI();
                this.clickHandler();
                var that = this;
                that.userResultsOnline.readFeature(this.settings.userId, function (feature) {
                    if (feature.attributes.Status != null) {
                        that.settings.dev ? "" : that.status = JSON.parse(feature.attributes.Status);
                        for (let [key, value] of Object.entries(that.status)) {
                            if (value != 1) {
                                that.status[key] = -1;
                                break;
                            }
                        }
                    }
                    else {
                        that.status["1"] = -1;
                        that.userResultsOnline.updateFeature(that.settings.userId, {"Orders":that.userStudy.order, "ID": that.settings.userId}, function(info) {console.log(info)})
                    }
                    that.updateUI();
                })

            },

            createUI: function () {

                var background_home = domCtr.create("div", { id: "background_home"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home"},  background_home);

                domCtr.create("div", { id: "loggedIn", innerHTML: "Your user ID is: &emsp;" +  "<span style='color: #F3511B'>"+this.settings.userId+"</span>"}, header_home);
                domCtr.create("img", { id: "logo_home", src: "images/Logo.png" }, header_home);

                this.containerHome = domCtr.create("div", { id: "containerHome"}, background_home);
                this.containerTasks = domCtr.create("div", { id: "containerTasks"}, containerHome);

                var container1 = domCtr.create("div", { id: "container1", className: "containerType"}, containerTasks);
                this.task1 = domCtr.create("div", { id: "task1", className: "task_button", innerHTML: "Task 1" }, container1);
                this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "Information about project" }, container1);

                var container2 = domCtr.create("div", { id: "container2", className: "containerType"}, containerTasks);
                this.task2 = domCtr.create("div", { id: "task2", className: "task_button", innerHTML: "Task 2" }, container2);
                this.task2_desc = domCtr.create("div", { id: "task2_desc", className: "task_desc", innerHTML: "Enter your information" }, container2);

                var container3 = domCtr.create("div", { id: "container3", className: "containerType"}, containerTasks);
                this.task3 = domCtr.create("div", { id: "task3", className: "task_button", innerHTML: "Task 3" }, container3);
                this.task3_desc = domCtr.create("div", { id: "task3_desc", className: "task_desc", innerHTML: "Watch instruction video" }, container3);

                var container4 = domCtr.create("div", { id: "container4", className: "containerType"}, containerTasks);
                this.task4 = domCtr.create("div", { id: "task4", className: "task_button", innerHTML: "Task 4" }, container4);
                this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "Tasks Round 1" }, container4);

                var container5 = domCtr.create("div", { id: "container5", className: "containerType"}, containerTasks);
                this.task5 = domCtr.create("div", { id: "task5", className: "task_button", innerHTML: "Task 5" }, container5);
                this.task5_desc = domCtr.create("div", { id: "task5_desc", className: "task_desc", innerHTML: "Questionnaire" }, container5);

                var container6 = domCtr.create("div", { id: "container6", className: "containerType"}, containerTasks);
                this.task6 = domCtr.create("div", { id: "task6", className: "task_button", innerHTML: "Task 6" }, container6);
                this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "Tasks Round 2" }, container6);

                var container7 = domCtr.create("div", { id: "container7", className: "containerType"}, containerTasks);
                this.task7 = domCtr.create("div", { id: "task7", className: "task_button", innerHTML: "Task 7" }, container7);
                this.task7_desc = domCtr.create("div", { id: "task7_desc", className: "task_desc", innerHTML: "Questionnaire" }, container7);
                
                var container8 = domCtr.create("div", { id: "container8", className: "containerType"}, containerTasks);
                this.task8 = domCtr.create("div", { id: "task8", className: "task_button", innerHTML: "Task 8" }, container8);
                this.task8_desc = domCtr.create("div", { id: "task8_desc", className: "task_desc", innerHTML: "Final questions" }, container8);
                
                var footer = domCtr.create("div", { id: "footer", className: "containerType", innerHTML: "Experiencing technical problems? <br>Please let me know at laumerd@ethz.ch"}, containerTasks);
 
                this.updateUI();

            },

            clickHandler: function () {


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

            storeUserInfo: function() {
                var userInfo = {
                    email: this.email
                };
                        
                // Multi purpose mail extension
                var mime = "data:application/json;charset=utf-8,";
                var saveLink = document.createElement("a");
            
                saveLink.setAttribute("href",mime+encodeURI(JSON.stringify(userInfo, null, 4)));
                saveLink.setAttribute("download", "data.json");
                document.body.appendChild(saveLink);
            
                //Click on the link
                saveLink.click();
            
                document.body.removeChild(saveLink);
            
            }, 
            returnToHome: function(userResult) {

                if (this.status["8"]== -1) {
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
            
            uploadResults: function(taskNumber, userResult) {
                var that = this;
                that["task" + taskNumber.toString()].innerHTML = "Saving..."
                data = {};
                data["Task" + taskNumber.toString()] = userResult;
                that.userResultsOnline.updateFeature(that.settings.userId, data, function(result){
                    if (result) {
                        that.status[taskNumber.toString()] = 1;
                        if (taskNumber != 8) {
                            that.status[(taskNumber + 1).toString()] = -1;
                        }
                        that.userResultsOnline.updateFeature(that.settings.userId, {"Status": that.status}, function(result){
                            console.log(result);
                        });

                    }
                    else {
                        that.status[taskNumber.toString()] = -1;
                    }
                    that["task" + taskNumber.toString()].innerHTML = "Task" + taskNumber.toString()    
                    that.updateUI();
 
                })
            },

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


function getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
