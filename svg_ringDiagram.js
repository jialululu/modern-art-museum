    d3.json("tweets.json",function(error,data) {dataViz(data.tweets)});

    function dataViz(incData) {

      var background = d3.select('svg')
      	.append('rect')
      	.classed('background', true)
      	.attr({
        	'x': 0,
        	'y': 0,
        	'height': 500,
        	'width': 960
      	})
      	.style('fill', 'white');

      nestedTweets = d3.nest()
      .key(function (el) {return el.user})
      .entries(incData);

    	var sunlight14 = [
				'#193556',
				'#42A5B3',
				'#E3BA22',
				'#F2DA57',
				'#BD8F22',
				'#E6842A',
				'#F6B656',
				'#BA5F06',
				'#137B80',
				'#42A5B3',
				'#005D6E',
				'#8E6C8A',
				'#B396AD',
				'#684664'
			]
    	var colorScale = d3.scale.ordinal()
    		.range(sunlight14);

      nestedTweets.forEach(function (el) {
        el.numTweets = el.values.length
        el.numFavorites = d3.sum(el.values, function (d) {return d.favorites.length});
        el.numRetweets = d3.sum(el.values, function (d) {return d.retweets.length});
      })

     	var pieChart = d3.layout.pie().sort(null);
     	pieChart.value(function(d) {return d.numRetweets});
     	newArc = d3.svg.arc();
     	newArc.outerRadius(200).innerRadius(170);

     pieChartFavs = d3.layout.pie().sort(null);
     pieChartFavs.value(function(d) {return d.numFavorites});
      console.log('pieChartFavs', pieChartFavs);

      d3.select("svg")
      .append("g")
      .attr("transform","translate(480,250)")
      .selectAll("path")
      .data(pieChartFavs(nestedTweets), function(d) {return d.data.key})
      .enter()
      .append("path")
      	.attr("d", newArc)
      		.style("fill", function(d, i) {return colorScale(i)})
      		.style("opacity", 0)
      		.style("stroke", "none")
      		.style("stroke-width", "2px")
      		.each(function(d) { this._current = d; });


 			function animate() {
        d3.selectAll("path")
					.transition()
          .delay(function(d, i) { return i * 500; })
          .duration(500)
          	.attrTween('d', function(d) {
   						var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
   						return function(t) {
       				d.endAngle = i(t);
     					return newArc(d);
   					}
					})
      		.style('opacity', 1)
      }

			animate();

      d3.select('rect.background').on('click', click);

      function click() {
        d3.selectAll('path')
          .transition()
          .duration(0)
          .style('opacity', 0)
        .call(null, animate())
      }

      function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
      return function(t) {
      return newArc(i(t));
      };

    }

    }