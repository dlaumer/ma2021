
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



], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, App, welcome, userStudy, Nasa, Ueq, PreQuest, PostQuest, InfoProject) {
            

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.Home",

            constructor: function () {
                this.userId = 1;
            },

            init: function (settings) {
                this.settings = settings;
                this.settings.home = this;

                // destroy welcome page when app is started
                domCtr.destroy("background");
                this.status = {};

                this.userStudy = new userStudy(this.settings);
                //this.storeUserInfo()
                this.createUI();
                this.clickHandler();
                this.urlParser();

            },

            createUI: function () {

                var background_home = domCtr.create("div", { id: "background_home"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home"},  background_home);

                domCtr.create("div", { id: "loggedIn", innerHTML: "Your user ID is: " +  "<span style='color: #F3511B'>"+this.userId+"</span>"}, header_home);
                domCtr.create("img", { id: "logo_home", src: "images/Logo.png" }, header_home);

                this.containerHome = domCtr.create("div", { id: "containerHome"}, background_home);
                this.containerTasks = domCtr.create("div", { id: "containerTasks"}, containerHome);

                var container1 = domCtr.create("div", { id: "container1", className: "containerType"}, containerTasks);
                this.task1 = domCtr.create("div", { id: "task1", className: "task_button", innerHTML: "Task 1" }, container1);
                this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "Enter your information" }, container1);
                this.status.task1 = {done: -1, container: container1}

                var container2 = domCtr.create("div", { id: "container2", className: "containerType"}, containerTasks);
                this.task2 = domCtr.create("div", { id: "task2", className: "task_button", innerHTML: "Task 2" }, container2);
                this.task2_desc = domCtr.create("div", { id: "task2_desc", className: "task_desc", innerHTML: "Information about project" }, container2);
                this.status.task2 = {done: 0, container: container2}

                var container3 = domCtr.create("div", { id: "container3", className: "containerType"}, containerTasks);
                this.task3 = domCtr.create("div", { id: "task3", className: "task_button", innerHTML: "Task 3" }, container3);
                this.task3_desc = domCtr.create("div", { id: "task3_desc", className: "task_desc", innerHTML: "Tasks Round 1" }, container3);
                this.status.task3 = {done: 0, container: container3}

                var container4 = domCtr.create("div", { id: "container4", className: "containerType"}, containerTasks);
                this.task4 = domCtr.create("div", { id: "task4", className: "task_button", innerHTML: "Task 4" }, container4);
                this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "Questionnaire" }, container4);
                this.status.task4 = {done: 0, container: container4}

                var container5 = domCtr.create("div", { id: "container5", className: "containerType"}, containerTasks);
                this.task5 = domCtr.create("div", { id: "task5", className: "task_button", innerHTML: "Task 5" }, container5);
                this.task5_desc = domCtr.create("div", { id: "task5_desc", className: "task_desc", innerHTML: "Tasks Round 2" }, container5);
                this.status.task5 = {done: 0, container: container5}

                var container6 = domCtr.create("div", { id: "container6", className: "containerType"}, containerTasks);
                this.task6 = domCtr.create("div", { id: "task6", className: "task_button", innerHTML: "Task 6" }, container6);
                this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "Questionnaire" }, container6);
                this.status.task6 = {done: 0, container: container6}
                
                var container7 = domCtr.create("div", { id: "container7", className: "containerType"}, containerTasks);
                this.task7 = domCtr.create("div", { id: "task7", className: "task_button", innerHTML: "Task 7" }, container7);
                this.task7_desc = domCtr.create("div", { id: "task7_desc", className: "task_desc", innerHTML: "Final questions" }, container7);
                this.status.task7 = {done: 0, container: container7}

                this.updateUI();

            },

            clickHandler: function () {


                on(this.task1, "click", function (evt) {
                    this.status.task1.done = 1;
                    this.updateUI();
                    var preQuest = new PreQuest(this.settings, this.containerHome);
                    preQuest.init();
                }.bind(this));

                on(this.task2, "click", function (evt) {
                    this.status.task2.done = 1;
                    this.updateUI();
                    var infoProject = new InfoProject(this.settings, this.containerHome);
                    infoProject.init();
                }.bind(this));

                on(this.task3, "click", function (evt) {
                    var app = new App();
                    app.init(this.settings, "userStudy", this.userStudy);
                }.bind(this));

                on(this.task4, "click", function (evt) {
                    this.status.task4.done = 1;
                    this.updateUI();
                    var nasa = new Nasa(this.settings, this.containerHome);
                    nasa.init();
                }.bind(this));

                on(this.task5, "click", function (evt) {
                    var app2 = new App();
                    app2.init(this.settings, "userStudy", this.userStudy);
                }.bind(this));
               
                on(this.task6, "click", function (evt) {
                    this.status.task6.done = 1;
                    this.updateUI();
                    var nasa2 = new Nasa(this.settings, this.containerHome);
                    nasa2.init();
                }.bind(this));

                on(this.task7, "click", function (evt) {
                    this.status.task7.done = 1;
                    this.updateUI();
                    var postQuest = new PostQuest(this.settings, this.containerHome);
                    postQuest.init();
                }.bind(this));

            },

            urlParser: function () {
                var urlParams = Object.keys(getJsonFromUrl());
                if (urlParams.length == 0) {
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
            returnToHome: function() {

                if (this.status.task7.done == 1) {
                    alert("Finished!");
                    domCtr.destroy("containerQuest");
                }
                else if (this.status.task6.done == 1) {
                    this.status.task7.done = -1;
                    domCtr.destroy("containerQuest");
                }
                else if (this.status.task5.done == -1) {
                    this.status.task5.done = 1;
                    this.status.task6.done = -1;
                    domCtr.destroy("viewDiv");
                    domCtr.destroy("userStudy");
                    domCtr.destroy("overlay");
                    domCtr.destroy("overlayItems");

                    dom.byId("background_home").style.display = "block";
                }
                else if (this.status.task4.done == 1) {
                    this.status.task5.done = -1;
                    domCtr.destroy("containerQuest");
                }

                else if (this.status.task3.done == -1) {
                    this.status.task3.done = 1;
                    this.status.task4.done = -1;
                    domCtr.destroy("viewDiv");
                    domCtr.destroy("userStudy");
                    domCtr.destroy("overlay");
                    domCtr.destroy("overlayItems");
                    dom.byId("background_home").style.display = "block";
                }
                else if (this.status.task2.done == 1) {
                    this.status.task3.done = -1;
                    domCtr.destroy("containerQuest");
                }
                else if (this.status.task1.done == 1) {
                    this.status.task2.done = -1;
                    domCtr.destroy("containerQuest");
                }
                this.updateUI();
                

            }, 
            

            updateUI() {
                for (let [key, value] of Object.entries(this.status)) {
                    if (value.done == 0) {
                        value.container.style.visibility = "hidden"
                    }
                    else if (value.done == -1) {
                        value.container.style.visibility = "visible"

                        value.container.children[key].style.pointerEvents = 'auto';
                        value.container.children[key].style.borderColor = this.settings.colors.project;	

                    }
                    else if (value.done = 1) {
                        value.container.style.visibility = "visible"
                        value.container.children[key].style.pointerEvents = 'none';
                        value.container.children[key].style.borderColor = "grey";	

                        value.container.style.opacity = 0.5
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
