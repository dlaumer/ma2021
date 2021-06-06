
define([
    "esri/core/Accessor",
    "esri/config",

    "esri/WebScene",
    "esri/WebMap",
    "esri/views/SceneView",
    "esri/views/MapView",
    "esri/layers/SceneLayer",
    "esri/Basemap",
    "esri/support/popupUtils",

    "esri/widgets/Legend",
    "esri/widgets/LayerList",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

    "urbanmobility/userStudy",
    "urbanmobility/dataDrill",
    "urbanmobility/graphMaker",    
    "urbanmobility/modeManager",
    "urbanmobility/vizChanger",



], function (
    Accessor, esriConfig,
    WebScene,WebMap, SceneView, MapView, SceneLayer, Basemap, popupUtils, Legend, LayerList,
    dom, on, domCtr, win, domStyle,
    Search, userStudy, dataDrill, graphMaker, modeManager, vizChanger) {


        return Accessor.createSubclass({
            declaredClass: "urbanmobility.app",

            constructor: function () {

                this.infoText = 
                `<b>Rosengarten Project</b> <br><br> 
                This project was developed between 2010 and 2020 in order to relieve 
                the traffic on the Rosengartenstrasse. It involves a semi- circular 
                tunnel and two new tram lines.
                `;
            },

            init: function (settings, info, userStudy) {

                // destroy welcome page when app is started
                domCtr.destroy("background");

                // get settings from choice on welcome page
                this.settings = settings;
                
                if (userStudy) {
                    this.userStudy = userStudy;
                    this.userStudy.init();
                    this.settings.dimension = this.userStudy.getDimension();
                }
                else {
                    this.settings.dimension = info;

                }

                domCtr.create("div", { id: "viewDiv"}, win.body())


                if (this.settings.dimension == "2D") {
                    this.settings.webscene = "66bd9befcf064b11811f14c9a352a7fe";
                }
                else if (this.settings.dimension == "3D") {
                    this.settings.webscene = "2a36b4dbc88f4881aa4e7b9d897b50bc";
                }

                

                // set portal url
                esriConfig.portalUrl = this.settings.url;

                // fix CORS issues by adding portal url to cors enabled servers list
                esriConfig.request.corsEnabledServers.push("https://egregis.maps.arcgis.com");

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
                else if (this.settings.dimension == "3D") {
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
                        haloColor: this.settings.colors.highlight,
                        haloOpacity: 0.3,
                        fillOpacity: 1,
                      },
                    });
                }
                
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
                    // create header with title according to choice on welcome page
                    var header = domCtr.create("div", { id: "header" }, win.body());
                    domCtr.create("img", { id: "Logo2", src: "images/Logo.png"}, header);
                    //domCtr.create("div", { id: "headerTitle", innerHTML: settings}, header);

                    var modeContainer = domCtr.create("div", { id: "modeContainer" }, win.body());
                    var now = domCtr.create("div", { id: "mode_now", className: "mode", innerHTML: "Now"}, modeContainer);
                    var no_project = domCtr.create("div", { id: "mode_no_project", className: "mode", innerHTML: "No Project"}, modeContainer);
                    var project = domCtr.create("div", { id: "mode_project", className: "mode", innerHTML: "Project"}, modeContainer);
                    var selection = domCtr.create("div", { id: "mode_selection", className: "mode", style: "position: absolute; z-index:99;height:5vh;"}, modeContainer);


                    var dashboard = domCtr.create("div", { id: "dashboard" }, win.body());
                    domCtr.create("div", { id: "dashboard-text" , innerHTML: this.infoText}, dashboard);
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
                    //var air = domCtr.create("div", { id: "air",className: "layer" }, layerlistContainer);
                    //domCtr.create("img", { id:"air_image", src:"images/air.png", style:'height: 80%; width: auto; object-fit: contain'}, air);
                    //air.innerHTML = air.innerHTML + "   Air Pollution";

                    /*
                    var layerlist = new LayerList({
                        view: this.view,
                        container: layerlistContainer,
                    });
                    */
                   
                    // Adds widget below other elements in the top left corner of the view

                    // Add widget to the bottom right corner of the view

                    /*
                    this.view.ui.add(this.userStudyDiv,  {
                        position: "top-left",
                        index: 0
                    }); // Add it to the map
                    */
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
                        selection.style.background = that.settings.colors.now;
                        modeManager.changeMode("mode", "now");
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);

                    });
                    on(no_project, "click", function () {
                        selection.style.marginLeft = "35%";
                        selection.style.background = that.settings.colors.no_project;
                        modeManager.changeMode("mode", "no_project");
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);

                    });
                    on(project, "click", function () {
                        selection.style.marginLeft = "70%";
                        selection.style.background = that.settings.colors.project;
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
                        that.dataDrill.graphMaker.removeDiagrams();
                        if (that.dataDrill.highlight) {
                            that.dataDrill.highlight.remove();
                            that.dataDrill.result = null;
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
                        that.dataDrill.graphMaker.removeDiagrams();
                        if (that.dataDrill.highlight) {
                            that.dataDrill.highlight.remove();
                            that.dataDrill.result = null;
                        }
                        that.vizChanger.changeVisualization();
                        that.dataDrill.processAllData(modeManager.viewSettings.layer);


                    });
                    /*
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


                this.view.when(function () {
                    //layerlist.viewModel.operationalItems.getItemAt(3).layer.listMode = "hide"
                    //layerlist.viewModel.operationalItems.getItemAt(4).layer.listMode = "hide"

                    modeManager.setSettings(this.scene, this.view, this.settings);
                    if (this.userStudy) {
                        this.userStudy.setSceneInfo(this.scene, this.view, this.settings);
                    }

                    if (this.settings.dimension == "3D") {
                    // Change color of callouts
                    var rendererCallouts = modeManager.getLayer("Public Transport Stops").renderer.clone();
                    rendererCallouts.getSymbol().callout.color = this.settings.colors.project;
                    modeManager.getLayer("Public Transport Stops").renderer  = rendererCallouts;

                    this.scene.ground.opacity = 0.4;

                   
                }
                if (!modeManager.getLayer(this.settings.layerNames.pt).layers) {
                    // Change color of Public Transport
                    var rendererPt = modeManager.getLayer(this.settings.layerNames.pt).renderer.clone();
                    /*
                    rendererPt.visualVariables[0].stops[0].color = {r:23, g:190, b:187, a:0.2};
                    rendererPt.visualVariables[0].stops[1].color = {r:23, g:190, b:187, a:0.3};
                    rendererPt.visualVariables[0].stops[2].color = {r:23, g:190, b:187, a:0.5};
                    rendererPt.visualVariables[0].stops[3].color = {r:23, g:190, b:187, a:0.7};
                    rendererPt.visualVariables[0].stops[4].color = {r:23, g:190, b:187, a:1.0};
                    */
                    // #005353|#007b7b|#00a4a4|#00cccc|#00ffff
                    const colors = ["#C1FAF9", "#94DBDA", "#68BBBA","#3B9C9B", "#0E7C7B"];

                    rendererPt.visualVariables[0].stops[0].color = colors[0];
                    rendererPt.visualVariables[0].stops[1].color = colors[1];
                    rendererPt.visualVariables[0].stops[2].color = colors[2];
                    rendererPt.visualVariables[0].stops[3].color = colors[3];
                    rendererPt.visualVariables[0].stops[4].color = colors[4];
                 
                    modeManager.getLayer(this.settings.layerNames.pt).renderer  = rendererPt;
                }
               

 
                    this.vizChanger = new vizChanger(this.scene, this.view, this.settings);
                    that.vizChanger.changeVisualization();

                    this.dataDrill = new dataDrill(this.scene, this.view, this.settings, this.infoText);
                    for (var i = 0;  i < this.scene.layers.length; i++) {
                        `
                        if (this.scene.layers.getItemAt(i).title == this.settings.layerNames.pt_lines) {
                            const template = {
                                // autocasts as new PopupTemplate()
                                title: "Line number: {route_short_name}",
                                /*
                                content: [
                                  {
                                    type: "fields",
                                    fieldInfos: [
                                      {
                                        fieldName: "route_type_text",
                                        label: "Type of vehicle"
                                      }
                                    ]
                                  }
                                ]
                                */
                              };
                              
                              this.scene.layers.getItemAt(i).popupTemplate = template;
                              this.scene.layers.getItemAt(i).popupEnabled = true;

                        }

                        else if (this.scene.layers.getItemAt(i).title == this.settings.layerNames.pt_stops) {
                            const template = {
                                // autocasts as new PopupTemplate()
                                title: "Stop name: {CHSTNAME}",
                                /*
                                content: [
                                  {
                                    type: "fields",
                                    fieldInfos: [
                                      {
                                        fieldName: "LINIEN",
                                        label: "Lines"
                                      }
                                    ]
                                  }
                                ]
                                */
                              };
                              
                              this.scene.layers.getItemAt(i).popupTemplate = template;
                              this.scene.layers.getItemAt(i).popupEnabled = true;

                        }

                        else if (this.scene.layers.getItemAt(i).title == this.settings.layerNames.streets_pro) {
                            const template = {
                                // autocasts as new PopupTemplate()
                                title: "Rosengartentunnel, ca. 2.4 km long",
                              };
                              
                              this.scene.layers.getItemAt(i).popupTemplate = template;
                              this.scene.layers.getItemAt(i).popupEnabled = true;

                        }
                        `
                        //else {
                            this.scene.layers.getItemAt(i).popupEnabled = false;

                        //}
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

        });
    });

   



