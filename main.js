//parameters
var svg1 = d3.select('#graphDiv').append('svg')
              .attr('height','800px')
              .attr('width','1350px')
              .style('overflow','auto');

var selectArtistsList = [];
var displayedArtist = [];

// helper functions
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function convertToRGB(list){
    console.log('color-list',list)
    result = 'rgb('
    list.forEach(function(d){
      result = result + d + ',';
    })
    result = result.substring(0,result.length-1) + ')';
    console.log('result',result)
    return result;
}

//load data
d3.queue()
  .defer(d3.json,"datasets/data-1.json")
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

  var nestByArtistId = d3.nest()
      .key(function(d){return d['ConstituentID']})
      .object(artworks);

  // console.log('???',nestByArtistId);

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

  console.log('artistColor',artistColor);

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

  var barTooltipDiv = div.append("div")
      .attr("class", "barTooltip")
      .style("opacity", 0);

  const keys = Object.keys(nestedData);
  for (const key of keys){
      // key = departments here

      var data = nestedData[key];
      var total = countByDepartment[key];

      var wrapper = d3.select('#departmentDiv').append('div')
          .attr('class','wrapper')
          .attr('id','wrapper' + keys.indexOf(key));

      var departmentDesc = wrapper.append('div')
          .attr('class','departmentDesc')
          .html(key+' : '+countByDepartment[key] + ' items');

      var barWrapper = wrapper.append('div')
          .attr('class','bar_wrapper')
          .attr('id','bar_wrapper' + keys.indexOf(key));

      var bar = barWrapper.selectAll('.bar')
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
          .on('mouseover',function(d){
              barTooltipDiv.style('opacity',1);
              barTooltipDiv.html(function(){
                if (artistsNestById[d]){
                  return artistsNestById[d][0]['DisplayName'] + '</br>' + artistsNestById[d][0]['ArtistBio'];
                } else {
                  return 'Known Artist';
              }})
              .style("left", (d3.event.pageX) + 5 + "px")
              .style("top", (d3.event.pageY - 50) + "px");
          })
          .on('mouseout',function(d){
              barTooltipDiv.style('opacity',0);
          })
          .on('click',function(d){
              //Change style of selected bar
              if (selectArtistsList.indexOf(d) < 0){
                selectArtistsList.push(d);
                // artistsNestById[d]['DisplayName'];
                d3.select(this)
                  .classed('selected',true)
                  .style('border-color',artistColor[d]);
                //TODO: Add graphs for each artists
                d3.select('#selectedArtists').append('button')
                  .html(function(){
                      if(nestByArtist[d]){
                          return nestByArtist[d][0]['DisplayName'];
                      } else {
                          return "Unknown Artist";
                  }})
                  .attr('class','selectedArtist')
                  .style('background-color',artistColor[d])
                  .on('click',function(){
                      var index = selectArtistsList.indexOf(d)
                      selectArtistsList.splice(index,1);
                      d3.select(this).remove();
                  });
              }

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
    // var filteredData = artworks.filter(function(d,i){
    //   var tempid;
    //   if (d['ConstituentID'][0]) {
    //     tempid = d['ConstituentID'][0].toString();
    //   }
    //   // if (i<10){console.log(d['ThumbnailURL']);}
    //   return (selectArtistsList.includes(tempid)&&d['ThumbnailURL']);
    // })
    // console.log("filteredData",filteredData)
    var filteredData = nestByArtistId;
    if ((selectArtistsList.length != 0)&&(selectArtistsList!=displayedArtist)){
      plotSelected(selectArtistsList,filteredData);
    }
  }

  function plotSelected(selectArtistsList,filteredData){
    // remove deselected artists
    console.log("displayedArtist",displayedArtist)
    for (const did in displayedArtist){
        if (selectArtistsList.indexOf(did) < 0){
          console.log("removing", divId)
          var divId = "#artistDiv"+did;
          d3.select(divId).remove();
        }
    }
    // add newly selected artists
    for (const id of selectArtistsList){
        if (displayedArtist.indexOf(id) < 0){
          displayedArtist.push(id)
          console.log(id)
          if (artistsNestById[id]){
            var artistWrapper = d3.select('div#thumbnailDiv').append('div')
                .attr('class','artistDiv')
                .attr('id','artistDiv'+id)
                .attr('objectID',id);

            var artistInfo = artistsNestById[id][0];
            var artworksInfo = filteredData[id];
            console.log('artistInfo',artistInfo);
            // console.log('artworksInfo',artworksInfo);

            var artistDesc = artistWrapper.append('div')
                .attr('class','artistDesc')
                .html(artistInfo['DisplayName'] + '</br>' + artistInfo['ArtistBio']);

            // plotArtistGraph(artistInfo);
            var thumbnailLabelsSvg = artistWrapper.append('div')
                .attr('class','thumbnailLabels')
                .append('svg').attr('id','thumbnailabelsSvg');
            thumbnailLabelsSvg
                .append('text')
                .text('preview').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x','45px').attr('y','100px');
            thumbnailLabelsSvg
                .append('text')
                .text('size').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x','45px').attr('y','235px');
            thumbnailLabelsSvg
                .append('text')
                .text('5cm = 1px').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x','45px').attr('y','250px');

            var thumbnailWrapper = artistWrapper.append('div')
              .attr('class','thumbnailWrapper');

            var imageWrapper = thumbnailWrapper.selectAll('.image-wrapper')
              .data(artworksInfo).enter()
              .append('div')
              .attr('class','image-wrapper')
              .style('width','30px');

            var img = imageWrapper.append('img')
              .attr('src',function(d){
                  return d['ThumbnailURL'];
              })
              .attr('height','200px')
              .attr('class','thumbnail')
              .attr('id',function(d){return 'thumbnail'+d['ObjectID'];});

            console.log('img',img);
            console.log('img',img.node());
            img_width = img.node().getBoundingClientRect().width;
            console.log('img_width',img_width);

            imageWrapper.on('click',function(d){
                d3.selectAll('.artworkDetails').remove();

                d3.selectAll('.image-wrapper')
                  .style('width','30px')
                  .style('border','none');

                var svg = d3.select(this)
                  .transition()
                  .duration(1000)
                  .style('width',function(d){
                      console.log(d3.select(this).select('image'));

                      if (d["Width (cm)"]/d["Height (cm)"]) {
                        return d["Width (cm)"]/d["Height (cm)"]*200+'px';
                      } else {
                        return '200px';
                      }
                  })
                  .style('border-left','#333333 20px solid')
                  .style('border-right','#333333 20px solid');

                  svg.select('img')
                  .style('transform','translate(0,0)');

                  d3.select(this).select('.artworkSizeRect')
                    .transition()
                    .duration(1000)
                    .attr('x',function(d){
                        if (d["Width (cm)"]/d["Height (cm)"]) {
                          return d["Width (cm)"]/d["Height (cm)"]*200/2-d["Width (cm)"]/5;
                        } else {
                          return 100;
                        }
                    });

                  plotDetails(d3.select(this));
                  // d3.select(this).select('.artworkDetails').style('display','block');
              })

            function plotDetails(imageWrapper){
                imageWrapper.append('div').attr('class','artworkDetails')
                  .html(function(d){
                      return d['Title'] + ' </br> ' + d['Date'] + ' | ' + d['Medium']
                  });
            }

            var graphWrapper = imageWrapper.append('svg')
                .attr('class','graphWrapper');

            function plotSize(){
              // Plot artwork size graph
              let sizeYPosition = 50;
              graphWrapper.append('line')
                .attr('class','constructionLine')
                .attr('x1','0').attr('y1',sizeYPosition+'px')
                .attr('x2','100%').attr('y2',sizeYPosition+'px')
                .style('stroke','grey')
                .style('stroke-width','1px');

              graphWrapper.append('rect')
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
                    return sizeYPosition-d["Height (cm)"]/10;
                  } else {
                    return sizeYPosition - 0.5;
                  }
                });
              }
            plotSize();

            function plotColorAnalysis(){
                let foldedWidth = 28;
                let blockHeight = 30;
                let blockYPosition = 65;
                let blocksGap = 2;
                var colorCodes = graphWrapper.selectAll('.colorCodes')
                  .data(function(d){
                      return d['Domain color'];}).enter()
                  .append('rect')
                  .attr('class','colorCodes')
                  .attr('x',function(d,i){return i*30+'px';})
                  .attr('y',blockYPosition+'px')
                  .attr('height',blockHeight + 'px').attr('width',function(d,i){return d[1]*100 + '%'})
                  .attr('fill',function(d){
                      return convertToRGB(d[0]);
                  });
            }
            plotColorAnalysis();
          }
        }
    }
  }

  // add function to fold and expand graphDiv
  d3.select('#foldGraphDiv')
    .on('click',foldDiv);

  function foldDiv() {
    d3.selectAll('.wrapper')
      // .transition()
      //   .attr('duration',1000)
        .style('height','8px');
        // .style('margin','3px 0');
    d3.select('button#foldGraphDiv')
      .html('EXPAND')
      .on('click',expandDiv);
    d3.selectAll('.departmentDesc')
      .style('display','none');
  }

  function expandDiv() {
    d3.selectAll('.wrapper')
      .style('height','60px');
      d3.selectAll('.departmentDesc')
        .style('display','block');
    d3.select('button#foldGraphDiv')
      .html('FOLD')
      .on('click',foldDiv);
  }
}
