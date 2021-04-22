
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
                var containerLinks = domCtr.create("div", { id: "containerLinks"}, container);

                this.version1 = domCtr.create("div", { id: "version1", className: "link", innerHTML: "Version 1" }, containerLinks);
                this.version2 = domCtr.create("div", { id: "version2", className: "link", innerHTML: "Version 2" }, containerLinks);

                domCtr.create("hr", { id: "welcomeLine"}, container);
                
                domCtr.create("div", { id: "description1", className: "description", innerHTML: "Masterthesis by Daniel Laumer" }, container);
                domCtr.create("div", { id: "description2", className: "description", innerHTML: "supervised by Fabian Göbel and Lisa Stähli" }, container);


            },

            clickHandler: function () {

                on(this.version1, "click", function (evt) {
                    window.location.href = window.location.href + "?Version1";
                }.bind(this));

                on(this.version2, "click", function (evt) {
                    window.location.href = window.location.href + "?Version2";
                }.bind(this));

            },

            urlParser: function () {
                var urlParams = Object.keys(getJsonFromUrl());
                if (urlParams.length >= 1 && (urlParams[0] === "Version1" || urlParams[0] === "Version2")) {
                    var app = new App();
                    app.init(urlParams[0]);
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
