define([
    "dojo/dom-construct",
    "dojo/_base/window",


], function (
    domCtr, win) {
        return {

            viewSettings: null,

            setSettings: function(scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;
                this.viewSettings = {
                    mode: "now",
                    theme: "none",
                    mode_prev: "now",
                    theme_prev: "none",
                    layer: "none",
                    prefix: "", // Prefix for the attributes, since there are always three sets of attributes for the three modes
                    attribute: "none",  // Name of the field/attribute of the feature class (maybe combined with prefix)
                };
            },

            changeMode: function(flag, value) {

                this.viewSettings.mode_prev = this.viewSettings.mode;
                this.viewSettings.theme_prev = this.viewSettings.theme;

                if (flag == "mode") {
                    this.viewSettings.mode = value;
                }
                else if (flag == "theme") {
                    this.viewSettings.theme = value;
                }
                switch ( this.viewSettings.mode + "|" + this.viewSettings.theme) {
                   
                    // ----- None ----------------------
                    case "now|none":
                        this.viewSettings.layer = "none";
                        this.viewSettings.prefix = "now_";
                        this.viewSettings.attribute = "none";

                        break;
                        
                    case "no_project|none":
                        this.viewSettings.layer = "none";
                        this.viewSettings.prefix = "no_";
                        this.viewSettings.attribute = "none";


                        break;

                    case "project|none":
                        this.viewSettings.layer = "none";
                        this.viewSettings.prefix = "pro_";
                        this.viewSettings.attribute = "none";

                        break;

                    // ----- Public Transport ----------
                    case "now|pt":
                        this.viewSettings.layer = this.getLayer(this.settings.layerNames.pt);
                        this.viewSettings.prefix = "";
                        this.viewSettings.attribute = "all_";

                        break;
                        
                    case "no_project|pt":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.pt);
                        this.viewSettings.prefix = "no_";
                        //this.viewSettings.attribute = "all_";
                        this.viewSettings.attribute = "all";


                        break;

                    case "project|pt":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.pt);
                        this.viewSettings.prefix = "pro_";
                        this.viewSettings.attribute = "all";

                        break;
    
                    // ----- Traffic ----------------------
                    case "now|traffic":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.traffic);
                        this.viewSettings.prefix = ""
                        this.viewSettings.attribute = "all_1";

                        break;
                        
                    case "no_project|traffic":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.traffic);
                        this.viewSettings.prefix = "no_";
                        this.viewSettings.attribute = "all";

                        break;

                    case "project|traffic":
                        this.viewSettings.layer =   this.getLayer(this.settings.layerNames.traffic);
                        this.viewSettings.prefix = "pro_";
                        this.viewSettings.attribute = "all";

                        break;

                    // ----- Air Pollution ----------------------
                    case "now|air":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.air);
                        this.viewSettings.prefix = "";
                        this.viewSettings.attribute = "PM_20";

                        break;
                        
                    case "no_project|air":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.air);
                        this.viewSettings.prefix = "";
                        this.viewSettings.attribute = "PM_30";

                        break;

                    case "project|air":
                        this.viewSettings.layer =  this.getLayer(this.settings.layerNames.air);
                        this.viewSettings.prefix = "pro_";
                        this.viewSettings.attribute = "PM_30";

                        break;
                
                }

            }, 

            getLayer: function(name) {
                return this.scene.layers.find(function(layer){
                    return layer.title === name;
                  });
            },

        }
    })
