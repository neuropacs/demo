preload(libs['GUI']).before(function(args){
		//this is how you can optionally run scripts before loading your libraries.
		args.app.showLoading();//Here we show the loading animation.
	});

preload("NeuropacsTableEntry.js");
preload("PDMSAPSPrequest.js");
preload('app:96pkeem0ztnrc1ur@research.dwi.ufl.edu/op.n');//InputWindow
preload('app:3i5a2echhwm9urk5@research.dwi.ufl.edu/op.n');//DialogWindow
preload('app:qk2de28zisu3vgdz@research.dwi.ufl.edu/op.n');//BrowserStorage

var initializeLocalStorage=function(){
	let p=new opn.Promise();
	browser_storage=new BrowserStorage();
	if(browser_storage.getCapacity()!=0){
		let o=browser_storage.getObject('neuropacs_demo');
		o.whenReady().then((o)=>{
			console.log(o);
			p.callThen({object:o});
		}).otherwise(()=>{
			browser_storage.newObject({OID:'neuropacs_demo'}).whenReady().then((o)=>{
				console.log(o);
				p.callThen({object:o});
			})
		})
	}
	return p;
}

var neuropacs_storage;
var browser_storage;
var neuropacs_connect;

var askUserKey=function(wind){
	let p=new opn.Promise();
	let ask_user=()=>{
		let w=new  InputWindow({
			title:"API Testing Tool",
			prompt:"Please type your API key:",
			icon:"neuropacs_icon.svg"
		});
		wind.getWindowContainer().append(w);
	
		w.whenSubmitted().then((input)=>{
			if(input.getText().length>0)p.callThen({object:input.getText(),event:true});
			else ask_user();
		})
	}
	ask_user();
	return p;
}

var getAPIKey=function(wind,ask){
	let p=new opn.Promise();
	let ask_user=()=>{
		let w=new  InputWindow({
			title:"API Testing Tool",
			prompt:"Please type your API key:",
			icon:"neuropacs_icon.svg"
		});
		wind.getWindowContainer().append(w);
	
		w.whenSubmitted().then((input)=>{
			if(input.getText().length>0)p.callThen({object:input.getText(),event:true});
			else ask_user();
		})
	}

	initializeLocalStorage().then((o)=>{
		neuropacs_storage=o;

		let API_KEY=neuropacs_storage.getFields()['APIkey'];
		if(typeof API_KEY==='undefined' || API_KEY.length==0){
			if(ask)ask_user();
			else p.callThen({object:null,event:false});
		}
		else p.callThen({object:API_KEY,event:false});

	})

	
	return p;
}

const serverUrl = "https://jdfkdttvlf.execute-api.us-east-1.amazonaws.com/prod";

var askApiKey=function(wind){
	askUserKey(wind).then((apiKey)=>{
		neuropacs_storage.setFields({"APIkey":apiKey});
		location.reload();
	})
}

var main=function(args){
	var wind=args.app.getWindow();
	getAPIKey(wind,false).then((apiKey,USER_TYPED)=>{

		if(apiKey==null){
			main2(args,null);
			return;
		}

		let loading=new  DialogWindow({
			title:"API Testing Tool",
			prompt:"Establishing secure connection...",
			buttons:[],
			icon:"lib/img/logo_animated.svg"
		});

		wind.getWindowContainer().append(loading);

		const npcs = Neuropacs.init({serverUrl, apiKey});
		console.log(npcs);

		//CONNECT TO NEUROPACS
		const conn =  npcs.connect().then((conn)=>{
			neuropacs_storage.setFields({"APIkey":apiKey});
			opn.wait({}).then(()=>{
				loading.close();
				neuropacs_connect=()=>{let p=new opn.Promise();p.callThen({object:npcs});return p;}
				main2(args,npcs);	
			})
		}).catch((error)=>{
			loading.close();
			console.log(error);
			let w=new  DialogWindow({
				title:"API Testing Tool",
				prompt:error,
				buttons:["Retry","Try a different key","Use without key"],
				icon:DialogWindow.EXCLAMATION
			});
			wind.getWindowContainer().append(w);
			w.getButton("Try a different key").whenPressed().then(()=>{
				askApiKey(wind);
			});
			w.getButton("Retry").whenPressed().then(()=>{
				location.reload();
			});
			w.getButton("Use without key").whenPressed().then(()=>{
				neuropacs_storage.setFields({"APIkey":""});
				location.reload();
			});
		})
	})
}

var main2= function(args,npcs){


	args.app.clearContents();//clears the loading animation
	var wind=args.app.getWindow();//gets the window object, which has many parameters, methods, and listeners
	wind.setFullScreen();
	
	//We create a GUI menu bar with one menu item:
	var menulayout=new MenuLayout();
	var help_menu=menulayout.getMenuBar().append(new MenuItem('Settings')).getSubMenu();
	help_menu.append(new MenuItem('Set new API Key')).whenClicked().then((item)=>{
		item.collapseMenu();

		wind.getWindowContainer().append(new  DialogWindow({
			title:"Reset API key",
			prompt:"Are you sure?",
			buttons:["Yes","No"],
			icon:DialogWindow.QUESTIONMARK
		})).getButton('Yes').whenClicked().then(()=>{
			askApiKey(wind);
		});
	});

	help_menu.append(new MenuItem('Track Order Id')).whenClicked().then((item)=>{
		item.collapseMenu();

		wind.getWindowContainer().append(new  InputWindow({
			title:"Track Order Id",
			prompt:"Please type your Order Id:",
			icon:"neuropacs_icon.svg"
		})).whenSubmitted().then((input)=>{
			if(input.getText().length>0){
				let job=input.getText();

				wind.getWindowContainer().append(new  InputWindow({
					title:"Track Order Id",
					prompt:"Please type a name for your order:",
					icon:"neuropacs_icon.svg"
				})).whenSubmitted().then((input)=>{
					if(input.getText().length>0){
						let name=input.getText();
						browser_storage.newObject({OID:job}).whenReady().then((o)=>{
						o.rename(name);
						o.setFields({startDate:new Date().getTime()});
						neuropacs_storage.add(o).then(()=>{
								let row=table.tBody.prepend(new TableRow({table:table}));
								let entry=row.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect})).setCloudObject(o).setId(job).setName(name).setProduct('PD/MSAp/PSP');
								let date_created=new Date(o.getSystemProperty("DATE_CREATED"));
								let h=date_created.getHours();
								if(h<10)h="0"+h;
								let m=date_created.getMinutes();
								if(m<10)m="0"+m;
								entry.setDate(""+h+":"+m);
								entry.setProgress(0);
								entry.setProgressComment("Order Id Added...");
								o.setFields({info:"Order Id Added...",progress:0,});
								entry.autoUpdate();
						})
					})
				}
				})
			}
		});
	});

	//You can append GUI elements to the window like this:
	wind.getContent().append(menulayout);

	var split=new SplitLayout({orientation:'vertical',sticky:'first',editable:false});
	split.setStickySize('auto','visible');

	split.appendCustomStyle({
		applyStyle:function(split){
			split.div.style.padding="10px";
			split.div.style.border="0px solid black";
			split.div.style.borderRadius="20px";
			split.div.style.boxShadow="0px 5px 10px black";
		}
	});

	menulayout.getContainer().appendCustomStyle({
		applyStyle:function(layout){
			layout.div.style.padding="5%";
		}
	});

	menulayout.getContainer().append(split);

	//Or alternatively you can append custom divs made with vanilla JS:
	var area=document.createElement('div');
	opn.set(area.style,{
		position:"absolute",
		display:"block",
		boxSizing:"border-box",
		width:"100%",
		height:"100%",
		padding:"10px",
		overflow:"hidden",
		color:"white",
		fontWeight:"700",
		fontSize:"28px",
		fontFamily:"Arial"
	});

	var table=new Table({
		rows:0,
		cols:1,
		tHeaders:["Column 1"]
	});

	table.appendCustomStyle({
		applyStyle:function(table){
			

		}
	})

	table.header.hide();



split.getSecondContainer().append(table);

var split_header=new SplitLayout({orientation:'horizontal',sticky:'second',editable:false});
split_header.setStickySize('auto','visible');
split_header.appendCustomStyle({
	applyStyle:function(header)
	{
		header.div.style.paddingBottom="10px";
	}
})
let b=new Button("New Order");
b.whenPressed().then(()=>{

	if(npcs==null){
		askApiKey(wind);
	}
	else popLayout.show()
})

var popLayout=new PopUpLayout();
popLayout.setPosition('left');	

	//We populate the pop up with GUI elements
	popLayout.append(new Label("Product Selection"));
	popLayout.append(new Button("PD/MSAp/PSP")).whenClicked().then(()=>{
		popLayout.hide();

		let window=new Window();
		wind.getWindowContainer().append(window);
		new PDMSAPSPrequest(window).setCallback((index)=>{

			let dataset=[];
			for(let i=0;i<index.length;i++){
				if(index[i].file)dataset.push(index[i].file);
			}
			let name=index[0].name;

			npcs.newJob().then((job)=>{

				browser_storage.newObject({OID:job}).whenReady().then((o)=>{
					o.rename(name);
					o.setFields({startDate:new Date().getTime()});
					neuropacs_storage.add(o).then(()=>{
							let row=table.tBody.prepend(new TableRow({table:table}));
							let entry=row.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect})).setCloudObject(o).setId(job).setName(name).setProduct('PD/MSAp/PSP');
							let date_created=new Date(o.getSystemProperty("DATE_CREATED"));
							let h=date_created.getHours();
							if(h<10)h="0"+h;
							let m=date_created.getMinutes();
							if(m<10)m="0"+m;
							entry.setDate(""+h+":"+m);


						async function uploadDataset(job,dataset,product,progress_callback){
							let to_remove=[];
							for(let f in dataset)if(dataset[f].name.indexOf('.')==0)to_remove.push(f);
							for(let f=to_remove.length-1;f>=0;f--) dataset.splice(to_remove[f],1);

							progress_callback({progress:0,status:"Uploading..."});
							await npcs.uploadDatasetFromFileArray({fileArray:dataset,orderId:job,callback:progress_callback});
							progress_callback({progress:0,status:"Uploading completed. Waiting for validation..."});
							await npcs.runJob({productName:product,orderId:job});
								
						}

						uploadDataset(job,dataset,"PD/MSAp/PSP-v1.0",(d)=>{
							entry.setProgress(d.progress);
							entry.setProgressComment(d.status);
						}).then(()=>{
							entry.setProgress(0);
							entry.setProgressComment("Analysis process queued...");
							o.setFields({info:"Analysis process queued...",progress:0,});
							entry.autoUpdate();
						});

					});
				})

				
			});
			
			


		});
	});
	
b.append(popLayout);

var logo=new Image();
logo.setSource('neuropacs_icon_large_text.svg');
logo.appendCustomStyle({
	applyStyle:function(logo){
		logo.div.style.backgroundPosition='left center';
	}
})

split_header.getSecondContainer().append(b);
split_header.getFirstContainer().append(logo);

split.getFirstContainer().append(split_header);



let load_orders=()=>{
	console.log(neuropacs_storage);
	console.log(browser_storage)
	let list=neuropacs_storage.getSystemProperty('LIST');
	let i=0;
	for(var id in list){
		browser_storage.getObject(id).whenReady().then((object)=>{
			let row=table.tBody.prepend(new TableRow({table:table}));
			let entry=row.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect})).setCloudObject(object).setId(id).setName(object.getSystemProperty('NAME')).setProduct('PD/MSAp/PSP');
			entry.autoUpdate();
		})
		
		i+=1;
	}
}

table.tBody.prepend(new TableRow({table:table}))
.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect}))
.setName('DEMO_MRI_3').setProgress(100).setProgressComment('Finished').setProduct('PD/MSAp/PSP').setResults({
    "orderID": "183b21a1-15cb-4882-8aec-2d6bf4cd1d4d",
    "date": "2025-05-30",
    "product": "PD/MSAp/PSP-v1.0",
    "result": {
        "Atypical": "0.913",
        "PSPvsMSAp": "0.944",
        "FWpSN": "0.28",
        "FWPutamen": "0.20",
        "FWSCP": "0.41",
        "FWMCP": "0.09"
    }
});
			
table.tBody.prepend(new TableRow({table:table}))
.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect}))
.setName('DEMO_MRI_2').setProgress(100).setProgressComment('Finished').setProduct('PD/MSA/PSP').setResults({
    "orderID": "37562845-1a07-46be-ac86-e832e40e597e",
    "date": "2025-05-31",
    "product": "PD/MSAp/PSP-v1.0",
    "result": {
        "Atypical": "0.597",
        "PSPvsMSAp": "0.3177",
        "FWpSN": "0.3127",
        "FWPutamen": "0.1434",
        "FWSCP": "0.2649",
        "FWMCP": "0.0617"
    }
});

table.tBody.prepend(new TableRow({table:table}))
.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect}))
.setName('DEMO_MRI_1').setProgress(100).setProgressComment('Finished').setProduct('PD/MSA/PSP').setResults({
    "orderID": "4ed799bb-6d80-4a1f-9639-2db6cc58a1c8",
    "date": "2025-05-31",
    "product": "PD/MSAp/PSP-v1.0",
    "result": {
        "Atypical": "0.216",
        "PSPvsMSAp": "0.67",
        "FWpSN": "0.15",
        "FWPutamen": "0.17",
        "FWSCP": "0.15",
        "FWMCP": "0.06"
    }
})

if(npcs!=null)load_orders();
}
