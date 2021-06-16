
define([
    "esri/core/Accessor",

    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/widgets/Feature",


    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",

    "urbanmobility/Application/App",

], function (
    Accessor, Map, MapView, FeatureLayer,Graphic,Feature,
    domCtr, win, dom, domStyle, on, mouse, App) {


        return Accessor.createSubclass({
            declaredClass: "urbanmobility.ConnectionAGO",

            constructor: function (settings) {
               
                this.settings = settings;
            },

            init: function() {
                this.table = new FeatureLayer({
                    portalItem: {
                      id: "e5666190b9d14ef09315effbdcff0f5b"
                    },
                });
                var that = this;
                that.table.load();

            },

            addFeature: function(callback) {
                const attributes = {"DateStarted" : Date.now()};
            
                const addFeature =  new Graphic({
                  geometry: null,
                  attributes: attributes
                });

                const promise = this.table.applyEdits({
                  addFeatures: [addFeature]
                }).then((editInfo) => {
                    callback(editInfo.addFeatureResults[0].objectId)
                });
            },

            readFeature: function(objectid, callback) {
                this.table
                .queryFeatures({
                  objectIds: [objectid],
                  outFields: ["*"],
                  returnGeometry: false
                })
                .then((results) => {
                  if (results.features.length > 0) {
                    editFeature = results.features[0];
                    callback(editFeature);
                    }
                 });

            },

            readFeatures: function() {
                return new Promise((resolve, reject) => {

                    var query =  this.table.createQuery();

                    this.table
                    .queryFeatures(query)
                    .then((results) => {
                    if (results.features.length > 0) {
                        resolve(results.features);
                        }
                    });
                })

            },

            updateFeature: function(objectid, data, callback) {

                this.table
                .queryFeatures({
                  objectIds: [objectid],
                  outFields: ["*"],
                  returnGeometry: false
                })
                .then((results) => {
                    if (results.features.length > 0) {
                        editFeature = results.features[0];
                        for (const item in data) {
                            if (item == "ID") {
                                editFeature.attributes[item] = parseInt(data[item]);
                            }
                            else {
                                editFeature.attributes[item] = JSON.stringify(data[item]);
                            }
                            if (item == "Task8") {
                                editFeature.attributes["DateEnded"] = Date.now();
                            }
                        }

                        this.table.applyEdits({
                            updateFeatures: [editFeature]
                        }).then((value) => {callback(value)}).catch((reason) => {callback(reason)});                   
                    }
                 });
              
        
               
              }


    });
})
