//parameters
var svg1 = d3.select('#graphDiv').append('svg')
              .attr('height','800px')
              .attr('width','1350px')
              .style('overflow','auto');

// helper functions
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//load data
d3.csv("datasets/moma_artworks.csv", function(error,data) {
  // return {
  //     artist_id: d["Artist Id"],
  //     classification: d["Classification"],
  //     title: d["Title"]
  // };
// }).then(function(data){
  if (error) throw error;
  console.log(data[0]);
  //format rawData
  var rawData = data;
  // rawData.forEach(function(d){
  //   //process data
  // })
  var countByDepartment = d3.nest()
      .key(function(d){return d['Department']})
      .rollup(function(v){return v.length})
      .object(rawData);

  var countByArtist = d3.nest()
      .key(function(d){return d['Artist ID']}) //group data by artists
      .rollup(function(v){return v.length})
      .object(rawData);

  console.log(countByArtist);
  var artistColor = {};
  const artists = Object.keys(countByArtist);

  for (const artist of artists){
      var color = getRandomColor();
      artistColor[artist] = color;
  }
  console.log("artistColor",artistColor);
  console.log(countByDepartment);
  var nestedData = d3.nest()
      .key(function(d){return d['Department']}) //group data by department
      .key(function(e){return e['Artist ID']}) //group data by artists
      .rollup(function(v){return v.length})
      .object(rawData);
  console.log(nestedData);
  // console.log(JSON.stringify(nestedData));
  console.log(Object.keys(nestedData));

  var div = d3.select('#graphDiv').append('div')
      .attr('id','departmentDiv');

  const keys = Object.keys(nestedData);
  for (const key of keys){
      console.log("for each",key);
      var data = nestedData[key];
      var total = countByDepartment[key];
      console.log(total);
      var wrapper = d3.select('#departmentDiv').append('div')
          .attr('class','bar_wrapper')
          .attr('id','bar_wrapper' + keys.indexOf(key));
      var bar = wrapper.selectAll('.bar')
          .data(Object.keys(data)).enter().append('span')
          .attr('class','bar')
          .style('width',function(d){
              // return data[d]+'px';
              return data[d]/total*100+'%';
          })
          .style('background-color',function(d){
              var r = 255
              return getRandomColor();
          });
      console.log("bar",bar);
  }
})
