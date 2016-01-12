    // Some globals
    var NS = 50; // Number of Samples to which every path should be mapped.

    var activeLine;

    var training_data = []; // this is to add the input from the user to the global training data set

    var lastSVG;
    var CL; // list of probabilities for every element in this order: stick,circle,spring,...
    var CL_ind;
    var bb; // box characteristics of the handwritten path
    //var features;
    var lastInd;
    var idStr;

    var added;

    // Some flags
    var haveDragged;
    var editMode = true;
    var eraserMode = false;

    // //to prevent body movement in mobile devices
    //   d3.select("body")
    //     .on("touchmove", nozoom);

    //   function nozoom() {
    //     d3.event.preventDefault();
    //   };

    var renderPath = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear");

    var renderPolygon = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

    //SVGs
    var svg = d3.select('#drawings')
                .append('svg')
                .attr('id','svg')
              .call(d3.behavior.drag()
                .on("dragstart", dragstarted)
                .on("drag", dragged)
                // .on("dragend", dragended)
              );
    // svg.on('click',clickSvgContainer); //needed for erasing rendered objects while at edit mode

    var gameOverPanel = d3.select('#gameOverPanel');
    var accomplishPanel = d3.select('#accomplishPanel');
    var helpPanel = d3.select('#helpPanel');


    //to prevent body movement in mobile devices
    d3.select("#drawings").on("touchmove", noScroll);
    function noScroll() {
		    d3.event.preventDefault();
	     };

    // $( "#drawings" ).bind( "tap", dragended);

    //this is necessary to avoid double execution of next() on mobile devices
    svg.on("ontouchstart" in document ? "touchend" : "mouseup", dragended)


    var blocks = d3.select('#falls')
                .append('svg')
                .attr('id','svgFalls');

    var epoch = d3.select('#epochNumber');
    var score = d3.select('#scoreNumber');

    var activeLine = svg.append("path").datum([]).attr("class", "line");

    function dragstarted() {
      // From http://bl.ocks.org/mbostock/f705fc55e6f26df29354
      // activeLine = svg.append("path").datum([]).attr("class", "line");
      activeLine.datum([]).attr("d", renderPath);
    }

    function dragged() {
      // aux=Date.now()
      activeLine.datum().push(d3.mouse(this));
      activeLine.attr("d", renderPath);
      haveDragged = true;
    }

    function dragended() {
      // console.log(Date.now()-aux)

      // If you came here because of a 'click' event, next object
      if (!haveDragged) {
        //activeLine.remove();
        if (newEpoch == false) {
          next();
          // We are here because of a click event, but dragstarted was also fired, so rebuild the line:
          var path = training_data[training_data.length-1].coords;
          activeLine.datum(path).attr("d", renderPath);
        }
        return;
      }
      haveDragged = false;


      // Train THE RANDOM FOREST
      trainIT(training_data);

      // Compute characteristics of path
      var path = activeLine.datum();
      var fb = characteristics(path);

      // Compute the classification probabilities
      if (counter-1 >= numIcons) { // I substract 1 to counter because at this point, the counter start at 1, not at 0.
        CL = classify(fb.features);
      } else { // in the training period, provide an artificial classification with the highest prob. to every icon consecutively
        CL = _.map(_.range(numIcons-1,-1,-1),function(d){return (d+counter-1) % numIcons;});
      }
      CL_ind = descIndexSort(CL); //descent sorted indeces

      lastInd = 0;
      var label = icons[CL_ind[lastInd]];

      // change image
      listOfBlocks[listOfBlocks.length-1].changeImage(label);

      if (newEpoch) { // add new data point only once per epoch (one epoch starts when two new icons are thrown)
        training_data.push({'label':label, 'coords':path, 'features':fb.features});
        newEpoch = false;
      } else {
        training_data[training_data.length-1].coords = path;
        training_data[training_data.length-1].features = fb.features;
      }

    }


    function descIndexSort(arr){ // inspired by http://stackoverflow.com/a/14439442/4564295
      var indices = _.map(arr,function(d,i){return i;});
      indices.sort(function (a, b) { return arr[a] > arr[b] ? -1 : arr[a] < arr[b] ? 1 : 0; });
      return indices;
    }


    function next(){ // convert successively to SVG from more to less probable according to prediction
      // lastSVG.remove();
      lastInd += 1;
      lastInd %= icons.length;
      var label = icons[CL_ind[lastInd]];

      listOfBlocks[listOfBlocks.length-1].changeImage(label);

      training_data[training_data.length-1].label = label;

      }


    function classify(features) {
      var p_forest = _.map(forest, function(d){return d.predictOne(features)});
      return p_forest;
    }
