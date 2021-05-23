
define([
    "esri/core/Accessor",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

], function (
    Accessor,
    dom, on, domCtr, win, domStyle) {

    return Accessor.createSubclass({
        declaredClass: "urbanmobility.InfoProject",

        constructor: function (settings, containerHome) {
            this.settings = settings;
            domCtr.destroy("containerQuest");
            this.containerQuest = domCtr.create("div", { id: "containerQuest", className: "questionnaire" }, containerHome);
            this.containerInfoProject = domCtr.create("div", { id: "containerInfoProject", className: "questionnaire2" }, containerQuest);

            this.results = {};
        },

        init: function () {

            this.container1 = domCtr.create("div", { id: "container1", className: "containerTypeInfo" }, this.containerInfoProject);

            this.container1.innerHTML = `
            Hi there :)<br>
            I'm Daniel and in the scope of my master thesis, I developed a web app called UrbanMobility. 
            It is a tool to visualize information like traffic and public transport in an urban 
            environment in an interactive web application. It shows the current and future situation as 
            well as indicators like how many cars are on the road and how many free spaces there 
            are on the public transport.

            <h3>Study description</h3>
            In this study I want to test the usability and efficiency of the application. There are two versions 
            and your job will be to perform some specific tasks and in the end answer some questions for each version.
            We will collect the following data:
            <ul>
                <li>Time needed to finish the task</li>
                <li>Number of clicks</li>
                <li>Position of the clicks</li>
            </ul>
            So this means that you should try to answer as precise as possible, but also as fast as possible.
            It is advised to use Chrome but other browsers should work as well.<br>
            --> estimated time: 15-20 min <br>
            
            <h3>Data Protection</h3>
            The obtained data will be stored safely and reported in an anonymous form. Only the responsible 
            investigators and/or the members of the Ethics Commission will have access to the original data under 
            strictly observed rules of confidentiality.

            <h3>Some Background</h3>
            The usage of the app is exemplified on a concrete project of the city of Zurich: The 
            Rosengartentunnel and Tram. The plan is to build a semicircular tunnel in order to 
            relieve a heavily frequented road segment of around 700m in the middle of the city. 
            The original road should be scaled down and provide space for two new tram lines.<br><br>
            `
            domCtr.create("img", { id: "rosengartenImg", src: "images/rosengarten.png"}, this.containerInfoProject);
            this.container2 = domCtr.create("div", { id: "container2", className: "containerTypeInfo" }, this.containerInfoProject);

            this.container2.innerHTML = `
            The project was rejected by the public vote in Spring 2020. It’s interesting because 
            it was quite controversial and the public opinion changed a lot over time. The 
            initiative combined the tunnel and the tram, which was a clever move because it 
            attracted both sides of the mobility camps. Nevertheless it faced a lot of opposition 
            from the public and the green parties. Other arguments against it were the imense costs 
            of 1.1 Billion Swiss Francs.<br><br>

            <b>Imagine that time is turned back and we are now again shortly before the public vote 
            and You are trying to inform yourself about the project with the help of UrbanMobility.</b> <br><br>

            (Please note that some of the data is produced syntethically, so it does not always reflect the reality!)<br><br>

            <h3>Contact information</h3>
            Author: Daniel Laumer, daniel.laumer@ethz.ch, laumerd@esri.com<br>
            Professorship: Prof. Dr. Martin Raubal, mraubal@ethz.ch<br>
            ETH Zurich, Institute for Cartography and Geoinformation <br>
            Collaboration with Esri R&D, Zurich.<br><br>

            By clicking the button below you confirm that you read the information and that you agree to the data collection 
            and use of your data in my master thesis.
            `

            this.finishButton = domCtr.create("div", { id: "finishButton", className: "task_button", innerHTML: "Yes I read it!" }, this.containerQuest);
            this.settings.dev ? "" : this.finishButton.style.pointerEvents = 'none';

            
            this.clickHandler();
            
            var that = this;
            setTimeout(function(){ 
                if ((that.containerInfoProject.clientHeight + that.containerInfoProject.scrollTop + 20) >= that.containerInfoProject.scrollHeight) {
                    that.finishButton.style.pointerEvents = 'auto';
                    that.finishButton.className = "task_button active"
                }
            }, 1000);
        },

        clickHandler: function () {

            on(this.finishButton, "click", function (evt) {

                this.results["screen"] = {
                    width: window.screen.width,
                    height: window.screen.height,
                };
                this.results["browser"] = navigator.userAgent;
                this.settings.home.returnToHome(this.results);
            }.bind(this));
            
            var that = this;
            that.containerInfoProject.onscroll = function(ev) {

                if ((that.containerInfoProject.clientHeight + that.containerInfoProject.scrollTop + 20) >= that.containerInfoProject.scrollHeight) {
                    that.finishButton.style.pointerEvents = 'auto';
                    that.finishButton.className = "task_button active" 
                }
            };

        },



    });
});





