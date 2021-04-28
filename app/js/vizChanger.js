define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

    "urbanmobility/modeManager",


], function (
    Accessor, Query,
    domCtr, win, dom, on, modeManager
) {
        return Accessor.createSubclass({
            declaredClass: "urbanmobility.vizChanger",

            constructor: function (scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;
            },

            changeVisualization: function() {
                
                // Change the theme
                if (modeManager.viewSettings.theme_prev != "none") {
                    modeManager.getLayer(this.settings.layerNames[modeManager.viewSettings.theme_prev]).visible = false;

                }
                if (modeManager.viewSettings.theme != "none") {
                    modeManager.viewSettings.layer.visible = true;
                }


                // Change the mode
                if (modeManager.viewSettings.theme != "none") {
                    var mode = modeManager.viewSettings.mode;
                    var layer = modeManager.viewSettings.layer;

                    if (modeManager.viewSettings.theme == "pt" || modeManager.viewSettings.theme == "traffic") {
                        renderer = layer.renderer.clone();
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        //sizeVariable.field =  modeManager.viewSettings.attribute;
                        renderer.visualVariables = [sizeVariable];
                        layer.renderer = renderer;
                    }
                    else if (modeManager.viewSettings.theme == "air") {
                        renderer = layer.renderer.clone();
                        //renderer.field=  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        renderer.field = modeManager.viewSettings.attribute;
                        const sizeVariable = renderer.visualVariables[0];
                        //sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        sizeVariable.field =  modeManager.viewSettings.attribute;
                        renderer.visualVariables = [sizeVariable];
                        layer.renderer = renderer;

                    }
                }
            },
        })

    })