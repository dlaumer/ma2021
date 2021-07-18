/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Application/App.js
--------------
Main file for the application UrbanMobility. Loads the map/scene, creates all the main interactive elements, 
edits the map/scene by changing some symbolizations and instatiates all the other classes from the folder 
Application. Here also the ID's of the map/scene is hardcoded

*/
define([
    "esri/core/Accessor",
    "esri/config",

    "esri/WebScene",
    "esri/WebMap",
    "esri/views/SceneView",
    "esri/views/MapView",

    "esri/widgets/Legend",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",

    "urbanmobility/Application/DataDrill",
    "urbanmobility/Application/ModeManager",
    "urbanmobility/Application/VizChanger",


], function (
    Accessor, esriConfig,
    WebScene, WebMap, SceneView, MapView, Legend,
    dom, on, domCtr, win, dataDrill, modeManager, vizChanger) {


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.app",

        constructor: function () {
            // default text for the dashboard
            this.infoText =
                `<b>Rosengarten Project</b> <br><br> 
                This project was developed between 2010 and 2020 in order to relieve 
                the traffic on the Rosengartenstrasse. It involves a semi- circular 
                tunnel and two new tram lines.
                `;
        },

        // main function, basically creates everything
        init: function (settings, info, userStudy) {

            // destroy welcome page when app is started
            domCtr.destroy("background");

            // in the case of usee study, the interface looks a bit differently
            this.settings = settings;
            this.settings.colorMode = "light"
            if (userStudy) {
                this.userStudy = userStudy;
                this.userStudy.init();
                this.settings.dimension = this.userStudy.getDimension();
            }
            else {
                console.log(info);
                this.settings.dimension = info[0];
                if (info.length > 1) {
                    this.settings.colorMode = info[1];
                }
            }

            // Holds the map, stretches over the whole screen
            domCtr.create("div", { id: "viewDiv" }, win.body())

            // Hardcoded ID's for the webmap/webscene
            if (this.settings.dimension == "2D") {
                this.settings.webscene = "66bd9befcf064b11811f14c9a352a7fe";
            }
            else if (this.settings.dimension == "3D") {
                if (this.settings.colorMode == "dark") {
                    this.settings.webscene = "b5ed00ef861f4aabaea26e73c64ad784";
                }
                else {
                    this.settings.webscene = "2a36b4dbc88f4881aa4e7b9d897b50bc";
                }
            }

            // if the chosen mode is dark mode, user ther css
            if (this.settings.colorMode == "dark") {
                domCtr.destroy("style_light");

                var element = document.createElement('link');
                element.href = 'css/style_dark.css';
                element.rel = 'stylesheet';
                element.type = 'text/css';

                document.body.appendChild(element);

            }

            // set portal url
            esriConfig.portalUrl = this.settings.url;

            // fix CORS issues by adding portal url to cors enabled servers list
            esriConfig.request.corsEnabledServers.push("https://egregis.maps.arcgis.com");

            // Load the 2D webmap
            if (this.settings.dimension == "2D") {
                // load scene with portal ID
                this.scene = new WebMap({
                    portalItem: {
                        id: this.settings.webscene
                    },
                });

                // create a view
                this.view = new MapView({
                    container: "viewDiv",
                    map: this.scene,
                    highlightOptions: {
                        color: this.settings.colors.highlight,
                        haloColor: this.settings.colors.highlight,
                        haloOpacity: 1,
                        fillOpacity: 0.2,

                    },

                });

            }
            // Load the 3D webscene
            else if (this.settings.dimension == "3D") {
                // load scene with portal ID
                this.scene = new WebScene({
                    portalItem: {
                        id: this.settings.webscene
                    },
                    basemap: ""
                });

                if (this.settings.colorMode == "dark") {
                    // create a view
                    this.view = new SceneView({
                        container: "viewDiv",
                        map: this.scene,
                        qualityProfile: "high",
                        highlightOptions: {
                            color: this.settings.colors.highlight,
                            haloColor: this.settings.colors.highlight,
                            haloOpacity: 0.3,
                            fillOpacity: 1,
                        },
                        environment: {
                            background: {
                                type: "color",
                                color: [71, 71, 71, 1]
                            },
                            starsEnabled: true,
                            atmosphereEnabled: false
                        }
                    });
                }
                else {
                    // create a view
                    this.view = new SceneView({
                        container: "viewDiv",
                        map: this.scene,
                        qualityProfile: "high",
                        highlightOptions: {
                            color: this.settings.colors.highlight,
                            haloColor: this.settings.colors.highlight,
                            haloOpacity: 0.3,
                            fillOpacity: 1,
                        },
                    });
                }

            }
            // Option to load no map, faster loading, just for dev/debug
            else if (this.settings.dimension == "noMap") {
                // load scene with portal ID
                this.scene = new WebScene({
                    basemap: ""
                });

                // create a view
                this.view = new SceneView({
                    container: "viewDiv"
                });
            }

            // environment settings for better visuals (shadows)
            if (this.settings.dimension == "3D") {
                this.view.environment.lighting.ambientOcclusionEnabled = true;
                this.view.environment.lighting.directShadowsEnabled = true;
            }

            /**** CREATE GUI *************************************/
            var header = domCtr.create("div", { id: "header" }, win.body());
            domCtr.create("img", { id: "Logo2", src: this.settings.colorMode == "dark" ? "images/Logo_dark.png" : "images/Logo.png" }, header);

            var modeContainer = domCtr.create("div", { id: "modeContainer" }, win.body());
            var now = domCtr.create("div", { id: "mode_now", className: "mode", innerHTML: "Now" }, modeContainer);
            var no_project = domCtr.create("div", { id: "mode_no_project", className: "mode", innerHTML: "No Project" }, modeContainer);
            var project = domCtr.create("div", { id: "mode_project", className: "mode", innerHTML: "Project" }, modeContainer);
            var selection = domCtr.create("div", { id: "mode_selection", className: "mode", style: "position: absolute; z-index:99;height:5vh;" }, modeContainer);


            var dashboard = domCtr.create("div", { id: "dashboard" }, win.body());
            domCtr.create("div", { id: "dashboard-text", innerHTML: this.infoText }, dashboard);
            domCtr.create("div", { id: "dashboard-info" }, dashboard);
            var dashboard_chart = domCtr.create("div", { id: "dashboard-chart" }, dashboard);
            domCtr.create("svg", { id: "svgTimeline" }, dashboard_chart);


            // use arcgis js api to make legend automatically
            var legendContainer = domCtr.create("div", { id: "legend" }, win.body());
            new Legend({
                view: this.view,
                container: legendContainer,
            });

            var layerlistContainer = domCtr.create("div", { id: "layerlist" }, win.body());
            var pt = domCtr.create("div", { id: "pt", className: "layer" }, layerlistContainer);
            domCtr.create("img", { id: "pt_image", src: this.settings.colorMode == "dark" ? "images/pt_dark.png" : "images/pt.png", style: 'height: 80%; width: auto; object-fit: contain' }, pt);
            pt.innerHTML = pt.innerHTML + "   Public Transport";
            var traffic = domCtr.create("div", { id: "traffic", className: "layer" }, layerlistContainer);
            domCtr.create("img", { id: "traffic_image", src: this.settings.colorMode == "dark" ? "images/traffic_dark.png" : "images/traffic.png", style: 'height: 80%; width: auto; object-fit: contain' }, traffic);
            traffic.innerHTML = traffic.innerHTML + "   Traffic";
            
            // Add all the elements on top of the map
            this.view.ui.add(header, "top-right"); // Add it to the map
            this.view.ui.add(modeContainer, "top-right");
            this.view.ui.add(layerlistContainer, "top-right");

            this.view.ui.add(legendContainer, "bottom-right");
            this.view.ui.add(dashboard, "bottom-right"); // Add it to the map

            /**** CREATE INTERACTIVITY *************************************/
            var that = this;
            // CLick on logo to go back
            on(header, "click", function () {
                var URI = window.location.href;
                var newURI = URI.substring(0, URI.lastIndexOf("?"));
                window.location.href = newURI;
            }.bind(this));

            // Change mode to now
            on(now, "click", function () {
                selection.style.marginLeft = "0";
                selection.style.background = that.settings.colors.now;
                modeManager.changeMode("mode", "now");
                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);

            });
            // Change mode to no project
            on(no_project, "click", function () {
                selection.style.marginLeft = "35%";
                selection.style.background = that.settings.colors.no_project;
                modeManager.changeMode("mode", "no_project");
                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);

            });
            // Change mode to project
            on(project, "click", function () {
                selection.style.marginLeft = "70%";
                selection.style.background = that.settings.colors.project;
                modeManager.changeMode("mode", "project");
                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);
            });

            // Change theme to public transport
            on(pt, "click", function () {
                if (modeManager.viewSettings.theme != "none") {
                    dom.byId(modeManager.viewSettings.theme).style.backgroundColor = "";
                }
                if (modeManager.viewSettings.theme == "pt") {
                    pt.style.backgroundColor = "white";
                    modeManager.changeMode("theme", "none");
                }
                else {
                    pt.style.backgroundColor = that.settings.colors.highlight;
                    modeManager.changeMode("theme", "pt");
                }
                that.dataDrill.graphMaker.removeDiagrams();
                if (that.dataDrill.highlight) {
                    that.dataDrill.highlight.remove();
                    that.dataDrill.result = null;
                }
                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);

            });
            // Change theme to traffic
            on(traffic, "click", function () {
                if (modeManager.viewSettings.theme != "none") {
                    dom.byId(modeManager.viewSettings.theme).style.backgroundColor = "";
                }
                if (modeManager.viewSettings.theme == "traffic") {
                    traffic.style.backgroundColor = "white";
                    modeManager.changeMode("theme", "none");
                }
                else {
                    traffic.style.backgroundColor = that.settings.colors.highlight;
                    modeManager.changeMode("theme", "traffic");
                }
                that.dataDrill.graphMaker.removeDiagrams();
                if (that.dataDrill.highlight) {
                    that.dataDrill.highlight.remove();
                    that.dataDrill.result = null;
                }
                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);


            });
            /*
            // Change theme to air pollution (not used anymore)
            on(air, "click", function () {
                if (modeManager.viewSettings.theme != "none") {
                    dom.byId(modeManager.viewSettings.theme).style.backgroundColor = "white";
                }
                if (modeManager.viewSettings.theme == "air") {
                    air.style.backgroundColor = "white";
                    modeManager.changeMode("theme", "none");
                }
                else {
                    air.style.backgroundColor = that.settings.colors.highlight;
                    modeManager.changeMode("theme", "air");
                }

                that.vizChanger.changeVisualization();
                that.dataDrill.processAllData(modeManager.viewSettings.layer);


            });
            */

            // When scene is loaded
            this.view.when(function () {

                modeManager.setSettings(this.scene, this.view, this.settings);
                if (this.userStudy) {
                    this.userStudy.setSceneInfo(this.scene, this.view, this.settings);
                }

                // Change some symbolizations
                if (this.settings.dimension == "3D") {
                    // Change color of callouts
                    var rendererCallouts = modeManager.getLayer("Public Transport Stops").renderer.clone();
                    rendererCallouts.getSymbol().callout.color = this.settings.colors.project;
                    modeManager.getLayer("Public Transport Stops").renderer = rendererCallouts;

                    this.scene.ground.opacity = 0.4;

                }
                if (!modeManager.getLayer(this.settings.layerNames.pt).layers) {
                    // Change color of Public Transport
                    var rendererPt = modeManager.getLayer(this.settings.layerNames.pt).renderer.clone();
                    
                    const colors = ["#C1FAF9", "#94DBDA", "#68BBBA", "#3B9C9B", "#0E7C7B"];

                    rendererPt.visualVariables[0].stops[0].color = colors[0];
                    rendererPt.visualVariables[0].stops[1].color = colors[1];
                    rendererPt.visualVariables[0].stops[2].color = colors[2];
                    rendererPt.visualVariables[0].stops[3].color = colors[3];
                    rendererPt.visualVariables[0].stops[4].color = colors[4];

                    modeManager.getLayer(this.settings.layerNames.pt).renderer = rendererPt;
                }



                this.vizChanger = new vizChanger(this.scene, this.view, this.settings);
                that.vizChanger.changeVisualization();

                this.dataDrill = new dataDrill(this.scene, this.view, this.settings, this.infoText);
                for (var i = 0; i < this.scene.layers.length; i++) {
                    
                    this.scene.layers.getItemAt(i).popupEnabled = false;
                }

                this.dataDrill.clickHandler();

            }.bind(this)).catch(function (err) {
                console.error(err);
            });

            // Make sure that the gui looks nice again after the map is resized
            var that = this;
            that.timeOutFunctionId = null;
            window.addEventListener('resize', debounce(function (event) {
                that.dataDrill.renderDiagrams(true);
            }));

            function debounce(func) {
                var timer;
                return function (event) {
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(func, 500, event);
                };
            }

        },

    });
});





