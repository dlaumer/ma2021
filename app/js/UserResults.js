
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

    "urbanmobility/App",

], function (
    Accessor, Map, MapView, FeatureLayer,Graphic,Feature,
    domCtr, win, dom, domStyle, on, mouse, App) {


        return Accessor.createSubclass({
            declaredClass: "urbanmobility.UserResults",

            constructor: function (settings) {
               
                this.settings = settings;
            },

            init: function() {
                this.table = new FeatureLayer({
                    portalItem: {
                      id: "d6079b2d361841d4ad61d4e4fe15bb8f"
                    },
                });
                var that = this;
                that.table.load();

            },

            addFeature: function(callback) {
                const attributes = {};
            
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
                            editFeature.attributes[item] = JSON.stringify(data[item])
                        }

                        this.table.applyEdits({
                            updateFeatures: [editFeature]
                        }).then((value) => {callback(true)}).catch((reason) => {callback(false)});                   
                    }
                 });
              
        
               
              }


    });
})
