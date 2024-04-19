preload(libs['GUI']);
preload('PrintDiv.js');
preload('app:89muvxshkuveueob@research.dwi.ufl.edu/op.n');//QRCode
preload('app:wyv25is7cmu8jb54@research.dwi.ufl.edu/op.n');//SVG

class NeuropacsReport{

    constructor(window,entry){
        window.setTitle(entry.id_label.text+' - '+entry.product_label.text+' results');
        window.setSize(600,800);
        window.setIcon('neuropacs_icon.svg');
        var menulayout=new MenuLayout();
	    menulayout.getMenuBar().append(new MenuItem('Print')).whenClicked().then((item)=>{
            let original_size=window.getSize();
			window.setSize(800,600);
            PrintDiv(area,{title:entry.id_label.text+' - '+entry.product_label.text+' results'});
            window.setSize(original_size[0],original_size[1]);
	    });
        window.getContent().append(menulayout);

        let area=document.createElement('div');
        menulayout.getContainer().div.appendChild(area);
        opn.set(area.style,{
            width:'100%',
            height:'100%',
            position:'relative'
        });

        let header=document.createElement('div');
        area.appendChild(header);
        opn.set(header.style,{
            width:'100%',
            top:'0px',
            left:'0px',
            position:'absolute',
            height:'8%',
            background:'rgb(111, 196, 213)'
        });
        let np_logo=document.createElement('div');
        header.appendChild(np_logo);
        opn.set(np_logo.style,{
            width:'10%',
            top:'0px',
            position:'absolute',
            height:'100%',
            backgroundImage:"url('neuropacs_icon.svg')",
            backgroundRepeat:'no-repeat',
            backgroundSize:'contain',
            backgroundPosition:'left center'
        });

        let header_text=document.createElement('div');
        header.appendChild(header_text);
        opn.set(header_text.style,{
				position:"absolute",
				display:"flex",
				alignItems:"center",
				justifyContent:"center",
				top:"0px",
				left:"10%",
				right:"10%",
				height:"100%",
				fontWeight:"700",
				fontFamily:"Arial",
				fontSize:"20px",
				textalign:"center",
				padding:"5px",
				boxSizing:"border-box",
				userSelect:"none"
			}
		)

        let header_text2=document.createElement('div');
		header_text.appendChild(header_text2);
		opn.set(header_text2.style,
			{
				padding:"0px",
				boxSizing:"border-box",
				color:"white",
				whitespace:"nowrap"
			}
		);

        header_text2.innerHTML='neuropacs - Classification Report';


        let metadata_box=document.createElement('div');
        area.appendChild(metadata_box);
        opn.set(metadata_box.style,
			{
                position:'absolute',
				top:"8%",
				left:"0%",
				right:"35%",
				height:"10%"
			}
		);

        metadata_box.appendChild(this.newField({top:'0%',height:'33%',name:'Report ID: '+entry.id}));
        let date=new Date(entry.cloudObject.info.uploadDate);
        let month=date.getMonth();if(month<10)month="0"+month;
        let day=date.getDate();if(day<10)day="0"+day;

        metadata_box.appendChild(this.newField({top:'33%',height:'33%',name:'Date (yyyy-mm-dd): '+date.getFullYear()+'-'+month+'-'+day}));
        //metadata_box.appendChild(this.newField({top:'50%',height:'25%',name:'Clinical Data: '}));
        //metadata_box.appendChild(this.newField({top:'66%',height:'33%',name:'Prediction Results'}));

        let qr_box=document.createElement('div');
        area.appendChild(qr_box);
        opn.set(qr_box.style,
			{
                position:'absolute',
				top:"10%",
				width:"33%",
				right:"0%",
				height:"23%"
			}
		);
        //new QRCode(qr_box,{text:'http://neuropacs.com',useSVG:true});

        let ai_box=document.createElement('div');
        area.appendChild(ai_box);
        opn.set(ai_box.style,
			{
                position:'absolute',
				top:"18%",
				left:"0%",
				right:"0%",
				height:"50%",
                backgroundSize:'contain',
                backgroundRepeat:'no-repeat',
                backgroundPosition:'center center'
			}
		);
        var svg=new SVG({width:600,height:400});
    	//svg.rect({width:600,height:200,stroke:'black',fill:'none'});


        let draw_classifier=(g,percent,C1,C2)=>{

            g.rect({x:10, y:10, width:280, height:370, stroke:'black',fill:'none'});
        
            g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:28,'text-anchor':'middle'},'Classification between');
            g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:48,'text-anchor':'middle'},C1+" and "+C2);

            g.text({'font-family':'sans-serif','font-size':'18px',x:20,y:80},'Classification Result:');
            g.rect({x:190, y:60, width:90, height:30, stroke:'black',fill:'none'});
            g.text({'font-family':'sans-serif','font-size':'18px',x:235,y:80,'text-anchor':'middle'},(percent>50)?C1:C2);

            let val1=percent;
            let val2=100-percent;
            let clr1='rgb(248 177 18)';
            let clr2='gray'
            if(val1<val2){
                let tmp=clr2;
                clr2=clr1;
                clr1=tmp;
            }
            g.ellipse({cx:150,cy:200,rx:100,ry:100,stroke:'black',fill:clr2});
            
            let points='150 200';
            for(let i=-percent/2;i<=percent/2;i++){
                let x=150+100*Math.cos(2*i*Math.PI/100+Math.PI);
                let y=200+100*Math.sin(2*i*Math.PI/100+Math.PI);
                points+=' '+Math.round(x)+' '+Math.round(y);
            }
            points+=' 150 200';
            let options={points, fill:clr1,stroke:'black'}
            g.polyline(options);

            let t=C1.replace('/',' or ').split(' ')
            for(let i=0;i<t.length;i++)
              g.text({'font-family':'sans-serif','font-size':'12px',x:20,y:200+i*14},t[i]);
            t=C2.replace('/',' or ').split(' ')
            for(let i=0;i<t.length;i++)
             g.text({'font-family':'sans-serif','font-size':'12px',x:255,y:200+i*14},t[i]);

             g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:336,'text-anchor':'middle'},'The result indicates that between '+C1);// MSAp/PSP, there is higher probability of MSAp or PSP diagnosis.
             g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:353,'text-anchor':'middle'},'and '+C2+', there is higher probability');
             g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:370,'text-anchor':'middle'},'of '+((percent>50)?C1:C2.replace('/',' or '))+' diagnosis.');
        }

        draw_classifier(svg.group(),10,'PD','MSA/PSP');

        draw_classifier(svg.group({transform:'translate(300 0)'}),80,'MSA','PSP');

        svg.text({'font-family':'sans-serif','font-size':'10px',x:300,y:395,'text-anchor':'middle'},'Patient management decisions should not be made solely on the basis of analysis by the neuropacs system.');

        /*if(entry.PD<50){
            svg.ellipse({cx:50,cy:50,rx:20,ry:20,stroke:'black',fill:'gray'});
            svg.text({'font-family':'sans-serif','font-size':'20px','font-weight':'bold',x:45,y:55,'fill':'white'},'1');

        
            svg.ellipse({cx:130,cy:150,rx:20,ry:20,stroke:'black',fill:'gray'});
            svg.text({'font-family':'sans-serif','font-size':'20px','font-weight':'bold',x:125,y:155,'fill':'white'},'2');

            //let g=svg.group({'transform':'translate(35,100) scale(3,3)'});
            //g.polygon({'points':"15,12 22,17 15,22",'fill':'gray'});
            //g.path({'d':"M4,2v9c0,3.3,2.7,6,6,6h8",'fill':"none", 'stroke':"gray", 'stroke-miterlimit':"10", 'stroke-width':"4"});
        }
        svg.text({'font-family':'sans-serif','font-size':'18px',x:100,y:50},'PD vs. Atypical Parkinsonism');
        svg.text({'font-family':'sans-serif','font-size':'14px',x:200,y:70},'(MSA,PSP)');

        
        svg.text({'font-family':'sans-serif','font-size':'18px',x:180,y:150},'MSA vs. PSP');
       
        let v=entry.PD;
        let c1='gray';
        let c2='rgb(248 177 18)';
        if(v>50){let t=c2;c2=c1;c1=t;}

        svg.text({'font-family':'sans-serif','font-size':'12px',x:375,y:30},'PD');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:410+v*150/100,y:30},''+Math.floor(v)+'%');
        svg.rect({x:400, y:5, width:v*150/100,height:40,stroke:'black',fill:c1});
        v=100-entry.PD;
        svg.text({'font-family':'sans-serif','font-size':'12px',x:370,y:65},'MSA');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:370,y:80},'PSP');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:410+v*150/100,y:75},''+Math.floor(v)+'%');
        svg.rect({x:400, y:50, width:v*150/100,height:40,stroke:'black',fill:c2});
        
        
        v=entry.MSA;
        c1='gray';
        c2='rgb(248 177 18)';
        if(v>50){let t=c2;c2=c1;c1=t;}
        svg.text({'font-family':'sans-serif','font-size':'12px',x:370,y:130},'MSA');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:410+v*150/100,y:130},''+Math.floor(v)+'%');
        svg.rect({x:400, y:105, width:v*150/100,height:40,stroke:'black',fill:c1});
        v=100-entry.MSA;
        svg.text({'font-family':'sans-serif','font-size':'12px',x:370,y:175},'PSP');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:410+v*150/100,y:175},''+Math.floor(v)+'%');
        svg.rect({x:400, y:150, width:v*150/100,height:40,stroke:'black',fill:c2});
        
*/
        ai_box.style.backgroundImage="url('"+svg.getDataURL()+"')";

        let ai_box2=document.createElement('div');
        area.appendChild(ai_box2);
        opn.set(ai_box2.style,
			{
                position:'absolute',
				top:"68%",
				left:"0%",
				right:"0%",
				height:"7.5%"
			}
		);

        /*if(entry.PD>50)
            ai_box2.appendChild(this.newField({top:'0%',height:'50%',name:'Predicted Diagnosis: PD'}));
        else if(entry.MSA>50)
            ai_box2.appendChild(this.newField({top:'0%',height:'50%',name:'Predicted Diagnosis: MSA'}));
        else ai_box2.appendChild(this.newField({top:'0%',height:'50%',name:'Predicted Diagnosis: PSP'}));*/

   
        ai_box2.appendChild(this.newField({top:'0%',height:'100%',name:'Biomarker Levels'}));

        let ai_box3=document.createElement('div');
        area.appendChild(ai_box3);
        opn.set(ai_box3.style,
			{
                position:'absolute',
				top:"75%",
				left:"0%",
				right:"0%",
				height:"25%",
                backgroundSize:'contain',
                backgroundRepeat:'no-repeat',
                backgroundPosition:'center center'
			}
		);

        svg=new SVG({width:600,height:200});
    	//svg.rect({width:600,height:200,stroke:'black',fill:'none'});

        svg.rect({x:50,y:0,width:250,height:150,stroke:'gray',fill:'none'});

        svg.line({x1:45,x2:50,y1:150,y2:150,stroke:'gray'});
        svg.line({x1:45,x2:50,y1:100,y2:100,stroke:'gray'});
        svg.line({x1:45,x2:50,y1:50,y2:50,stroke:'gray'});
        svg.line({x1:45,x2:50,y1:0,y2:0,stroke:'gray'});
        svg.text({'font-family':'sans-serif','font-size':'12px',x:25,y:150},'0.0');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:25,y:102},'0.25');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:25,y:52},'0.75');
        svg.text({'font-family':'sans-serif','font-size':'12px',x:25,y:10},'1.0');
        let max=1.0;

        let color1='green';
        let color2='rgb(158, 206, 220)';
        let value=entry.ROIc[0];
        let w=23;
        svg.rect({x:55,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color1});

        svg.line({x1:55+w/2,y1:150*(max-entry.ROImin[0])/max,x2:55+w/2,y2:150*(max-entry.ROImax[0])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:55+w/4,y1:150*(max-entry.ROImin[0])/max,x2:55+w*3/4,y2:150*(max-entry.ROImin[0])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:55+w/4,y1:150*(max-entry.ROImax[0])/max,x2:55+w*3/4,y2:150*(max-entry.ROImax[0])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});

        value=entry.ROIs[0];
        svg.rect({x:55+w+5,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color2});

        svg.text({'font-family':'sans-serif','font-size':'12px',x:55+w-10,y:165},'pSN');

        //--

        value=entry.ROIc[1];
        svg.rect({x:61+(w+5)*2,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color1});
        
        svg.line({x1:61+(w+5)*2+w/2,y1:150*(max-entry.ROImin[1])/max,x2:61+(w+5)*2+w/2,y2:150*(max-entry.ROImax[1])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:61+(w+5)*2+w/4,y1:150*(max-entry.ROImin[1])/max,x2:61+(w+5)*2+w*3/4,y2:150*(max-entry.ROImin[1])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:61+(w+5)*2+w/4,y1:150*(max-entry.ROImax[1])/max,x2:61+(w+5)*2+w*3/4,y2:150*(max-entry.ROImax[1])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});

        value=entry.ROIs[1];
        svg.rect({x:61+(w+5)*3,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color2});

        svg.text({'font-family':'sans-serif','font-size':'12px',x:61+(w+5)*3-27,y:165},'Putamen');

        //--

        value=entry.ROIc[2];
        svg.rect({x:67+(w+5)*4,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color1});

        svg.line({x1:67+(w+5)*4+w/2,y1:150*(max-entry.ROImin[2])/max,x2:67+(w+5)*4+w/2,y2:150*(max-entry.ROImax[2])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:67+(w+5)*4+w/4,y1:150*(max-entry.ROImin[2])/max,x2:67+(w+5)*4+w*3/4,y2:150*(max-entry.ROImin[2])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:67+(w+5)*4+w/4,y1:150*(max-entry.ROImax[2])/max,x2:67+(w+5)*4+w*3/4,y2:150*(max-entry.ROImax[2])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});

        value=entry.ROIs[2];
        svg.rect({x:67+(w+5)*5,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color2});

        svg.text({'font-family':'sans-serif','font-size':'12px',x:67+(w+5)*5-15,y:165},'SCP');

        //--

        value=entry.ROIc[3];
        svg.rect({x:73+(w+5)*6,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color1});

        svg.line({x1:73+(w+5)*6+w/2,y1:150*(max-entry.ROImin[3])/max,x2:73+(w+5)*6+w/2,y2:150*(max-entry.ROImax[3])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:73+(w+5)*6+w/4,y1:150*(max-entry.ROImin[3])/max,x2:73+(w+5)*6+w*3/4,y2:150*(max-entry.ROImin[3])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
        svg.line({x1:73+(w+5)*6+w/4,y1:150*(max-entry.ROImax[3])/max,x2:73+(w+5)*6+w*3/4,y2:150*(max-entry.ROImax[3])/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});

        value=entry.ROIs[3];
        svg.rect({x:73+(w+5)*7,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color2});

        svg.text({'font-family':'sans-serif','font-size':'12px',x:73+(w+5)*7-15,y:165},'MCP');

        svg.text({'font-family':'sans-serif','font-size':'12px',x:61+(w+5)*3-20,y:185},'Regions of Interest');

        svg.text({'transform':'rotate(-90 10 75)','font-family':'sans-serif','font-size':'12px',x:-15,y:80},'Free water');

        svg.rect({x:350,y:30,width:w,height:w,stroke:'black',fill:color1});
        svg.text({'font-family':'sans-serif','font-size':'12px',x:355+w,y:45},'Controls');

        svg.rect({x:470,y:30,width:w,height:w,stroke:'black',fill:color2});
        svg.text({'font-family':'sans-serif','font-size':'12px',x:475+w,y:45},'Subject');

        svg.text({'font-family':'sans-serif','font-size':'14px',x:350,y:90},'pSN   Posterior substantia nigra');
        svg.text({'font-family':'sans-serif','font-size':'14px',x:350,y:110},'SCP   Superior cerebellar peduncle');
        svg.text({'font-family':'sans-serif','font-size':'14px',x:350,y:130},'MCP   Middle cerebellar peduncle');

        ai_box3.style.backgroundImage="url('"+svg.getDataURL()+"')";


        
    }

    newField(options){
        let container=document.createElement('div');
        opn.set(container.style,
			{
                position:'absolute',
				top:options.top,
				left:"0%",
				right:"0%",
				height:options.height,
			}
		);

        let header_text=document.createElement('div');
        container.appendChild(header_text);
        opn.set(header_text.style,{
				position:"absolute",
				display:"flex",
				alignItems:"center",
				top:"0px",
				left:"5%",
				right:"5%",
				height:"100%",
				fontWeight:"500",
				fontFamily:"Arial",
				fontSize:"16px",
				textalign:"center",
				padding:"5px",
				boxSizing:"border-box",
				userSelect:"none"
			}
		)

        let header_text2=document.createElement('div');
		header_text.appendChild(header_text2);
		opn.set(header_text2.style,
			{
				padding:"0px",
				boxSizing:"border-box",
				color:"black",
				whitespace:"nowrap"
			}
		);

        header_text2.innerHTML=options.name;

        return container;
    }

}

var main=function(){exportData({NeuropacsReport})};