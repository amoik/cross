

function isObject(val)
{
	if (val === null) { return false;}
	return ( (typeof val === 'function') || (typeof val === 'object') );
}

function sortArray(a, b)
{
	if (a[0] === b[0])
		return 0;
	else
		return (a[0] < b[0]) ? -1 : 1;
}

function dynamicSort(prop)
{
	var sortOrder = 1;
	if(prop[0] === "-")
	{
		sortOrder = -1;
		prop = prop.substr(1);
	}
	return function (a,b)
	{
		var result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
		return result * sortOrder;
	}
}

function _GET()
{
	var url = window.location.href;

	//for empty id links(eg. bootstrap)
	if(url.slice(-1) === "#")
		url = url.slice(0,-1);

	var vars = {};
	var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value)
	{
		vars[key] = value;
	});
	return vars;
}

function removeBox()
{
	$('#alrt_box').remove();
	modal.hidePleaseWait();
}

$( window ).resize(function()
{
  setBoxPos();
});

function setBoxPos()
{
  var bx = $('#alrt_box');

	var ww = $(window).width();
	var bw = $('#alrt_box').width();

	var x = ww/2 - bw/2;


	bx.css("left", x+"px");
	bx.css("top",  "200px");//y+"px");
}


function alrt(msg, style)
{
	modal.showPleaseWait();
	$("body").append("<div id='alrt_box'></div>")
	var bx = $('#alrt_box');

	bx.css("opacity", "0.8");
	bx.css("position", "fixed");
	bx.css("z-index", "10030000");
	bx.css("background-color", "#FFDD66");
	bx.css("border", "1px solid grey");
	bx.css("border-radius", "15px");
	bx.css("padding", "3%");

	bx.html('<p style="'+style+'">'+msg+'</p><p style="float:right;"><button class="btn btn-default" onclick="removeBox()"><span class="glyphicon glyphicon-check"></span></button></p>');

	setBoxPos();

	bx.show();
}

function getTimeDiff(d1, d2)
{
	var zeitDiff = d1.getTime() - d2.getTime();
	return Math.ceil(zeitDiff / (1000 * 3600 * 24));
}



function die(msg)
{
	var errMsg = "<p style='color:#ff0000;font-weight:bold;font-size:17pt;text-align:center;margin:5%;'>Es ist ein schwerwiegender Fehler aufgetreten:</p>";
	document.body.innerHTML = errMsg+"<div style='margin:10%;padding:5%;text-align:center;font-size:20px;border:2px solid grey;border-radius:15px;'>"+msg+"</div>";
	throw new Error(msg);
}

var Sorter = function(obj)
{
	this.sortByString = "";
	this.object = obj;
	this.originals = JSON.parse(JSON.stringify(obj));
  this.object.srtReverse = false;
  this.originals.srtReverse = false;

	this.sortBy = function(key)
  {
		this.object.sort(this.dynamicSort(key));

		if(this.originals !== undefined)
    	this.originals.sort(this.dynamicSort(key));

  	// die originaldaten werden auch sortiert, da sonst die differenzerkennung bei jedem item anschlagen würde
		if(this.sortByString === key)
		{
			if(this.object.srtReverse)
			{
				this.object.srtReverse = false;
				this.originals.srtReverse = false;
			}
			else
			{
				this.object.srtReverse = true;
				this.originals.srtReverse = true;
				this.object.reverse();
				this.originals.reverse();
			}
		}
		else
		{
			this.object.srtReverse = false;
			this.originals.srtReverse = false;
			//den key kopieren(in js gibt es leider keine elegantere lösung dafür)
			this.sortByString = JSON.parse(JSON.stringify(key));
		}
	}


	this.dynamicSort = function(prop)
	{
		var sortOrder = 1;
		if(prop[0] === "-")
		{
			sortOrder = -1;
			prop = prop.substr(1);
		}
		return function (a,b)
		{
			var result = (a[prop] < b[prop]) ? -1 : (a[prop] > b[prop]) ? 1 : 0;
			return result * sortOrder;
		}
	}
};

