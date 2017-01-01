 // variables globales
var paper1, 
	infoBulle, gMap, gField, gCompass, gNeedle, photo, marker1, marker2, 
	cursor1, cursor2, cursor3, 
	sun, moon, 
	gWidth, gHeight,
	gHeading, gFov, gLat, gLon, gEditable = 0, gZoom = 16,
	cx, cy, O1x, O1y, O2x, O2y, 
	r, r0, r1, r2, r3,
	moveMarkerEvent = function (dx, dy, x, y) {
		var x1=x-O1x, y1=y-O1y, 
				angle = Math.round(Raphael.angle(cx,cy,x1,y1)),
				angle0 = Math.round(Raphael.angle(cx,cy,this.ox,this.oy)),
				delta=(angle-angle0); 
		// console.log('x='+x);
		// console.log('y='+y);
		// console.log('dx='+dx);
		// console.log('dy='+dy);
		// console.log('this.ox='+this.ox);
		// console.log('this.oy='+this.oy);
		// console.log('x1='+x1);
		// console.log('y1='+y1);
		// console.log('angle=' + angle);
		// console.log('angle0=' + angle0);
		// console.log('delta=' + delta);
		
			this.ox = x1; 
			this.oy = y1; 
			this.direction = angle-90;
			this.direction = stdBearing(this.direction);
			
			if (Math.abs(delta) > 0) {
				var dataString = "...R"+Math.round(delta)+","+cx+","+cy;
				
				this.transform(dataString).toFront();
				this.line.transform(dataString).toFront();
			};
			drawLines();
		},
	changeHeadingEvent = function (dx, dy, x, y) {
            var x1=x-O1x, y1=y-O1y, 
				angle = Math.round(Raphael.angle(cx,cy,x1,y1)),
				angle0 = Math.round(Raphael.angle(cx,cy,this.ox,this.oy)),
				delta=(angle-angle0); 

			this.ox = x1; 
			this.oy = y1; 
			
			if (Math.abs(delta) > 0) {
			  rotateFov(delta);
				gHeading = angle-90;
				gHeading = stdBearing(gHeading);
				document.getElementById("heading").value = gHeading;
			};
			drawLines();
		},
	resizeFovEvent = function (dx, dy, x, y) {
            var x1=x-O1x, y1=y-O1y, 
				angle = Raphael.angle(cx,cy,x1,y1),
				angle0 = Raphael.angle(cx,cy,this.ox,this.oy),
				delta=(angle0-angle); 

			this.ox = x1; 
			this.oy = y1; 
			
			if (this == cursor3) {
				delta = -1 * delta;
			}
			if (delta < 0 && (-1*delta <= gFov/2) || (delta > 0 && delta <= ((360-gFov)/2))) {

				var dataString = "...R"+Math.round(-1*delta)+","+cx+","+cy;
				cursor1.transform(dataString);
				dataString = "...R"+Math.round(delta)+","+cx+","+cy;
				cursor3.transform(dataString);

				gFov = Math.round(gFov) + Math.round(2 * delta);
				gFov = stdBearing(gFov);
				document.getElementById("fov").value = gFov;

			};
			drawLines();
		},
	zoomInEvent = function (x,y) {
			gZoom = (gZoom < 20 ? parseInt(gZoom) + 1 : 20);
			refreshMap();
        },
	zoomOutEvent = function (x,y) {
			gZoom = (gZoom > 12 ? parseInt(gZoom) - 1 : 12);
			refreshMap();
        },
	clickEvent = function (x,y) {
			this.ox = x-O1x; 
			this.oy = y-O1y; 
        },
	hoverInEvent= function (ev) {
			this.ox = ev.clientX-O2x; 
			this.oy = ev.clientY-O2y; 
			
			this.show();
			
			// if (typeof popup !== "undefined") {
				// popup.remove();
				// popup.push(paper2.text(this.ox, this.oy, 'ma légende ' + this.attr('name')).attr({'fill' : 'white', 'stroke': 'none', 'text-anchor': 'start', "font": '100 14px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'})				);
				// popup.show();
			// } else {
				// popup = paper2.set();
			// }
        },
	hoverOutEvent= function () {
		this.hide;
		
			// if (typeof popup !== "undefined") {
				// popup.hide();
			// }
        },
	dropEvent = function () {
			drawFov(gHeading,gFov,gEditable);
        },
	dblClickEvent = function (ev) {
            var x1=ev.pageX-O1x, y1=ev.pageY-O1y, x2, y2, 
				angle = Math.round(Raphael.angle(cx,cy,x1,y1)); 
		angle = angle-90;
		angle = stdBearing(angle);
		x2=cx+Math.round(r*Math.cos(Math.radians(angle-90)),0);
		y2=cy+Math.round(r*Math.sin(Math.radians(angle-90)),0);

		if (typeof marker1 === "undefined") {
			marker1=paper1.circle(x2, y2, 6).attr({"fill":"hotpink", "stroke-width": 2, "stroke": "white", "cursor": "pointer"});
			marker1.direction=angle;
			marker1.line = paper1.path("M "+ (cx+6) +", "+ cy +" L "+(cx+r-6)+ ", "+cy).attr({"stroke-width": 2, "stroke": "hotpink"});
			marker1.line.transform("r" + (angle-90) + " " + cx + ", " + cy);
			marker1.drag(moveMarkerEvent, clickEvent);
		} else if (typeof marker2 === "undefined") {
			marker2=paper1.circle(x2, y2, 6).attr({"fill":"greenyellow", "stroke-width": 2, "stroke": "white", "cursor": "pointer"});
			marker2.direction=angle;
			marker2.line = paper1.path("M "+ (cx+6) +", "+ cy +" L "+(cx+r-6)+ ", "+cy).attr({"stroke-width": 2, "stroke": "greenyellow"});
			marker2.line.transform("r" + (angle-90) + " " + cx + ", " + cy);
			marker2.drag(moveMarkerEvent, clickEvent);
		}
		
		drawLines();
	};
  
 // Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function stdBearing(bearing) {
	var result;
	result = (bearing > 360) ? bearing - 360 : bearing;
	result = (result < 0) ? result + 360 : result;
	return(result);
}

function bbox(lat, lon, dir, fov, dist) {
	//  retourne s w n e  coordinates for bbox around the FOV at the direction to the dist in meters
	var latitudes = new Array(), longitudes = new Array(), pt, lat1, lat2, lon1, lon2, dir1, dir2;
	
	// calcule la position des 3 points aux limites du FOV
	pt = LatLon(lat, lon);
	latitudes.push(pt.lat);
	longitudes.push(pt.lon);
	dir1 = Math.round(dir,1) - Math.round(fov/2,1);
	dir2 = Math.round(dir,1) + Math.round(fov/2,1);
	pt = LatLon(lat, lon).destinationPoint(dist, dir1);
	latitudes.push(pt.lat);
	longitudes.push(pt.lon);
	pt = LatLon(lat, lon).destinationPoint(dist, dir);
	latitudes.push(pt.lat);
	longitudes.push(pt.lon);
	pt = LatLon(lat, lon).destinationPoint(dist, dir2);
	latitudes.push(pt.lat);
	longitudes.push(pt.lon);
	
	dir1=Math.floor(dir1/90)+1;
	dir2=Math.floor(dir2/90);

	// en fonction de la valeur du FOV, on ajoute un ou deux  points cardinaux
	for (i = dir1; i <= dir2; i++)
	{
			dir3 = i*90;
			pt = LatLon(lat, lon).destinationPoint(dist, dir3);
			latitudes.push(pt.lat);
			longitudes.push(pt.lon);
	}

	// trie les tableaux pour retrouver les valeurs min  et max
	latitudes.sort();
	lat1 = latitudes[0];
	lat2 = latitudes[latitudes.length-1];
	
	longitudes.sort();
	lon1 = longitudes[0];
	lon2 = longitudes[longitudes.length-1];
	
	var bbox;
	
	if (lat1 <= lat2) {
		if (lon1 <= lon2) {
			bbox = "(" + lat1 + ", " + lon1 + ", " + lat2 + ", " + lon2 + ")";
		} else {
			bbox = "(" + lat1 + ", " + lon2 + ", " + lat2 + ", " + lon1 + ")";
		}
	} else {
		if (lon1 <= lon2) {
			bbox = "(" + lat2 + ", " + lon1 + ", " + lat1 + ", " + lon2 + ")";
		} else {
			bbox = "(" + lat2 + ", " + lon2 + ", " + lat1 + ", " + lon1 + ")";
		}
	}

	return(bbox);
};

function findOrigin(obj) {
    var rect = obj.getBoundingClientRect();
    var left = rect.left - obj.clientLeft + obj.scrollLeft;
    var top = rect.top - obj.clientTop + obj.scrollTop;

    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj == obj.offsetParent);
    }
    return [left, top];
 };
 
function drawFov(h, f, editable) {
    
		var 	x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5,
			startAngle, endAngle, midAngle, dataString, tmpObj;
		
		gHeading = h;
		gFov = f;
		gEditable = editable;
		
		gField.remove();
		gField.clear();

		if(cursor1){
		   cursor1.remove();
		   cursor1 = false;
		 }
		if(cursor2){
		   cursor2.remove();
		   cursor2 = false;
		 }
		if(cursor3){
		   cursor3.remove();
		   cursor3 = false;
		 }

		startAngle = (gHeading-90-(gFov/2));
		endAngle = (gHeading-90+(gFov/2));
		midAngle = gHeading-90;
	
		x0=cx+Math.round(r0*Math.cos(Math.radians(midAngle)),0);
		y0=cy+Math.round(r0*Math.sin(Math.radians(midAngle)),0);
		x1=cx+Math.round(r0*Math.cos(Math.radians(startAngle)),0);
		y1=cy+Math.round(r0*Math.sin(Math.radians(startAngle)),0);
		x2=cx+Math.round(r0*Math.cos(Math.radians(endAngle)),0);
		y2=cy+Math.round(r0*Math.sin(Math.radians(endAngle)),0);
			
  		dataString = "M" + cx + "," + cy + "  L" + x1 + " "+ y1 + " A" + r0 + "," + r0 +" 0 0,1 " + x0 + " "+ y0 + " A" + r0 + "," + r0 +" 0 0,1 " + x2 + " "+ y2 + " z";

		tmpObj = paper1.path(dataString);

		gField.push(tmpObj);

		x0=cx+Math.round(r1*Math.cos(Math.radians(midAngle)),0);
		y0=cy+Math.round(r1*Math.sin(Math.radians(midAngle)),0);
		x1=cx+Math.round(r1*Math.cos(Math.radians(startAngle)),0);
		y1=cy+Math.round(r1*Math.sin(Math.radians(startAngle)),0);
		x2=cx+Math.round(r2*Math.cos(Math.radians(startAngle)),0);
		y2=cy+Math.round(r2*Math.sin(Math.radians(startAngle)),0);
		
		x3=cx+Math.round(r1*Math.cos(Math.radians(endAngle)),0);
		y3=cy+Math.round(r1*Math.sin(Math.radians(endAngle)),0);
		x4=cx+Math.round(r2*Math.cos(Math.radians(endAngle)),0);
		y4=cy+Math.round(r2*Math.sin(Math.radians(endAngle)),0);
		x5=cx+Math.round(r2*Math.cos(Math.radians(midAngle)),0);
		y5=cy+Math.round(r2*Math.sin(Math.radians(midAngle)),0);
			
 		dataString = "M" + x1 + "," + y1 + " A" + r1 + ","+ r1 + " 0 0,1 " + x0 + " "+ y0 + " A" + r1 + ","+ r1 + " 0 0,1 " + x3 + " "+ y3 + " L" + x4 + "," + y4 + " A" + r2 + "," + r2 +" 0 0,0 " + x5 + " "+ y5 + " A" + r2 + "," + r2 +" 0 0,0 " + x2 + " "+ y2 + " z";
		tmpObj = paper1.path(dataString);

		gField.push(tmpObj);
		
		gField.attr({
			fill: "dodgerblue",
			stroke: "dodgerblue",
            "stroke-width": 2, 
			opacity: .33
		});

		if (typeof marker1 !== "undefined") {
			marker1.toFront();
			marker1.line.toFront();
		};
		if (typeof marker2 !== "undefined") {
			marker2.toFront();
			marker2.line.toFront();
		};
		if (typeof sun !== "undefined") {
			sun.toFront();
		};
		if (typeof moon !== "undefined") {
			moon.toFront();
		};

		x1=cx+Math.round(r*Math.cos(Math.radians(startAngle)),0);
		y1=cy+Math.round(r*Math.sin(Math.radians(startAngle)),0);

		x2=cx+Math.round(r*Math.cos(Math.radians(midAngle)),0);
		y2=cy+Math.round(r*Math.sin(Math.radians(midAngle)),0);
		
		x3=cx+Math.round(r*Math.cos(Math.radians(endAngle)),0);
		y3=cy+Math.round(r*Math.sin(Math.radians(endAngle)),0);

        dataString = "M " + x2 + " " + y2 + " m 0 -8 l 6 12 l -12 0 l 6 -12 ";
        cursor2 = paper1.path(dataString);
        cursor2.transform("R" + gHeading);
        cursor2.attr({"fill":"dodgerblue", "stroke-width": 2, "stroke": "white"}); 

        if (gEditable == 1) {

			cursor1 = paper1.circle(x1, y1, 6).attr({"fill":"dodgerblue", "stroke-width": 2, "stroke": "white"});

			cursor3 = paper1.circle(x3, y3, 6).attr({"fill":"dodgerblue", "stroke-width": 2, "stroke": "white"});

			cursor1.attr({"cursor": "pointer"}).drag(resizeFovEvent, clickEvent, dropEvent);
			cursor2.attr({"cursor": "pointer"}).drag(changeHeadingEvent, clickEvent, dropEvent);
			cursor3.attr({"cursor": "pointer"}).drag(resizeFovEvent, clickEvent, dropEvent);

			document.getElementById("heading").value = gHeading;
			document.getElementById("fov").value = gFov;
		}

};

function drawNeedle(heading)
{
		var 	ra, rb, rc, rd, x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, x7, y7,
			midAngle, startAngle, endAngle, dataString, tmpObj;
				
		gNeedle.remove();
		gNeedle.clear();

        rb = 8;
        ra = 12;
        rc = r0-(2*rb);
        rd = r0-rb;

		midAngle = heading-90;
        startAngle = -30 + midAngle;
        endAngle = 30 + midAngle;
	
		x0=cx+Math.round(ra*Math.cos(Math.radians(startAngle)),0);
		y0=cy+Math.round(ra*Math.sin(Math.radians(startAngle)),0);
        
		x1=cx+Math.round(rc*Math.cos(Math.radians(midAngle)),0);
		y1=cy+Math.round(rc*Math.sin(Math.radians(midAngle)),0);

		x2=cx+Math.round(rd*Math.cos(Math.radians(midAngle)),0);
		y2=cy+Math.round(rd*Math.sin(Math.radians(midAngle)),0);

		x3=cx+Math.round(ra*Math.cos(Math.radians(endAngle)),0);
		y3=cy+Math.round(ra*Math.sin(Math.radians(endAngle)),0);

		x4=cx+Math.round(ra*Math.cos(Math.radians(endAngle+180)),0);
		y4=cy+Math.round(ra*Math.sin(Math.radians(endAngle+180)),0);

		x5=cx+Math.round(ra*Math.cos(Math.radians(startAngle+180)),0);
		y5=cy+Math.round(ra*Math.sin(Math.radians(startAngle+180)),0);

		x6=cx+Math.round(rc*Math.cos(Math.radians(endAngle+180)),0);
		y6=cy+Math.round(rc*Math.sin(Math.radians(endAngle+180)),0);

		x7=cx+Math.round(rd*Math.cos(Math.radians(midAngle+180)),0);
		y7=cy+Math.round(rd*Math.sin(Math.radians(midAngle+180)),0);
        
        var tmpObj, dataString;

/*
  		dataString  = "M" + (cx-ra) + "," + cy + " A" + ra + ","+ ra + " 0 0,1 " + x0 + " "+ y0 + " L" + x0 + " " + y1 + " L" + x2 + " " + y2 + " L" + x3 + " " + y1 + " L" + x3 + " " + y3 + " A" + ra + ","+ ra + " 0 0,1 " + (cx+ra) + " " + cy +  " L" + (cx+rb) + " " + cy + " A" + rb + ","+ rb + " 0 0,0 " + (cx-rb) + " " + cy + " L" + (cx-ra) + " " + cy + " z" ;  
		tmpObj = paper1.path(dataString);

		tmpObj.attr({
			fill: "red",
			stroke: "red",
            "stroke-width": 1, 
			opacity: .33
		});

		gNeedle.push(tmpObj);

 		dataString = "M" + (cx-ra) + "," + cy + " A" + ra + ","+ ra + " 0 0,0 " + x4 + " "+ y4 + " L" + x4 + " " + y7 + " L" + x7 + " " + (y7-8) + " L" + x5 + " " + y7 + " L" + x5 + " " + y5 + " A" + ra + ","+ ra + " 0 0,0 " + (cx+ra) + " " + cy +  " L" + (cx+rb) + " " + cy + " A" + rb + ","+ rb + " 0 0,1 " + (cx-rb) + " " + cy + " L" + (cx-ra) + " " + cy + " z" ;  
		tmpObj = paper1.path(dataString);

		tmpObj.attr({
			fill: "black",
			stroke: "black",
            "stroke-width": 1,
            opacity: .1
		});

		gNeedle.push(tmpObj);
 */
 		dataString = "M" + x0 + "," + y0 + " A" + ra + ","+ ra + " 0 0,0 " + x4 + " "+ y4 + " L" + x4 + " " + y7 + " L" + x7 + " " + (y7-8) + " L" + x5 + " " + y7 + " L" + x5 + " " + y5 + " A" + ra + ","+ ra + " 0 0,0 " + x3 + " " + y3 + " L" + x3 + " " + y1 + " L" + x2 + " " + y2 + " L" + x0 + " " + y1 + " z" ;  

		tmpObj = paper1.path(dataString);

		tmpObj.attr({
			fill: "dodgerblue",
			stroke: "dodgerblue",
            "stroke-width": 2,
            opacity: .33
		});

		gNeedle.push(tmpObj);

		tmpObj = paper1.circle(cx,cy,6).attr({"fill":"dodgerblue", "stroke-width": 2, "stroke": "white"}).toFront();
		gNeedle.push(tmpObj);

		if (typeof sun !== "undefined") {
			sun.toFront();
		};
		if (typeof moon !== "undefined") {
			moon.toFront();
		};


        // dataString = "M " + x2 + " " + y2 + " m 0 -8 l 6 12 l -12 0 l 6 -12 ";
        // cursor2 = paper1.path(dataString);
        // cursor2.transform("R" + gHeading);
        // cursor2.attr({"fill":"dodgerblue", "stroke-width": 2, "stroke": "white"}); 

};

function rotateFov(angle) {
		var dataString = "...R"+Math.round(angle)+","+cx+","+cy;
		gField.transform(dataString);			
		
		cursor1.transform(dataString);
		cursor3.transform(dataString);
		cursor2.transform(dataString);
};

function rotateNeedle(angle) {
		var dataString = "...R"+Math.round(-1*angle)+","+cx+","+cy;
		gNeedle.transform(dataString);			
};

function rotateCompass(angle) {
		var dataString = "...R"+Math.round(-1*angle)+","+cx+","+cy;
		gCompass.transform(dataString);			
};

function drawSun(direction) {
		var dataString = "M15.502,7.504c-4.35,0-7.873,3.523-7.873,7.873c0,4.347,3.523,7.872,7.873,7.872c4.346,0,7.871-3.525,7.871-7.872C23.374,11.027,19.85,7.504,15.502,7.504zM15.502,21.25c-3.244-0.008-5.866-2.63-5.874-5.872c0.007-3.243,2.63-5.866,5.874-5.874c3.242,0.008,5.864,2.631,5.871,5.874C21.366,18.62,18.744,21.242,15.502,21.25zM15.502,6.977c0.553,0,1-0.448,1-1.001V1.125c-0.002-0.553-0.448-1-1-1c-0.553,0-1.001,0.449-1,1.002v4.85C14.502,6.528,14.949,6.977,15.502,6.977zM18.715,7.615c0.125,0.053,0.255,0.076,0.382,0.077c0.394,0,0.765-0.233,0.925-0.618l1.856-4.483c0.21-0.511-0.031-1.095-0.541-1.306c-0.511-0.211-1.096,0.031-1.308,0.541L18.174,6.31C17.963,6.82,18.205,7.405,18.715,7.615zM21.44,9.436c0.195,0.194,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l3.43-3.433c0.391-0.39,0.39-1.023,0-1.415c-0.392-0.39-1.025-0.39-1.415,0.002L21.44,8.021C21.049,8.412,21.049,9.045,21.44,9.436zM23.263,12.16c0.158,0.385,0.531,0.617,0.923,0.617c0.127,0,0.257-0.025,0.383-0.078l4.48-1.857c0.511-0.211,0.753-0.797,0.541-1.307s-0.796-0.752-1.307-0.54l-4.481,1.857C23.292,11.064,23.051,11.65,23.263,12.16zM29.752,14.371l-4.851,0.001c-0.552,0-1,0.448-0.998,1.001c0,0.553,0.447,0.999,0.998,0.999l4.852-0.002c0.553,0,0.999-0.449,0.999-1C30.752,14.817,30.304,14.369,29.752,14.371zM29.054,19.899l-4.482-1.854c-0.512-0.212-1.097,0.03-1.307,0.541c-0.211,0.511,0.031,1.096,0.541,1.308l4.482,1.854c0.126,0.051,0.256,0.075,0.383,0.075c0.393,0,0.765-0.232,0.925-0.617C29.806,20.695,29.563,20.109,29.054,19.899zM22.86,21.312c-0.391-0.391-1.023-0.391-1.414,0.001c-0.391,0.39-0.39,1.022,0,1.gHeightl3.434,3.429c0.195,0.195,0.45,0.293,0.706,0.293s0.513-0.098,0.708-0.293c0.391-0.392,0.389-1.025,0-1.415L22.86,21.312zM20.029,23.675c-0.211-0.511-0.796-0.752-1.307-0.541c-0.51,0.212-0.752,0.797-0.54,1.308l1.86,4.48c0.159,0.385,0.531,0.617,0.925,0.617c0.128,0,0.258-0.024,0.383-0.076c0.511-0.211,0.752-0.797,0.54-1.309L20.029,23.675zM15.512,23.778c-0.553,0-1,0.448-1,1l0.004,4.851c0,0.553,0.449,0.999,1,0.999c0.553,0,1-0.448,0.998-1l-0.003-4.852C16.511,24.226,16.062,23.777,15.512,23.778zM12.296,23.142c-0.51-0.21-1.094,0.031-1.306,0.543l-1.852,4.483c-0.21,0.511,0.033,1.096,0.543,1.307c0.125,0.052,0.254,0.076,0.382,0.076c0.392,0,0.765-0.234,0.924-0.619l1.853-4.485C13.051,23.937,12.807,23.353,12.296,23.142zM9.57,21.325c-0.392-0.391-1.025-0.389-1.415,0.002L4.729,24.76c-0.391,0.392-0.389,1.023,0.002,1.415c0.195,0.194,0.45,0.292,0.706,0.292c0.257,0,0.513-0.098,0.708-0.293l3.427-3.434C9.961,22.349,9.961,21.716,9.57,21.325zM7.746,18.604c-0.213-0.509-0.797-0.751-1.307-0.54L1.96,19.925c-0.511,0.212-0.752,0.798-0.54,1.308c0.16,0.385,0.531,0.616,0.924,0.616c0.127,0,0.258-0.024,0.383-0.076l4.479-1.861C7.715,19.698,7.957,19.113,7.746,18.604zM7.1,15.392c0-0.553-0.447-0.999-1-0.999l-4.851,0.006c-0.553,0-1.001,0.448-0.999,1.001c0.001,0.551,0.449,1,1,0.998l4.852-0.006C6.654,16.392,7.102,15.942,7.1,15.392zM1.944,10.869l4.485,1.85c0.125,0.053,0.254,0.076,0.381,0.076c0.393,0,0.766-0.232,0.925-0.618c0.212-0.511-0.032-1.097-0.544-1.306L2.708,9.021c-0.511-0.21-1.095,0.032-1.306,0.542C1.19,10.074,1.435,10.657,1.944,10.869zM8.137,9.451c0.195,0.193,0.449,0.291,0.705,0.291s0.513-0.098,0.709-0.295c0.391-0.389,0.389-1.023-0.004-1.414L6.113,4.609C5.723,4.219,5.088,4.221,4.699,4.612c-0.391,0.39-0.389,1.024,0.002,1.414L8.137,9.451zM10.964,7.084c0.16,0.384,0.532,0.615,0.923,0.615c0.128,0,0.258-0.025,0.384-0.077c0.51-0.212,0.753-0.798,0.54-1.307l-1.864-4.479c-0.212-0.51-0.798-0.751-1.308-0.539C9.129,1.51,8.888,2.096,9.1,2.605L10.964,7.084z",
		x2=cx+Math.round(r3*Math.cos(Math.radians(direction-90)),0),
		y2=cy+Math.round(r3*Math.sin(Math.radians(direction-90)),0);

		if (typeof sun === "undefined") {
			sun=paper1.set();
			var tmpObj = paper1.circle(x2,y2,6).attr({"fill":"gold", "stroke": "none"});
			sun.push(tmpObj);
			tmpObj = paper1.path(dataString).transform("...T"+(x2-16)+","+ (y2-16)+"s0.8").attr({"fill":"none", "stroke": "goldenrod"});
			sun.push(tmpObj);
			sun.direction=direction;
		}
}

function drawMoon(direction) {
		var x2=cx+Math.round(r3*Math.cos(Math.radians(direction-90)),0),
		y2=cy+Math.round(r3*Math.sin(Math.radians(direction-90)),0),
		dataString = "M" + x2 + "," + (y2-8) + " A1,8 0 0,0 " + x2 + "," + (y2+8) + " A9,8 0 1,1 " + x2 + "," + (y2-8) +  " z";

		if (typeof moon === "undefined") {
			moon=paper1.path(dataString).transform("r-12t2,2").attr({"fill":"lemonchiffon ", "stroke-width": 2, "stroke": "#CCC8A4"});
			moon.direction=direction;
		}
}

function drawLines() {
		
		var width=gWidth, height=gHeight,
		x0, x1, x2, x3, xmax;

		if (typeof line1 !== "undefined") {
			line1.remove();
		}
		if (typeof line2 !== "undefined") {
			line2.remove();
		}
		if (typeof lineSun !== "undefined") {
			lineSun.remove();
		}
		if (typeof lineMoon !== "undefined") {
			lineMoon.remove();
		}
		x0 = Math.round(gHeading) - Math.round(gFov/2);
		x3 = Math.round(gHeading) + Math.round(gFov/2);
		xmax = x3-x0;
		if (typeof marker1 !== "undefined") {
			x0 = (x0 < 0 ? x0+360 : x0);
			x0 = (marker1.direction<x0 ? x0-360 : x0);
			x1 = Math.round(width * (marker1.direction-x0)/ xmax);
			line1 = paper2.path("M"+x1+",0 L"+x1+", "+height).attr({"stroke-width": 2, "stroke": "hotpink"});
		} 
		if (typeof marker2 !== "undefined") {
			x0 = (x0 < 0 ? x0+360 : x0);
			x0 = (marker2.direction<x0 ? x0-360 : x0);
			x2 = Math.round(width * (marker2.direction-x0)/ xmax);
			line2 = paper2.path("M"+x2+",0 L"+x2+", "+height).attr({"stroke-width": 2,  "stroke": "yellowgreen"});
		}
		if (typeof sun !== "undefined") {
			x0 = (x0 < 0 ? x0+360 : x0);
			x0 = (sun.direction<x0 ? x0-360 : x0);
			x2 = Math.round(width * (sun.direction-x0)/ xmax);
			lineSun = paper2.path("M"+x2+",0 L"+x2+", "+height).attr({"stroke-width": 2,  "stroke": "gold"});
		}
		if (typeof moon !== "undefined") {
			x0 = (x0 < 0 ? x0+360 : x0);
			x0 = (moon.direction<x0 ? x0-360 : x0);
			x2 = Math.round(width * (moon.direction-x0)/ xmax);
			lineMoon = paper2.path("M"+x2+",0 L"+x2+", "+height).attr({"stroke-width": 2,  "stroke": "lemonchiffon"});
		}
}

function drawPhoto(idCanvas, idImage) {
		var width = document.getElementById(idCanvas).offsetWidth,
		height = document.getElementById(idCanvas).offsetHeight,
		img = document.getElementById(idImage),
		origin;		

		if (typeof paper2 == "undefined") {
			paper2 = Raphael(idCanvas,width,height);
			origin=findOrigin(document.getElementById(idCanvas))
			O2x=origin[0];
			O2y=origin[1];
			
			console.log("origine photo (x,y) : " + O2x + ', ' + O2y);
		}

		gWidth = document.getElementById(idImage).clientWidth;
		gHeight = document.getElementById(idImage).clientHeight;
		
		img.style.display = "none";

		paper2.rect(0,0,width,height).attr({fill:"none", stroke: "none"});
		paper2.image(img.src,0,0,gWidth,gHeight);
		paper2.setViewBox(0,0,gWidth, gHeight, true);

		drawLines();
}

function resetInfoBulle() {
		if (typeof infoBulle !== "undefined") {
			infoBulle.remove();
		}	
}

function  addInfoBulle(azim, dist, legende, dist_min, dist_max) {
		var width=gWidth, height=gHeight,
		x0, x1, x2, xmax, y, tmpText, tmpBbox;

		x0 = Math.round(gHeading) - Math.round(gFov/2);
		x2 = Math.round(gHeading) + Math.round(gFov/2);

		xmax = gFov;

		if (typeof infoBulle === "undefined") {
			infoBulle = paper2.set();
		}
		
		x0 = (x0 < 0 ? x0+360 : x0);
		x0 = (azim<x0 ? x0-360 : x0);
		
		x1 = Math.round(width * stdBearing(azim-x0)/ xmax);
		if ((x1 > 0) & (x1 < width)) {
			infoBulle.push(paper2.path("M"+x1+",0 L"+x1+", "+height).attr({"stroke-width": 3, "opacity": 0.25, "stroke": "white"}));
			infoBulle.hover(hoverInEvent, hoverOutEvent);
			y = Math.round(height * (dist_max-dist) / (dist_max-dist_min));
			if (x1>(2*width/3)) {
				tmpText = paper2.text(x1-5, y, legende+ ' ►').attr({'fill' : 'white', 'stroke': 'none', 'text-anchor': 'end', "font": '100 14px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
			} else {
				tmpText = paper2.text(x1+5, y, '◄ ' + legende).attr({'fill' : 'white', 'stroke': 'none', 'text-anchor': 'start', "font": '100 14px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
			}

			tmpBbox = tmpText.getBBox();
			infoBulle.push(paper2.rect(tmpBbox.x,tmpBbox.y,tmpBbox.width,tmpBbox.height).attr({ 'stroke': 'none', 'fill' : 'dodgerblue', 'opacity': 0.66 }));
			infoBulle.push(tmpText.toFront());
			
			return(true);
		} else {
			return(false);
		}
}

function drawCompass(idCanvas) {

		var 
		width = document.getElementById(idCanvas).clientWidth,
		height = document.getElementById(idCanvas).clientHeight,
        size = Math.min(width,height),
		ratio = size/600,
		origin;
		r = Math.round(size*2/6,0);
		cx = Math.round(width/2,0);
		cy = Math.round(height/2,0);
		r0 = Math.round(r-(10*ratio),0);
		r1 = Math.round(r+(6*ratio),0);
		r2 = Math.round(r1+(36*ratio),0);
		r3 = Math.round(r1+(r2-r1)/2,0);		
		
        gWidth = document.getElementById(idCanvas).clientWidth;
        gHeight = document.getElementById(idCanvas).clientHeight;
		 
         // console.log("idCanvas : " + idCanvas);
         // console.log("width : " + width);
		 // console.log("gWidth : " + gWidth);
		 // console.log("gHeight : " + gHeight);
		 // console.log("r : " + r);
		 // console.log("ratio : " + ratio);
		 // console.log("cx : " + cx);
		 // console.log("cy : " + cy);
		 // console.log("r0: " + r0);
		 // console.log("r1 : " + r1);
		 // console.log("r2 : " + r2);
		 // console.log("r3 : " + r3);

        var r4 = r2 + 10;
		
		// retrouve les coordonnées de l'origine du canvas
		origin=findOrigin(document.getElementById(idCanvas))
		O1x=origin[0];
		O1y=origin[1];

		console.log("origine boussole (x,y) : " + O1x + ', ' + O1y);
		console.log("centre boussole (x,y) : " + cx + ', ' + cy);

		r2 = r2+3;
        var tmpObj;
 		var dataString = "M" + cx + "," + (cy-r1) + " A" + r1 + ","+ r1 + " 0 0,1 " + cx + " "+ (cy+r1) + " A" + r1 + ","+ r1 + " 0 0,1 " + cx + " "+ (cy-r1) + " L" + cx + "," + (cy-r) + " A" + r + "," + r +" 0 0,0 " + cx + " "+ (cy+r) + " A" + r + "," + r +" 0 0,0 " + cx + " "+ (cy-r) + " z";

		paper1 = Raphael(idCanvas, gWidth, gHeight);
		gField = paper1.set();
        gNeedle = paper1.set();
		gCompass = paper1.set();
		
        tmpObj = paper1.path(dataString).attr({fill:"white", opacity: .85, stroke: "none", "cursor": "crosshair"}).dblclick(dblClickEvent);
		gCompass.push(tmpObj);

		r1 = r1-3;
 		dataString = "M" + cx + "," + (cy-r1) + " A" + r1 + ","+ r1 + " 0 0,1 " + cx + " "+ (cy+r1) + " A" + r1 + ","+ r1 + " 0 0,1 " + cx + " "+ (cy-r1) + " L" + cx + "," + (cy-r2) + " A" + r2 + "," + r2 +" 0 0,0 " + cx + " "+ (cy+r2) + " A" + r2 + "," + r2 +" 0 0,0 " + cx + " "+ (cy-r2) + " z";

        tmpObj = paper1.path(dataString).attr({fill:"#eee", opacity: .66, stroke: "none"});
		gCompass.push(tmpObj);
				
		var x=cx+Math.round(r3*Math.cos(Math.radians(270)),0);
		var y=cy+Math.round(r3*Math.sin(Math.radians(270)),0);
		tmpObj = paper1.text(x,y,"N").attr({fill: "red", opacity: .85, stroke: "black", "font": '400 '+32*ratio+'px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(0)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(0)),0);
		tmpObj = paper1.text(x,y,"E").attr({fill: "white", opacity: .85, stroke: "black", "font": '200 '+32*ratio+'px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(180)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(180)),0);
		tmpObj = paper1.text(x,y,"O").attr({fill: "white", opacity: .85, stroke: "black", "font": '200 '+32*ratio+'px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(90)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(90)),0);
		tmpObj = paper1.text(x,y,"S").attr({fill: "white", opacity: .85, stroke: "black", "font": '200 '+32*ratio+'px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(22.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(22.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(45)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(45)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(67.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(67.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(112.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(112.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(135)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(135)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(157.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(157.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(202.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(202.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(225)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(225)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(247.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(247.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(292.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(292.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(315)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(315)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);

		x=cx+Math.round(r3*Math.cos(Math.radians(337.5)),0);
		y=cy+Math.round(r3*Math.sin(Math.radians(337.5)),0);
		tmpObj = paper1.circle(x,y,Math.round(5*ratio)).attr({fill:"lightgrey", opacity: .85, stroke: "none"});
		gCompass.push(tmpObj);
		
};

function refreshMap() {
		var srce = "http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyBs45OqQDYI3QSgLHf9Ttp5oCXwQYOYxNY&center="+gLat+","+gLon+"&zoom="+gZoom+"&size="+(2*r2)+"x"+(2*r2)+"&scale=1&maptype=hybrid";
		gMap.attr({fill:"url("+srce+")", stroke: "none"});	
		
		console.log(srce);
}