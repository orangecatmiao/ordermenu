import { Injectable } from "@angular/core";
import { Calendar } from '../_factory/calendar';
import { OgcatTool } from '../../../projects/ogcat-tool-package/src/public-api';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from "@angular/fire/storage";
//import { AngularFireAuth } from '@angular/fire/auth';

@Injectable()
export class Firehttp {

    constructor(
        private calendar: Calendar, 
        private ogcatTool:OgcatTool,
        private firestore: AngularFirestore,
        private storage: AngularFireStorage, 
        private firedatabase:AngularFireDatabase,
        //private auth:AngularFireAuth
    ){}
    

    /**
     * 
     * @param db 
     * @param addObj 
     * @param callback 
     */
    create(db:string, addObj, callback ){
        let app= this;
        var ref = app.firestore.collection(db);
        if(addObj.show==null){
            app.ogcatTool.loadingMask(true);
        }
        delete addObj.show;
        addObj.created = this.calendar.getStrYMDHMSbyObj(new Date());
        //addObj.updated =null; 

        ref.add(addObj).then((data) => {
            app.ogcatTool.showMessage("新增成功 !!");
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            app.ogcatTool.showErrorMessage("新增失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(addObj.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }





    /**
     * 
     * @param db 
     * @param addArray 
     * @param callback 
     */
    createMultiple(db:string, addArray, callback ){
        let app =this;
        var ref = app.firestore.firestore.batch();
        if(addArray.show==null){
            app.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        addArray.forEach((doc) => {
            doc.created = app.calendar.getStrYMDHMSbyObj(new Date());
           // doc.updated =null; 
            var docRef = app.firestore.firestore.collection(db).doc();
            ref.set(docRef, doc);
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            app.ogcatTool.showMessage("新增成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            app.ogcatTool.showErrorMessage("新增失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(addArray.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }



    /**
     * 
     * @param db 資料庫的物件
     * @param id 資料 ID
     * @param updateObj 要更新的物件
     * @param callback {success:function, error:function, finally:function}
     */
    update(db:string, id:string, updateObj, callback ){
        let app=this;
        if(updateObj.show == null){
            app.ogcatTool.loadingMask(true);
        }
        delete updateObj.show;
        updateObj.updated = this.calendar.getStrYMDHMSbyObj(new Date());
   
        app.firestore.collection(db).doc(id).update(updateObj).then(function(data) {
            if(updateObj.show == null){
                app.ogcatTool.showMessage("修改成功 !!");
            }
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            app.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
            app.ogcatTool.showErrorMessage(error);
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(updateObj.show == null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }



  /**
     * 
     * @param db 
     * @param updateArray 
     * @param callback 
     */
    updateMultiple(db:string, updateArray, callback ){
        let app =this;
        var ref = app.firestore.firestore.batch();
        if(updateArray.show==null){
            app.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        updateArray.forEach((doc) => { 
            doc.updated = app.calendar.getStrYMDHMSbyObj(new Date()); 
            var docRef = app.firestore.firestore.collection(db).doc(doc.id);
            ref.update(docRef, doc);
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            app.ogcatTool.showMessage("修改成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            app.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(updateArray.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }






    /**
     * 
     * @param db 
     * @param id 
     * @param callback 
     */
    delete(db:string, id:string, callback){
        let nn:Array<object> =[{ aaa:100 }]
        let app =this;
        app.ogcatTool.loadingMask(true);
        app.firestore.collection(db).doc(id).delete()
        .then(function(data) {
            app.ogcatTool.showMessage("刪除成功 !!");
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            app.ogcatTool.showErrorMessage("刪除失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            app.ogcatTool.loadingMask(false);
        });
    }



 /**
     * 
     * @param db 
     * @param deleteArray 
     * @param callback 
     */
    deleteMultiple(db:string, deleteArray, callback ){
        let app =this;
        var ref = app.firestore.firestore.batch();
        if(deleteArray.show==null){
            app.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        deleteArray.forEach((doc) => { 
            var docRef = app.firestore.firestore.collection(db).doc(doc.id);
            ref.delete(docRef);//deleteMultiple
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            app.ogcatTool.showMessage("修改成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            app.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(deleteArray.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }






    /**
     * 
     * @param img_full_path 
     * @param callback 
     */
    deleteImage(img_full_path, callback){
        let app=this;
        app.storage.storage.refFromURL(img_full_path).delete().then(function(data) {
            app.ogcatTool.showMessage("圖片刪除成功 !!");
            if(callback.success){
                callback.success(data);
            }
          }).catch(function(error) {
              app.ogcatTool.showErrorMessage("圖片刪除失敗!!");
              if(callback.error){
                  callback.error(error);
              }
          }).finally(()=>{ 
              if(callback.finally){
                  callback.finally();
              }
              app.ogcatTool.loadingMask(false);
          });
    }



    /**
     * 
     * @param obj   db:'store-info', uid:'useruid', limit: 5, orderby:{field:'name',sort:'desc'},  
     * @param callback 
     */
    getByUid(obj, callback ){
         let app= this;
        if(obj.show==null){
            app.ogcatTool.loadingMask(true);
        }
    
        let ref = this.getRef(obj);
        ref.get().then((querySnapshot) => {
            if(callback.success){
                let list=[];
                var nextVisible = querySnapshot.docs[querySnapshot.docs.length-1];
                var preVisible = querySnapshot.docs[querySnapshot.docs.length-2];
                let pageObj={
                    next:nextVisible,
                    prev:preVisible
                }
                querySnapshot.forEach(function(doc) {
                    let obj = doc.data();
                    obj.id = doc.id;
                    obj.copy = JSON.parse(JSON.stringify(obj));
                    list.push(obj); // console.log(doc.id, " => ", doc.data());
                });
                callback.success(list, pageObj);
                if(obj.show==null){
                    app.ogcatTool.showMessage("資料取得成功 !!");
                }
               
            }
        }).catch(function(error) { debugger;console.log(error)
            if(obj.show==null){
                app.ogcatTool.showErrorMessage("資料取得失敗!!");
            }
           
            if(callback.error){
                callback.error(error);
            }
            //console.log(error)
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(obj.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }


    /**
     * 
     * @param obj : {db:string 資料庫名稱,  id:string 這筆資料的ID } 
     * @param callback 
     */
    getByID(obj, callback ){
        let app = this;
        if(obj.show==null){
            app.ogcatTool.loadingMask(true);
        }
        app.firestore.collection(obj.db).doc(obj.id).ref.get().then((querySnapshot) => {
            if(callback.success){
                let info =  querySnapshot.data();
                if(info!=null){
                    info['id'] = querySnapshot.id;
                }
              
                callback.success(info);
                if(obj.show==null){
                    app.ogcatTool.showMessage("資料取得成功 !!");
                }
            }
        }).catch(function(error) {// debugger;console.log(error);
            if(obj.show==null){
                app.ogcatTool.showErrorMessage("資料取得失敗!!");
            }
           
            if(callback.error){
                callback.error(error);
            }
        }).finally(()=>{ 
            if(callback.finally){
                callback.finally();
            }
            if(obj.show==null){
                app.ogcatTool.loadingMask(false);
            }
        });
    }



    //==============================  其他 ================================
    getRef(obj){
        if(obj.ref!=null){
            return obj.ref; 
        }
        let ref =  this.firestore.collection(obj.db).ref.where('uid','==', obj.uid);
        return ref;
    }


}



/**
 * getRef(pointer, obj){
    let ref;
    if(obj.orderby!=null){
        ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid).orderBy(obj.orderby.field, obj.orderby.sort);
    }else if(obj.limit !=null  && obj.pageObj==null){
       ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid).orderBy('start', 'desc').limit(obj.limit)//
       console.log("這兒呢")
    }else if(obj.limit !=null && obj.pageObj!=null){
      ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid).orderBy('start', 'desc').startAfter(obj.pageObj).limit(obj.limit)
      console.log("這兒才對")
    }else if(obj.orderby!=null && obj.limit !=null){
        ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid).orderBy(obj.orderby.field, obj.orderby.sort).startAt(obj.start).limit(obj.limit);
    }else{
        ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid);
    }
    return ref;
}


 */















/**
 * 
 *  uploadImage(){
    var n = Date.now();
    const file = this.upoladPhoto.file;
    const filePath = `myImages/${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`myImages/${n}`, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if (url) {
              this.fb = url;
            }
            console.log(this.fb);
          });
        })
      )
      .subscribe(url => {
        if (url) {
          console.log(url);
        }
      });
  }
 */



 /**
  *  uploadImage(){
    var name = this.uid;
    const file = this.upoladPhoto.file;
    const filePath = `storeImages/${name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`storeImages/${name}`, file);
   
    task.then(function(data) {
      //'https://firebasestorage.googleapis.com/v0/b/'+ environment.firebase.storageBucket +'/o/storeImages/%2f'+ jpgname +'?alt=media&token=' + token
      //data.metadata.name 圖片名稱
    
      fileRef.getDownloadURL().subscribe(url => {
        console.log(data)
        console.log("路徑",url)
        //todo 取得 token 後回存
      });
      
    }).catch(function(error) {
    
    }).finally(()=>{

    })
  }
  */