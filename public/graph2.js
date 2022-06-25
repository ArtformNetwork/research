let lookupTable = {}; //#### lookup the new table.-----------------------------
let reverseLookup = {}; //#### map ID to artForm name-----------------------------
let adjacentMatrix = {};//#### to find nodes related to and from this nodes-----------------------------
let reverseAdjacentMatrix = {};
let network;
let artforms = [];

const sensesLookup = { 
//#### use the shorten abbrevition from the database to write the respective senses----------------------------- 
//#### on the popup when an artform was clicked-----------------------------

  'VHToTaS': 'Vision, Hearing, Touch, Taste, Smell',
  'HToTaS': 'Hearing, Touch, Taste, Smell',
  'VToTaS': 'Vision, Touch, Taste, Smell',
  'VHTaS': 'Vision, Hearing, Taste, Smell',
  'VHToS': 'Vision, Hearing, Touch, Smell',
  'VHToTa': 'Vision, Hearing, Touch, Taste',
  'ToTaS': 'Touch, Taste, Smell',
  'HTaS': 'Hearing, Taste, Smell',
  'HToS': 'Hearing, Touch, Smell',
  'HToTa': 'Hearing, Touch, Taste',
  'VTaS': 'Vision, Taste, Smell',
  'VToS': 'Vision, Touch, Smell',
  'VToTa': 'Vision, Touch, Taste',
  'VHS': 'Vision, Hearing, Smell',
  'VHTa': 'Vision, Hearing, Taste',
  'VHTo': 'Vision, Hearing, Touch',
  'TaS': 'Taste, Smell',
  'ToS': 'Touch, Smell',
  'ToTa': 'Touch, Taste',
  'HS': 'Hearing, Smell',
  'HTa': 'Hearing, Taste',
  'HTo': 'Hearing, Touch',
  'VS': 'Vision, Smell',
  'VTa': 'Vision, Taste',
  'VTo': 'Vision, Touch',
  'VH': 'Vision, Hearing',
  'V': 'Vision',
  'H': 'Hearing',
  'To': 'Touch',
  'Ta': 'Taste',
  'S': 'Smell',

}


var t0 = performance.now();
//#### CREATE THE NODES -----------------------------
function drawGraph(nodes, edgesData) {
//#### CREATING ARRAY OF EDGES-----------------------------
  var edges = new vis.DataSet([
    ...edgesData
  ]);

//#### CREATING NETWORK HERE-----------------------------
  var container = document.getElementById("mynetwork");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {
    interaction: {
      hover: true,
    },
    groups: {
      'adjacent': {
        borderWidth: 5
      },
      'reverse': {
        borderWidth: 5
      }
    },
//#### PROPERTIES OF THE NETWORK GRAPH-----------------------------
    edges: {
      smooth: { type: "continuous", enabled: false }
    },
    layout: {
      improvedLayout: false
    },
    nodes: {
      shape: "dot",
      scaling: {
        customScalingFunction: function (min, max, total, value) {
          return value / total;
        },
        min: 30,
        max: 80,
      },
      font: {
        size: 20,
        color: "white",
        face: "Tahoma",
      },
    },

  //#### THE PHYSIC SIMULATION CODE WILL BE OVER HERE-----------------------------
    physics: {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -800000,
        centralGravity: 0.000,
        springLength: 50,
        springConstant: 0.03,
        damping: 0.4,
        avoidOverlap: 0
      },
      stabilization: {
        iterations: 1000,
        updateInterval: 1
    }

    },
    interaction: {
      tooltipDelay: 200,
      hideEdgesOnDrag: true,
    },

  };

  network = new vis.Network(container, data, options)
  console.log("graph drawn")

//#### SHOW LOADING PROGRESS-----------------------------
  network.on('stabilizationProgress', function (i) {

    document.querySelector(".loadText").innerHTML = (i.iterations / i.total * 100).toFixed(1) + "% - " + "Fetching Artform Database"
  
    if (i.iterations >= 1000) {
      document.querySelector("#progress").remove();
      var t1 = performance.now();
      console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    }
//#### REMOVE ONCE LODED-----------------------------
    else if (i.iterations < 1000) {
      document.querySelector(".loadText").innerHTML = (i.iterations / i.total * 100).toFixed(1) + "% ";
      function hello() {
        document.querySelector(".progress").style.top = (100 - (i.iterations / i.total * 100).toFixed(1)) + "% ";
      }
      var target = document.querySelector(".loadText");

      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          hello()
        });
      });

      var config = {
        childList: true,
        subtree: true,
        characterData: true
      };

      observer.observe(target, config);
    }
  })

  $(document).ready(function () {


  });

//#### get nodes that was clicked, create the box for node info --------------------------
//#### and the bullet points for the related artforms.-----------------------------
  let previousGroup = {};
  network.on("selectNode", function (params) {


//#### reset all the changed nodes to their previous group-----------------------------
    for (let nodeid in previousGroup) {
      let node = nodes.get(nodeid);
      node.group = previousGroup[nodeid];
      nodes.update(node);
    }
    previousGroup = {};


    document.querySelector(".modal-body").innerHTML = "";
    let divElement = document.createElement('div');
//#### WRITE THE SENSES USING THE SENSE LOOKUP-----------------------------
    let senses = "";
    let nodeId = params.nodes[0];
    let artform = artforms[nodeId];
    if (sensesLookup.hasOwnProperty(artform.Primary_Sense)) {
      senses = sensesLookup[artform.Primary_Sense];
    } else {
      senses = artform.Primary_Sense;
    }

    divElement.innerHTML = `<div>
      <h1 style="color:white; text-align: center;">${reverseLookup[nodeId]}</h1>
      <h2 style="color:white;">Primary Sense: </h2>
      <p style="color:white;">${senses}</p>
    </div>
    `;
//#### WRITE THE "RELATED TO" ON THE POPUP MENU + CHANGE THE NODES COLOR-----------------------------
    document.querySelector(".modal-body").appendChild(divElement);
    let adjacents = adjacentMatrix[nodeId];
    if (Array.isArray(adjacents)) {
      let unorderedList = document.createElement('ul');
      let header = document.createElement("h2");
      header.innerHTML = "Related To:"
      header.style.color = 'white';
      header.style.fontFamily = 'sans-serif';
      let toUpdate = [];

      for (let a of adjacents) {
        unorderedList.innerHTML += '<li style="color:white;">' + reverseLookup[a] + '</li>'
        let adjNode = nodes.get(a);
//#### save the group before we overrwite -----------------------------
        previousGroup[a] = adjNode.group;
        adjNode.group = "adjacent";
        adjNode.borderWidth = 2;
        adjNode.color = {
          'border': 'white',
        }
        toUpdate.push(adjNode)
      }
      nodes.update(toUpdate);
//#### clear everything inside the #output div-----------------------------

      document.querySelector(".modal-body").appendChild(header);
      document.querySelector(".modal-body").appendChild(unorderedList);


      $(document).ready(function () {
        $('.modal').addClass('show')
        $('.modal').css('display', 'block')
      })



    } else {
      console.error("Unable to gt adacjents for nodeId = " + nodeId)
    }


//#### WRITE THE "RELATED BY" ON THE POPUP MENU + CHANGE THE NODES COLOR-----------------------------
    let reverse = reverseAdjacentMatrix[nodeId];
    if (Array.isArray(reverse)) {
      let header = document.createElement("h2");
      header.innerHTML = "Related By:"
      header.style.color = 'white';
      header.style.fontFamily = 'sans-serif';
      header.setAttribute('data-aos', 'fade-up')
      let reverseUnorderedList = document.createElement('ul');
      let toUpdate = [];
      for (let r of reverse) {
        reverseUnorderedList.innerHTML += '<li style="color:white;">' + reverseLookup[r] + "</li>";
        let reverseNode = nodes.get(r);
        previousGroup[r] = reverseNode.group;
        reverseNode.group = "reverse";
        reverseNode.borderWidth = 2;
        reverseNode.color = {
          'border': 'white',
        }

        toUpdate.push(reverseNode);
      }
      nodes.update(toUpdate);
      console.log(previousGroup);
      document.querySelector(".modal-body").appendChild(header)
      document.querySelector(".modal-body").appendChild(reverseUnorderedList);
    }


  });


} //### END OF function drawGraph-----------------------------



var changeChosenNodeSize = function (values, id, selected, hovering) {
  values.size = 100;
};
var changeChosenLabelSize = function (values, id, selected, hovering) {
  values.size += 10;
};

async function method2() {
  let response = await axios.get('/data');
  let jsonObject = response.data;
  // ### use CSV from Spreadsheet and save the data as "jsonObject" after loaded (await)-----------------------------
  // ### then pass this string of "jsonObject" into all of those below =>{ }-----------------------------

  console.log(jsonObject);
  artforms = jsonObject;

  //### getNodes()(function) from "jsonObject" passed from CSV of spreadsheet-----------------------------
  //### Map the id and label as "index" and "artform"-----------------------------
  let nodeNamesArray = getNodes(jsonObject);
  let nodes = nodeNamesArray.map((artform, index) => {
    return {
      id: index,
      label: artform.Artform,
      group: artform.Primary_Sense,
      chosen: { label: changeChosenLabelSize, node: changeChosenNodeSize },
    }
  })

  nodes = new vis.DataSet([...nodes]);


  // ### lookupTable = retrive the information from this node array-----------------------------
  lookupTable = {};
  reverseLookup = {};
  for (let i = 0; i < nodeNamesArray.length; i++) {
    let node = nodeNamesArray[i];
    lookupTable[node.Artform.toLowerCase()] = i;
    reverseLookup[i] = node.Artform;
  }
  // ####DRAW THE EDGES = for each artform within jsonObject, take the "Related_Artforms" column, split it using commas and push it individually(...)into edges(edges.push)-----------------------------
  let edges = [];
  for (let artform of jsonObject) {
    let related = artform.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(related => {
        return {
          "from": lookupTable[artform.Artform.toLowerCase()],
          "to": lookupTable[related.toLowerCase()]
        }
      })
    edges.push(...related);

  }


  //### create related.-----------------------------
  for (let j of jsonObject) {
    //#### id of the current node represented by the j, split, trim spaces, remove null and lowercase all-----------------------------
    let nodeId = lookupTable[j.Artform.toLowerCase()];
    let related = j.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(related => {
        return lookupTable[related.toLowerCase()] || -1;
      })
    // filter all the 0s-----------------------------
    let adjacents = [...related].filter(f => f != -1);
    adjacentMatrix[nodeId] = adjacents;
    //#### Create related By-----------------------------
    for (let a of adjacents) {
      if (!reverseAdjacentMatrix[a]) {
        reverseAdjacentMatrix[a] = [];
      }
      reverseAdjacentMatrix[a].push(nodeId);
    }

  }




  // only draw the graph wnen data has been processed-----------------------------
  drawGraph(nodes, edges);

  // })

}
//####### FUNCTION that uses Set() which remove repeated items in the "Artform" column.-----------------------------
function getNodes(artforms) {
  let artformArray = artforms.map(a => { return { Artform: a.Artform, Primary_Sense: a.Primary_Sense } });
  // Set will automatically discard repeated values-----------------------------
  return [...new Set(artformArray)]


}


//#### search, look up the table after new Set(remove duplicate)-----------------------------
//#### assign all text to lower case, search, zoom in with animation to that node.-----------------------------

document.querySelector('#search-btn').addEventListener('click', () => {

  let nodeId = lookupTable[document.querySelector('#search-terms').value.toLowerCase()];
  network.focus(nodeId, { animation: true, scale: 0.7 });
  network.selectNodes([nodeId]);

})



method2();
