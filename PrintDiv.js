function PrintDiv(div,options)
{
	var mywindow=open('','PRINT','height=400,width=600');
	let title=document.title;
	if(options&&typeof options.title!=='undefined')title=options.title;
	mywindow.document.write('<html><head><title>'+title+'</title>');
	mywindow.document.write('</head><body >');
	
	mywindow.document.write(div.innerHTML);
	mywindow.document.write('</body></html>');
	
	mywindow.document.close();// necessary for IE >= 10
	mywindow.focus();// necessary for IE >= 10*/
	
	if(options&&typeof options.format!=='undefined'){
		options.format(mywindow.document);
	}
	
	mywindow.print();
	mywindow.close();
	
	return true;
}


var main=function(){exportData({PrintDiv})}