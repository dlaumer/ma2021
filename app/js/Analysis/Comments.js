define([
    "esri/core/Accessor",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/on",
    "dojo/mouse",
    "urbanmobility/UserStudy/ConnectionAGO",



], function (
    Accessor,
    domCtr, win, dom, domStyle, on, mouse, UserResults) {

        return Accessor.createSubclass({
            declaredClass: "urbanmobility.Comments",

            constructor: function () {

            },

            init: function (settings) {
                this.settings = settings;

                domCtr.destroy("background");
                this.createUI();
                this.inputHandler();

                
                this.userResults = new UserResults(this.settings);
                this.userResults.init();
                this.userResults.readFeatures().then((feats => {
                    this.readData(feats).then((features) => {
                        this.features = features;
                        console.log(this.features);
                        this.makeDivs();
                    })
                }));
            },

            createUI: function () {

                this.background_comments = domCtr.create("div", { id: "background_comments"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home", innerHTML: "<h1>Comments</h1>"},  this.background_comments);
           },

            inputHandler: function() {
                
                var that = this;
                document.addEventListener('keydown', function(e) {
                    switch (e.code) {
                        case "ArrowUp":
                           
                            break;
                        case "ArrowDown":
                            
                            break;
                    }
                });
            },

            readData: function(feats) {
                return new Promise((resolve, reject) => {
                    features = {};
                    var outliers = [63, 247];
                    for (feature in feats) {
                        var att = feats[feature].attributes
                        if (att.ID > 53) {
                            if (!outliers.includes(att.ID) && att.Task8 != null) {
                                var task8 = JSON.parse(att.Task8);
                                if (Object.keys(task8).includes("comments") && task8["comments"] != "") {
                                    features[att.ID] = task8["comments"];
                                }
                            }
                        }
                    }
                    resolve(features)
                })
            }, 

            makeDivs: function () {
                for (i in this.features) {
                    var content = "<b>" + i.toString() + "</b>: " + this.features[i]
                    domCtr.create("div", {className: "comments", innerHTML: content },  this.background_comments);

                }
            }
        })
    })

    function debounce(func){
        var timer;
        return function(event){
        if(timer) clearTimeout(timer);
        timer = setTimeout(func,500,event);
        };
    }