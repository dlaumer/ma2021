
define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/App",
    "urbanmobility/Home",


], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, App, Home) {

        // application settings
        var settings= {
            name: "Demo",
            url: "https://egregis.maps.arcgis.com",           // portal URL for config
            webscene: "03c3431c5e984f4ab52144950552e6c6",   // portal item ID of the webscene
            layerNames: {
                pt: "Public Transport (Ver 1)",
                traffic: "Traffic",
                air: "Air Pollution",
                traffic_pro: "Traffic_pro", 
                streets_pro: "Streets_pro"
            },
            colors: {
                now: "#17BEBB",
                no_project: "#0E7C7B",
                project: "#F3511B",
                highlight: "#E0CA3C",
            }
        };


        return Accessor.createSubclass({
            declaredClass: "urbanmobility.welcome",

            constructor: function () {
                
            },

            init: function () {

                this.settings = settings;
                this.createUI();
                this.clickHandler();
                this.urlParser();

            },

            createUI: function () {

                var background = domCtr.create("div", { id: "background"}, win.body());
                var container = domCtr.create("div", { id: "welcome"},  background);

                domCtr.create("img", { id: "Logo", src: "images/Logo.png" }, container);
                var containerLinks = domCtr.create("div", { id: "containerLinks"}, container);

                this.version1 = domCtr.create("div", { id: "version1", className: "link", innerHTML: "2D" }, containerLinks);
                this.version2 = domCtr.create("div", { id: "version2", className: "link", innerHTML: "3D" }, containerLinks);
                this.userStudyButton = domCtr.create("div", { id: "userStudyButton", className: "link", innerHTML: "User Study" }, container);

                domCtr.create("hr", { id: "welcomeLine"}, container);
                
                domCtr.create("div", { id: "description1", className: "description", innerHTML: "Masterthesis by Daniel Laumer" }, container);
                domCtr.create("div", { id: "description2", className: "description", innerHTML: "supervised by Fabian Göbel and Lisa Stähli" }, container);


            },

            clickHandler: function () {

                on(this.version1, "click", function (evt) {
                    window.location.href = window.location.href + "?2D";
                }.bind(this));

                on(this.version2, "click", function (evt) {
                    window.location.href = window.location.href + "?3D";
                }.bind(this));

                on(this.userStudyButton, "click", function (evt) {
                    window.location.href = window.location.href + "?userStudy";
                }.bind(this));

            },

            urlParser: function () {
                var urlParams = Object.keys(getJsonFromUrl());
                if (urlParams.length >= 1 && (urlParams[0] === "2D" || urlParams[0] === "3D")) {
                    var app = new App();
                    app.init(this.settings, urlParams[0], null);
                }
                if (urlParams.length >= 1 && (urlParams[0] === "userStudy")) {
                    var home = new Home();
                    home.init(this.settings);
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
