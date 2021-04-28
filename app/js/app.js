
define([
    "esri/core/Accessor",
    "esri/config",

    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/SceneLayer",
    "esri/Basemap",

    "esri/widgets/Legend",
    "esri/widgets/LayerList",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

    "urbanmobility/dataDrill",
    "urbanmobility/graphMaker",    
    "urbanmobility/modeManager",
    "urbanmobility/vizChanger",



], function (
    Accessor, esriConfig,
    WebScene, SceneView, SceneLayer, Basemap, Legend, LayerList,
    dom, on, domCtr, win, domStyle,
    Search, dataDrill, graphMaker, modeManager, vizChanger) {

        // application settings
        var settings_demo = {
            name: "Demo",
            url: "https://egregis.maps.arcgis.com",           // portal URL for config
            webscene: "d9d1688d71d6414badc25c508b40e786",   // portal item ID of the webscene
            layerNames: {
                pt: "Public Transport",
                traffic: "Traffic",
                air: "Air Pollution",
            },
            colors: {
                now: "#17BEBB",
                no_project: "#0E7C7B",
                project: "#F3511B",
                highlight: "#E0CA3C",
            }
        };

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.app",

            constructor: function () {
            },

            init: function (settings) {


                // destroy welcome page when app is started
                domCtr.destroy("background");
                
                domCtr.create("div", { id: "viewDiv", style: "width: 100%; height: 100%" }, win.body())

                // get settings from choice on welcome page
                this.settings = this.getSettingsFromUser(settings);

                if (this.settings.version == "Version1") {
                    this.settings.layerNames.pt = "Public Transport (Ver 1)";
                }

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
                    qualityProfile: "high",
                    highlightOptions: {
                        color: this.settings.colors.highlight,
                        fillOpacity: 0.2,
                      },
                });
            

                    // environment settings for better visuals (shadows)
                    this.view.environment.lighting.ambientOcclusionEnabled = true;
                    this.view.environment.lighting.directShadowsEnabled = true;

                    // create header with title according to choice on welcome page
                    var header = domCtr.create("div", { id: "header" }, win.body());
                    domCtr.create("img", { id: "Logo2", src: "images/Logo.png"}, header);
                    domCtr.create("div", { id: "headerTitle", innerHTML: settings}, header);

                    var modeContainer = domCtr.create("div", { id: "modeContainer" }, win.body());
                    var now = domCtr.create("div", { id: "mode_now", className: "mode", innerHTML: "Now"}, modeContainer);
                    var no_project = domCtr.create("div", { id: "mode_no_project", className: "mode", innerHTML: "No Project"}, modeContainer);
                    var project = domCtr.create("div", { id: "mode_project", className: "mode", innerHTML: "Project"}, modeContainer);
                    var selection = domCtr.create("div", { id: "mode_selection", className: "mode", style: "position: absolute; z-index:99;height:5vh;"}, modeContainer);


                    var dashboard = domCtr.create("div", { id: "dashboard" }, win.body());
                    domCtr.create("div", { id: "dashboard-text" , innerHTML: "<b>Dashboard</b>"}, dashboard);
                    domCtr.create("div", { id: "dashboard-info" }, dashboard);
                    var dashboard_chart = domCtr.create("div", { id: "dashboard-chart" }, dashboard);
                    domCtr.create("svg", { id: "svgTimeline" }, dashboard_chart);
                    

                    var legendContainer = domCtr.create("div", { id: "legend" }, win.body());
                    new Legend({
                        view: this.view,
                        container: legendContainer,
                    });

                    var layerlistContainer = domCtr.create("div", { id: "layerlist" }, win.body());
                    var pt = domCtr.create("div", { id: "pt", className: "layer"}, layerlistContainer);
                    domCtr.create("img", { id:"pt_image", src:"images/pt.png", style:'height: 80%; width: auto; object-fit: contain'}, pt);
                    pt.innerHTML = pt.innerHTML + "   Public Transport";
                    var traffic = domCtr.create("div", { id: "traffic",className: "layer" }, layerlistContainer);
                    domCtr.create("img", { id:"traffic_image", src:"images/traffic.png", style:'height: 80%; width: auto; object-fit: contain'}, traffic);
                    traffic.innerHTML = traffic.innerHTML + "   Traffic";
                    var air = domCtr.create("div", { id: "air",className: "layer" }, layerlistContainer);
                    domCtr.create("img", { id:"air_image", src:"images/air.png", style:'height: 80%; width: auto; object-fit: contain'}, air);
                    air.innerHTML = air.innerHTML + "   Air Pollution";

                    /*
                    var layerlist = new LayerList({
                        view: this.view,
                        container: layerlistContainer,
                    });
                    */
                   
                    // Adds widget below other elements in the top left corner of the view

                    // Add widget to the bottom right corner of the view

                    this.view.ui.add(header, "top-right"); // Add it to the map
                    this.view.ui.add(modeContainer,"top-right");
                    this.view.ui.add(layerlistContainer,"top-right");

                    this.view.ui.add(legendContainer, "bottom-right");
                    this.view.ui.add(dashboard, "bottom-right"); // Add it to the map

                    var that = this;
                    on(header, "click", function () {
                        var URI = window.location.href;
                        var newURI = URI.substring(0, URI.lastIndexOf("?"));
                        window.location.href = newURI;
                    }.bind(this));

                    on(now, "click", function () {
                        selection.style.marginLeft = "0";
                        selection.style.background = settings_demo.colors.now;
                        modeManager.changeMode("mode", "now");
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);

                    });
                    on(no_project, "click", function () {
                        selection.style.marginLeft = "35%";
                        selection.style.background = settings_demo.colors.no_project;
                        modeManager.changeMode("mode", "no_project");
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);

                    });
                    on(project, "click", function () {
                        selection.style.marginLeft = "70%";
                        selection.style.background = settings_demo.colors.project;
                        modeManager.changeMode("mode", "project");
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);


                    });


                    on(pt, "click", function () {
                        if (modeManager.viewSettings.theme != "none") {
                            dom.byId(modeManager.viewSettings.theme).style.backgroundColor = "white";
                        }
                        if (modeManager.viewSettings.theme == "pt") {
                            pt.style.backgroundColor = "white";
                            modeManager.changeMode("theme", "none");
                        }
                        else {
                            pt.style.backgroundColor = that.settings.colors.highlight;
                            modeManager.changeMode("theme", "pt");
                            }
                        
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);


                    });
                    on(traffic, "click", function () {
                        if (modeManager.viewSettings.theme != "none") {
                            dom.byId(modeManager.viewSettings.theme).style.backgroundColor = "white";
                        }
                        if (modeManager.viewSettings.theme == "traffic") {
                            traffic.style.backgroundColor = "white";
                            modeManager.changeMode("theme", "none");
                        }
                        else {
                            traffic.style.backgroundColor = that.settings.colors.highlight;
                            modeManager.changeMode("theme", "traffic");
                        }
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);


                    });
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


                this.view.when(function () {
                    //layerlist.viewModel.operationalItems.getItemAt(3).layer.listMode = "hide"
                    //layerlist.viewModel.operationalItems.getItemAt(4).layer.listMode = "hide"

                    modeManager.setSettings(this.scene, this.view, this.settings);

                    var rendererCallouts = modeManager.getLayer("Public Transport Stops").renderer.clone();
                    rendererCallouts.getSymbol().callout.color = this.settings.colors.project;
                    modeManager.getLayer("Public Transport Stops").renderer  = rendererCallouts;


                    this.vizChanger = new vizChanger(this.scene, this.view, this.settings);
                    
                    this.dataDrill = new dataDrill(this.scene, this.view, this.settings);
                    for (var i = 0;  i < this.scene.layers.length; i++) {
                        this.scene.layers.getItemAt(i).popupEnabled = false;
                        //this.dataDrill.processAllData(this.scene.layers.getItemAt(i));
                    }

                    this.dataDrill.clickHandler();

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });

                var that = this;
                that.timeOutFunctionId = null;
                window.addEventListener('resize', debounce(function(event){
                    that.dataDrill.renderDiagrams(true);
                }));

                function debounce(func){
                    var timer;
                    return function(event){
                    if(timer) clearTimeout(timer);
                    timer = setTimeout(func,500,event);
                    };
                }
            

            },

            getSettingsFromUser: function (settings) {
                if (settings === "Version1" || settings === "Version2"){
                    settings_demo.version = settings;
                    return settings_demo;
                }
            }
        });
    });




