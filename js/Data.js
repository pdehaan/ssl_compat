/*
This class takes raw data and formats it into various things:
- Array of URI list items
- An object containing metadata
- An array of objects that can be fed into a chart component

*/



function Data ()
{
	this.name = "Data";
}

Data.parseDocument = function(arg)
{
	var temp1 = arg.toString().split("++++++++++");
	var temp2 = temp1[1].split("\n");
	var uriObjectArray = [];
	for (var i=0;i<temp2.length;i++)
	{
		try
		{
			uriObjectArray.push (Data.makeURIObject(temp2[i]));
		} catch (e)
		{
			//alert("Bad JSON detected");
		}
	}
	var o = {};
	o.metadata = temp1[0].split("\n");
	o.uriList = uriObjectArray;
	return o;
}
Data.parseDocument2 = function(arg)
{
	var temp = arg.toString().split("\n");
	var uriObjectArray = [];

	for (var i=0;i<temp.length;i++)
	{
		try
		{
			uriObjectArray.push (Data.makeURIObject(temp[i]));
		} catch (e)
		{
			//alert("Bad JSON detected");
		}
	}
	var o = {};
	o.uriList = uriObjectArray;
	return o;
}

Data.makeURIObject = function (str)
{
	var p = str.indexOf("{");
	if (p == -1)
	{
		throw new Error();
	}
	var temp1 = str.substring(p);
	var o = {};
	var temp2 = JSON.parse(temp1)
	for (var i in temp2)
	{
		o[i] = temp2[i];
	}
	return o;
}

Data.getPieGraphData = function(uriList, fieldName)
{
	var obj = [];
	for (var i=0;i<uriList.length;i++)
	{
		var str = eval ("uriList[" + i + "]." + fieldName);
		var temp = eval ("obj['" + str +"']");
		if (temp == null)
		{
			eval ("obj['" + str + "']=1;")
		} else {
			temp++;
			eval ("obj['" + str + "']= " + temp + ";")
		}
	}
	var fields = [];
	for (var field in obj)
	{
		var temp = {};
		temp.label = field;
		temp.value = obj[field];
		fields.push(temp);
	}

	var colorArray = returnColorArray(fields.length);
	for (var i=0;i<fields.length;i++)
	{
		fields[i].color = colorArray[i];
	}
    return fields;  
}

Data.sortByField = function (uriList, fieldName)
{
	uriList.sort(function(arg1,arg2)
		{
			var a = eval ("arg1." + fieldName);
			var b = eval ("arg2." + fieldName);
			return a == b ? 0 : (a < b ? -1 : 1);
		});
	return uriList;
}
Data.numericSortByField = function (uriList, fieldName)
{
	uriList.sort(function(arg1,arg2)
		{
			var a = Number (eval ("arg1." + fieldName));
			var b = Number (eval ("arg2." + fieldName));
			return a == b ? 0 : (a < b ? -1 : 1);
		});
	return uriList;
}
Data.dateSortByField = function (uriList, fieldName)
{
	uriList.sort(function(arg1,arg2)
		{
			var a = Number (new Date (eval ("arg1." + fieldName)));
			var b = Number (new Date (eval ("arg2." + fieldName)));
			if (Number.isNaN(a))
			{
				a = 0;
			} else {
				a += 3155760000000;
			}
			if (Number.isNaN(b))
			{
				b = 0;
			} else 
			{
				b += 3155760000000;
			}

			return a == b ? 0 : (a < b ? -1 : 1);
		});
	return uriList;
}
Data.filterBy = function (uriList, fieldName, value, remove)
{
	var temp = [];
	for ( var i=0;i<uriList.length;i++ )
	{
		var found = eval ("uriList[" + i + "]." + fieldName + "=='" + value + "'");
		if ( ( !found && remove ) || ( found && !remove ) )
		{
			temp.push (uriList[i]);
		} 
	}
	return temp;
}


Data.getBarGraphData = function(uriList, fieldName)
{
	
	var labels = [];
	var data = [];
	for (var i=0;i<uriList.length;i++)
	{
		labels.push(uriList[i].run);
		data.push(Number(uriList[i].errors));
	}
	
	var dataset = {};
	
	dataset.label = "Number of errors";
	dataset.fillColor = "rgba(151,187,205,0.2)";
    dataset.strokeColor = "rgba(151,187,205,1)";
    dataset.pointColor = "rgba(151,187,205,1)";
    dataset.pointStrokeColor = "#fff";
    dataset.pointHighlightFill = "#fff";
    dataset.pointHighlightStroke = "rgba(151,187,205,1)";
    dataset.data = data;

	var o = {};
	o.labels = labels;
	o.datasets = [dataset];
	return o;  

	/*
    var data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]};
    return data;
   */
}

