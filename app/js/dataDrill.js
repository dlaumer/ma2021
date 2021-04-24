define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

    "urbanmobility/graphMaker",


], function (
    Accessor, Query,
    domCtr, win, dom, on, graphMaker
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
                        if (result && result.graphic.layer.title != this.settings.layerNames.traffic_geometry_now && result.graphic.layer.title != this.settings.layerNames.buildings){
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

                    if (layerName == this.settings.layerNames.pt_flow_now) {
                        var data = {}
                        data.hourData = this.parsePTData(results);
                        data.all = results.features[0].attributes["all_"];
                        data.text =  "<b>Occupancy</b> <br><br> From: " + results.features[0].attributes["Fr"] + "<br>To: " + results.features[0].attributes["To_"];
                    }
                    callback(data);

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }, 

            processAllData: function(layer) {
                if (layer.title == this.settings.layerNames.pt_flow_now) {
                    if (layer.layers && (layer.layers.length == 2)) {
                        layer = layer.layers.getItemAt(0);

                    }
                    // query for the average population in all features
                    var statQuery = [{
                        onStatisticField: "all_",  // service field for 2015 population
                        outStatisticFieldName: "all",
                        statisticType: "avg"
                    }];

                    for (var i = 4; i < 29; i++) {
                        statQuery.push({
                            onStatisticField: "h_" + i.toString(),  // service field for 2015 population
                            outStatisticFieldName: "h_" + i.toString(),
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
                        this.renderDiagrams();

                    }.bind(this)).catch(function (err) {
                        console.error(err);
                    });
                }

                
            }, 


            parsePTData: function(results) {
                var data = []
                for (var i = 4; i < 29; i++) {
                    var value = results.features[0].attributes["h_" + i.toString()];
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

            renderDiagrams: function() {
                this.graphMaker.initPTDiagramm()

                this.graphMaker.updatePTDiagramm(this.currentData.hourData, true);
                this.graphMaker.updatePTDiagramm(this.currentData.hourData);     // Second time bc forsome reason the tooltip did not work the first time

                this.graphMaker.updateDonutChart(this.currentData.all);
                dom.byId("dashboard-text").innerHTML = this.currentData.text;



            }
        });

       
    }
);