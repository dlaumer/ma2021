define([
    "esri/core/Accessor",
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom",
    "dojo/on",

], function (
    Accessor, Query,
    domCtr, win, dom, on
) {
        return Accessor.createSubclass({
            declaredClass: "urbanmobility.graphMaker",

            constructor: function (scene, view, settings) {
                this.scene = scene;
                this.view = view;
                this.settings = settings;
            },

            initPTDiagramm: function() {
                this.margin = { top: 10, right: 10, bottom: 40, left: 50 };
                this.widthTimeline = d3
                  .select('#dashboard-chart')
                  .node()
                  .getBoundingClientRect().width - this.margin.left - this.margin.right;
                // Set dimensions
                this.heightTimeline = d3
                  .select('#dashboard-chart')
                  .node()
                  .getBoundingClientRect().height - this.margin.top - this.margin.bottom;
              

                this.svgTimeline = d3.select("#dashboard-chart")
                .append("svg")
                .attr("width", this.widthTimeline + this.margin.left + this.margin.right)
                .attr("height", this.heightTimeline + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + this.margin.left + "," + this.margin.top + ")")

                // Text label for the y axis
                this.svgTimeline.append("text")
                .attr("font-size", "10px")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left / 2)
                .attr("x", 0 - (this.heightTimeline / 2))
                .style("text-anchor", "middle")
                .text("Occupancy [%]");

                // Initialize the X axis
                this.xScale = d3.scaleBand()
                .range([0, this.widthTimeline])
                .padding(0.2);

                this.xScale.invert = function (x) {
                var domain = this.domain();
                var range = this.range()
                var scale = d3.scaleQuantize().domain(range).range(domain)
                return scale(x)
                };
                this.xAxis = this.svgTimeline.append("g")
                .attr("transform", "translate(0," + this.heightTimeline + ")")

                // Initialize the Y axis
                this.yScale = d3.scaleLinear()
                .range([this.heightTimeline, 0]);
                this.yAxis = this.svgTimeline.append("g")
                .attr("class", "yAxis")

            },

            updateDonutChart: function(percentage) {

                var marg = 0;

                var width = d3
                  .select('#dashboard-info')
                  .node()
                  .getBoundingClientRect().width - marg - marg;
                // Set dimensions
                var height = d3
                  .select('#dashboard-info')
                  .node()
                  .getBoundingClientRect().height - marg - marg;

                // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
                this.radius = Math.min(width, height) / 2 - marg


    
                this.svg = d3.select("#dashboard-info").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                

                this.svg.append("text")
                    .attr("x", 0 )
                    .attr("y", 0 + this.radius/10 )
                    .attr("class", "text-tooltip")        
                    .style("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .style("font-size", this.radius/2.5+"px")
                    .attr("fill", this.settings.colors.now);
                
                this.render(percentage);
            },

            render: function(percentage) {

                var color = [this.settings.colors.now, "#17BEBB40"]

                var data = [percentage, 100-percentage];
                
                var pie = d3.pie()
                    .sort(null);
            
                var arc = d3.arc()
                    .innerRadius(this.radius/2)
                    .outerRadius(this.radius-this.radius/6);
            
                var path = this.svg.selectAll("path")
                    .data(pie(data));
            
                var pathEnter = path.enter().append("path")
                    .attr("fill", function(d, i) {
                        return color[i];
                    })
                    .attr("d", arc).transition().duration(1000).attrTween("d", arcTween);
            
                var pathUpdate = path.attr("d", arc).transition().duration(1000).attrTween("d", arcTween);
                
                this.svg.select("text.text-tooltip")
                    .text(percentage.toFixed(0) + "%").transition().duration(1000);


                // Store the displayed angles in _current.
            // Then, interpolate from _current to the new angles.
            // During the transition, _current is updated in-place by d3.interpolate.
            function arcTween(a) {
                var i = d3.interpolate(this._current, a);
                this._current = i(0);
                return function(t) {
                return arc(i(t));
                };
            }
            
            },

        

            updatePTDiagramm: function(hourData, firstTime=false) {
                d3.selection.prototype.conditionalTransition =
                    function(cond) {
                        return cond ? this: this.transition().duration(1000);
                    };
                // Update the barcharts according to what is clicked
                var that = this;
                // Parse the Data
                // X axis
                that.xScale.domain(hourData.map(function (d) { return d.time; }))
                that.xAxis.conditionalTransition(firstTime).call(d3.axisBottom(that.xScale).tickFormat(function (d) {
                  return d
                }
                ))
                  .selectAll("text")
                  .style("text-anchor", "end")
                  .attr("dx", "-.8em")
                  .attr("dy", ".15em")
                  .attr("transform", "rotate(-65)")
              
                // Add Y axis
                that.yScale.domain([0,100]);
                that.yAxis.conditionalTransition(firstTime).call(d3.axisLeft(that.yScale).ticks(3));
              
                // variable u: map data to existing bars
                var u = that.svgTimeline.selectAll("rect")
                  .data(hourData)
              
                // Update bars
                u
                  .enter()
                  .append("rect")
                  .merge(u)
                  .conditionalTransition(firstTime)
                  .attr("x", function (d) { 
                      return that.xScale(d.time); })
                  .attr("y", function (d) { 
                      return that.yScale(d.percentage); })
                  .attr("width", that.xScale.bandwidth())
                  .attr("height", function (d) { 
                      return that.heightTimeline - that.yScale(d.percentage); })
                  .attr("fill", that.settings.colors.now)
                  .attr("class", "bars")
                   // Update bars
                
                   /*
                u
                .enter()
                .append("rect")
                .merge(u)
                .conditionalTransition(firstTime)
                .attr("x", function (d) { 
                    return that.xScale(d.time); })
                .attr("y", function (d) { 
                    return 0; })
                .attr("width", that.xScale.bandwidth())
                .attr("height", function (d) { 
                    return that.heightTimeline- that.yScale(100-d.percentage); })
                .attr("fill", "#17BEBB40")
                .attr("class", "bars")
              
              */
              
              }

        });
    }
);