
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/App",
    "urbanmobility/welcome_us",

], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, App, welcome) {

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.Home",

            email: null,

            constructor: function () {
                
            },

            init: function (urlJson) {

                // destroy welcome page when app is started
                domCtr.destroy("background");

                this.email = urlJson.Login;

                this.storeUserInfo()
                this.createUI();
                this.clickHandler();
                this.urlParser();


            },

            createUI: function () {

                var background_home = domCtr.create("div", { id: "background_home"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home"},  background_home);

                this.logout = domCtr.create("div", { id: "logout", className: "link", innerHTML: "Logout" }, header_home);
                domCtr.create("div", { id: "loggedIn", innerHTML: "Logged in as: " +  "<span style='color: #F3511B'>"+this.email+"</span>"}, header_home);
                domCtr.create("img", { id: "logo_home", src: "images/Logo.png" }, header_home);


                var container1 = domCtr.create("div", { id: "container1", className: "containerType"}, background_home);
                this.task1 = domCtr.create("div", { id: "Task1", className: "task_button", innerHTML: "Task 1" }, container1);
                this.task1_desc = domCtr.create("div", { id: "task1_desc", className: "task_desc", innerHTML: "Enter your information" }, container1);

                var container2 = domCtr.create("div", { id: "container2", className: "containerType"}, background_home);
                this.task2 = domCtr.create("div", { id: "Task2", className: "task_button", innerHTML: "Task 2" }, container2);
                this.task2_desc = domCtr.create("div", { id: "task2_desc", className: "task_desc", innerHTML: "Read about the thesis and the project" }, container2);

                var container3 = domCtr.create("div", { id: "container3", className: "containerType"}, background_home);
                this.task3 = domCtr.create("div", { id: "Task3", className: "task_button", innerHTML: "Task 3" }, container3);
                this.task3_desc = domCtr.create("div", { id: "task3_desc", className: "task_desc", innerHTML: "Answer first question" }, container3);

                var container4 = domCtr.create("div", { id: "container4", className: "containerType"}, background_home);
                this.task4 = domCtr.create("div", { id: "Task4", className: "task_button", innerHTML: "Task 4" }, container4);
                this.task4_desc = domCtr.create("div", { id: "task4_desc", className: "task_desc", innerHTML: "Answer second question" }, container4);

                var container5 = domCtr.create("div", { id: "container5", className: "containerType"}, background_home);
                this.task5 = domCtr.create("div", { id: "Task5", className: "task_button", innerHTML: "Task 5" }, container5);
                this.task5_desc = domCtr.create("div", { id: "task5_desc", className: "task_desc", innerHTML: "Answer third question" }, container5);

                var container6 = domCtr.create("div", { id: "container6", className: "containerType"}, background_home);
                this.task6 = domCtr.create("div", { id: "Task6", className: "task_button", innerHTML: "Task 6" }, container6);
                this.task6_desc = domCtr.create("div", { id: "task6_desc", className: "task_desc", innerHTML: "Fill in the questionnaire" }, container6);

               

            },

            clickHandler: function () {

                on(this.logout, "click", function (evt) {
                    window.location.href = window.location.href.split("?")[0];
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
            

            }


           
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
