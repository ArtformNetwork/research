let lookupTable = {}; //lookup the new table.
let reverseLookup = {}; // map ID to artForm name
let adjacentMatrix = {};// to find nodes related to and from this nodes
let reverseAdjacentMatrix = {};
let network;
let artforms = [];

const sensesLookup = {

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



// create an array with nodes
function drawGraph(nodes, edgesData) {
  //
  // create an array with edges
  var edges = new vis.DataSet([
    ...edgesData
  ]);

  // create a network
  var container = document.getElementById("mynetwork");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {
    interaction: {
      hover: true,
    },
    groups:{
      'adjacent': {
        /*color: {
          background: 'white'
        },*/
        borderWidth:5
      },
      'reverse': {
       /* color: {
          background: 'white'
        },*/
        borderWidth:5
      }
    },

    edges: {
      smooth: { type: "continuous", enabled: false }
    },
    layout: {
      improvedLayout: false
    },
    nodes: {
      shape: "circle",
      scaling: {
        min: 30,
        max: 80,
      },
      font: {
        size: 5,
        face: "Tahoma",
      },
      widthConstraint: 30,
    },
    physics: {
      enabled: true,
      // solver: "forceAtlas2Based"
      barnesHut: {

        gravitationalConstant: -50000,
        centralGravity: 0.005,
        springLength: 0.025,
        springConstant: 0.012,
        damping: 0.5,
        avoidOverlap: 3
      },
      stabilization: {
        iterations: 1000,
        updateInterval: 1
    }

    }
  
};


network = new vis.Network(container, data, options)
console.log("graph drawn")

// SHOW LODING PROGRESS
network.on('stabilizationProgress', function(i){
  //console.log(i);
  document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Fetching Artform Database"
  // remove once loaded
  if(i.iterations>=1000){
    document.querySelector("#progress").remove();
  } else if(i.iterations>935){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Artform Network Rendering"
  } else if(i.iterations>=592){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Physic Simulations"
  } else if(i.iterations>=469){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Linking Nodes"
  } else if(i.iterations>=373){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Generating Links"
  } else if(i.iterations>=245){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Generating Nodes"
  } else if(i.iterations>=134){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "Populating Database"
  } else if(i.iterations>=52){
    document.querySelector("#progress").innerHTML = (i.iterations / i.total*100).toFixed(1) + "% - " + "CSV Conversion"
  }
})

//#### get nodes that was clicked, create the box for node info and the bullet points for the related artforms.
let previousGroup = {};
network.on("selectNode", function (params) {

  // reset all the changed nodes to their previous group
   for (let nodeid in previousGroup) {
     let node = nodes.get(nodeid);
     node.group = previousGroup[nodeid];
     nodes.update(node);
   }
   previousGroup = {};
 

  document.querySelector("#output").innerHTML = "";
  let divElement = document.createElement('div');

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
      <h2>Primary Sense: </h2>
      <p>${senses}</p>
    </div>
    `;

  /*
      let commonSenses = document.createElement('div');
      let relatedTo = document.createElement('div');
      let unorderedList = document.createElement('ul');
      let relatedBy = document.createElement('div');
    */
  document.querySelector("#output").appendChild(divElement);
  let adjacents = adjacentMatrix[nodeId];
  if (Array.isArray(adjacents)) {
    let unorderedList = document.createElement('ul');
    let header = document.createElement("h2");
    header.innerHTML = "Related To:"
    let toUpdate = [];
    for (let a of adjacents) {
      // console.log(reverseLookup[a]);
      // output += reverseLookup[a] + "1\n";
      unorderedList.innerHTML += "<li>" + reverseLookup[a] + "</li>"
      let adjNode = nodes.get(a);
      // save the group before we overrwite
      previousGroup[a] = adjNode.group;
      adjNode.group = "adjacent";
      adjNode.borderWidth = 2;
      adjNode.color = {
        'border': 'white',
        // 'background':'red',
      }
      // adjNode.value = 200;
      //  nodes.update(adjNode);
       toUpdate.push(adjNode)
    }
    nodes.update(toUpdate);
    // clear everything inside the #output div

    document.querySelector("#output").appendChild(header);
    document.querySelector("#output").appendChild(unorderedList);

    



  } else {
    console.error("Unable to gt adacjents for nodeId = " + nodeId)
  }

  let reverse = reverseAdjacentMatrix[nodeId];
  // console.log(reverseAdjacentMatrix)
  if (Array.isArray(reverse)) {
    let header = document.createElement("h2");
    header.innerHTML = "Related By:"
    let reverseUnorderedList = document.createElement('ul');
    let toUpdate = [];
    for (let r of reverse) {
      reverseUnorderedList.innerHTML += "<li>" + reverseLookup[r] + "</li>";
      let reverseNode = nodes.get(r);
      //console.log(reverseNode);
      previousGroup[r] = reverseNode.group;
      reverseNode.group = "reverse";
      reverseNode.borderWidth = 2;
      reverseNode.color = {
        'border': 'white',
        // 'background':'red',
      }
      // reverseNode.color = "red";
      // reverseNode.value = 200;
      // // reverseNode.label = "HAHAHA";
      
      // nodes.update(reverseNode);   
      toUpdate.push(reverseNode);
    }
    nodes.update(toUpdate);
    console.log(previousGroup);
    document.querySelector("#output").appendChild(header)
    document.querySelector("#output").appendChild(reverseUnorderedList);
  }



  /*
    //#### take the node id from click, reverse lookup for the name, and then HTML write onto a html <div> using `(the one beside ~) and the ${} means javascript
      divElement.innerHTML = `<div>
        <h1 style="color:white; text-align: center;">${reverseLookup[nodeId]}</h1>
      </div>
      `;
      commonSenses.innerHTML = `<div>
        <h5 style="color:white;">Common Senses: </h5>
      </div>
      `;
      //#### to add a "related to" text into the information box
      relatedTo.innerHTML = `<div>
        <h5 style="color:white;">Related To: </h5>
      </div>
      `;
      relatedBy.innerHTML = `<div>
        <h5 style="color:white;">Related By: </h5>
      </div>
      `;
    //#### pass the adjacent into the "#output" column at the information box on the right
      let adjacents = adjacentMatrix[nodeId];
      let output = "";
      if (Array.isArray(adjacents)) {
        for (let a of adjacents) {
        // console.log(reverseLookup[a]);
        // output += reverseLookup[a] + "1\n";
        unorderedList.innerHTML += "<li>" + reverseLookup[a] + "</li>"
      } 
      
      // clear everything inside the #output div
      document.querySelector("#output").innerHTML = "";
      document.querySelector("#output").appendChild(divElement);
      document.querySelector("#output").appendChild(commonSenses);
      document.querySelector("#output").appendChild(relatedTo);
      document.querySelector("#output").appendChild(unorderedList);
      document.querySelector("#output").appendChild(relatedBy);
      } else {
        console.error("Unable to gt adacjents for nodeId = " + nodeId)
      }
      */

});


} //### END OF function drawGraph



var changeChosenNodeSize = function (values, id, selected, hovering) {
  values.size = 40;
};
var changeChosenLabelSize = function (values, id, selected, hovering) {
  values.size += 3;
};

async function method2() {
  //let url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEiiCJ_MQKk2BVzvTEyeo7LMN19CNuf1kpr5RGosDhL1zsvn54epmqSuXKtKQuMsi5p3t8pHx9B14p/pub?gid=0&single=true&output=csv';

  //let url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEiiCJ_MQKk2BVzvTEyeo7LMN19CNuf1kpr5RGosDhL1zsvn54epmqSuXKtKQuMsi5p3t8pHx9B14p/pub?gid=340655955&single=true&output=csv';
  let response = await axios.get('/data');
  let jsonObject = response.data;
  // ### use CSV from Spreadsheet and save the data as "jsonObject" after loaded (await)
  // ### then pass this string of "jsonObject" into all of those below =>{ }
  // csv().fromString(response.data).then((jsonObject) => {
  // for (let j of jsonObject) {
  //   console.log(j)
  // }
  console.log(jsonObject);
  artforms = jsonObject;

  //### getNodes()(function) from "jsonObject" passed from CSV of spreadsheet
  //### Map the id and label as "index" and "artform"
  // console.log(jsonObject);
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


  // ### lookupTable = retrive the information from this node array
  lookupTable = {};
  reverseLookup = {};
  for (let i = 0; i < nodeNamesArray.length; i++) {
    let node = nodeNamesArray[i];
    lookupTable[node.Artform.toLowerCase()] = i;
    reverseLookup[i] = node.Artform;
  }
  // ####DRAW THE EDGES = for each artform within jsonObject, take the "Related_Artforms" column, split it using commas and push it individually(...)into edges(edges.push)
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
  //console.log(edges);

  //### create related.
  for (let j of jsonObject) {
    //#### id of the current node represented by the j, split, trim spaces, remove null and lowercase all
    let nodeId = lookupTable[j.Artform.toLowerCase()];
    let related = j.Related_Artforms.split(",")
      .map(s => s.trim())
      .filter(s => s != "")
      .map(related => {
        return lookupTable[related.toLowerCase()] || -1;
      })
    // filter all the 0s
    let adjacents = [...related].filter(f => f != -1);
    adjacentMatrix[nodeId] = adjacents;
    //#### Create related By
    for (let a of adjacents) {
      if (!reverseAdjacentMatrix[a]) {
        reverseAdjacentMatrix[a] = [];
      }
      reverseAdjacentMatrix[a].push(nodeId);
    }

  }
  //console.log(adjacentMatrix);


  console.log("Loading done");
  // only draw the graph wnen data has been processed
  drawGraph(nodes, edges);

  // })

}
//####### FUNCTION that uses Set() which remove repeated items in the "Artform" column.
function getNodes(artforms) {
  let artformArray = artforms.map(a => { return { Artform: a.Artform, Primary_Sense: a.Primary_Sense } });
  // Set will automatically discard repeated values
  return [...new Set(artformArray)]


}


//#### search, look up the table after new Set(remove duplicate)
//#### assign all text to lower case, search, zoom in with animation to that node.

document.querySelector('#search-btn').addEventListener('click', () => {

  let nodeId = lookupTable[document.querySelector('#search-terms').value.toLowerCase()];
  network.focus(nodeId, { animation: true, scale: 0.7 });
  network.selectNodes([nodeId]);

})

method2();
