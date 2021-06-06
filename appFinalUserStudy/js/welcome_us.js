
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/Home",


], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, Home) {

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.welcome",

            constructor: function () {
                
            },

            init: function () {

                this.createUI();
                this.clickHandler();
                this.urlParser();

            },

            createUI: function () {

                var background = domCtr.create("div", { id: "background"}, win.body());
                var container = domCtr.create("div", { id: "welcome"},  background);

                domCtr.create("img", { id: "Logo", src: "images/Logo.png" }, container);
                this.email = domCtr.create("input", { id: "email", name:"email",  placeholder:"Email Address" }, container);

                var containerLinks = domCtr.create("div", { id: "containerLinks"}, container);

                this.newUser = domCtr.create("div", { id: "newUser", className: "link", innerHTML: "New User" }, containerLinks);
                this.existingUser = domCtr.create("div", { id: "existingUser", className: "link", innerHTML: "Existing User" }, containerLinks);

                domCtr.create("hr", { id: "welcomeLine"}, container);
                
                domCtr.create("div", { id: "description1", className: "description", innerHTML: "Masterthesis by Daniel Laumer" }, container);
                domCtr.create("div", { id: "description2", className: "description", innerHTML: "supervised by Fabian Göbel and Lisa Stähli" }, container);


            },

            clickHandler: function () {

                on(this.newUser, "click", function (evt) {
                    if (this.email.value == "") {
                        alert("Please provide an email")
                    }
                    else {
                        window.location.href = window.location.href + "?Login=" + this.email.value;
                    }
                }.bind(this));

                on(this.existingUser, "click", function (evt) {
                    if (this.email.value == "") {
                        alert("Please provide an email")
                    }
                    else {
                        window.location.href = window.location.href + "?Login=" + this.email.value;
                    }
                }.bind(this));

            },

            urlParser: function () {
                var urlParams = Object.keys(getJsonFromUrl());
                if (urlParams.length >= 1 && (urlParams[0] === "Login")) {
                    var home = new Home();
                    home.init(getJsonFromUrl());
                }
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
