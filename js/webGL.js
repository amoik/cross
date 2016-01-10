var gl;
var shaderProgram;
var shaderProgramTex;
var frames = 0;
var time = undefined;
var canvWallW = 0;
var canvWallH = 0;
const CANV_ID = 'canv';
const WEBGL_X = 16;
const WEBGL_Y = 6;
const GL_RESOLUTION = 800;
var fragmentShader;
var vertexShader;
var fragmentShaderTex;
var vertexShaderTex;

function canvDraw(myPic)
{
	frames = 0;
	time = undefined;
	canvWallW = 0;
	canvWallH = 0;



	$("#"+CANV_ID).show();
	var can = document.getElementById(CANV_ID);

	var global = {onAir:false,md:false, x: 0,player:{x:0,y:0,s:1, a:0},ang:angular.element(document.getElementById('mpGame')).controller(),npcGrabbed:false,keyState:{}};
	global.ang.setRunning(true);

	addListeners(can, global);

	if(!initGL(can, global))
	{
		alrt("Dieser Browser beherrscht leider kein WebGL :(<br>Lade dir einen <a href='https://www.mozilla.org/de/firefox/new/' target='_blank'>richtigen</a> herunter");
		return false;
	}

	initShadersTex();

	canvResize();


	global.ang.setOnePlayerPicture(myId, myPic);

	canvEndless(can, global);
	return true;
}


function calcFrames(global)
{
	if(time === undefined)
		time = new Date();

	var actual = new Date();

	if(actual.getTime() - time.getTime() > 1000)
	{
		$("#canvFrames").html("FPS: " + frames).show();
		frames = 0;
		time = new Date();
	}
	else
		frames ++;
}

function canvEndless(can, global)
{
	calcFrames(global);

	calcInput(global);
	calcPhysics(global);
	drawScene(global);

	requestAnimFrame(function()
	{
		if(global.ang.getRunning())
		{
			canvEndless(can, global);
		}
		else
			cleanUp()
	});
}

function calcPhysics(global)
{
	//speed reduction
	if(!global.onAir && global.ang.getGame().players)
	{
		//set to 0 if low enough
		if(global.ang.getGame().players[myId].xs < 0.01 && global.ang.getGame().players[myId].xs > -0.01)
			global.ang.getGame().players[myId].xs = 0;
		else if(global.ang.getGame().players[myId].xs < -0.01)
			global.ang.getGame().players[myId].xs += 0.05;
		else if(global.ang.getGame().players[myId].xs > 0.01)
			global.ang.getGame().players[myId].xs -= 0.05;

		//lock on max/min
		if(global.ang.getGame().players[myId].xs > 0.5)
			global.ang.getGame().players[myId].xs = 0.5;

		if(global.ang.getGame().players[myId].xs < -0.5)
			global.ang.getGame().players[myId].xs = -0.5;
	}

	//add speed
	global.ang.getGame().players[myId].y += global.ang.getGame().players[myId].ys;
	global.ang.getGame().players[myId].x += global.ang.getGame().players[myId].xs;

	//left wall collision
	if(global.ang.getGame().players[myId].x - global.ang.getGame().players[myId].s < -WEBGL_X)
	{
		global.ang.getGame().players[myId].x = global.ang.getGame().players[myId].s - WEBGL_X;
		global.ang.getGame().players[myId].xs = -global.ang.getGame().players[myId].xs;
	}

	//right wall collision
	if(global.ang.getGame().players[myId].x + global.ang.getGame().players[myId].s > WEBGL_X)
	{
		global.ang.getGame().players[myId].x = -global.ang.getGame().players[myId].s + WEBGL_X;
		global.ang.getGame().players[myId].xs = -global.ang.getGame().players[myId].xs;
	}


	//floor collision
	if(global.ang.getGame().players[myId].y - global.ang.getGame().players[myId].s < -WEBGL_Y)
	{
		global.onAir = false;
		global.ang.getGame().players[myId].y = -WEBGL_Y + global.ang.getGame().players[myId].s;
	}
	//gravity
	else
	{
		global.onAir = true;
		global.ang.getGame().players[myId].ys -= 0.1;
	}

	//collision with other players
	for(var i in global.ang.getGame().players)
	{
		if(i != myId)
		{
			if(parseInt(i) != myId)
			{
				if(coll_circle_circle(global.ang.getGame().players[myId].x, global.ang.getGame().players[myId].y, global.ang.getGame().players[myId].s, global.ang.getGame().players[i].x, global.ang.getGame().players[i].y, global.ang.getGame().players[i].s))
				{
					if(global.ang.getGame().players[myId].x < global.ang.getGame().players[i].x)
					{
						vibrate();
						global.ang.getGame().players[myId].x = global.ang.getGame().players[i].x - global.ang.getGame().players[myId].s - global.ang.getGame().players[i].s;
					}
					else
					{
						vibrate();
						global.ang.getGame().players[myId].x = global.ang.getGame().players[i].x + global.ang.getGame().players[myId].s + global.ang.getGame().players[i].s;
					}
				}
			}
		}
	}
}

function vibrate()
{
	if ("vibrate" in navigator)
	{
		navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
		navigator.vibrate(100);
	}
}

function move(global, amount)
{
	if(!global.onAir)
	{
		global.ang.getGame().players[myId].xs += amount;
	}
}
function jump(global)
{
	if(!global.onAir)
		global.ang.getGame().players[myId].ys = 1;
}

function calcInput(global)
{
	if(global.keyState[68])
	{//d
		move(global, 0.1);
	}
	if(global.keyState[65])
	{//a
		move(global, -0.1);
	}
	if(global.keyState[87])
	{//w
	}
	if(global.keyState[83])
	{//s
	}
	if(global.keyState[32])
	{//space
		jump(global);
	}
}

function canvResize()
{
	if(gl)
	{
		var jCan = $("#"+CANV_ID);
		jCan.height(jCan.width() / WEBGL_X * WEBGL_Y);
		gl.clearColor(0.9, 0.9, 0.9, 1.0);
		mat4.ortho(-WEBGL_X,WEBGL_X,-WEBGL_Y,WEBGL_Y,1,0.0,pMatrix);
		mat4.identity(mvMatrix);
	}
}

function initGL(can, global)
{
	can.width = GL_RESOLUTION;
	can.height = GL_RESOLUTION;

	try
	{
		gl = can.getContext("webgl");
		gl.viewportWidth = can.width;
		gl.viewportHeight = can.height;
	}
	catch (e)
	{
		return false;
	}
	return true;
}

function cleanUp()
{
	setConfig("loadedLevel", "empty");

	if(shaderProgram)
	{
		gl.detachShader(shaderProgram, vertexShader);
		gl.detachShader(shaderProgram, fragmentShader);
		gl.deleteProgram(shaderProgram);
	}


	if(shaderProgramTex)
	{
		gl.detachShader(shaderProgramTex, vertexShaderTex);
		gl.detachShader(shaderProgramTex, fragmentShaderTex);
		gl.deleteProgram(shaderProgramTex);
	}
}

function initShaders()
{
	fragmentShader = getShaderByString(gl, getFShader(), "x-shader/x-fragment")
	vertexShader = getShaderByString(gl, getVShader(), "x-shader/x-vertex")


	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
	{
		alert("Shader konnten nicht initialisiert werden!");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	return true;
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();


function drawScene(global, tex)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	for(var i in global.ang.getGame().players)
	{
		if(global.ang.getGame().players[i])
		{
			if(!global.ang.getPlayerPictures()[i])
			{
				rebuildTexture(global, i);
			}

			if(global.ang.getGame().players[i].id != myId)
			{
				if(global.ang.getPlayerPictures()[i])
				{
					glDrawCircleTex(global.ang.getGame().players[i].x, global.ang.getGame().players[i].y, global.ang.getGame().players[i].s, global.ang.getGame().players[i].a, global.ang.getPlayerPictures()[i].t);// tex[0].t);
				}
			}
		}
	}
}



function addListeners(can, global)
{
	window.addEventListener('keydown',function(e){global.keyState[e.keyCode || e.which] = true;},true);
	window.addEventListener('keyup',function(e){global.keyState[e.keyCode || e.which] = false;},true);
	window.addEventListener('touchstart',function(e){jump(global);},true);
	window.addEventListener('devicemotion',function(e){accel(global, e);},true);
}

function accel(global, e)
{
	e.preventDefault();
	var ori = screen.mozOrientation || screen.orientation || screen.msOrientation;

	if(typeof ori == "string")
	{
		if (ori === "landscape-primary")
			move(global, Math.round(e.accelerationIncludingGravity.y*10) / 100);
		else if (ori === "landscape-secondary")
			move(global, -Math.round(e.accelerationIncludingGravity.y*10) / 100);
		else if (ori === "portrait-secondary")
			move(global, Math.round(e.accelerationIncludingGravity.x*10) / 100);
		else if (ori === "portrait-primary")
			move(global, -Math.round(e.accelerationIncludingGravity.x*10) / 100);
	}
	else
	{
		if(window.orientation == 90)
			move(global, Math.round(e.accelerationIncludingGravity.y*10) / 100);
		else if(window.orientation == -90)
			move(global, -Math.round(e.accelerationIncludingGravity.y*10) / 100);
		else if(window.orientation == 0)
			move(global, -Math.round(e.accelerationIncludingGravity.x*10) / 100);
		else if(window.orientation == 180)
			move(global, Math.round(e.accelerationIncludingGravity.x*10) / 100);
	}
}

/*
 * calculates canvas coordinates from an mouse event
 *
 */
function getCanvasCoord(e)
{
	var jCan = $("#"+CANV_ID);
	var can = document.getElementById(CANV_ID);
	var rect = can.getBoundingClientRect();
	if(!rect)
		die("BoundingClientRect is not supported by this browser!");

	var x = e.clientX-rect.left-(jCan.width()/2);
	var y = e.clientY-rect.top-(jCan.height()/2);

	var mx = x/(jCan.width()/2)*WEBGL_X;
	var my = y/(jCan.height()/2)*WEBGL_Y;


	return {x: mx , y: -my};
}



function coll_circle_circle(x1, y1, r1, x2, y2, r2)
{

	var circ1 = Math.sqrt(Math.abs(x1-x2)*Math.abs(x1-x2)+Math.abs(y1-y2)*Math.abs(y1-y2));
	var circ2 = parseFloat(r1)+parseFloat(r2);

	if( circ1 < circ2)
	{
		return 1;
	}
	else
		return 0;
}

function rebuildTexture(global, i)
{
	var p = global.ang.getPlayerPictures();
	if(!p[i])
		p[i]={};

	p[i].t = gl.createTexture();
	p[i].t.image = new Image();

	//if there is a custom picture
	if(p[i].png)
		p[i].t.image.src = p[i].png;
	else	//if not
		p[i].t.image.src = global.ang.getPicture();

	p[i].t.image.onload = function ()
	{
		handleLoadedTexture(p[i].t);
	}
}



//								WEBGL FUNCTIONS

//								GENERIC
function getShaderByString(gl, str, type)
{
	var shader;
	if (type == "x-shader/x-fragment")
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else if (type == "x-shader/x-vertex")
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}
	else
	{
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


function setMatrixUniforms()
{
	gl.uniformMatrix4fv(shaderProgramTex.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgramTex.mvMatrixUniform, false, mvMatrix);
}





//								WITH TEXTURES

function getVShaderTex()
{
	var str = "";

	str += "attribute vec3 aVertexPosition;";
	str += "attribute vec2 aTextureCoord;";
	str += "uniform mat4 uMVMatrix;";
	str += "uniform mat4 uPMatrix;";
	str += "varying vec2 vTextureCoord;";

	str += "void main(void)";
	str += "{";
		str += "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);";
		str += "vTextureCoord = aTextureCoord;";
	str += "}";

	return str;
}

function getFShaderTex()
{
	var str = "";

	str += "precision mediump float;";
	str += "varying vec2 vTextureCoord;";
	str += "uniform sampler2D uSampler;";

	str += "void main(void)";
	str += "{";
		str += "gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));";
	str += "}";

	return str;
}

function initShadersTex()
{
	fragmentShaderTex = getShaderByString(gl, getFShaderTex(), "x-shader/x-fragment");
	vertexShaderTex = getShaderByString(gl, getVShaderTex(), "x-shader/x-vertex");

	shaderProgramTex = gl.createProgram();
	gl.attachShader(shaderProgramTex, vertexShaderTex);
	gl.attachShader(shaderProgramTex, fragmentShaderTex);
	gl.linkProgram(shaderProgramTex);

	if (!gl.getProgramParameter(shaderProgramTex, gl.LINK_STATUS))
	{
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgramTex);

	shaderProgramTex.vertexPositionAttribute = gl.getAttribLocation(shaderProgramTex, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgramTex.vertexPositionAttribute);

	shaderProgramTex.textureCoordAttribute = gl.getAttribLocation(shaderProgramTex, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgramTex.textureCoordAttribute);

	shaderProgramTex.pMatrixUniform = gl.getUniformLocation(shaderProgramTex, "uPMatrix");
	shaderProgramTex.mvMatrixUniform = gl.getUniformLocation(shaderProgramTex, "uMVMatrix");
	shaderProgramTex.samplerUniform = gl.getUniformLocation(shaderProgramTex, "uSampler");
}

function handleLoadedTexture(texture)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}






function lowLvlGLDrawTex(posC, texC, tex, type)
{
	//POS COORDS
	var posB = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posB);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posC), gl.STATIC_DRAW);
	posB.itemSize = 2;
	posB.numItems = posC.length / 2;

	//TEX COORDS
	var texB = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texB);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texC), gl.STATIC_DRAW);
	texB.itemSize = 2;
	texB.numItems = texC.length / 2;


	gl.bindBuffer(gl.ARRAY_BUFFER, posB);
	gl.vertexAttribPointer(shaderProgramTex.vertexPositionAttribute, posB.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, texB);
	gl.vertexAttribPointer(shaderProgramTex.textureCoordAttribute, texB.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(shaderProgramTex.samplerUniform, 0);

	setMatrixUniforms();
	gl.drawArrays(type, 0, posB.numItems);
}



function glDrawRectangleTex(x, y, xs, ys, tex)
{
	posC = [
		x+xs, y+ys,
		x-xs, y+ys,
		x+xs, y-ys,
		x-xs, y-ys,
	];


	var texC = [
	1.0, 1.0,
	0.0, 1.0,
	1.0, 0.0,
	0.0, 0.0,
	];

	lowLvlGLDrawTex(posC, texC, tex, gl.TRIANGLE_STRIP);
}


function glDrawCircleTex(x, y, s, a, tex)
{
	var vcount = 30;
	var angle = a / 360 * Math.PI * 2;

	var posC = Array();
	var texC = Array();

	for (var j = 0; j < vcount; ++j)
	{
		var prozent = (j / (vcount-2));
		var rad = prozent * 2.0 * Math.PI;

		var aussenx = x + s * Math.cos(rad+angle);
		var ausseny = y + s * Math.sin(rad+angle);
		var texx = (0.5*Math.cos(rad))+0.5;
		var texy = (0.5*Math.sin(rad))+0.5;


		texC.push(texx);
		texC.push(texy);
		posC.push(aussenx);
		posC.push(ausseny);
	}


	lowLvlGLDrawTex(posC, texC, tex, gl.TRIANGLE_FAN);
}









////////////TODO AUSMISTEN UND UMBENENNEN!!!

function glDrawSquare(x, y, s, r, g, b)
{
	verts = [
		x+s,  y+s,
		x-s,  y+s,
		x+s,  y-s,
		x-s,  y-s,
	];


	var color = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, color);
	colors = []
	for (var i=0; i < 4; i++)
	{
		colors = colors.concat([r, g, b, 1.0]);
	}

	lowLvlGLDraw(verts, 4, colors, gl.TRIANGLE_STRIP);
}

function glDrawTriangle(x, y, s, r, g, b)
{
	var verts = [
		 x,         y+s,
		 x-(s/2.0), y-s,
		 x+(s/2.0), y-s,
	];


	var color = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, color);
	var colors = [
		r, g, b, 1.0,
		r, g, b, 1.0,
		r, g, b, 1.0
	];

	lowLvlGLDraw(verts, 3, colors, gl.TRIANGLES);
}

function glDrawCircle(x, y, s, r, g, b)
{
	var vcount = 20;
	var verts = Array();
	var colors = Array();

	for (var j = 0; j < vcount; ++j)
	{
		var prozent = (j / (vcount-2));
		var rad = prozent * 2.0 * Math.PI;

		var aussenx = x + s * Math.cos(rad);
		var ausseny = y + s * Math.sin(rad);

		colors.push(r);
		colors.push(g);
		colors.push(b);
		colors.push(1);
		verts.push(aussenx);
		verts.push(ausseny);
	}
	lowLvlGLDraw(verts, vcount, colors, gl.TRIANGLE_FAN);
}


function lowLvlGLDraw(verts, vcount, colors, type)
{

	var pos = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, pos);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
	pos.itemSize = 2;
	pos.numItems = vcount;



	var col = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, col);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	col.itemSize = 4;
	col.numItems = vcount;



	gl.bindBuffer(gl.ARRAY_BUFFER, pos);
	gl.vertexAttribPointer(shaderProgramTex.vertexPositionAttribute, pos.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, col);
	gl.vertexAttribPointer(shaderProgramTex.vertexColorAttribute, col.itemSize, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawArrays(type, 0, pos.numItems);
}





function getVShader()
{
	var str = "";

	str += "attribute vec3 aVertexPosition;";
	str += "attribute vec4 aVertexColor;";
	str += "uniform mat4 uMVMatrix;";
	str += "uniform mat4 uPMatrix;";
	str += "varying vec4 vColor;";

	str += "void main(void)";
	str += "{";
		str += "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);";
		str += "vColor = aVertexColor;";
	str += "}";

	return str;
}

function glDrawRectangle(x, y, xs, ys, r, g, b)
{
	verts = [
		x+xs, y+ys,
		x-xs, y+ys,
		x+xs, y-ys,
		x-xs, y-ys,
	];


	var color = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, color);
	colors = []
	for (var i=0; i < 4; i++)
	{
		colors = colors.concat([r, g, b, 1.0]);
	}

	lowLvlGLDraw(verts, 4, colors, gl.TRIANGLE_STRIP);
}

function glDrawTriangle(x, y, s, r, g, b)
{
	var verts = [
		 x,     y+s,
		 x-(s/2.0), y-s,
		 x+(s/2.0), y-s,
	];


	var color = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, color);
	var colors = [
		r, g, b, 1.0,
		r, g, b, 1.0,
		r, g, b, 1.0
	];

	lowLvlGLDraw(verts, 3, colors, gl.TRIANGLES);
}

function glDrawCircle(x, y, s, r, g, b)
{
	var vcount = 30;
	var verts = Array();
	var colors = Array();

	for (var j = 0; j < vcount; ++j)
	{
		var prozent = (j / (vcount-2));
		var rad = prozent * 2.0 * Math.PI;

		var aussenx = x + s * Math.cos(rad);
		var ausseny = y + s * Math.sin(rad);

		colors.push(r);
		colors.push(g);
		colors.push(b);
		colors.push(1);
		verts.push(aussenx);
		verts.push(ausseny);
	}
	lowLvlGLDraw(verts, vcount, colors, gl.TRIANGLE_FAN);
}

function getFShader()
{
	var str = "";

	str += "precision mediump float;";
	str += "varying vec4 vColor;";

	str += "void main(void)";
	str += "{";
		str += "gl_FragColor = vColor;";
	str += "}";

	return str;
}



function getShaderById(gl, id)
{
	var shaderScript = document.getElementById(id);
	if (!shaderScript)
	{
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k)
	{
		if (k.nodeType == 3)
		{
				str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment")
	{
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	}
	else if (shaderScript.type == "x-shader/x-vertex")
	{
		shader = gl.createShader(gl.VERTEX_SHADER);
	}
	else
	{
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
	{
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

window.requestAnimFrame = (function()
{
	//uses browser-native animation frames
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback,element)
	{
		window.setTimeout(callback, 1000/60);
	};
})();
