preload(libs['GUI']);
preload(libs['UtilityWindows']);
preload("NeuropacsReport.js");
preload('app:qk2de28zisu3vgdz@research.dwi.ufl.edu/op.n');//BrowserStorage

var main=function(){
    
    class NeuropacsTableEntry extends HorizontalLayout {

        constructor(options)
        {
            super(options);
            this.defaultStyle=NeuropacsTableEntry.defaultStyle;
            this.neuropacs_connect=options.neuropacs_connect;

            this.PD=Math.floor(Math.random()*100);
            this.PD=3.5;
            this.MSA=Math.floor(Math.random()*100);
            this.MSA=9.5;
            this.ROIs=[];for(let i=0;i<4;i++)this.ROIs[i]=Math.random()*3;
            this.ROIs=[2.7, 2.3, 2.8, 2.15];
            this.ROIc=[0.8, 0.7, 0.7, 0.3];
            this.ROImin=[0.75, 0.65, 0.65, 0.25];
            this.ROImax=[0.9, 0.85, 0.75, 0.4];

            let v=new VerticalLayout();
            this.id_label=v.append(new Label(""));
            this.date_label=v.append(new Label(""));
            this.product_label=v.append(new Label(""));
            this.append(v);

            let v2=new VerticalLayout();
            this.progress_bar=v2.append(new ProgressBar());
            this.progress_label=v2.append(new Label(""));
            this.append(v2);

            v2.appendCustomStyle({
                applyStyle:function(v2){
                    v2.div.style.width="100%";
                }
            })

            let b_style={
                applyStyle:function(b){
                    b.div.style.width='auto';
                }
            }

            let trash_icon='data:image/svg+xml;utf8,<?xml version="1.0" ?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/></svg>';

            let bg=new ButtonGroup({orientation:'horizontal'});
            let icon='data:image/png;base64,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';
	
            bg.append(new Button("Result")).setIcon(icon).appendCustomStyle(b_style).whenClicked().then(()=>{


                this.neuropacs_connect().then((npcs)=>{
                        if(this.progress_bar.getValue()<100)
                        {
                            npcs.checkStatus(this.id,this.id).then((o)=>{
                                if(o.progress!=this.cloudObject.getFields()['progress']||o.info!=this.cloudObject.getFields()['info']){
                                    console.log('New progress');
                                    this.setProgress(o.progress);
                                    this.setProgressComment(o.info);
                                    this.cloudObject.setFields({progress:o.progress,info:o.info,started:o.started,finished:o.finished,failed:o.failed});
                                }else 
                                {
                                    console.log('Same progress');
                                    console.log(o);
                                }
                            }).catch(()=>{
                                this.setProgressComment('ERROR');
                                object.setFields({progress:0,info:"Error",failed:true});
                                
                            })
                        }else
                        {
                            npcs.getResults("JSON",this.id,this.id).then((o)=>{
                                o=JSON.parse(o);
                                console.log(o)
                                this.PD=100-o.result.MSAPSPvsPD;
                                this.MSA=o.result.PSPvsMSA;
                                this.ROIs=[o.result.FWpSN, o.result.FWPutamen, o.result.FWSCP, o.result.FWMCP];
                                let w=new Window();
                                 options.windowContainer.append(w);
                                new NeuropacsReport(w,this);
                            })	
                        }
                });

            })
    
            bg.append(new Button("")).setIcon(trash_icon).appendCustomStyle(b_style).whenClicked().then(()=>{
                
                var dialogWindow=new DialogWindow({
                    title:"Delete "+this.id_label.text+"?",
                    prompt:"Do you want to delete "+this.product_label.text+" request "+this.id_label.text+" ("+this.date_label.text+")?",
                    buttons:["Yes","Cancel"],
                    icon:DialogWindow.QUESTIONMARK
                })
            
                //Then we added it to the window container.
                options.windowContainer.append(dialogWindow);
                
                //If you click Yes, another Dialog Window is made.
                dialogWindow.getButton("Yes").whenClicked().then(()=>{
                    
                    
                    let s=new BrowserStorage();
            		let o=s.getObject('neuropacs_demo');
		            o.whenReady().then((o)=>{
                        o.removeById(this.id).then(()=>{
                            this.parent.parent.removeFromParent();
                        });
                    });



                    });
                
                
            });

            this.append(bg);
        

        }

        setCloudObject(cloudObject){
            this.cloudObject=cloudObject;
            return this;
        }

        setId(id){
            this.id=id;
            this.id_label.setToolTipText("Order ID: "+id);
            return this;
        }

        setName(name){
            this.id_label.setText(name);
            return this;
        }

        setDate(date){
            this.date_label.setText(date);
            return this;
        }

        setProduct(product){
            this.product_label.setText(product);
            return this;
        }

        setProgress(value){
            this.progress_bar.setValue(value);
            return this;
        }

        setProgressComment(comment){
            this.progress_label.setText(comment);
            return this;
        }

        getProgressBar(){return this.progress_bar;}
        

        startAnimation(){
            let object=this.cloudObject;
            let entry=this;
            let id=this.id;
            let date_created=new Date(object.getFields()["startDate"]);
		let h=date_created.getHours();
		if(h<10)h="0"+h;
		let m=date_created.getMinutes();
		if(m<10)m="0"+m;
		entry.setDate(""+h+":"+m);


		entry.setProgress(object.getFields()['progress']);
		entry.setProgressComment(object.getFields()['info']);

		if(object.getFields()['finished']||object.getFields()['failed']){
			//nothing to do
		}else
		{
			console.log('checking... '+id);
            this.neuropacs_connect().then((npcs)=>{
                npcs.checkStatus(id,id).then((o)=>{
                    if(o.progress!=object.getFields()['progress']||o.info!=object.getFields()['info']){
                        console.log('New progress');
                        entry.setProgress(o.progress);
                        entry.setProgressComment(o.info);
                        object.setFields({progress:o.progress,info:o.info,started:o.started,finished:o.finished,failed:o.failed});
                    }else 
                    {
                        console.log('Same progress');
                        console.log(o);
                    }
                }).catch(()=>{
                    entry.setProgressComment('ERROR');
                    object.setFields({progress:0,info:"Error",failed:true});
                    
                })
            })
		}

        }

    }
    

    NeuropacsTableEntry.defaultStyle={
		applyStyle:function(entry){
			entry.applyStyleForClass('HorizontalLayout');
            entry.div.style.minHeight="100px";
		}
	};
    
    
    exportData({NeuropacsTableEntry})};