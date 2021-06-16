define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

    "urbanmobility/Application/ModeManager",


], function (
    Accessor, Query,
    domCtr, win, dom, on, modeManager
) {
        return Accessor.createSubclass({
            declaredClass: "urbanmobility.VizChanger",

            constructor: function (scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;
            },

            changeVisualization: function() {
                
                var mode = modeManager.viewSettings.mode;
                var theme = modeManager.viewSettings.theme;
                var layer = modeManager.viewSettings.layer;
                // Change the theme
                if (modeManager.viewSettings.theme_prev != "none") {
                    modeManager.getLayer(this.settings.layerNames[modeManager.viewSettings.theme_prev]).visible = false;

                }

                if (theme != "none") {
                    modeManager.viewSettings.layer.visible = true;
                }


                // Change the mode
                if (theme != "none") {
                   

                    if (theme == "pt") {
                        renderer = layer.renderer.clone();
                        renderer.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        sizeVariable.legendOptions = {
                            title: "Occupied spaces [%]", 
                            showLegend: true
                          };
                          
                        renderer.visualVariables = [sizeVariable];

                        layer.renderer = renderer;
                    }

                    if ( theme == "traffic") {
                        renderer = layer.renderer.clone();
                        renderer.field = modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        
                        sizeVariable.legendOptions = {
                            customValues: [1,2,3,4,5],
                            title: "Average number of cars per day (x10)", 
                            showLegend: true
                          };
                        renderer.visualVariables = [sizeVariable];

                        
                        layer.renderer = renderer;

                        if (mode == "project") {
                            modeManager.getLayer(this.settings.layerNames.traffic_pro).renderer = renderer;
                        }
                    }
                    else if (theme == "air") {
                        renderer = layer.renderer.clone();
                        //renderer.field=  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        renderer.field = modeManager.viewSettings.attribute;
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        //sizeVariable.field =  modeManager.viewSettings.attribute;
                        renderer.visualVariables = [sizeVariable];
                        layer.renderer = renderer;

                    }

                    
                }

                // Filter the layer
                this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.pt_lines)).then(function(layerView) {
                    if (modeManager.viewSettings.mode == "project") {
                        layerView.filter = null;
                    } else {
                        layerView.filter = {
                            where:"project = 0"
                        };
                    }
                });

               
                
                if (mode == "project" && theme == "traffic") {
                    modeManager.getLayer(this.settings.layerNames.traffic_pro).visible = true;
                    this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.traffic_pro)).then(function(layerView) {
                        layerView.refresh()
                    });
                }
                else {
                    modeManager.getLayer(this.settings.layerNames.traffic_pro).visible = false;
                }

                if (mode == "project") {
                    modeManager.getLayer(this.settings.layerNames.streets_pro).visible = true;
                }
                else {
                    modeManager.getLayer(this.settings.layerNames.streets_pro).visible = false;
                }

                 this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.traffic)).then(function(layerView) {
                    layerView.refresh()
                });

                 this.view.whenLayerView(modeManager.getLayer(this.settings.layerNames.pt)).then(function(layerView) {
                    layerView.refresh()
                });
                

            },
        })

    })