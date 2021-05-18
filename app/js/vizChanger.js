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
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        sizeVariable.legendOptions = {
                            title: "Occupancy [%]", 
                            showLegend: true
                          };
                          
                        renderer.visualVariables = [sizeVariable];

                        
                        layer.renderer = renderer;
                    }

                    if ( theme == "traffic") {
                        renderer = layer.renderer.clone();
                        const sizeVariable = renderer.visualVariables[0];
                        sizeVariable.field =  modeManager.viewSettings.prefix + modeManager.viewSettings.attribute;
                        sizeVariable.field =  modeManager.viewSettings.attribute;
                        
                        //sizeVariable.legendOptions = {
                        //    title: "% population in poverty by county", 
                        //    showLegend: true
                        //  };
                        renderer.visualVariables = [sizeVariable];

                        
                        layer.renderer = renderer;
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


               

            },
        })

    })