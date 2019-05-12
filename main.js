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
    result = 'rgb('
    list.forEach(function(d){
      result = result + d + ',';
    })
    result = result.substring(0,result.length-1) + ')';
    return result;
}

//load data
d3.queue()
  .defer(d3.json,"datasets/data_final.json")
  .defer(d3.json,"datasets/moma_artists.json")
  .await(plot);
function plot(error,artworks,artists){

  if (error) throw error;
  console.log(artworks[0]);
  console.log(artists[0]);

  var countByDepartment = d3.nest()
      .key(function(d){return d['Department']})
      .rollup(function(v){return v.length})
      .object(artworks);

  var departmentList = Object.keys(countByDepartment);

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

  var nestedData = d3.nest()
      .key(function(d){return d['Department']}) //group data by department
      .key(function(e){return e['ConstituentID']}) //group data by artists
      .rollup(function(v){return v.length})
      .object(artworks);

  var div = d3.select('#graphDiv').append('div')
      .attr('id','departmentDiv');

  var barTooltipDiv = d3.select('body').append("div")
      .attr("class", "barTooltip")
      .style("left","0").style("top","0")
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
          // .attr('class',function(d){return 'artist-'+d;}) //d = ConstituentID here
          .attr('class',function(d){return 'bar bar'+d;})
          // .attr('class','bar')
          .style('width',function(d){
              return data[d]/total*100+'%';
          })
          .style('background-color',function(d){
              return artistColor[d];
          })
          .on('mouseover',function(d){
              barTooltipDiv.style('opacity',1);
              barTooltipDiv.html(function(){
                if (artistsNestById[d]){
                  return artistsNestById[d][0]['DisplayName'] + '</br>' + artistsNestById[d][0]['ArtistBio'] + '</br>' + nestedData[key][d] + ' items';
                } else {
                  return 'Known Artist';
              }})
              .style("left", (d3.event.pageX) + 5 + "px")
              .style("top", (d3.event.pageY - 50) + "px");
          })
          .on('mouseout',function(d){
              barTooltipDiv.style('opacity',0).style('x','0px').style('y','0px');
          })
          .on('click',function(d){

              //Change style of selected bar
              if (selectArtistsList.indexOf(d) < 0){
                selectArtistsList.push(d);
                d3.selectAll('.bar'+d).classed('selected',true);

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
                      console.log('???',d);
                      selectArtistsList.splice(index,1);
                      d3.select(this).remove();
                      console.log('???',d3.selectAll('bar'+d));
                      d3.selectAll('.bar'+d).classed('selected',false);

                  });
              }

          })

  }

  // zoom
  var slider = document.getElementById("zoomRange");
  slider.oninput = function() {
    var zoomValue = this.value;
    d3.selectAll('.wrapper').style('width',1000*zoomValue+'px');
  }

  let artistsNestById = d3.nest()
      .key(function(d){return d['ConstituentID']})
      .object(artists);

  d3.select('#plotThumbnail').on('click',generateThumbnail);

  //filter data based on selection
  function generateThumbnail(){

    foldDiv();

    // add filters
    var filtersDiv = d3.select('div#filtersDiv').style('display','block');
    d3.selectAll(".filterCheckbox").on("change",update);
    update();

    function update(){
      displayedArtist = [];
      d3.selectAll('.artistDiv').remove();

      var choices = [];
      d3.selectAll(".filterCheckbox").each(function(d){
        cb = d3.select(this);
        if(cb.property("checked")){
          choices.push(departmentList[cb.property("value")]);
        }
      });

      console.log("updating",choices);

      if(choices.length > 0){
        filteredArtworks = artworks.filter(function(d,i){return choices.includes(d['Department']);});
      } else {
        filteredArtworks = artworks;
      }

      var nestByArtistId = d3.nest()
          .key(function(d){return d['ConstituentID']})
          .object(filteredArtworks);

      console.log("selectArtistsList",selectArtistsList);

      if ((selectArtistsList.length != 0)&&(selectArtistsList!=displayedArtist)){
        plotSelected(selectArtistsList,nestByArtistId);
      }

    }

  }

  function updateThumbnail(){
    var filteredData = nestByArtistId;
    if ((selectArtistsList.length != 0)&&(selectArtistsList!=displayedArtist)){
      plotSelected(selectArtistsList,filteredData);
    }
  }

  function plotSelected(selectArtistsList,filteredData){
    // remove deselected artists
    console.log("displayedArtist",displayedArtist)
    for (const did in displayedArtist){
        if (selectArtistsList.indexOf(displayedArtist[did]) < 0){

          var divId = "#artistDiv"+displayedArtist[did];
          console.log(d3.select(divId));
          d3.select(divId).remove();
        }
    }
    // add newly selected artists
    for (const id of selectArtistsList){
        if (displayedArtist.indexOf(id) < 0){
          displayedArtist.push(id)
          // console.log('???',filteredData[id]);
          if (artistsNestById[id]&&filteredData[id]){
            var artistWrapper = d3.select('div#thumbnailDiv').append('div')
                .attr('class','artistDiv')
                .attr('id','artistDiv'+id)
                .attr('objectID',id);

            var artistInfo = artistsNestById[id][0];
            var artworksInfo = filteredData[id];
            // console.log('artistInfo',artistInfo);
            // console.log('artworksInfo',artworksInfo);
            var labelXPosition = 47;
            var sizeScaleRatio = 10;
            var artistDesc = artistWrapper.append('div')
                .attr('class','artistDesc')
                .html(artistInfo['DisplayName'] + '</br>' + artistInfo['ArtistBio']);

            // the matrix of artists' artwork color representation
            // var artistMatrix = artistDesc.append("svg")
            //     .attr('class', 'artistMatrix');
            //
            // var birthyr = artistInfo['BeginDate']
            //
            // var matTooltipDiv = d3.select('body').append("div")
            //     .attr("class", "matTooltip")
            //     .style("opacity", 0);
            //
            // artistMatrix.selectAll('.artistBox')
            //     .data(function (d){return d['color'];}).enter()
            //     .append('rect')
            //     .attr('class', 'artistBox')
            //     .attr('x', function(d,i){return (i%10)*10;})
            //     .attr('y', function(d,i){return (parseInt(i/10));})
            //     .attr('height', 10)
            //     .attr('width', 10)
            //     .attr('fill', function(d){return convertToRGB(d);})
            //     .on('mouseover',function(d,i){
            //         matTooltipDiv.style('opacity',1);
            //         matTooltipDiv.html(function (){
            //         return str(birthyr + i);})
            //             .style("left", (d3.event.pageX) + 5 + "px")
            //             .style("top", (d3.event.pageY - 50) + "px");
            //     });


            // plotArtistGraph(artistInfo);
            var thumbnailLabelsSvg = artistWrapper.append('div')
                .attr('class','thumbnailLabels')
                .append('svg').attr('id','thumbnailabelsSvg');
            thumbnailLabelsSvg
                .append('text')
                .text('preview').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x',labelXPosition+'px').attr('y','100px');
            thumbnailLabelsSvg
                .append('text')
                .text('size').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x',labelXPosition+'px').attr('y','235px');
            thumbnailLabelsSvg
                .append('text')
                .text(sizeScaleRatio+'cm=1px').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x',labelXPosition+'px').attr('y','250px');
            thumbnailLabelsSvg
                .append('text')
                .text('palette').attr('class','labels')
                .attr('text-anchor','end')
                .attr('x',labelXPosition+'px').attr('y','290px');

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

            // console.log('img',img);
            // console.log('img',img.node());
            // img_width = img.node().getBoundingClientRect().width;
            // console.log('img_width',img_width);

            imageWrapper.on('click',function(d){
                d3.selectAll('.artworkDetails').remove();
                d3.selectAll('.colorCodes').remove();

                // show artwork's details
                showArtworkDetails(d);

                d3.selectAll('.image-wrapper')
                  .style('width','30px')
                  .style('border','none');

                var svg = d3.select(this)
                  .transition()
                  .duration(1000)
                  .style('width',function(d){

                      if (d["Width (cm)"]/d["Height (cm)"]) {
                        return d["Width (cm)"]/d["Height (cm)"]*200+'px';
                      } else {
                        return '200px';
                      }
                  })
                  .style('border-left','black 20px solid')
                  .style('border-right','black 20px solid');

                  svg.select('img')
                  .style('transform','translate(0,0)');

                  d3.select(this).select('.artworkSizeRect')
                    .transition()
                    .duration(1000)
                    .attr('x',function(d){
                        if (d["Width (cm)"]/d["Height (cm)"]) {
                          return d["Width (cm)"]/d["Height (cm)"]*200/2-d["Width (cm)"]/sizeScaleRatio*2;
                        } else {
                          return 100;
                        }
                    });

                  // plotDetails(d3.select(this));
                  plotColorAnalysis(d3.select(this).select('svg'));
              })

            function plotDetails(imageWrapper_i){
            }

            var graphWrapper = imageWrapper.append('svg')
                .attr('class','graphWrapper');

            function plotColorAnalysis(graphWrapper){
                let foldedWidth = 28;
                let blockHeight = 20;
                let blockYPosition = 65;
                let blocksGap = 2;
                var colorCodes = graphWrapper.selectAll('.colorCodes')
                  .data(function(d){
                      return d['Domain color'];}).enter()
                  .append('rect')
                  .attr('class','colorCodes')
                  .attr('x',function(d,i){return d[2]*100 + '%';})
                  .attr('y',blockYPosition+'px')
                  .attr('height',blockHeight + 'px').attr('width',function(d,i){return d[1]*100 + '%';})
                  .attr('fill',function(d){
                      return convertToRGB(d[0]);
                  });
            }

            function plotSize(){
              // Plot artwork size graph
              let sizeYPosition = 40;
              let sizeScaleRatio = 10;
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
                      return d["Height (cm)"]/sizeScaleRatio;
                    } else {
                      return 1;
                    }
                })
                .attr('width',function(d){
                    if (d["Width (cm)"]){
                      return d["Width (cm)"]/sizeScaleRatio;
                    } else {
                      return 1;
                    }
                })
                .attr('x',function(d){
                  if (d["Width (cm)"]){
                    return 15-d["Width (cm)"]/sizeScaleRatio;
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

            function plotMaxAnalysis(){
                let foldedWidth = 28;
                let blockHeight = 20;
                let blockYPosition = 65;
                let blocksGap = 1;
                var colorMax = graphWrapper
                  .append('rect')
                  .attr('class','colorMax')
                  .attr('x',blocksGap + 'px')
                  .attr('y',blockYPosition+'px')
                  .attr('height',blockHeight + 'px').attr('width',foldedWidth+'px')
                  .attr('fill',function(d){
                      return convertToRGB(d['Max Color']);
                  });
            }
            plotMaxAnalysis();
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

  d3.select('#normalizeBar')
    .on('click',normalizeBarGraph);

  var maxCount = Math.max(...Object.values(countByDepartment));
  console.log(maxCount);

  function normalizeBarGraph() {

    for (const i in Object.keys(countByDepartment)){
      d3.select('#bar_wrapper'+i)
        .transition()
        .duration(1000)
        .style('width',function(){
            return Object.values(countByDepartment)[i]/maxCount*100+'%';
        });
    d3.select('#normalizeBar')
      .html('DENORMALIZE')
      .on('click',cancelNormalize);
    }
  }

  function cancelNormalize() {
    d3.selectAll('.bar_wrapper')
      .transition()
      .duration(1000)
      .style('width','100%');
    d3.select('#normalizeBar')
      .html('NORMALIZE BAR GRAPH')
      .on('click',normalizeBarGraph);
  }
  var artworkDetailDiv = d3.select('#selectedArtworks');
  artworkDetailDiv.append('p').html('SELECTED ARTWORKS:');
  artworkDetailDiv.append('p')
    .html("click on artwork's thumbnail to see details and recommendations")
    .attr('class','labels');

  var descDiv = artworkDetailDiv.append('div')
    .attr('class','artworkDesc');
  var descText = descDiv.append('p').attr('class','descriptions');

  var recommendationDiv = d3.select('#recommendation');
  recommendationDiv.append('p').html('SIMILAR ARTWORKS:');
  recommendationDiv.append('p')
    .html("similiar artworks are computed by extracting style features using an pre-trained VGG19 model")
    .attr('class','labels');
  var recommendWrapper = recommendationDiv.append('div').attr('id','recommend-wrapper');

  function showArtworkDetails(d){

      descText.html(function(){
          return d['Title'] + ' </br> ' + d['Date'] + ' </br></br> ' + d['Medium'] + '</br>';
      });
      descText.append('div').append('a').attr('href',function(){
          return d['URL']
      }).html(">>> go to artwork's webpage")
      .attr('class','link');
  }
}
