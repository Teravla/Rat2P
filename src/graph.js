class Graph {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.selectedStartNode = null;
        this.nodeMap = {};  // Ajoutez un nodeMap pour associer les étiquettes aux IDs
    }

    addNode(node) {
        this.nodes.push(node);
        this.nodeMap[node.label] = node.id;  // Mettez à jour le nodeMap avec l'étiquette du nœud et son ID

    }

    addEdge(edge) {
        this.edges.push(edge);

    }

    findShortestPath(startLabel, endLabel, networkData) {
        const startId = this.nodeMap[startLabel];
        const endId = this.nodeMap[endLabel];
    
        if (startId === undefined || endId === undefined) {
            console.error("Invalid start or end node");
            return null;
        }
    
        const distances = {};
        const predecessors = {};
    
        // Initialisation des distances
        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            predecessors[node.id] = null;
        });
        distances[startId] = 0;
    
        // Relaxation des arêtes
        for (let i = 0; i < this.nodes.length - 1; i++) {
            this.edges.forEach(edge => {
                if (distances[edge.from] + parseFloat(edge.label) < distances[edge.to]) {
                    distances[edge.to] = distances[edge.from] + parseFloat(edge.label);
                    predecessors[edge.to] = edge.from;
                }
            });
        }
    
        // Vérification des cycles négatifs
        for (const edge of this.edges) {
            if (distances[edge.from] + parseFloat(edge.label) < distances[edge.to]) {
                console.error("Graph contains a negative-weight cycle");
                return null;
            }
        }
    
        // Reconstruction du chemin
        const path = [];
        let currentNode = endId;
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = predecessors[currentNode];
        }
    
        if (path[0] !== startId) {
            console.error("No path found");
            return null;
        }
    
    
        this.printTime(path);
        
    
        this.highlightPath(path, networkData);
        return path;
    }

    printTime(path) {
        // Calcul du temps total pour le chemin
        let totalTime = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const edge = this.edges.find(e => e.from === from && e.to === to);
            if (edge) {
                totalTime += parseFloat(edge.label);
            }
        }
    
        // Affichage du temps en secondes
        console.log(`Total time for the path: ${totalTime.toFixed(2)} seconds`);
    
        // Mise à jour de l'affichage du temps dans la page
        document.getElementById('timeLabel').textContent = totalTime.toFixed(2);
        document.getElementById('timeMinutes').textContent = (totalTime / 60).toFixed(2);
    }
    
    
    printTimeWithChanges(path, numberOfChanges) {
        // Calcul du temps total pour le chemin
        let totalTime = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            const edge = this.edges.find(e => e.from === from && e.to === to);
            if (edge) {
                totalTime += parseFloat(edge.label);
            }
        }
    
        totalTime += numberOfChanges * 2 * 60; // Ajouter 2 minutes pour chaque changement de ligne
    
        // Affichage du temps en secondes
        console.log(`Total time for the path: ${totalTime.toFixed(2)} seconds`);
    
        // Mise à jour de l'affichage du temps dans la page
        document.getElementById('timeLabelChanges').textContent = totalTime.toFixed(2);
        document.getElementById('timeMinutesChanges').textContent = (totalTime / 60).toFixed(2);
    }
    

    highlightPath(path, networkData) {
        // Met en surbrillance le chemin sélectionné
        for (let i = 0; i < path.length - 1; i++) {
            const from = path[i];
            const to = path[i + 1];
            this.edges.forEach(edge => {
                if ((edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)) {
                    edge.color = '#0000ff'; // Bleu pour le chemin
                    const edgeData = networkData.edges.get(edge.id);
                    if (edgeData) {
                        edgeData.color = '#0000ff'; // Changer la couleur de l'arête
                        networkData.edges.update(edgeData); // Mettre à jour l'arête
                    }
                }
            });
        }
    }

    resetColors(networkData) {
        // Créer une liste des mises à jour en une seule fois pour améliorer les performances
        const updates = this.edges.map(edge => {
            return { id: edge.id, color: '#000000' }; // Noir par défaut
        });
    
        // Effectuer une mise à jour en masse pour réduire le nombre d'opérations
        networkData.edges.update(updates);
    }
}


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
                            // Ajout du dernier arrêt
                            listItem.innerHTML = `<strong>${currentNode.label}</strong> <em>(${currentStopLines.join(', ')})</em>`;
                        }
                    
                        pathList.appendChild(listItem);
                    }
                    
                    // Mise à jour du label du chemin
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


function printTimeWithChanges(path, numberOfChanges) {
    // Calcul du temps total pour le chemin
    let totalTime = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = this.edges.find(e => e.from === from && e.to === to);
        if (edge) {
            totalTime += parseFloat(edge.label);
        }
    }

    totalTime += numberOfChanges * 2 * 60; // Ajouter 2 minutes pour chaque changement de ligne

    // Affichage du temps en secondes
    console.log(`Total time for the path: ${totalTime.toFixed(2)} seconds`);

    // Mise à jour de l'affichage du temps dans la page
    document.getElementById('timeLabelChanges').textContent = totalTime.toFixed(2);
    document.getElementById('timeMinutesChanges').textContent = (totalTime / 60).toFixed(2);
}








// Classe pour gérer les nœuds
class Node {
    constructor(name, colorborder, colorbackground) {
        this.id = Node.generateId();
        this.label = name;
        this.shape = 'dot';
        this.size = 10;
        this.color = { background: colorbackground, border: colorborder };
        this.lineCount = 1; // Compteur initialisé à 1
        this.lines = []; // Nouveau tableau pour stocker les lignes desservant ce nœud
    }

    static generateId() {
        if (!Node.idCounter) Node.idCounter = 0;
        return Node.idCounter++;
    }

    incrementLineCount() {
        this.lineCount += 1;
    }

    // Ajout d'une méthode pour ajouter une ligne au nœud
    addLine(line) {
        if (!this.lines.includes(line)) {
            this.lines.push(line);
        }
    }
}


// Classe pour gérer les arêtes
class Edge {
    constructor(from, to, time) {
        this.from = from;
        this.to = to;
        this.label = time;
        this.width = 2;
        this.color = { color: '#000', highlight: '#ff0000' };
        this.smooth = { type: 'continuous', forceDirection: 'none' };
    }

    setDirection(isDirected) {
        if (isDirected) {
            this.arrows = { to: { enabled: true, scaleFactor: 0.5 } };
        }
    }
}

// Fonction pour récupérer les données
async function fetchData() {
    const response = await fetch('/data');
    return response.json();
}

async function createNetwork() {
    const data = await fetchData();
    const nodeMap = {};
    const colorMap = {}; 
    const nodes = [];
    const addedEdges = new Set();
    const graph = new Graph();

    // Création des nœuds et gestion des couleurs
data.sommets.forEach(sommet => {
    const name = sommet.Nom;
    const colorBorder = "#" + sommet.Color;
    const colorBackground = "#" + sommet.Color; // On utilise la même couleur pour le fond et la bordure au départ

    let node;

    if (!nodeMap[name]) {
        // Création d'un nouveau nœud avec la couleur de bordure et la couleur de fond
        node = new Node(name, colorBorder, colorBackground);
        nodeMap[name] = node.id;
        nodes.push(node);
        graph.addNode(node);
    } else {
        // Si le nœud existe déjà, on le trouve dans la liste des nœuds
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


    // Mise à jour des couleurs des nœuds en fonction du nombre de lignes
    nodes.forEach(node => {
        if (node.lineCount >= 2) {
            node.color.background = 'white';
            node.color.border = 'black';
        } else {
            node.color.background = "#" + data.sommets.find(s => s.Nom === node.label).Color;
            node.color.border = node.color.background;
        }
    });

    // Création des arêtes
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

    // Initialisation du réseau
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
        handleNodeClick(params, graph, networkData); // Passer networkData ici aussi
    });
}



createNetwork();
