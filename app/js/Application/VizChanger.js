/*  Copyright (c) by Daniel Laumer. All rights reserved.
Developed at ETH Zurich in the scope of my Master's Thesis

Authors: Daniel Laumer
Date: 19.July 2021
Project: UrbanMobility, Evaluation of mobility indicator visualizations in interactive 3D environments 
Questions at: daniel.laumer@gmail.com
 */

/*
--------------
Application/VizChanger.js
--------------
Adapts the visual changes determined by ModeManager.js, meaning it turns layers on and off in the map/scene.
Also it changes the renderes of the layers in for the changes between the modes. Also there is a filter to hide
some features for some modes. 

*/
define([
    "esri/core/Accessor",

    "urbanmobility/Application/ModeManager",

], function (
    Accessor, modeManager
) {
    return Accessor.createSubclass({
        declaredClass: "urbanmobility.VizChanger",

        constructor: function (scene, view, settings) {
            this.scene = scene;
            this.view = view;
            this.settings = settings;
        },

        // Only function here, reads the current state from ModeManager and adapts the view accordingly
        changeVisualization: function () {

            var mode = modeManager.viewSettings.mode;
            var theme = modeManager.viewSettings.theme;
            var layer = modeManager.viewSettings.layer;

            // Change the theme
            // Change the visible layer, or don't show any of the two layers at all
            if (modeManager.viewSettings.theme_prev != "none") {
                modeManager.getLayer(this.settings.layerNames[modeManager.viewSettings.theme_prev]).visible = false;

            }

            if (theme != "none") {
                modeManager.viewSettings.layer.visible = true;
            }

            // Change the mode
            if (theme != "none") {
                // For public transport, change the visual variable color to show another attribute
                if (theme == "pt") {
                    // It does not work if you just change it, you need to clone every part and set it back
                    renderer = layer.renderer.clone();
                    renderer.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                    const sizeVariable = renderer.visualVariables[0];
                    sizeVariable.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                    sizeVariable.legendOptions = {
                        title: "Occupied spaces [%]",
                        showLegend: true
                    };

                    renderer.visualVariables = [sizeVariable];

                    layer.renderer = renderer;
                }
                // For traffic, change the visual variable size to show another attribute
                if (theme == "traffic") {
                    // It does not work if you just change it, you need to clone every part and set it back
                    renderer = layer.renderer.clone();
                    renderer.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                    const sizeVariable = renderer.visualVariables[0];
                    sizeVariable.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;

                    sizeVariable.legendOptions = {
                        customValues: [1, 2, 3, 4, 5],
                        title: "Average number of cars per day (x10)",
                        showLegend: true
                    };
                    renderer.visualVariables = [sizeVariable];

                    layer.renderer = renderer;

                    if (mode == "project") {
                        modeManager.getLayer(this.settings.layerNames.traffic_pro).renderer = renderer;
                    }
                }
                // Not used now
                else if (theme == "air") {
                    renderer = layer.renderer.clone();
                    renderer.field = modeManager.viewSettings.attribute;
                    const sizeVariable = renderer.visualVariables[0];
                    sizeVariable.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                    renderer.visualVariables = [sizeVariable];
                    layer.renderer = renderer;

                }

            }

            // Filter the layer (needed only for the public transport lines, so that the additional two lines are also shown in the case of mode=project)
            this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.pt_lines)).then(function (layerView) {
                if (modeManager.viewSettings.mode == "project") {
                    layerView.filter = null;
                } else {
                    layerView.filter = {
                        where: "project = 0"
                    };
                }
            });


            // The traffic info for the tunnel was stored in a separate layer, because it is 3D and belpow the surface
            if (mode == "project" && theme == "traffic") {
                modeManager.getLayer(this.settings.layerNames.traffic_pro).visible = true;
                this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.traffic_pro)).then(function (layerView) {
                    layerView.refresh()
                });
            }
            else {
                modeManager.getLayer(this.settings.layerNames.traffic_pro).visible = false;
            }

            // The geometry of the tunnel is also stored in a separate layer, also because it has actual 3D height info
            if (mode == "project") {
                modeManager.getLayer(this.settings.layerNames.streets_pro).visible = true;
            }
            else {
                modeManager.getLayer(this.settings.layerNames.streets_pro).visible = false;
            }

            // This was the intention to solve the problems of some layers not showing up sometimes
            this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.traffic)).then(function (layerView) {
                layerView.refresh()
            });

            this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.pt)).then(function (layerView) {
                layerView.refresh()
            });


        },
    })

})