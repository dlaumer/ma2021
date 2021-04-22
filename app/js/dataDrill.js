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
                this.graphMaker.initPTDiagramm()
            },

            clickHandler: function () {
                var view = this.view;

                view.on("click", function (event) {
                    view.hitTest(event.screenPoint).then(function (response) {
                        var result = response.results[0];
                        if (result && result.graphic.layer.title != this.settings.layerNames.traffic_geometry_now){
                            var that = this;
                            this.processGraphic(result.graphic, result.graphic.layer.title, function(data) {
                                that.graphMaker.updatePTDiagramm(data);
                            });
                        }
                        else {
                            this.graphMaker.updatePTDiagramm(this.allData);
                            this.graphMaker.render(this.allDataAll);
                            var dashboardText = dom.byId("dashboard-text");
                            dashboardText.innerHTML = "<b>Occupancy</b> <br><br> Whole Project Area";
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
                        var data = this.parsePTData(results);
                        this.graphMaker.render(results.features[0].attributes["all_"]);
                        var dashboardText = dom.byId("dashboard-text");
                        dashboardText.innerHTML = "<b>Occupancy</b> <br><br> From: " + results.features[0].attributes["Fr"] + "<br>To: " + results.features[0].attributes["To_"];


                    }
                    callback(data);

                }.bind(this)).catch(function (err) {
                    console.error(err);
                });
            }, 

            processAllData: function(layer) {
                if (layer.title == this.settings.layerNames.pt_flow_now) {
                    
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
                        
                        this.allData = this.parsePTData(results);
                        this.allDataAll = results.features[0].attributes["all"]
                        var dashboardText = dom.byId("dashboard-text");
                        dashboardText.innerHTML = "<b>Occupancy</b> <br><br> Whole Project Area";

                        this.graphMaker.updatePTDiagramm(this.allData, true);
                        this.graphMaker.updateDonutChart(this.allDataAll);



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
                    data.push({time: i.toString() + ":00", percentage: value});
                }
                return data;
            }
        });

       
    }
);