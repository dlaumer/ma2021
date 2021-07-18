/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Application/DataDrill.js
--------------
Reads the attributes from the feature layer on ArcGIS Online. Also does some data calculation and processing 
on the fly, like for example averaging

*/
define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom",

    "urbanmobility/Application/GraphMaker",
    "urbanmobility/Application/ModeManager",

], function (
    Accessor, Query,
    dom, graphMaker, modeManager
) {
    return Accessor.createSubclass({
        declaredClass: "urbanmobility.DataDrill",

        constructor: function (scene, view, settings, infoText) {
            this.scene = scene;
            this.view = view;
            this.settings = settings;
            this.graphMaker = new graphMaker(scene, view, settings)
            this.currentData = null;
            this.infoText = infoText
        },

        // handles what is done when someone clicks on the map
        clickHandler: function () {
            var view = this.view;
            view.on("click", function (event) {
                view.hitTest(event.screenPoint).then(function (response) {
                    var res = response.results[0];
                    // If there was an element clicked and also this element is either part of the traffic or public transport layers
                    if (res && (res.graphic.layer.title == this.settings.layerNames.pt || res.graphic.layer.title == this.settings.layerNames.traffic || res.graphic.layer.title == this.settings.layerNames.traffic_pro)) {
                        this.result = res;
                        var that = this;
                        // Handle the visualization what element is clicked
                        that.view.whenLayerView(this.result.graphic.layer).then((layerView) => {
                            if (that.highlight) {
                                that.highlight.remove();
                            }
                            that.highlight = layerView.highlight([this.result.graphic.getObjectId()]);
                            // Do the actuall data drilling!
                            that.processGraphic(this.result.graphic, this.result.graphic.layer.title, function (data) {
                                that.currentData = data;
                                // adapt the dashboard accordingly (with the detailed data)
                                that.renderDiagrams(false);
                            });
                        });
                    }
                    // If nothing is clicked, remove the highlight
                    else {
                        if (this.highlight) {
                            this.highlight.remove();
                            this.result = null;
                        }
                        this.currentData = this.allData;
                        // adapt the dashboard accordingly (with average data)
                        this.renderDiagrams(false);
                    }

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }.bind(this));
        },
        
        // Takes the clicked element and reads the attributes 
        processGraphic: function (graphic, layerName, callback) {

            var selectedOID = graphic.getObjectId();

            // Prepare query to read attributes
            var query = new Query();

            query.objectIds = [selectedOID];
            query.returnGeometry = false;
            // Read all fields
            query.outFields = ["*"];

            // perform the query
            graphic.layer.queryFeatures(query).then(function (results) {

                if (results.features[0] === undefined) {
                    console.log("Wrong ObjectID");
                }

                // Case public transport
                if (layerName == this.settings.layerNames.pt) {
                    var data = {}
                    // Prepare the data in a form that it can be used for the dashboard
                    data.hourData = this.parsePTData(results);
                    // Set the data
                    data.all = results.features[0].attributes[modeManager.viewSettings.prefix + modeManager.viewSettings.attribute];
                    data.text = "<b>Occupancy</b> <br> <span style='font-size: smaller'>Average of occupied spaces </span> <br><br> From: " + results.features[0].attributes["Fr_name"] + "<br>To:    " + results.features[0].attributes["To_name"];
                }
                // Case traffic
                if (layerName == this.settings.layerNames.traffic || layerName == this.settings.layerNames.traffic_pro) {
                    var data = {}
                    // Prepare the data in a form that it can be used for the dashboard
                    data.hourData = this.parseTrafficData(results);
                    // Set the data
                    data.all_avg = (results.features[0].attributes[modeManager.viewSettings.prefix + "all_x"] + results.features[0].attributes[modeManager.viewSettings.prefix + "all_y"]) / 2;
                    data.text = "<b>Number of cars</b><br> <span style='font-size: smaller'>Average per day </span> <br><br> From: " + results.features[0].attributes["Fr_name"] + "<br>To:    " + results.features[0].attributes["To_name"];
                }
                results.features[0].visible = false;
                callback(data);

            }.bind(this)).catch(function (err) {
                console.error(err);
            });
        },

        // This reads and processes all the data from all features, and calculating the averages
        processAllData: function (layer) {
            // If neither pt or traffic is selected, set the dashboard to the default text, remove diagrams
            if (layer == "none" || layer.title == this.settings.layerNames.air) {
                dom.byId("dashboard-text").innerHTML = this.infoText;
                dom.byId("dashboard-text").style.width = "100%";

                this.graphMaker.removeDiagrams();
            }
            // Case public transport
            else if (layer.title == this.settings.layerNames.pt) {

                // Not needed right now, was the case when there were two different versions of pt
                if (layer.layers && (layer.layers.length == 2)) {
                    layer = layer.layers.getItemAt(0);

                }
                // query for the average population in all features
                var statQuery = [{
                    onStatisticField: modeManager.viewSettings.prefix + modeManager.viewSettings.attribute,
                    outStatisticFieldName: "all",
                    statisticType: "avg"
                }];

               // query for the average per hour for all features (pt data goes from 4 o'clock 29:00 (also 4:00)) 
                for (var i = 4; i < 29; i++) {
                    statQuery.push({
                        onStatisticField: modeManager.viewSettings.prefix + "h_" + i.toString(),
                        outStatisticFieldName: modeManager.viewSettings.prefix + "h_" + i.toString(),
                        statisticType: "avg"
                    });
                }

                // Prepare the query 
                var query = layer.createQuery();

                query.returnGeometry = false;
                query.outStatistics = statQuery;
                query.outFields = ["*"];

                layer.queryFeatures(query).then(function (results) {
                    this.allData = {};
                    // Parse the data in a form that it can be used for the dashboard
                    this.allData.hourData = this.parsePTData(results);
                    this.allData.all = results.features[0].attributes["all"];
                    this.allData.text = "<b>Occupancy</b> <br> <span style='font-size: smaller'>Average of occupied spaces </span><br><br> Whole Project Area";
                    var that = this;
                    dom.byId("dashboard-text").style.width = "25%";

                    // If already one element is clicked (needed when the mode changes(we want the same object to to stay selected))
                    // Read again the new values for this element
                    if (that.result) {
                        that.processGraphic(that.result.graphic, that.result.graphic.layer.title, function (data) {
                            that.currentData = data;
                            if (dom.byId("svgDonut")) {
                                that.renderDiagrams(false);
                            }
                            else {
                                that.renderDiagrams(true);
                            };
                        })

                    }
                    else {
                        that.currentData = that.allData;
                        if (dom.byId("svgDonut")) {
                            that.renderDiagrams(false);
                        }
                        else {
                            that.renderDiagrams(true);
                        }
                    }



                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }
            // Case traffic
            else if (layer.title == this.settings.layerNames.traffic) {

                // query for the average population in all features
                var statQuery = [{
                    onStatisticField: modeManager.viewSettings.prefix + "all_x",
                    outStatisticFieldName: "all_x",
                    statisticType: "avg"
                },
                {
                    onStatisticField: modeManager.viewSettings.prefix + "all_y",
                    outStatisticFieldName: "all_y",
                    statisticType: "avg"
                }];

                // query for the average per hour for all features
                for (var i = 0; i < 24; i++) {
                    statQuery.push({
                        onStatisticField: modeManager.viewSettings.prefix + "h_" + i.toString() + "_x",
                        outStatisticFieldName: modeManager.viewSettings.prefix + "h_" + i.toString() + "_x",
                        statisticType: "avg"
                    });
                    statQuery.push({
                        onStatisticField: modeManager.viewSettings.prefix + "h_" + i.toString() + "_y",
                        outStatisticFieldName: modeManager.viewSettings.prefix + "h_" + i.toString() + "_y",
                        statisticType: "avg"
                    });
                }

                // Prepare the query
                var query = layer.createQuery();

                query.returnGeometry = false;
                query.outStatistics = statQuery;
                query.outFields = ["*"];

                layer.queryFeatures(query).then(function (results) {
                    this.allData = {};
                    // Parse the data in a form that it can be used for the dashboard
                    this.allData.hourData = this.parseTrafficData(results);
                    this.allData.all_x = results.features[0].attributes["all_x"];
                    this.allData.all_y = results.features[0].attributes["all_y"];
                    this.allData.all_avg = (this.allData.all_x + this.allData.all_y) / 2;
                    this.allData.text = "<b>Number of cars</b><br> <span style='font-size: smaller'>Average per day </span>  <br><br> Whole Project Area";
                    var that = this;
                    dom.byId("dashboard-text").style.width = "25%";

                    // If already one element is clicked (needed when the mode changes(we want the same object to to stay selected))
                    // Read again the new values for this element
                    if (this.result) {
                        that.processGraphic(that.result.graphic, that.result.graphic.layer.title, function (data) {

                            that.currentData = data;
                            if (dom.byId("svgTimeline")) {
                                that.renderDiagrams(false);
                            }
                            else {
                                that.renderDiagrams(true);
                            };
                        })
                    }
                    else {
                        that.currentData = that.allData;
                        if (dom.byId("svgTimeline")) {
                            that.renderDiagrams(false);
                        }
                        else {
                            that.renderDiagrams(true);
                        }
                    }
                }.bind(this)).catch(function (err) {
                    console.error(err);
                });

            }
        },

        // Takes all the attributes from the public transport feature and puts it into a slightly different format so it can be used by the GraphMaker
        parsePTData: function (results) {
            var data = []
            // Loop over all hours and read the value
            for (var i = 4; i < 29; i++) {
                var value = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString()];
                if (value == null) {
                    value = 0;
                }
                // since 28:00 o'clock is 4:00 o'clock again, just make the average
                if (i == 28) {
                    data[0].percentage = (data[0].percentage + value) / 2;
                }
                else {
                    // Prepare a string for the diagramm to display it
                    data.push({ time: (i % 24).toString() + ":00", percentage: value });
                }
            }
            return data;
        },

        // Takes all the attributes from the traffic feature and puts it into a slightly different format so it can be used by the GraphMaker
        parseTrafficData: function (results) {
            var data = []
            // Loop over all hours and read the value
            for (var i = 0; i < 24; i++) {
                // Here we have two values, for both directions!
                var value_x = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString() + "_x"];
                var value_y = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString() + "_y"];

                value_x == null ? value_x = 0 : null;
                value_y == null ? value_y = 0 : null;

                // But in this case we want to only show one value, so make the average
                data.push({ time: (i).toString() + ":00", "value_avg": (value_x + value_y) / 2, "value_x": value_x, "value_y": value_y });
            }
            return data;
        },

        // Function to simply update all the diagrams
        // Init is a boolean for the very first rendering
        renderDiagrams: function (init) {
            // Init means it is rendering the first time ever
            if (modeManager.viewSettings.theme == "pt") {
                if (init) {
                    this.graphMaker.initDiagramm()
                    this.graphMaker.updatePTDiagramm(this.currentData.hourData, true);
                    this.graphMaker.initDonutChart(this.currentData.all);

                }
                this.graphMaker.updatePTDiagramm(this.currentData.hourData);     // Second time bc for some reason the tooltip did not work the first time
                this.graphMaker.updateDonutChart(this.currentData.all);

                dom.byId("dashboard-text").innerHTML = this.currentData.text;
            }

            else if (modeManager.viewSettings.theme == "traffic") {
                if (init) {
                    this.graphMaker.initDiagramm()
                    this.graphMaker.updateTrafficDiagramm(this.currentData.hourData, true);
                    this.graphMaker.initDonutChart(this.currentData.all_avg);

                }
                this.graphMaker.updateTrafficDiagramm(this.currentData.hourData);     // Second time bc for some reason the tooltip did not work the first time
                this.graphMaker.updateTrafficChart(this.currentData.all_avg);

                dom.byId("dashboard-text").innerHTML = this.currentData.text;
            }

        }
    });
});