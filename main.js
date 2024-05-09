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
			//load_orders();
		}).otherwise(()=>{
			browser_storage.newObject({OID:'neuropacs_demo'}).whenReady().then((o)=>{
				console.log(o);
				p.callThen({object:o});
				//load_orders();
			})
		})
	}
	return p;
}

var neuropacs_storage;
var browser_storage;
var neuropacs_connect;

var getAPIKey=function(wind){
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
		if(typeof API_KEY==='undefined' || API_KEY.length==0)ask_user();
		else p.callThen({object:API_KEY,event:false});

	})

	
	return p;
}

var main=function(args){
	const serverUrl = "https://sl3tkzp9ve.execute-api.us-east-2.amazonaws.com/v1/";



	var wind=args.app.getWindow();
	getAPIKey(wind).then((API_KEY,USER_TYPED)=>{

		let loading=new  DialogWindow({
			title:"API Testing Tool",
			prompt:"Connecting...",
			buttons:[],
			icon:"neuropacs_icon.svg"
		});
		wind.getWindowContainer().append(loading);

		const npcs = Neuropacs.init(serverUrl, API_KEY);
		console.log(npcs);

		//CONNECT TO NEUROPACS
		const conn =  npcs.connect().then((conn)=>{

			neuropacs_storage.setFields({"APIkey":API_KEY});
			

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
				buttons:["Try a different key"],
				icon:DialogWindow.EXCLAMATION
			});
			wind.getWindowContainer().append(w);
			w.getButton("Try a different key").whenPressed().then(()=>{
				location.reload();
			});
		})
	})
}

var main2= function(args,npcs){


	args.app.clearContents();//clears the loading animation
	var wind=args.app.getWindow();//gets the window object, which has many parameters, methods, and listeners
	wind.setFullScreen();
	//for example:
	

	//We create a GUI menu bar with one menu item:
	var menulayout=new MenuLayout();
	var help_menu=menulayout.getMenuBar().append(new MenuItem('Help')).getSubMenu();
	help_menu.append(new MenuItem('Set new API Key')).whenClicked().then((item)=>{
		item.collapseMenu();

		wind.getWindowContainer().append(new  DialogWindow({
			title:"Reset API key",
			prompt:"Are you sure?",
			buttons:["Yes","No"],
			icon:DialogWindow.QUESTIONMARK
		})).getButton('Yes').whenClicked().then(()=>{
			neuropacs_storage.setFields({"APIkey":""});
			location.reload();
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
	//menulayout.getContainer().div.appendChild(area);



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
b.whenPressed().then(()=>{popLayout.show()})

var popLayout=new PopUpLayout();
popLayout.setPosition('left');	

	//We populate the pop up with GUI elements
	popLayout.append(new Label("Product Selection"));
	popLayout.append(new Button("PD/MSA/PSP")).whenClicked().then(()=>{
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
							let entry=row.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect})).setCloudObject(o).setId(job).setName(name).setProduct('PD/MSA/PSP');
							let date_created=new Date(o.getSystemProperty("DATE_CREATED"));
							let h=date_created.getHours();
							if(h<10)h="0"+h;
							let m=date_created.getMinutes();
							if(m<10)m="0"+m;
							entry.setDate(""+h+":"+m);

						 async function uploadPart(dataset,start,n,cb){
							const totalFiles = dataset.length;
							let attempts=0;
							for (let i = start; i < totalFiles; i+=n) {
								//console.log("Upload "+i+" of "+totalFiles+" ("+start+")");
								try{
									await npcs.upload(dataset[i], job, job);
									//let result=await npcs.validateUpload([dataset[i].name],job,job);
									//console.log(result);
									//console.log(''+i+' '+n+' '+totalFiles);
									cb();
									if(attempts>0)console.log('ok');
									attempts=0;
								}catch (e)
								{
									console.log(e);
									if(attempts<4){
										console.log('will re-attempt '+attempts+'...');
										i-=n;
										attempts+=1;
										await new Promise(r => setTimeout(r, 2000));
									}else{
										throw new Error(e);
									}
								}
								//console.log("Done "+i);
								
							}
						 }

						function uploadParts(dataset,n,cb){
							const asyncProcesses=[];
							for(let i=0;i<n;i++){
								asyncProcesses.push(uploadPart(dataset,i,n,cb));
							}
							return Promise.all(asyncProcesses);
						 }

					

						 async function uploadDataset(dataset) {
							try {
				
							
							  
							  entry.setProgressComment("Uploading...");
							  o.setFields({info:"Uploading..."});

							  try{
								let uploaded=false;
								let upload_attempts=0;
								

								while(uploaded==false){
									//console.log(dataset);
									let filenames=[];
									for(let i=0;i<dataset.length;i++){
										filenames.push(dataset[i].name);
									}
									let totalFiles = dataset.length;
									let i=0;
									await uploadParts(dataset,4,()=>{
											i++;
											entry.setProgress(Math.round(100*(i)/totalFiles));
											//o.setFields({progress:Math.round(100*(i)/totalFiles)});
									});

									
									entry.setProgressComment("Verifying uploaded data...");
									o.setFields({info:"Verifying uploaded data..."}); 

									let missingFiles=[];
									i=0;
									for(;i<filenames.length;){
										let fnm=[];
										for(let j=0;j<100 && i<filenames.length; j++){
											fnm.push(filenames[i]);
											i++;
										}
										//console.log(fnm);
										if(upload_attempts>0)await new Promise(r => setTimeout(r, 2000));
										let result=await npcs.validateUpload(fnm,job,job);
										//console.log(result);
										for(let j=0;j<result.missingFiles.length;j++)missingFiles.push(result.missingFiles[j]);
									}
									
									if(missingFiles.length==0) uploaded=true;
									else{
										upload_attempts+=1;
										if(upload_attempts>30)throw new Error("Dataset upload failed (10)!");
										console.log(upload_attempts);
										console.log(missingFiles);
										let mis={};
										for(let f=0;f<missingFiles.length;f++)mis[missingFiles[f]]=true;
										let new_dataset=[];
										for(let f=0;f<dataset.length;f++){
											if(mis[dataset[f].name])new_dataset.push(dataset[f]);
										}
										dataset=new_dataset;
									}
								}

							  }catch(error){
								console.log(error);
								entry.setProgressComment("Error Uploading!");
								o.setFields({info:"Error Uploading",failed:true});
								return;
							  }
				
							  entry.setProgressComment("Uploaded. Analysis is starting...");
							  o.setFields({info:"Uploaded. Analysis is starting...",uploaded:true,uploadDate:new Date().getTime()});

							  let j=await npcs.runJob("PD/MSA/PSP-v1.0", job, job);
							  console.log(j);
							  entry.setProgress(0);
							  entry.setProgressComment("Analysis started...");
							  o.setFields({info:"Analysis started...",progress:0,});

							} catch (error) {
							  console.log(error);
							  entry.setProgressComment("Failed!");
							  if (error.neuropacsError) {
								throw new Error(error.neuropacsError);
							  } else {
								throw new Error("Dataset upload failed!");
							  }
							}
						  }

						  

						uploadDataset(dataset).then(()=>{
					
						});

					});
				})

				
			});
			
			


		});
	});
	popLayout.append(new Button("AD/DLB")).whenClicked().then(()=>{
		popLayout.hide();
		wind.getWindowContainer().append(new  DialogWindow({
			title:"AD/DLB",
			prompt:"Coming soon...",
			buttons:["OK"],
			icon:'neuropacs_icon.svg'
		}));
	})
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


let addRow=(table,id,object)=>{
	console.log(object);
	let row=table.tBody.prepend(new TableRow({table:table}));
	let entry=row.setCellContent(0,new NeuropacsTableEntry({windowContainer:wind.getWindowContainer(),neuropacs_connect})).setCloudObject(object).setId(id).setName(object.getSystemProperty('NAME')).setProduct('PD/MSA/PSP');
		entry.startAnimation();
};

let load_orders=()=>{
	//We populate the table with random values
	let list=neuropacs_storage.getSystemProperty('LIST');
	let i=0;
	for(var id in list){
		browser_storage.getObject(id).whenReady().then((object)=>{
			addRow(table,id,object);
		})
		
		i+=1;
	}
}

load_orders();


}
