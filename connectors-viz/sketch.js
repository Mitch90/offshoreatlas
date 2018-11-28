var myTable;
var myData = [];
var nodes = [];
var connectors = [];
var maxValue;
var maxSize = 50;
var network = {}; //contains the whole system


function preload() {
	// load data
	// myTable = loadTable("assets/China-Offshore-FDI-simplified.tsv", "tsv", "header");
	//sample data
	myTable = loadTable("assets/data-min.csv", "tsv", "header");
}

function setup() {
	createCanvas(windowWidth, windowHeight)
	//transform it in someting meaningful
	for (var i in myTable.getObject()) {
		myData.push(myTable.getObject()[i]);
	}
	// console.log(myData);

	var values = [];
	//get all the nodes
	myData.forEach(function(d) {
		nodes.push(d['Source']);
		nodes.push(d['Inter 1']);
		nodes.push(d['Target']);
	})

	//remove duplicates
	nodes = Array.from(new Set(nodes));
	//evaluate properties
	nodes = nodes.map(function(d) {
		var newNode = new Connector(d);

		newNode.in = _.filter(myData, {
			'Target': d
		});
		newNode.out = _.filter(myData, {
			'Source': d
		});
		newNode.thought = _.filter(myData, {
			'Inter 1': d
		});

		newNode.totalIn = newNode.in.reduce(function(p, n) {
			return p + 1 * n['Extimate 01']
		}, 0)
		newNode.totalThrough = newNode.thought.reduce(function(p, n) {
			return p + 1 * n['Extimate 01']
		}, 0);
		newNode.totalOut = newNode.out.reduce(function(p, n) {
			return p + 1 * n['Extimate 01']
		}, 0);
		values.push(Math.max(newNode.totalIn, newNode.totalThrough, newNode.totalOut));
		return newNode;
	})
	//get the maximum value
	maxValue = Math.max(...values);

	//try to draw all of them
	var xPos = 50;
	var yPos = 50;
	nodes.forEach(function(d) {
		d.x = xPos;
		d.y = yPos;
		d.draw();
		xPos += 50;
	})
	console.log(nodes);
	drawEdges();
}

function draw() {
	// put drawing code here
}

function drawEdges() {
	myData.forEach(function(e) {
		//Get nodes
		var s = _.filter(nodes, {
			'id': e['Source']
		})[0];
		var i = _.filter(nodes, {
			'id': e['Inter 1']
		})[0];
		var t = _.filter(nodes, {
			'id': e['Target']
		})[0];
		console.log(s, i, t);

		var size = map(e['Extimate 01'], 0, maxValue, 0, maxSize);

		//anchors for the first line
		//increase inposition
		s.inPos += size/2;
		//opposite angle
		var beta = s.rotation - PI/2;

		apoint = {
			'x':s.x + cos(s.rotation + s.outRot) * s.outRadius - cos(s.rotation + s.outRot - PI/2) * s.outRadius / 2,
			'y':s.y + sin(s.rotation + s.outRot) * s.outRadius - sin(s.rotation + s.outRot - PI/2) * s.outRadius / 2
		};

		ellipse(apoint.x, apoint.y, 5)

		spoint = {
			'x':s.x + cos(s.rotation + s.outRot) * s.outRadius,
			'y':s.y + sin(s.rotation + s.outRot) * s.outRadius
		};
		sanchor = {
			'x':s.x + cos(s.rotation + s.outRot) * s.outRadius * 2,
			'y': s.y + sin(s.rotation + s.outRot) * s.outRadius * 2
		};
		t1point = {
			'x':i.x + cos(i.rotation + i.inThroughRot) * i.throughtRadius,
			'y': i.y + sin(i.rotation + i.inThroughRot) * i.throughtRadius
		};
		t1anchor = {
			'x': i.x + cos(i.rotation + i.inThroughRot) * i.throughtRadius * 2,
			'y': i.y + sin(i.rotation + i.inThroughRot) * i.throughtRadius * 2
		};
		//anchors for the second line
		t2point = {
			'x': i.x + cos(i.rotation + i.outThroughtRot) * i.throughtRadius,
			'y': i.y + sin(i.rotation + i.outThroughtRot) * i.throughtRadius
		};
		t2anchor = {
			'x': i.x + cos(i.rotation + i.outThroughtRot) * i.throughtRadius * 2,
			'y': i.y + sin(i.rotation + i.outThroughtRot) * i.throughtRadius * 2
		};
		tpoint = {
			'x': t.x + cos(t.rotation + t.inRot) * t.inRadius,
			'y': t.y + sin(t.rotation + t.inRot) * t.inRadius
		};
		tanchor = {
			'x': t.x + cos(t.rotation + t.inRot) * t.inRadius * 2,
			'y': t.y + sin(t.rotation + t.inRot) * t.inRadius * 2
		};

		// stroke('green')
		// ellipse(tanchor[0], tanchor[1], 5);
		// stroke('orange')
		// ellipse(t2anchor[0], t2anchor[1], 5);

		stroke('gray');
		strokeWeight(size)
		strokeCap(SQUARE);
		noFill();
		// line(spoint[0], spoint[1], sanchor[0], sanchor[1]);
		// line(t1anchor[0], t1anchor[1], t1point[0], t1point[1])
		bezier(spoint.x, spoint.y, sanchor.x, sanchor.y, t1anchor.x, t1anchor.y, t1point.x, t1point.y);
		bezier(tpoint.x, tpoint.y, tanchor.x, tanchor.y, t2anchor.x, t2anchor.y, t2point.x, t2point.y);

	})
}

function Connector(_id) {
	this.id = _id

	this.totalIn = 0;
	this.totalOut = 0;
	this.totalThrough = 0;

	this.in = [];
	this.out = [];
	this.thought = [];

	this.inPos = 0;
	this.outPos = 0;
	this.throughtPos = 0;

	this.rotation = 0; // degrees
	this.radius = 0;
	this.inRadius = 0;
	this.outRadius = 0;
	this.throughtRadius = 0;

	this.x = 0;
	this.y = 0;

	this.selected = false;

	//angleMode(RADIANS);

	this.inRot = 0;
	this.outRot = PI;
	this.inThroughRot = PI / 2;
	this.outThroughtRot = PI / 2 * 3;

	this.draw = function() {
		//calc the radius
		this.radius = map(Math.max(this.totalIn, this.totalOut, this.totalThrough), 0, maxValue, 0, maxSize);
		this.inRadius = map(this.totalIn, 0, maxValue, 0, maxSize);
		this.outRadius = map(this.totalOut, 0, maxValue, 0, maxSize);
		this.throughtRadius = map(this.totalThrough, 0, maxValue, 0, maxSize);

		if (this.selected) {
			fill('red');
		} else {
			fill(200)
		}

		strokeWeight(0.5)

		//general rotation
		translate(this.x, this.y);
		rotate(this.rotation);

		push();
		//rotate and draw the first rect
		rotate(this.inRot);
		stroke('blue') //blue for in
		var iSize = map(this.totalIn, 0, maxValue, 0, maxSize);
		rect(0, -iSize / 2, iSize, iSize);
		pop()

		push()
		rotate(this.outRot)
		stroke('green') // green for out
		var oSize = map(this.totalOut, 0, maxValue, 0, maxSize);
		rect(0, -oSize / 2, oSize, oSize);
		pop()

		push()
		rotate(this.inThroughRot);
		stroke('orange') //orange for throught
		var tSize = map(this.totalThrough, 0, maxValue, 0, maxSize);
		rect(0, -tSize / 2, tSize, tSize);
		pop()

		push()
		rotate(this.outThroughtRot)
		stroke('orange') //orange for throught
		rect(0, -tSize / 2, tSize, tSize);
		pop();

		push()
		noStroke();
		fill('black')
		textAlign(RIGHT);
		text(this.id, 0, 0);
		pop()

		//remove general rotation
		rotate(-this.rotation);
		translate(-this.x, -this.y);

	}
}

function mouseClicked() {
	//check if click is on a connector

	nodes.forEach(function(d) {
		if (dist(d.x, d.y, mouseX, mouseY) < d.radius) {
			d.selected = true;

			network.selected = d
			//redraw
			background(255);
			nodes.forEach(function(d) {
				d.draw();
			})
			drawEdges();
		} else {
			d.selected = false;
		}
	})
}

function mouseDragged(e) {
	console.log(e);
	network.selected.x = e.x;
	network.selected.y = e.y;
	background(255);
	nodes.forEach(function(d) {
		d.draw();
	})
	drawEdges();
}

function keyPressed() {
	console.log(keyCode);
	if (keyCode == 37) {
		console.log('left')
		network.selected.rotation += 0.1;
	} else if (keyCode == 39) {
		console.log('right')
		network.selected.rotation -= 0.1;
	}
	background(255);
	nodes.forEach(function(d) {
		d.draw();
	})
	drawEdges();
}