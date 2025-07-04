preload(libs['GUI']);

class PDMSAPSPrequest{

    constructor(window){
        window.setTitle('PD/MSAp/PSP order');
        window.setIcon('neuropacs_icon.svg');
        window.setSize(400,400);

        var split_top=new SplitLayout({orientation:'vertical',sticky:'first',editable:false});
	    split_top.setStickySize('auto','visible');

        window.getContent().append(split_top);

       // split_top.getFirstContainer().append(new Label("DICOM dataset"));

		let h=new VerticalLayout();
		h.append(new Label("Please confirm the following:"));
		let ch1=h.append(new Checkbox("The patient is 40 years of age or older."));
		let ch2=h.append(new Checkbox("The patient experiences symptoms consistent with PD, MSA or PSP."));
		let ch3=h.append(new Checkbox("The neuropacs diffusion MRI acquisition protocol has been followed."));
		let ch4=h.append(new Checkbox("The MRI scan has been visually inspected to confirm that it contains the full volume of the brain and is free of distortions due to patient motion or other forms of artifacts, such as tumors."));

		h.append(new Button("Upload MRI")).whenClicked().then(()=>{
			if(ch1.isSelected() && ch2.isSelected() && ch3.isSelected() && ch4.isSelected())
			{
				split_top.getFirstContainer().removeAll();
				ulpoading_window();
			}
		});

		split_top.getFirstContainer().append(h);
		
		let ulpoading_window=()=>{

			var dropArea=new Layout();
			dropArea.appendCustomStyle({
				applyStyle:function(layout){
					layout.div.style.height='80%';
					layout.div.style.border='4px dashed black';
				}
			})

			split_top.getSecondContainer().append(dropArea);

			var l=new Label("Drag or select DICOM files to upload");
			dropArea.append(l);
			l.div.style.textAlign='center';

			var i=new Image();
			dropArea.append(i);
			i.setSource('data:image/png;base64,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');
			i.appendCustomStyle({
				applyStyle:function(i){
					i.div.style.minHeight='80px';
				}
			});
			i.setToolTipText("Drop files to this area to upload.");
			
			var fs=new FileSelector();
			fs.setDirectory(true);
			
			var b=new Button("Select File");
			b.setLabel("Select Folder");
			b.appendCustomStyle({
				applyStyle:function(b){
					opn.set(b.div.style,{
						width:'50%',
						marginLeft:'auto',
						marginRight:'auto'
					});
				}
			})
			b.setToolTipText("Click to select files from your computer.");
			dropArea.append(b);

			b.whenClicked().then(function(b){
				fs.show();
			})
			fs.whenSelected().then((fs,e)=>{
				//self.showUploadingProgress();
				fs.createIndex(e).then((index)=>{
					fs.input.value='';
					window.close();
					this.callback(index);
				});
			})

			var dt=new DropTarget({
				dropTarget:dropArea,
				activeStyle:{
					border:'4px dashed black',
					opacity:"0.5",
				},

				inactiveStyle:{
					border:'none',
					opacity:1
				}
			});
			
			dt.whenDropped().then((dt,e)=>{
				dt.createIndex(e).then((index)=>{
					window.close();
					this.callback(index);
				});
				
			})
	};


    }

    setCallback(callback){
        this.callback=callback;
    }
}

var main=function(){exportData({PDMSAPSPrequest})}
