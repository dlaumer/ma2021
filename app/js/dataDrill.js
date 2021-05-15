define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

    "urbanmobility/graphMaker",
    "urbanmobility/modeManager",



], function (
    Accessor, Query,
    domCtr, win, dom, on, graphMaker, modeManager
) {
    return Accessor.createSubclass({
        declaredClass: "urbanmobility.dataDrill",

        constructor: function (scene, view, settings) {
            this.scene = scene;
            this.view = view;
            this.settings = settings;
            this.graphMaker = new graphMaker(scene, view, settings)
            this.currentData = null;
        },

        clickHandler: function () {
            var view = this.view;

            view.on("click", function (event) {
                view.hitTest(event.screenPoint).then(function (response) {
                    var result = response.results[0];
                    if (result && (result.graphic.layer.title == this.settings.layerNames.pt || result.graphic.layer.title == this.settings.layerNames.traffic || result.graphic.layer.title == this.settings.layerNames.air)){
                        var that = this;
                        that.view.whenLayerView(result.graphic.layer).then((layerView) => {
                            if (that.highlight) {
                                that.highlight.remove();
                                }
                            that.highlight = layerView.highlight([result.graphic.getObjectId()]);
                            
                            that.processGraphic(result.graphic, result.graphic.layer.title, function(data) {
                                that.currentData = data;
                                that.graphMaker.render(data.all);
                                dom.byId("dashboard-text").innerHTML = data.text;
                                that.graphMaker.updatePTDiagramm(data.hourData);
                            });
                        });
                    }
                    else {
                        if (this.highlight) {
                            this.highlight.remove();
                        }
                        this.currentData = this.allData;
                        this.graphMaker.updatePTDiagramm(this.allData.hourData);
                        this.graphMaker.render(this.allData.all);
                        dom.byId("dashboard-text").innerHTML = this.allData.text;
                    }

                    

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }.bind(this));
        },

        processGraphic: function (graphic, layerName, callback) {

            var selectedOID = graphic.getObjectId();

            var query = new Query();

            query.objectIds = [selectedOID];
            query.returnGeometry = false;
            query.outFields = ["*"];

            graphic.layer.queryFeatures(query).then(function (results) {

                if (results.features[0] === undefined) {
                    console.log("Wrong ObjectID");
                }

                if (layerName == this.settings.layerNames.pt) {
                    var data = {}
                    data.hourData = this.parsePTData(results);
                    data.all = results.features[0].attributes[modeManager.viewSettings.prefix + modeManager.viewSettings.attribute];
                    data.text =  "<b>Occupancy</b> <br><br> From: " + results.features[0].attributes["Fr_name"] + "<br>To: " + results.features[0].attributes["To_name"];
                }
                results.features[0].visible = false;
                callback(data);

            }.bind(this)).catch(function (err) {
                console.error(err);
            });
        }, 

        processAllData: function(layer) {
            if (layer == "none" || layer.title == this.settings.layerNames.traffic || layer.title == this.settings.layerNames.air) {
                dom.byId("dashboard-text").innerHTML = "<b>Dashboard</b>";
                this.graphMaker.removeDiagrams();
            }
            else if (layer.title == this.settings.layerNames.pt) {
                if (layer.layers && (layer.layers.length == 2)) {
                    layer = layer.layers.getItemAt(0);

                }
                // query for the average population in all features
                var statQuery = [{
                    onStatisticField: modeManager.viewSettings.prefix + modeManager.viewSettings.attribute,  
                    outStatisticFieldName: "all",
                    statisticType: "avg"
                }];

                for (var i = 4; i < 29; i++) {
                    statQuery.push({
                        onStatisticField: modeManager.viewSettings.prefix + "h_" + i.toString(),  
                        outStatisticFieldName: modeManager.viewSettings.prefix + "h_" + i.toString(),
                        statisticType: "avg"
                    });
                }
                

                var query = layer.createQuery();

                query.returnGeometry = false;
                query.outStatistics = statQuery;
                query.outFields = ["*"];

                layer.queryFeatures(query).then(function (results) {
                    this.allData = {};
                    this.allData.hourData = this.parsePTData(results);
                    this.allData.all = results.features[0].attributes["all"];
                    this.allData.text = "<b>Occupancy</b> <br><br> Whole Project Area";
                    this.currentData = this.allData;
                    if (dom.byId("svgDonut")) {
                        this.renderDiagrams(false);
                    }
                    else {
                        this.renderDiagrams(true);
                    }

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }
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


                var query = layer.createQuery();

                query.returnGeometry = false;
                query.outStatistics = statQuery;
                query.outFields = ["*"];

                layer.queryFeatures(query).then(function (results) {
                    this.allData = {};
                    this.allData.hourData = this.parseTrafficData(results);
                    this.allData.all_x = results.features[0].attributes["all_x"];
                    this.allData.all_y = results.features[0].attributes["all_y"];
                    this.allData.text = "<b>Traffic Measurements</b> <br><br> Whole Project Area";
                    this.currentData = this.allData;
                    

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });

            }
        }, 


        parsePTData: function(results) {
            var data = []
            for (var i = 4; i < 29; i++) {
                var value = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString()];
                if (value == null) {
                    value = 0;
                }
                if (i==28) {
                    data[0].percentage = (data[0].percentage + value) / 2;
                }
                else {
                    data.push({time: (i%24).toString() + ":00", percentage: value});
                }
            }
            return data;
        },

        parseTrafficData: function(results) {
            var data = []
            for (var i = 0; i < 24; i++) {
                var value_x = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString() + "_x"];
                var value_y = results.features[0].attributes[modeManager.viewSettings.prefix + "h_" + i.toString() + "_y"];

                value_x == null ? value_x = 0 : null;
                value_y == null ? value_y = 0 : null;
                
                data.push({time: (i).toString() + ":00", percentage: value_x, "value_y": value_y});
            }
            return data;
        },

        renderDiagrams: function(init) {
            // Init means it is rendering the first time ever
            if (modeManager.viewSettings.theme != "none") {
                if (init) {
                    this.graphMaker.initPTDiagramm()
                    this.graphMaker.updatePTDiagramm(this.currentData.hourData, true);
                    if (modeManager.viewSettings.theme == "pt") {
                        this.graphMaker.updateDonutChart(this.currentData.all);
                    }

                }
                this.graphMaker.updatePTDiagramm(this.currentData.hourData);     // Second time bc forsome reason the tooltip did not work the first time
                if (modeManager.viewSettings.theme == "pt") {
                    this.graphMaker.render(this.currentData.all);
                }

                dom.byId("dashboard-text").innerHTML = this.currentData.text;
            }

        }
    });
});