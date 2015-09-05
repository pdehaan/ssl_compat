var metadata="METADATA";
var ASCENDING_GLYPH = String.fromCharCode(9650);
var DESCENDING_GLYPH = String.fromCharCode(9660);
var currentGlyph = ASCENDING_GLYPH;
var header = ["URI", "&nbsp;error&nbsp;code&nbsp;", "&nbsp;type", "&nbsp;error&nbsp;string&nbsp;"];
var optionsMarkup = "<div id=\'controls\'><p><a id=\'show_regressions\' href=\'#\' onclick=showRegressionsOnly() >Show new breakage only</a><p><a id=\'restore_button\' href=\'#\' onclick=reset()>Restore original</a></div>";
var originalData;
var currentTargetData;
var currentControlData;
var currentColumnSort = 0;
var sortAscending = true;
var stringTable;
var currentTab = 1;
var filterType = 1;
var regressions = false;
var masterTab1, masterTab2;
var masterTabHTML1, masterTabHTML2;
var tabStr1, tabStr2;
var runDate = metadata.split(" : ")[1];
var mouseX, mouseY;

function getMouse(e)
{
	mouseX = e.pageX;
	mouseY = e.pageY;
}

function init()
{
	floater = document.getElementById("floater");
	masterTab1 = document.getElementById("tab_1");
	masterTab2 = document.getElementById("tab_2");
	masterTab3 = document.getElementById("tab_3");
	masterTabHTML1 = masterTab1.innerHTML;
	masterTabHTML2 = masterTab2.innerHTML;
	document.captureEvents(Event.MOUSEMOVE)
	document.onmousemove = getMouse;
}
function setUI()
{
	document.title = "SSL Compatibility Test : " + metadata;
	document.getElementById("header_text").innerHTML = metadata;
	updateTabTitles();
	changeTab(1);
	changeFilter(1);
}
function updateTabTitles()
{
	var numTargetSites = currentTargetData.length;
	var numControlSites = currentControlData.length;
	masterTab1.innerHTML = masterTabHTML1.replace("TAB_HEADER_1",tabStr1 + " : " + numTargetSites);;
	masterTab2.innerHTML = masterTabHTML2.replace("TAB_HEADER_2",tabStr2 + " : " + numControlSites);;
}
function changeFilter(arg)
{
	if (arg == 1)
	{
		filterTab1.id = "selected_filter";
		filterTab2.id = "not_selected_filter";	
	} else {
		filterTab1.id = "not_selected_filter";
		filterTab2.id = "selected_filter";
	}
	filterType = arg;
}
function changeTab(arg)
{
	if ( arg == 1 )
	{
		masterTab1.id = "selected";
		masterTab2.id = "not_selected";	
		masterTab3.id = "not_selected";	
	} else if ( arg == 2 )
	{
		masterTab1.id = "not_selected";
		masterTab2.id = "selected";	
		masterTab3.id = "not_selected";	
	} else if ( arg == 3 )
	{
		masterTab1.id = "not_selected";
		masterTab2.id = "not_selected";	
		masterTab3.id = "selected";	
	}
	currentTab = arg;
}
function onTabSelect(arg)
{
	changeTab(arg);
	currentColumnSort = 5; // hack: always force re-sort
	sortColumn(0);
}
function showOptions()
{
	changeTab(3);
	setHTML ("content", optionsMarkup);
}
function mySort(a,b) {
	a = a[currentColumnSort];
	b = b[currentColumnSort];
	if (sortAscending)
	{
		return a == b ? 0 : (a < b ? -1 : 1);
	} else {
		return a == b ? 0 : (a > b ? -1 : 1);
	}
}
function sortColumn(arg)
{
	if ( arg == currentColumnSort)
	{
		sortAscending = !sortAscending;
	} else {
		sortAscending = true;
	}

	currentGlyph = ASCENDING_GLYPH;
	if ( !sortAscending )
	{
		currentGlyph = DESCENDING_GLYPH;
	} 

	var errorData;
	if ( currentTab == 1 )
	{
		errorData = currentTargetData;
	} else
	{
		errorData = currentControlData;
	}

	var tempSortOrder = sortAscending;

	// temp sort by URI
	sortAscending = true;
	currentColumnSort = 0;
	errorData.sort(mySort);

	// real sort
	sortAscending = tempSortOrder;
	currentColumnSort = arg;
	errorData.sort(mySort);

	setHTML("content", makeTableHTML(errorData));
}

function makeTableHTML ( body )
{
	var tagInfo = "<a href=\'#\' onclick=sortColumn(";
	var tableStr = "<table>";
	tableStr += "<tr id=\'column_header\'>";

	var tempGlyph = "";
	for ( var i=0;i<header.length;i++ )
	{
		if ( i == currentColumnSort )
		{
			tempGlyph = "&nbsp;&nbsp;&nbsp;" + currentGlyph + "&nbsp;";
		} else {
			tempGlyph = "";
		}
		tableStr += "<th>" + tagInfo + i + ")>" + header[i] + tempGlyph + "</a></th>";
	}
	tableStr+= "</tr>";

	for ( var i=0;i<body.length;i++ )
	{
		for ( var j=0;j<body[i].length;j++ )
		{
			var tempStr = body[i][j];
			if ( j != 0 )
			{
				tempStr = "<a onmouseover=hideFloater() onclick=showFloater(\'" + tempStr + "\')>" + tempStr + "</a>";
			} 
			tableStr += "<td>" + tempStr + "</td>";
		}
		tableStr += "</tr>";
	}
	tableStr += "</table>";
	return tableStr;
}
function setHTML (id, html)
{
	document.getElementById(id).innerHTML = html;
}


function loadDiffFile(fileURI)
{
	var req = new XMLHttpRequest();
	req.addEventListener("load", loadSuccess)
	req.addEventListener("error", loadError)
	req.open("GET", fileURI);
	req.send();
}
function loadSuccess(e)
{
	init();
	originalData = e.target.response.toString().split("+++ ")[1];
	createTables(parseDocument(originalData));
	setUI();
}
function loadError(e)
{
	alert ("load error" );
}
function parseDocument(str)
{
	var bothTables = str.split("-- ");
	var targetTable = createTableData (bothTables[1], "-");
	var controlTable = createTableData (bothTables[0], "+");
	tabStr1 = targetTable[0].split(" ")[0].split("	")[0];
	tabStr2 = controlTable[0].split(" ")[0].split("	")[0];
	targetTable.shift();
	controlTable.shift();

	var temp1 = bothTables[0].split("\n+");
	var temp2 = bothTables[1].split("\n-");
	temp1.shift();
	temp2.shift();

	var tempStr = temp1.join("\n") + temp2.join("\n");
	return [targetTable, controlTable];
}

function createTables(dataArray)
{
	currentTargetData = dataArray[0];
	currentControlData = dataArray[1];
	setHTML ("content", makeTableHTML(dataArray[currentTab-1]));
}
function createTableData(str, delineator)
{
	var c = "\n" + delineator
	var temp = str.split(c);
	var title = temp.shift();
	var tableArray = createColumnsFromRows(temp);
	tableArray.unshift(title);
	return tableArray;
}

function createColumnsFromRows ( a )
{
	var tempArray = new Array();
	for ( var i=0;i<a.length;i++ )
	{
		tempArray.push (a[i].split(" "));
		var tempURI = "<a target='blank' href=\'https://" + tempArray[i][0] + "'>" + tempArray[i][0] + "</a>";
		tempArray[i][0] = tempURI;
	}
	return tempArray;
}

function reset()
{
	document.getElementById("show_regressions").style.color="#000000";
	document.getElementById("restore_button").style.color="#a80";
	regressions = false;
	currentColumnSort = 0;
	sortAscending = true;
	currentGlyph = ASCENDING_GLYPH;
	var tables = parseDocument(originalData);
	currentTargetData = tables[0];
	currentControlData = tables[1];
	updateTabTitles();
}

function applyFilterToPage(str)
{
	if ( currentTab == 1 )
	{
		newTargetData = filter(currentTargetData, str);
		setHTML("content", makeTableHTML(newTargetData));
		currentTargetData = newTargetData;
	} else
	{
		newControlData = filter(currentControlData, str);
		setHTML("content", makeTableHTML(newControlData));
		currentControlData = newControlData;
	}
	updateTabTitles();
}
function filter ( tableArray, str )
{
	var tempArray = new Array();
	for ( var i=0;i<tableArray.length;i++ )
	{
		var found = false;
		for ( var j=0;j<tableArray[i].length;j++ )
		{
			if ( tableArray[i][j].indexOf(str) != -1 )
			{
				found = true;
			}
		}
		if ( !found && filterType==1 )
		{
			tempArray.push (tableArray[i]);
		} 
		if ( found && filterType==2 )
		{
			tempArray.push (tableArray[i]);
		}
	}
	return tempArray;
}
function showRegressionsOnly()
{
	document.getElementById("restore_button").style.color="#000000";

	if ( regressions ) return;
	var tempArray = new Array();

	for ( var i=0;i<currentTargetData.length;i++ )
	{
		var found = false;
		var domain = currentTargetData[i][0];
		for ( var j=0;j<currentControlData.length;j++)
		{
			if (domain == currentControlData[j][0])
			{
				found = true;
				break;
			}
		}
		if ( !found )
		{
			tempArray.push (currentTargetData[i]);
		}
	}
	currentTargetData = tempArray;
	updateTabTitles();
	document.getElementById("show_regressions").style.color="#a80";
	//onTabSelect(currentTab);
	regressions = true;
}
function showFloater(str)
{
	var markup = "<ul><li><a href=\'#\' onclick=onFilterSelect(1,\'" + str + "\')>remove all</a><br><li><a href=\'#\' onclick=onFilterSelect(2,\'" + str + "\')>show only</a></ul>";
	floater.innerHTML = markup;
	floater.style.position = "absolute";
	floater.style.left = (mouseX + 30) + "px";
	floater.style.top = (mouseY - 20) + "px";
}
function hideFloater()
{
	floater.innerHTML = "";
}
function onFilterSelect(type, str)
{
	filterType = type;
	applyFilterToPage(str);	
	hideFloater();
}