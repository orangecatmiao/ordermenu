import { Component, OnInit,  EventEmitter, Input, Output } from '@angular/core';
import { OgcatTool, OgcatDialog } from '../../../projects/ogcat-tool-package/src/public-api'; 
import { AngularFireStorage } from "@angular/fire/storage";

//import { AngularFirestore } from "@angular/fire/firestore";
import { Firehttp } from '../_service/firehttp';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  providers:[OgcatTool, OgcatDialog]
})
export class PhotoComponent implements OnInit {
  title = '圖片';
  imgShow={ file:null, src:'', show:0 };
  user_id:string='';
  photoUrl;
  //photo_max_size:number = 1050000; //byte
  company_id;
  c_count=0;
  uid = JSON.parse(localStorage.userInfo).uid; 
  

  @Input('isOuter') isOuter: boolean;
  @Input('myPhoto') myPhoto: any;
  @Input('photo_upload') photo_upload: number;
  @Input('photo_delete') photo_delete: boolean = false;
  @Input('imageFile') imageFile: string;
  @Input('styleObj') styleObj: any ={image_tool:{}, file_input:{}, fa_times:{ 'font-size': '30px'}};
  @Input('photo_max_size') photo_max_size: number;
  @Output() voted = new EventEmitter<boolean>();

  goVote(obj) {
      this.voted.emit(obj);
  }
  constructor(
    private ogcatTool:OgcatTool,
    private ogcatDialog:OgcatDialog,
    private storage: AngularFireStorage, 
   // private firestore: AngularFirestore,
    private http:Firehttp
  ) { }

  ngOnInit(): void {
    this.user_id = this.ogcatTool.getCookie("user_id");
    this.photoUrl= '';//this.ogcatTool.getUrl().phptoUrl;
    this.company_id = this.ogcatTool.getCookie("company_uid");
  }
  ngOnChanges(changes): void{
    console.log("改變資料",this.myPhoto)
    
    if(this.photo_upload==1){
      this.uploadImage();
    }

    if(this.photo_delete == true ){
      this.deleteBanner();
    }
 }
  //==================  瀏覽器讀取圖片  =============================
  dragoverHandler(evt) {
    evt.preventDefault();
  }

  checkFile(file, div){
    let resultObj =this.checkImageList([file]);
    
      if(resultObj.error > 0){
        this.ogcatDialog.alert(resultObj.error_message);
        return;
      }
  
      if(resultObj.error_size > 0){
        this.ogcatDialog.alert(resultObj.error_size_message);
        return;
      }
  
      if(resultObj.error == 0 && resultObj.error_size==0){
        this.toReadImage(file, div);
      }
  }
  
  dropHandler(evt,div,action_type){
      let files;
      if(action_type === 'drop'){
        evt.preventDefault();
        files = evt.dataTransfer.files;//let files = evt.currentTarget.files;
      }else if(action_type==='change'){
        let mydata = (evt.currentTarget.files!=null)?evt.currentTarget.files:evt.dataTransfer.files;
        files = mydata;
      }
      let resultObj =this.checkImageList(files);
      this.checkFile(files[0], div);
   }

  openfile(evt) {
    let img = evt.target.result;
    return img;
  }

    //瀏覽圖片
  toReadImage(file,div){
      let app = this;
      var fr = new FileReader();
      fr.onload = function(evt:any) {
        let imgx =  app.openfile(evt);
        app[div].file=file;
        app[div].src =imgx;
        app[div].show=1;
        app[div].act ='read';
        app.goVote(app[div]);
      };
      fr.readAsDataURL(file);
    
  }

  checkImageList(files){
      let len = files.length;
      let error:number =0;
      let error_message:string = '';
      let error_size:number =0;
      let error_size_message:string = '';
      
      for(let i=0; i<len; i++){
        if(files){
          if(files[i].type != 'image/jpeg' &&  files[i].type != 'image/png' && files[i].type != 'image/gif'){
            error++;
          }
          if(files[i].size > this.photo_max_size){
            error_size++;
          }
        }
        
      }
      error_message = "上傳的檔案格式不正確 !!只接受圖片 jpg/jpeg/png/gif 。";
      error_size_message = "檔案只能在 1M 以內。";
      return {
        error:error,
        error_message:error_message,
        error_size:error_size,
        error_size_message:error_size_message
      };
  }
   
  deleteAddSlider(){
    this.imgShow={ 
      file:null, src:'', show:0
    };
  } 

 
   

  //==================  圖片上傳  =============================
  uploadImage(){
    if(this.imgShow.file==null){
      this.goVote('save');
      return;
    }
    
   // var image_name = this.uid;
    let file = this.imgShow.file;
    let filePath = `${this.imageFile}/`;  //${image_name}`;
    let fileRef = this.storage.ref(filePath);
    let task = this.storage.upload(`${this.imageFile}/`, file);//${image_name}
    let app = this;
   
    task.then(function(data) {
      fileRef.getDownloadURL().subscribe(url => {
        let eObj ={
          img_name:data.metadata.name,
          img_url: url
        }
        app.goVote(eObj);
        app.myPhoto = '';
      });
    }).catch(function(error) {
    }).finally(()=>{
    })
  }

  goDeleteBanner(){
  // event.stopPropagation();
    var app = this;
    this.ogcatDialog.confirm("您確定要刪除此圖片嗎?", {
      success:function(){
        app.deleteBanner();
      }
    })
  }

  //刪除
  deleteBanner(){
    let url = this.myPhoto;
    let app =this;
    this.http.deleteImage(url, {
      success:function(data){
        
        if(app.photo_delete == true){
          app.goVote('img-item-del');
          app.photo_delete = false;
        }else{
          app.myPhoto = '';
          app.goVote('img-del');
        }
      
      }
    })
  }


    
}
