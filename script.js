'use strict';
let canvas = document.createElement("canvas");
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");
let actx = new (window.AudioContext || window.webkitAudioContext)();

function playNote(f) {
	let o = actx.createOscillator();
	let g = actx.createGain();
	o.type = 'sine';
	o.frequency.setValueAtTime(f, actx.currentTime);
	g.gain.value = 0.25;
	g.gain.setTargetAtTime(0, actx.currentTime + 0.25, 0.3);
	o.connect(g).connect(actx.destination);
	o.start();
	o.stop(2 + actx.currentTime);
}

let m = new Uint32Array(2);
let nodes = []; // x, y, p, root, ?xf, ?yf
let selnote = -1;
let octpx = 600;

function addNode(p) {
	nodes.push({x: m[0], y: m[1], p: p});
}
function nearestNodeData() {
	if (nodes.length == 0) {
		console.warn("attempted to boi");
		return -1;
	}
	let d2min = (m[0] - nodes[0].x) ** 2 + (m[1] - nodes[0].y) ** 2;
	let imin = 0;
	for (let i = 1; i < nodes.length; i++) {
		let d2 = (m[0] - nodes[i].x) ** 2 + (m[1] - nodes[i].y) ** 2;
		if (d2 < d2min) {
			imin = i;
			d2min = d2;
		}
	}
	return [imin, d2min];
}
function playNearestNode() {
	if (nodes.length == 0) return;
	let d = nearestNodeData();
	selnote = d[0];
	playNote(440 * Math.exp(nodes[d[0]].p));
}
function createNode() {
	let p;
	let n = {x: m[0], y: m[1]};
	if (nodes.length == 0) {
		n.p = 0;
		n.root = true;
	} else {
		let d = [selnote, 0];//nearestNodeData();
		d[1] = (nodes[selnote].x - n.x) ** 2 + (nodes[selnote].y - n.y) ** 2;
		n.xf = nodes[d[0]].x;
		n.yf = nodes[d[0]].y;
		let s = (n.xf > n.x) ^ (n.yf > n.y) ? -1 : 1;
		n.p = nodes[d[0]].p + Math.sqrt(d[1]) / octpx * s * Math.log(2);
		n.root = false;
	}
	nodes.push(n);
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < nodes.length; i++) {
		ctx.beginPath();
		ctx.arc(nodes[i].x, nodes[i].y, 10, 0, 2*Math.PI);
		ctx.fill();
		ctx.closePath();
		if (!nodes[i].root) {
			ctx.beginPath();
			ctx.moveTo(nodes[i].xf, nodes[i].yf);
			ctx.lineTo(nodes[i].x, nodes[i].y);
			ctx.stroke();
			ctx.closePath();
		}
	}
	if (nodes.length > 0 && selnote >= 0) {
		ctx.beginPath();
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx, 0, 2*Math.PI);
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx * Math.log(3/2) / Math.log(2), 0, 2*Math.PI);
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx * Math.log(5/4) / Math.log(2), 0, 2*Math.PI);
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx * Math.log(6/5) / Math.log(2), 0, 2*Math.PI);
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx * Math.log(11/8) / Math.log(2), 0, 2*Math.PI);
		ctx.arc(nodes[selnote].x, nodes[selnote].y, octpx * Math.log(9/8) / Math.log(2), 0, 2*Math.PI);
		ctx.stroke();
		ctx.closePath();
	}
}

function deleteNearestNode() {
	if (nodes.length == 0) return;
	let d = nearestNodeData();
	if (d[0] != nodes.length - 1) {
		nodes[d[0]] = nodes.pop();
		if (selnote == nodes.length) selnote = d[0];
	} else {
		nodes.pop();
		selnote = -1;
	}
}

addEventListener("mousemove", function(e) {
	m[0] = e.clientX;
	m[1] = e.clientY;
	//draw();
}, false);
addEventListener("resize", function(e) {
	let r = canvas.getBoundingClientRect();
	canvas.width = r.width;
	canvas.height = r.height;
	draw();
}, false);
let r = canvas.getBoundingClientRect();
canvas.width = r.width;
canvas.height = r.height;
addEventListener("keydown", function(e) {
	switch (e.key) {
	case "s":
	createNode();
	playNearestNode();
	break;
	case "d":
	createNode();
	break;
	case "f":
	playNearestNode();
	break;
	case "x":
	deleteNearestNode();
	break;
	}
	draw();
}, false);
