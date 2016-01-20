var colors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#FF5A5E","#5AD3D1","#FFC870","#A8B3C5","#616774"],
colorsDark  = ["#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f39c12","#d35400","#c0392b","#bdc3c7","#F7464A","#46BFBD","#FDB45C","#949FB1","#4D5360"];
var legendPIETemp = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><a href=\"<%=segments[i].link%>\"><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%> - <%=segments[i].value%><%}%></a></li><%}%></ul>";
var legendBARTemplate = "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>";

function compare(a,b) {
  if (a.value > b.value)
	return -1;
if (a.value < b.value)
	return 1;
	return 0;
}


function createChart(dataStr,path,chartType,catName,chartElementID,legendElementID){
	var fillColors = [];
	var labels = [];
	var chData = [];
	var data = [];
	var groupChart = (typeof dataStr['datasets'] != "undefined")?true:false;
	var labelLinkable = (dataStr['labelLinkable'])?true:false;
	if(dataStr && !groupChart){
		var i =0;
		var dataArray = [];;
		for(var prop in dataStr){
			dataArray.push({name:dataStr[prop].name,value:dataStr[prop].value,label:dataStr[prop].label});
		}
		dataArray = dataArray.sort(compare);
		for(var i=0;i<dataArray.length;i++){
			var en = dataArray[i];
			if(chartType=="pie"){

				if(/restrict/.test(en.label)){

					chData.push({
				        value: en.value,
				        color: "#CC0000" ,
				        highlight: "#CC0000",
				        label: en.label,
				        link: path+en.name
			    	});

				}else{
					chData.push({
				        value: en.value,
				        color: colorsDark[i] || '#bdc3c7',
				        highlight: colors[i] || '#bdc3c7',
				        label: en.label,
				        link: path+en.name
			    	});

				}
				
			}else if(chartType=="bar"){
				labels.push(en.label);
				data.push(en.value);
				fillColors.push(colorsDark[i]);
			}
		}
	};

	if(chartType=="bar"){
		if(!groupChart){
			var random = Math.floor((Math.random() * colors.length)),
				color = colors[random],
				colorDark = colorsDark[random];
				//only show top 10 bars
				labels = labels.slice(0, 10);
				data = data.slice(0,10);
			chData = {
				labels: labels,
				datasets : [{
					label : catName,
					fillColor : color,
					highlightFill: color,
					data: data
				}]
			};

		}else{
			chData = dataStr;
		}
		
	}

	var ctx = document.getElementById(chartElementID).getContext("2d");
	if(chartType=="pie" && !groupChart){
		//ctx.canvas.height = 250;
		var myChart = new Chart(ctx).Pie(chData,{
			legendTemplate : legendPIETemp,
			responsive : true,
			animation: false,
		    animateRotate : false,
		    animateScale : false
		});

		var legendHTML = myChart.generateLegend();

		$(legendElementID).html(legendHTML);

	}else if(chartType=="bar"){
		//ctx.canvas.height = 400;
		var myChart = new Chart(ctx).Bar(chData,{
			legendTemplate : legendBARTemplate,
			responsive : true,
			animation: false,
		    animateRotate : false,
		    animateScale : false,
		    makeLabelLinkable : labelLinkable
		});
		var z =0;
		if(!groupChart)
		{
			var barLegend = '<ul class="pie-legend">';
			for(var z=0;z<dataArray.length;z++){
				var legendObj = dataArray[z];
				var link = path+legendObj.name;
				
				if(myChart.datasets[0].bars[z]){
					barLegend+='<li><a href="'+link+'"><span style="background-color:'+fillColors[z]+'"></span>'+legendObj.label+' - '+legendObj.value+'</a></li>';
					myChart.datasets[0].bars[z].fillColor = fillColors[z];
				}else{
					barLegend+='<li><a href="'+link+'"><span style="background-color:#FFFFFF"></span>'+legendObj.label+' - '+legendObj.value+'</a></li>';
				}
					
			}
			barLegend += "</ul>";
			
		}else{
			var barLegend = '<ul class="pie-legend">';
			for(var z=0;z<chData['datasets'].length;z++){

				var dataSet = chData['datasets'][z];
				var values = chData['datasets'][z]['data'];
				var value =0;
				for(var i=0;i<values.length;i++){
					value +=values[i];
				}
				var link = path|| '';
				var fillColor = dataSet['fillColor'] || '';
				var label =  dataSet['label'] || '';
				var opname = dataSet['opname'] || '';
				barLegend+='<li><a href="'+link+opname+'"><span style="background-color:'+fillColor+'"></span>'+label+' - '+value+'</a></li>';
			}

			barLegend += "</ul>";
			//console.log("chData['datasets']", chData['datasets']);
			
			if(chData['datasets'] && chData['datasets'].length > 0 && labelLinkable)
			{	
				var opName = chData['datasets'][0]['opname'];
				opName = opName.split('_');
				opName = opName[0];
				$("#"+chartElementID).on('clicked.label',function(eventN,data){
					var lbLink = data.link || '' ;
					lbLink = lbLink.replace("/","__");
					var link = path|| '';
					window.location = path+opName+'_label/'+lbLink;
				});
			}
			
		}
		
		myChart.update();
		$(legendElementID).html(barLegend);
	}else if(chartType == "doughnut" || chartType == "pie"){
		if(groupChart){
			//ctx.canvas.height = 300;

			var configChart = {
				percentageInnerCutout : 75,
				responsive : true,
				animation: false,
			    animateRotate : false,
			    animateScale : false
			};
			if(chartType == "pie"){
				ctx.canvas.height = 250;
				configChart.percentageInnerCutout = 0;
			}
				

			var myChart = new Chart(ctx).Doughnut(dataStr['datasets'], configChart);
			myChart.update();

			var barLegend = '<ul class="pie-legend">';

			for(var z=0;z<dataStr['datasets'].length;z++){
				var dataSet = dataStr['datasets'][z];
				var link = path|| '';
				var fillColor = dataSet['color'] || '';
				var label =  dataSet['label'] || '';
				var opname = dataSet['opname'] || '';
				var value = dataSet['value'] || 0;
				barLegend+='<li><a href="'+link+opname+'"><span style="background-color:'+fillColor+'"></span>'+label+' - '+value+'</a></li>';
			}

			barLegend += "</ul>";
			$(legendElementID).html(barLegend);
		}
	}
}