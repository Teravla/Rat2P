/**
 * 
 * @file graph.js
 * @module graph
 * @description Contains classes and functions to manage graphs
 * @requires vis
 * @requires Node
 * @requires Edge
 * @Teravla
 * @version 1.0.0
 * 
 */




/**
 * 
 * @class
 * @name Graph
 * @description Represents a graph with nodes and edges
 * 
 */
class Graph {
    /**
     * 
     * Create a new graph
     * @constructor
     * @param {Array} nodes - List of nodes in the graph
     * @param {Array} edges - List of edges in the graph
     * @param {Node} selectedStartNode - The currently selected start node
     * @param {Object} nodeMap - A map of labels to node IDs
     * @memberof Graph
     * @instance
     * @public
     * @name Graph
     * @see Node
     * @see Edge
     * @example
     * const graph = new Graph(nodes, edges, selectedStartNode, nodeMap);
     * @description Create a new graph
     * 
     */
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.selectedStartNode = null;
        this.nodeMap = {};  // Add a node map to store the label and ID
    }

    /**
     * 
     * Add a node to the graph
     * @param {Node} node 
     * @returns {Graph}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @chainable
     * @name addNode
     * @example
     * @see Node
     * graph.addNode(node);
     * @description Add a node to the graph
     * 
     */
    addNode(node) {
        this.nodes.push(node);
        this.nodeMap[node.label] = node.id;  // Update the node map with the label and ID
    }

    /**
     * 
     * Add an edge to the graph
     * @param {Edge} edge
     * @returns {Graph}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @chainable
     * @name addEdge
     * @see Edge
     * @example
     * graph.addEdge(edge);
     * @description Add an edge to the graph
     * 
    */
    addEdge(edge) {
        this.edges.push(edge);
    }

    /**
     * 
     * @param {Node} startLabel 
     * @param {Node} endLabel
     * @param {Object} networkData
     * @returns {Array}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @name findShortestPath
     * @see Node
     * @see Edge
     * @see printTime
     * @see highlightPath
     * @example
     * graph.findShortestPath(startLabel, endLabel, networkData);
     * @description Find the shortest path between two nodes in the graph using Bellman-Ford algorithm
     * 
     */
    findShortestPath(startLabel, endLabel, networkData) {
        // Retrieve the IDs of the start and end nodes
        const startId = this.nodeMap[startLabel];
        const endId = this.nodeMap[endLabel];
    
        // Validate the start and end nodes
        if (startId === undefined || endId === undefined) {
            console.error("Invalid start or end node"); // Log an error if either node is invalid
            return null; // Return null if the nodes are not valid
        }
    
        // Initialize distances and predecessors
        const distances = {}; // Dictionary to store distances from the start node
        const predecessors = {}; // Dictionary to store node predecessors
    
        // Initialize distances to infinity and predecessors to null
        this.nodes.forEach(node => {
            distances[node.id] = Infinity; // Each node is initialized with an infinite distance
            predecessors[node.id] = null; // No predecessor by default
        });
        distances[startId] = 0; // The distance from the start node to itself is 0
    
        // Edge relaxation loop (|V| - 1) times
        for (let i = 0; i < this.nodes.length - 1; i++) {
            this.edges.forEach(edge => {
                // If the current distance + edge weight is less than the known distance, update it
                if (distances[edge.from] + parseFloat(edge.label) < distances[edge.to]) {
                    distances[edge.to] = distances[edge.from] + parseFloat(edge.label); // Update distance
                    predecessors[edge.to] = edge.from; // Update predecessor
                }
            });
        }
    
        // Check for negative-weight cycles
        for (const edge of this.edges) {
            // If a further relaxation is possible, there is a negative-weight cycle
            if (distances[edge.from] + parseFloat(edge.label) < distances[edge.to]) {
                console.error("Graph contains a negative-weight cycle"); // Log an error if a cycle is detected
                return null; // Return null to indicate failure
            }
        }
    
        // Reconstruct the path from the end node to the start node
        const path = [];
        let currentNode = endId;
        while (currentNode !== null) {
            path.unshift(currentNode); // Add the node to the path list
            currentNode = predecessors[currentNode]; // Move to the next predecessor
        }
    
        // If the reconstructed path does not start with the start node, no valid path exists
        if (path[0] !== startId) {
            console.error("No path found"); // Log an error if the path is invalid
            return null; // Return null if no path is found
        }
    
        // Display the time associated with the path
        this.printTime(path); // Call a function to print the time (defined elsewhere)
    
        // Highlight the path on the user interface
        this.highlightPath(path, networkData); // Call a function to highlight the path (defined elsewhere)
    
        // Return the found path
        return path;
    }
    
    /**
     * 
     * @param {Array} path 
     * @returns {void}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @name printTime
     * @example
     * graph.printTime(path);
     * @description Print the total time for the given path
     * 
     */
    printTime(path) {
        // Calculate the total time for the path
        let totalTime = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const edge = this.edges.find(e => e.from === from && e.to === to);
            if (edge) {
                totalTime += parseFloat(edge.label);
            }
        }
    
        // Display the time in seconds
        console.log(`Total time for the path: ${totalTime.toFixed(2)} seconds`);
    
        // Updating time display on the page
        document.getElementById('timeLabel').textContent = totalTime.toFixed(2);
        document.getElementById('timeMinutes').textContent = (totalTime / 60).toFixed(2);
    }
    
    /**
     * 
     * @param {Array} path
     * @param {Number} numberOfChanges
     * @returns {void}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @name printTimeWithChanges
     * @example
     * graph.printTimeWithChanges(path, numberOfChanges);
     * @description Print the total time for the given path with the specified number of changes
     * 
     */
    printTimeWithChanges(path, numberOfChanges) {
        // Calculate the total time for the path with changes
        let totalTime = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const edge = this.edges.find(e => e.from === from && e.to === to);
            if (edge) {
                totalTime += parseFloat(edge.label);
            }
        }
    
        totalTime += numberOfChanges * 2 * 60; // Add 2 minutes for each line change
    
        // Display the time in seconds
        console.log(`Total time for the path: ${totalTime.toFixed(2)} seconds`);
    
        // Updating time display on the page
        document.getElementById('timeLabelChanges').textContent = totalTime.toFixed(2);
        document.getElementById('timeMinutesChanges').textContent = (totalTime / 60).toFixed(2);
    }
    
    /**
     * 
     * @param {Array} path
     * @param {Object} networkData
     * @returns {void}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @name highlightPath
     * @example
     * graph.highlightPath(path, networkData);
     * @description Highlight the specified path on the graph
     * 
     */
    highlightPath(path, networkData) {
        // Highlights the selected path
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            this.edges.forEach(edge => {
                if ((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)) {
                    edge.color = '#0000ff'; // Blue for the path
                    const edgeData = networkData.edges.get(edge.id);
                    if (edgeData) {
                        edgeData.color = '#0000ff'; // Change the color of the edge
                        networkData.edges.update(edgeData); // Update
                    }
                }
            });
        }
    }

    /**
     * 
     * @param {Object} networkData 
     * @returns {void}
     * @memberof Graph
     * @instance
     * @method
     * @public
     * @name resetColors
     * @example
     * graph.resetColors(networkData);
     * @description Reset the colors of all edges in the graph
     * 
     */
    resetColors(networkData) {
        // Create a list of updates in one go to improve performance
        const updates = this.edges.map(edge => {
            return { id: edge.id, color: '#000000' }; // Noir par défaut
        });
    
        // Perform a mass update to reduce the number of operations
        networkData.edges.update(updates);
    }
}


/**
 * 
 * @class
 * @name Node
 * @description Represents a node in a graph
 * 
 */
class Node {
    /**
     * 
     * @param {String} name - The name of the node
     * @param {String} colorborder - The color of the node border
     * @param {String} colorbackground - The color of the node background
     * @returns {Node}
     * @memberof Node
     * @instance
     * @public
     * @constructor
     * @name Node
     * @example
     * const node = new Node(name, colorborder, colorbackground);
     * @description Create a new node
     * 
     */
    constructor(name, colorborder, colorbackground) {
        this.id = Node.generateId();
        this.label = name;
        this.shape = 'dot';
        this.size = 10;
        this.color = { background: colorbackground, border: colorborder };
        this.lineCount = 1; // Compteur initialisé à 1
        this.lines = []; // Nouveau tableau pour stocker les lignes desservant ce nœud
    }

    /**
     * 
     * @returns {Number}
     * @memberof Node
     * @instance
     * @public
     * @static
     * @name generateId
     * @example
     * Node.generateId();
     * @description Generate a unique ID for a node
     * 
     */
    static generateId() {
        if (!Node.idCounter) Node.idCounter = 0;
        return Node.idCounter++;
    }

    /**
     * 
     * @returns {void}
     * @memberof Node
     * @instance
     * @public
     * @method
     * @name incrementLineCount
     * @example
     * node.incrementLineCount();
     * @description Increment the line count for the node
     * 
     */
    incrementLineCount() {
        this.lineCount += 1;
    }

    /**
     * 
     * @param {String} line - The line to add to the node
     * @returns {void}
     * @memberof Node
     * @instance
     * @public
     * @method
     * @name addLine
     * @example
     * node.addLine(line);
     * @description Add a line to the node
     * 
     */
    addLine(line) {
        if (!this.lines.includes(line)) {
            this.lines.push(line);
        }
    }
}


/**
 * 
 * @class
 * @name Edge
 * @description Represents an edge in a graph
 * 
 */
class Edge {
    /**
     * 
     * @param {String} from - The ID of the starting node
     * @param {String} to - The ID of the ending node 
     * @param {String} time - The time to traverse the edge
     * @returns {Edge}
     * @memberof Edge
     * @instance
     * @public
     * @constructor
     * @name Edge
     * @example
     * const edge = new Edge(from, to, time);
     * @description Create a new edge
     * 
     */
    constructor(from, to, time) {
        this.from = from;
        this.to = to;
        this.label = time;
        this.width = 2;
        this.color = { color: '#000', highlight: '#ff0000' };
        this.smooth = { type: 'continuous', forceDirection: 'none' };
    }

    /**
     * 
     * @param {Boolean} isDirected - Whether the edge is directed or not
     * @returns {void}
     * @memberof Edge
     * @instance
     * @public
     * @method
     * @name setDirection
     * @example
     * edge.setDirection(isDirected);
     * @description Set the direction of the edge
     * 
     */
    setDirection(isDirected) {
        if (isDirected) {
            this.arrows = { to: { enabled: true, scaleFactor: 0.5 } };
        }
    }
}


/**
 * 
 * @param {Object} params - The parameters of the click event, including the selected nodes.
 * @param {Graph} graph - The graph object that contains nodes and methods for pathfinding.
 * @param {Object} networkData - The data representing the structure and connections of the network.
 * @returns {void}
 * 
 * @throws {Error} Will log an error if the selected node is not found in the graph or if no path could be found.
 * 
 * @example
 * handleNodeClick({ nodes: [1] }, graphInstance, networkData);
 * @description Handles the click event on a node in the graph visualization.
 * 
 */
function handleNodeClick(params, graph, networkData) {
    if (params.nodes.length > 0) {
        const selectedNodeId = params.nodes[0];
        const selectedNode = graph.nodes.find(n => n.id === selectedNodeId);

        if (!selectedNode) {
            console.error(`Node with id ${selectedNodeId} not found`);
            return;
        }

        if (!graph.selectedStartNode) {
            graph.resetColors(networkData);
            graph.selectedStartNode = selectedNode;

            document.getElementById('startNodeLabel').textContent = `${selectedNode.label} (Lignes ${selectedNode.lines ? selectedNode.lines.join(', ') : 'No lines'})`;
            document.getElementById('endNodeLabel').textContent = 'None';
            document.getElementById('pathLabel').textContent = 'No path found';
        } else {
            const endNode = selectedNode;

            document.getElementById('endNodeLabel').textContent = `${endNode.label} (Lignes ${selectedNode.lines ? selectedNode.lines.join(', ') : 'No lines'})`;

            if (graph.selectedStartNode && endNode) {
                const startLabel = graph.selectedStartNode.label;
                const endLabel = endNode.label;

                const path = graph.findShortestPath(startLabel, endLabel, networkData);
                if (path) {


                    const pathList = document.createElement('ol');
                    let previousLine = null;
                    const lineList = [];

                    path.forEach((nodeId, index) => {
                        const node = graph.nodes.find(n => n.id === nodeId);
                        if (node && node.lines) {
                            lineList.push(node.lines);

                        } else {
                            console.error(`L'arrêt avec l'ID ${nodeId} n'a pas été trouvé ou ne contient pas de lignes.`);
                        }
                    });

                    if (lineList.length > 0) {
                        previousLine = lineList[0].length === 1 ? lineList[0][0] : lineList[0].find(line => lineList[1].includes(line));

                    }
                    let numberOfChanges = 0;
                    for (let i = 0; i < lineList.length; i++) {
                        const currentStopLines = lineList[i];
                        const listItem = document.createElement('li');
                        const currentNode = graph.nodes.find(n => n.id === path[i]);
                    
                        if (i < lineList.length - 1) {
                            const nextStopLines = lineList[i + 1];
                    
                            if (nextStopLines.includes(previousLine)) {
                                listItem.innerHTML = `<strong>${currentNode.label}</strong> <em>(${currentStopLines.join(', ')})</em>`;
                            } else {
                                const newLine = nextStopLines.find(line => lineList[i + 2] && lineList[i + 2].includes(line)) || nextStopLines[0];
                                listItem.innerHTML = `<strong>${currentNode.label}</strong> <em>(${currentStopLines.join(', ')})</em> - <span style="color: red;">Changement de ligne:</span> ${previousLine} → ${newLine}`;
                                previousLine = newLine;
                                numberOfChanges += 1;
                            }
                        } else {
                            // Adding the last stop
                            listItem.innerHTML = `<strong>${currentNode.label}</strong> <em>(${currentStopLines.join(', ')})</em>`;
                        }
                    
                        pathList.appendChild(listItem);
                    }
                    
                    // Update of the path of the path
                    const pathLabel = document.getElementById('pathLabel');
                    pathLabel.innerHTML = '';
                    pathLabel.appendChild(pathList);
                    graph.printTimeWithChanges(path, numberOfChanges);
                } else {
                    console.error("No path could be found between the selected nodes.");
                    document.getElementById('pathLabel').textContent = 'No path found';
                }

                graph.selectedStartNode = null;
            }
        }
    }
}



/**
 * 
 * @returns {Promise}
 * @example
 * fetchData();
 * @description Fetch data from the server
 * 
 */
async function fetchData() {
    const response = await fetch('/data');
    return response.json();
}


/**
 * 
 * @returns {void}
 * @example
 * createNetwork();
 * @description Create the network visualization
 * 
 */
async function createNetwork() {
    const data = await fetchData();
    const nodeMap = {};
    const colorMap = {}; 
    const nodes = [];
    const addedEdges = new Set();
    const graph = new Graph();

    // Creation of nodes and color management
    data.sommets.forEach(sommet => {
        const name = sommet.Nom;
        const colorBorder = "#" + sommet.Color;
        const colorBackground = "#" + sommet.Color; // We use the same color for the bottom and the border at the start

        let node;

        if (!nodeMap[name]) {
            // Creation of a new node with the border color and the background color
            node = new Node(name, colorBorder, colorBackground);
            nodeMap[name] = node.id;
            nodes.push(node);
            graph.addNode(node);
        } else {
            // If the node already exists, it is found in the list of nodes
            node = nodes.find(n => n.label === name);
            if (node) {
                node.incrementLineCount();
                if (!colorMap[name]) {
                    colorMap[name] = [];
                }
                colorMap[name].push(colorBorder);
            }
        }

        if (node) {
            node.addLine(sommet.Line);
        }
    });


    // Updating the colors of the nodes as a function of the number of lines
    nodes.forEach(node => {
        if (node.lineCount >= 2) {
            node.color.background = 'white';
            node.color.border = 'black';
        } else {
            node.color.background = "#" + data.sommets.find(s => s.Nom === node.label).Color;
            node.color.border = node.color.background;
        }
    });

    // Creation of edges
    const edges = data.aretes.map(arete => {
        const from = nodeMap[data.sommets.find(s => s.ID === arete.Sommet1).Nom];
        const to = nodeMap[data.sommets.find(s => s.ID === arete.Sommet2).Nom];
        const time = arete.Time;
        const edge = new Edge(from, to, time);
        graph.addEdge(edge);
        
        if (from === to && time === '0') return null;
        
        const edgeId = `${from}-${to}`;
        if (addedEdges.has(edgeId) || addedEdges.has(`${to}-${from}`)) return null;
        
        addedEdges.add(edgeId);
        
        const reverseEdge = data.aretes.find(e => e.Sommet1 === arete.Sommet2 && e.Sommet2 === arete.Sommet1);
        const isDirected = !reverseEdge;
        edge.setDirection(isDirected);

        return edge;
    }).filter(edge => edge !== null);

    // Network initialization
    const container = document.getElementById('network');
    const networkData = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        nodes: {
            shape: 'dot',
            size: 10,
            font: { size: 12 }
        },
        edges: {
            width: 2,
            font: { size: 12, align: 'top' },
            color: { highlight: '#ff0000', inherit: true }
        },
        physics: {
            enabled: true,
            stabilization: true
        },
        layout: {
            improvedLayout: false
        }
    };

    const network = new vis.Network(container, networkData, options);

    network.on("click", function (params) {
        handleNodeClick(params, graph, networkData); // Pass NetworkData here too
    });
}



createNetwork();
