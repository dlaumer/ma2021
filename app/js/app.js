
define([
    "esri/core/Accessor",
    "esri/config",

    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/SceneLayer",
    "esri/Basemap",

    "esri/widgets/BasemapToggle",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/LayerList",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

], function (
    Accessor, esriConfig,
    WebScene, SceneView, SceneLayer, Basemap,
    BasemapToggle, Home, Legend, LayerList,
    dom, on, domCtr, win, domStyle,
    Search) {

        // application settings
        var settings_demo = {
            name: "Demo",
            url: "https://egregis.maps.arcgis.com",           // portal URL for config
            webscene: "d9d1688d71d6414badc25c508b40e786",   // portal item ID of the webscene
        };

        return Accessor.createSubclass({
            declaredClass: "c-through.App",

            constructor: function () {

            },

            init: function (settings) {

                // destroy welcome page when app is started
                domCtr.destroy("background");
                
                domCtr.create("div", { id: "viewDiv", style: "width: 100%; height: 100%" }, win.body())

                // get settings from choice on welcome page
                this.settings = this.getSettingsFromUser(settings);

                // set portal url
                esriConfig.portalUrl = this.settings.url;

                // fix CORS issues by adding portal url to cors enabled servers list
                esriConfig.request.corsEnabledServers.push("https://egregis.maps.arcgis.com");

                // load scene with portal ID
                this.scene = new WebScene({
                    portalItem: {
                        id: this.settings.webscene
                    },
                    basemap: ""
                });

                // create a view
                this.view = new SceneView({
                    container: "viewDiv",
                    map: this.scene,
                    qualityProfile: "high"
                });

                // environment settings for better visuals (shadows)
                this.view.environment.lighting.ambientOcclusionEnabled = true;
                this.view.environment.lighting.directShadowsEnabled = true;

                // create header with title according to choice on welcome page
                var header = domCtr.create("div", { id: "header" }, win.body());
                domCtr.create("img", { id: "Logo2", src: "images/Logo.png"}, header);
                domCtr.create("div", { id: "headerTitle", innerHTML: settings}, header);

                var modeContainer = domCtr.create("div", { id: "modeContainer" }, win.body());
                domCtr.create("div", { id: "mode_now", className: "mode", innerHTML: "Now"}, modeContainer);
                domCtr.create("div", { id: "mode_no_project", className: "mode", innerHTML: "No Project"}, modeContainer);
                domCtr.create("div", { id: "mode_project", className: "mode", innerHTML: "Project"}, modeContainer);


                var dashboard = domCtr.create("div", { id: "dashboard", innerHTML: "Dashboard" }, win.body());
                

                var legendContainer = domCtr.create("div", { id: "legend" }, win.body());
                new Legend({
                    view: this.view,
                    container: legendContainer,
                  });
                
                var layerlistContainer = domCtr.create("div", { id: "layerlist" }, win.body());

                new LayerList({
                    view: this.view,
                    container: layerlistContainer,
                });
                  // Adds widget below other elements in the top left corner of the view
        
                  // Add widget to the bottom right corner of the view

                this.view.ui.add(header, "top-right"); // Add it to the map
                this.view.ui.add(modeContainer,"top-right");
                this.view.ui.add(layerlistContainer,"top-right");

                this.view.ui.add(legendContainer, "bottom-right");
                this.view.ui.add(dashboard, "bottom-right"); // Add it to the map


                on(header, "click", function () {
                    var URI = window.location.href;
                    var newURI = URI.substring(0, URI.lastIndexOf("?"));
                    window.location.href = newURI;
                }.bind(this));


            },

            getSettingsFromUser: function (settings) {
                if (settings === "Version1" || settings === "Version2"){
                    return settings_demo;
                }
            }
        });
    });




