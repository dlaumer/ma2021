/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
UserStudy/ConnectionAGO.js
--------------
Deals with uploading user study data to ArcGIS Online. There are also functions to read the data
from ArcGIS Online and find specific entries.

*/
define([
    "esri/core/Accessor",

    "esri/layers/FeatureLayer",
    "esri/Graphic"

], function (
    Accessor, FeatureLayer, Graphic) {


    return Accessor.createSubclass({
        declaredClass: "urbanmobility.ConnectionAGO",

        constructor: function (settings) {

            this.settings = settings;
        },

        // Here the ID of the table on AGO
        init: function () {
            this.table = new FeatureLayer({
                portalItem: {
                    id: "e5666190b9d14ef09315effbdcff0f5b"
                },
            });
            var that = this;
            that.table.load();

        },

        // function to add one row to the table
        addFeature: function (callback) {
            // add the current time/date
            const attributes = { "DateStarted": Date.now() };

            const addFeature = new Graphic({
                geometry: null,
                attributes: attributes
            });
            // Apply uploading the (almost) empty row
            const promise = this.table.applyEdits({
                addFeatures: [addFeature]
            }).then((editInfo) => {
                callback(editInfo.addFeatureResults[0].objectId)
            });
        },

        // function to read one row of the table
        readFeature: function (objectid, callback) {
            // Look for a specific onbjectid
            this.table
                .queryFeatures({
                    objectIds: [objectid],
                    outFields: ["*"],
                    returnGeometry: false
                })
                .then((results) => {
                    if (results.features.length > 0) {
                        editFeature = results.features[0];
                        callback(editFeature);  // returm the fatatures
                    }
                });

        },

        // function to read all rows of the tables
        readFeatures: function () {
            return new Promise((resolve, reject) => {

                // Create empty query, means to take all rows!
                var query = this.table.createQuery();

                this.table
                    .queryFeatures(query)
                    .then((results) => {
                        if (results.features.length > 0) {
                            resolve(results.features);
                        }
                    });
            })

        },

        // function to change one row in the table
        updateFeature: function (objectid, data, callback) {
            // first read the existing entry
            this.table
                .queryFeatures({
                    objectIds: [objectid],
                    outFields: ["*"],
                    returnGeometry: false
                })
                // then take re existing entry and edit it
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
                        // finally, upload the new data to ArcGIS Online
                        this.table.applyEdits({
                            updateFeatures: [editFeature]
                        }).then((value) => { callback(value) }).catch((reason) => { callback(reason) });
                    }
                });
        }
    });
})
