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

                this.filter = {"General": [210, 219, 234, 244, 267, 281, 283, 289, 290, 309, 321, 335, 344, 348, 353, 354, 377], "Positive": [54, 146, 193, 196, 198, 209, 234, 244, 259, 289, 290, 309, 321, 334, 335, 348, 354, 364, 377, 387], "Negative": [54, 57, 234, 267, 289, 290, 309, 335, 354, 365], "Hardbr\u00fccke": [54, 140, 149, 195, 234, 278, 290, 292, 321, 344], "Direction": [54, 56, 149, 290], "Comparison": [123], "See answer": [143, 322], "2D vs 3D": [155, 198], "Future": [200, 267], "Firefox": [240, 325], "Technical Problems": [54, 353, 365, 387]}

                domCtr.destroy("background");
                this.createUI();
                this.inputHandler();

                
                this.userResults = new UserResults(this.settings);
                this.userResults.init();
                this.userResults.readFeatures().then((feats => {
                    this.readData(feats).then((features) => {
                        this.features = features;
                        console.log(this.features);
                        this.makeDivs("All");
                    })
                }));
            },

            createUI: function () {

                this.background_comments = domCtr.create("div", { id: "background_comments"}, win.body());
                var header_home = domCtr.create("div", { id: "header_home", innerHTML: "<h1>Comments</h1>"},  this.background_comments);
                var row = domCtr.toDom(
                    `<select name="userId" id="userId" class="quest_input">
                    <option value="All" selected>All</option>
                    </select>`)
                this.categorySelect = domCtr.place(row, header_home);
                this.categorySelect.style.border = "1px solid grey";
                var filterKeys = Object.keys(this.filter)
                for (i in filterKeys) {
                    var option = document.createElement("option");
                    option.text = filterKeys[i];
                    this.categorySelect.add(option);
                }
                
            },

            inputHandler: function() {
                
                on(this.categorySelect, "change", function (evt) {
                    var category = evt.target.value;
                    console.log(category);
                    this.makeDivs(category);

                }.bind(this));

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

            makeDivs: function (category) {
                domCtr.destroy("container_comments");
                var container_comments = domCtr.create("div", { id: "container_comments"}, this.background_comments);
                for (i in this.features) {
                    if (category == "All" || this.filter[category].includes(parseInt(i))) {
                        var content = "<b>" + i.toString() + "</b>: " + this.features[i]
                        domCtr.create("div", {className: "comments", innerHTML: content },  container_comments);    
                    }
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