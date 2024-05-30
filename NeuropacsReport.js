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

            let clr1='gray';
            let clr2='rgb(248 177 18)';
            if(percent>50){
                let tmp=clr2;
                clr2=clr1;
                clr1=tmp;
            }


            let cx=150;
            let cy=200;
            let r=70;
            g.ellipse({cx,cy,rx:r,ry:r,stroke:'black',fill:clr2});

            let points=''+cx+' '+cy;
            for(let i=-percent/2;i<=percent/2;i++){
                let x=cx+r*Math.cos(2*i*Math.PI/100+Math.PI);
                let y=cy+r*Math.sin(2*i*Math.PI/100+Math.PI);
                points+=' '+Math.round(x)+' '+Math.round(y);
            }
            points+=' '+cx+' '+cy;
            let options={points, fill:clr1,stroke:'black'}
            g.polyline(options);

           
            g.text({'font-family':'sans-serif','font-size':'12px','text-anchor':'middle',x:cx-r-(cx-r-10)/2,y:205},C1);
            g.text({'font-family':'sans-serif','font-size':'12px','text-anchor':'middle',x:cx+r+(cx-r-10)/2,y:205},C2);

            g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:336,'text-anchor':'middle'},'The result indicates that between '+C1);// MSAp/PSP, there is higher probability of MSAp or PSP diagnosis.
            g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:353,'text-anchor':'middle'},'and '+C2+', there is higher probability');
            g.text({'font-family':'sans-serif','font-size':'15px',x:150,y:370,'text-anchor':'middle'},'of '+((percent>50)?C1:C2.replace('/',' or '))+' diagnosis.');
        }

        draw_classifier(svg.group(),100-entry.MSAPSPvsPD,'PD','MSA/PSP');

        draw_classifier(svg.group({transform:'translate(300 0)'}),100-entry.PSPvsMSA,'MSA','PSP');

        svg.text({'font-family':'sans-serif','font-size':'10px',x:300,y:395,'text-anchor':'middle'},'Patient management decisions should not be made solely on the basis of analysis by the neuropacs system.');

       
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
        

        let ROIc={
            FWMCP:{avg:0.073751,std:0.02591},
            FWPutamen:{avg:0.176522,std:0.061003},
            FWSCP:{avg:0.298924,std:0.076232},
            FWpSN:{avg:0.175282,std:0.04196},
        };

        let max=1.0;
        let color1='green';
        let color2='rgb(158, 206, 220)';

        let x=55;
        let w=23;
        for(let region in entry.ROIs)
        {
            let value=ROIc[region].avg;

            svg.rect({x:x,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color1});
    
            svg.line({x1:x+w/2,y1:150*(max-(ROIc[region].avg-ROIc[region].std))/max,x2:x+w/2,y2:150*(max-(ROIc[region].avg+ROIc[region].std))/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
            svg.line({x1:x+w/4,y1:150*(max-(ROIc[region].avg-ROIc[region].std))/max,x2:x+w*3/4,y2:150*(max-(ROIc[region].avg-ROIc[region].std))/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
            svg.line({x1:x+w/4,y1:150*(max-(ROIc[region].avg+ROIc[region].std))/max,x2:x+w*3/4,y2:150*(max-(ROIc[region].avg+ROIc[region].std))/max,stroke:'black','stroke-width':3,'stroke-linecap':'round'});
    
            value=entry.ROIs[region];
            svg.rect({x:x+w+5,y:150*(max-value)/max,width:w,height:value*150/max,stroke:'black',fill:color2});
    
            svg.text({'font-family':'sans-serif','font-size':'12px','text-anchor':'middle',x:x+w+3,y:165},region.substring(2));
            x+=6+(w+5)*2;
        }
       

        svg.text({'font-family':'sans-serif','font-size':'12px',x:61+(w+5)*3-20,y:185},'Regions of Interest');

        svg.text({'transform':'rotate(-90 10 75)','font-family':'sans-serif','font-size':'12px',x:-15,y:80},'Free water');

        svg.rect({x:350,y:30,width:w,height:w,stroke:'black',fill:color1});
        svg.text({'font-family':'sans-serif','font-size':'12px',x:355+w,y:45},'Controls');

        svg.rect({x:470,y:30,width:w,height:w,stroke:'black',fill:color2});
        svg.text({'font-family':'sans-serif','font-size':'12px',x:475+w,y:45},'Patient');

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