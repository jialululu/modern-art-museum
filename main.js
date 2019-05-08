//parameters
var svg1 = d3.select('#graphDiv').append('svg')
              .attr('height','800px')
              .attr('width','1350px')
              .style('overflow','auto');

var selectArtistsList = [];

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
d3.queue()
  .defer(d3.json,"datasets/moma_artworks_s.json")
  .defer(d3.json,"datasets/moma_artists.json")
  .await(plot);
function plot(error,artworks,artists){
// d3.csv("datasets/moma_artworks.csv", function(error,data) {
  // return {
  //     artist_id: d["ConstituentID"],
  //     classification: d["Classification"],
  //     title: d["Title"]
  // };
// }).then(function(data){
  if (error) throw error;
  console.log(artworks[0]);
  console.log(artists[0]);
  //format rawartworks
  // rawartworks.forEach(function(d){
  //   //process data
  // })
  var countByDepartment = d3.nest()
      .key(function(d){return d['Department']})
      .rollup(function(v){return v.length})
      .object(artworks);

  var countByArtist = d3.nest()
      .key(function(d){return d['ConstituentID']}) //group data by artists
      .rollup(function(v){return v.length})
      .object(artworks);

  var nestByArtist = d3.nest()
      .key(function(d){return d['ConstituentID']}) //group data by artists
      .object(artists);
  // console.log(nestByArtist);

  var artistColor = {};
  const artistsList = Object.keys(countByArtist);

  for (const artist of artistsList){
      var color = getRandomColor();
      artistColor[artist] = color;
  }

  console.log('???',artistColor);

  console.log(countByDepartment);
  var nestedData = d3.nest()
      .key(function(d){return d['Department']}) //group data by department
      .key(function(e){return e['ConstituentID']}) //group data by artists
      .rollup(function(v){return v.length})
      .object(artworks);

  // console.log(JSON.stringify(nestedData));
  console.log(Object.keys(nestedData));

  var div = d3.select('#graphDiv').append('div')
      .attr('id','departmentDiv');

  const keys = Object.keys(nestedData);
  for (const key of keys){
      // key = departments here

      var data = nestedData[key];
      var total = countByDepartment[key];

      var wrapper = d3.select('#departmentDiv').append('div')
          .attr('class','bar_wrapper')
          .attr('id','bar_wrapper' + keys.indexOf(key));
      var bar = wrapper.selectAll('.bar')
          .data(Object.keys(data)).enter().append('span')
          .attr('class','bar')
          // .attr('class',function(d){return 'artist-'+d;}) //d = ConstituentID here
          .attr('artist',function(d){return d;})
          .style('width',function(d){
              // return data[d]+'px';
              return data[d]/total*100+'%';
          })
          .style('background-color',function(d){
              return artistColor[d];
          })
          .on('click',function(d){
              //Change style of selected bar
              selectArtistsList.push(d);
              artistsNestById[d]['DisplayName'];
              d3.select(this)
                .classed('selected',true)
                .style('border-color',artistColor[d]);
              //TODO: Add graphs for each artists
              d3.select('#selectedArtists').append('button')
                .html(nestByArtist[d][0]['DisplayName'])
                .attr('class','selectedArtist')
                .style('background-color',artistColor[d]);

              var svg = d3.select('#artistGraph').append('svg')
                .attr('width','100%')
                .attr('height','300px');
              svg.append('circle')
                .attr('cx','50%')
                .attr('cy','150px')
                .attr('r','140px');
              //TODO: remove selected artists and update highlights
              //TODO: remove all
          })

  }

  let artistsNestById = d3.nest()
      .key(function(d){return d['ConstituentID']})
      .object(artists);

  // console.log('???',artistsNestById);

  var tooltip = d3.select("#hoverDiv").append('div')
        .attr("class","tooltipDiv");

  //TODO: Add tooltip and hover effects
  var allBars = d3.selectAll(".bar").nodes();
  allBars.forEach(function(d,i){
    if (i <= 10){
      // console.log(d.getAttribute('artist'));
      // console.log(this);
      // var artistID = d.getAttribute('artist');
      // var name = artistsNestById[artistID][0]['Name'];
      // console.log(name);
    }
  });

  d3.select('#plotThumbnail').on('click',generateThumbnail);
  //filter data based on selection
  function generateThumbnail(){

    foldDiv();

    console.log("selectArtistsList",selectArtistsList);
    var filteredData = artworks.filter(function(d,i){
      var tempid;
      if (d['ConstituentID'][0]) {
        tempid = d['ConstituentID'][0].toString();
      }
      // if (i<10){console.log(d['ThumbnailURL']);}
      return (selectArtistsList.includes(tempid)&&d['ThumbnailURL']);
    })
    console.log("filteredData",filteredData)

    //plot thumbnail part
    var imageWrapper = d3.select('div#thumbnails').selectAll('.image-wrapper')
      .data(filteredData).enter()
      // .append('div')
      // .attr('class','item-wrapper')
      .append('svg')
      .attr('class','image-wrapper')
      .style('width','30px')
      .on('click',function(d){
        d3.selectAll('.image-wrapper')
          .style('width','30px')
          .style('border','none');
        var svg = d3.select(this)
          .transition()
          .duration(1000)
          .style('width',function(d){
              // console.log(d["Width (cm)"]/d["Height (cm)"]*300);
              console.log(d3.select(this).select('image').attr('width'));
              if (d["Width (cm)"]/d["Height (cm)"]) {
                return d["Width (cm)"]/d["Height (cm)"]*300+'px';
              } else {
                return '300px';
              }
          })
          .style('border-left','#333333 20px solid')
          .style('border-right','#333333 20px solid');
          d3.select(this).select('.artworkSizeRect')
            .transition()
            .duration(1000)
            .attr('x',function(d){
                if (d["Width (cm)"]/d["Height (cm)"]) {
                  return d["Width (cm)"]/d["Height (cm)"]*300/2-d["Width (cm)"]/5;
                } else {
                  return 150;
                }
            });

          d3.select(this).append('rect')
            .attr('class','descriptionBox')
            .attr('width','100%')
            .attr('height','40');
          d3.select(this).append('text')
            .attr('x','20')
            .attr('y','20')
            .text('Hello');
        // var texts = svg.append('text')
        //   .text(d);
      })
    imageWrapper.append('image')
      .attr('xlink:href',function(d){
          return d['ThumbnailURL'];
      })
      .attr('height','300px')
      .attr('class','thumbnail');

    imageWrapper.append('line')
      .attr('class','constructionLine')
      .attr('x1','0').attr('y1','340')
      .attr('x2','100%').attr('y2','340')
      .style('stroke','grey')
      .style('stroke-width','1px');

    imageWrapper.append('rect')
      .attr('class','artworkSizeRect')
      .attr('height',function(d){
          if (d["Height (cm)"]) {
            return d["Height (cm)"]/5;
          } else {
            return 1;
          }
      })
      .attr('width',function(d){
          if (d["Width (cm)"]){
            return d["Width (cm)"]/5;
          } else {
            return 1;
          }
      })
      .attr('x',function(d){
        if (d["Width (cm)"]){
          return 15-d["Width (cm)"]/5;
        } else {
          return 14.5;
        }
      })
      .attr('y',function(d){
        if (d["Height (cm)"]) {
          return 340-d["Height (cm)"]/10;
        } else {
          return 339.5;
        }
      });
  }

  // add function to fold and expand graphDiv
  d3.select('#foldGraphDiv')
    .on('click',foldDiv);

  function foldDiv() {
    d3.selectAll('.bar_wrapper')
      // .transition()
      //   .attr('duration',1000)
        .style('height','8px')
        .style('margin','3px 0');
    d3.select('button#foldGraphDiv')
      .html('EXPAND')
      .on('click',expandDiv);
  }

  function expandDiv() {
    d3.selectAll('.bar_wrapper')
      .style('height','55px')
      .style('margin','10px 0');
    d3.select('button#foldGraphDiv')
      .html('FOLD')
      .on('click',foldDiv);
  }
}
