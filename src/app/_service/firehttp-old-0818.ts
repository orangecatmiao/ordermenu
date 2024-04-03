import { Injectable } from "@angular/core";
import { Calendar } from '../_factory/calendar';


@Injectable()
export class Firehttp {

    constructor(private calendar: Calendar){}
    

    /**
     * 
     * @param pointer 
     * @param db 
     * @param addObj 
     * @param callback 
     */
    create(pointer, db:string, addObj, callback ){
        var ref = pointer.firestore.collection(db);
        if(addObj.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
       
        addObj.created = this.calendar.getStrYMDHMSbyObj(new Date());
        //addObj.updated =null; 

        ref.add(addObj).then((data) => {
            pointer.ogcatTool.showMessage("新增成功 !!");
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            pointer.ogcatTool.showErrorMessage("新增失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(addObj.show==null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }





    /**
     * 
     * @param pointer 
     * @param db 
     * @param addArray 
     * @param callback 
     */
    createMultiple(pointer, db:string, addArray, callback ){
        let app =this;
        var ref = pointer.firestore.firestore.batch();
        if(addArray.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        addArray.forEach((doc) => {
            doc.created = app.calendar.getStrYMDHMSbyObj(new Date());
           // doc.updated =null; 
            var docRef = pointer.firestore.firestore.collection(db).doc();
            ref.set(docRef, doc);
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            pointer.ogcatTool.showMessage("新增成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            pointer.ogcatTool.showErrorMessage("新增失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(addArray.show==null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }



    /**
     * 
     * @param pointer this
     * @param db 資料庫的物件
     * @param id 資料 ID
     * @param updateObj 要更新的物件
     * @param callback {success:function, error:function, finally:function}
     */
    update(pointer, db:string, id:string, updateObj, callback ){
       
        if(updateObj.show == null){
            pointer.ogcatTool.loadingMask(true);
        }
    
        updateObj.updated = this.calendar.getStrYMDHMSbyObj(new Date());
   
        pointer.firestore.collection(db).doc(id).update(updateObj).then(function(data) {
            if(updateObj.show == null){
                pointer.ogcatTool.showMessage("修改成功 !!");
            }
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            pointer.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
            pointer.ogcatTool.showErrorMessage(error);
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(updateObj.show == null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }



  /**
     * 
     * @param pointer 
     * @param db 
     * @param updateArray 
     * @param callback 
     */
    updateMultiple(pointer, db:string, updateArray, callback ){
        let app =this;
        var ref = pointer.firestore.firestore.batch();
        if(updateArray.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        updateArray.forEach((doc) => { 
            doc.updated = app.calendar.getStrYMDHMSbyObj(new Date()); 
            var docRef = pointer.firestore.firestore.collection(db).doc(doc.id);
            ref.update(docRef, doc);
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            pointer.ogcatTool.showMessage("修改成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            pointer.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(updateArray.show==null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }






    /**
     * 
     * @param pointer 
     * @param db 
     * @param id 
     * @param callback 
     */
    delete(pointer, db, id, callback){
        pointer.ogcatTool.loadingMask(true);
        pointer.firestore.collection(db).doc(id).delete()
        .then(function(data) {
            pointer.ogcatTool.showMessage("刪除成功 !!");
            if(callback.success){
                callback.success(data);
            }
        }).catch(function(error) {
            pointer.ogcatTool.showErrorMessage("刪除失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            pointer.ogcatTool.loadingMask(false);
        });
    }



 /**
     * 
     * @param pointer 
     * @param db 
     * @param deleteArray 
     * @param callback 
     */
    deleteMultiple(pointer, db:string, deleteArray, callback ){
        let app =this;
        var ref = pointer.firestore.firestore.batch();
        if(deleteArray.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
        let add_list=[];
        deleteArray.forEach((doc) => { 
            var docRef = pointer.firestore.firestore.collection(db).doc(doc.id);
            ref.delete(docRef, doc);
            doc.id = docRef.id;
            add_list.push(doc);
        });

        ref.commit().then(() => {
            pointer.ogcatTool.showMessage("修改成功 !!");
            if(callback.success){
                callback.success(add_list);
            }
        }).catch(function(error) { 
            pointer.ogcatTool.showErrorMessage("修改失敗!!");
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(deleteArray.show==null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }






    /**
     * 
     * @param pointer 
     * @param img_full_path 
     * @param callback 
     */
    deleteImage(pointer, img_full_path, callback){
        pointer.storage.storage.refFromURL(img_full_path).delete().then(function(data) {
            pointer.ogcatTool.showMessage("圖片刪除成功 !!");
            if(callback.success){
                callback.success(data);
            }
          }).catch(function(error) {
              pointer.ogcatTool.showErrorMessage("圖片刪除失敗!!");
              if(callback.error){
                  callback.error(error);
              }
          }).finally((data)=>{ 
              if(callback.finally){
                  callback.finally(data);
              }
              pointer.ogcatTool.loadingMask(false);
          });
    }



    /**
     * 
     * @param pointer 
     * @param obj  { db:'store-info', uid:'useruid', limit: 5, orderby:{field:'name',sort:'desc'}, }  
     * @param callback 
     */
    getByUid(pointer, obj, callback ){
        
        if(obj.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
    
        let ref = this.getRef(pointer, obj);
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
                    pointer.ogcatTool.showMessage("資料取得成功 !!");
                }
               
            }
        }).catch(function(error) { debugger;console.log(error)
            if(obj.show==null){
                pointer.ogcatTool.showErrorMessage("資料取得失敗!!");
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
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }


    /**
     * 
     * @param pointer 
     * @param obj : {db:string 資料庫名稱,  id:string 這筆資料的ID } 
     * @param callback 
     */
    getByID(pointer, obj, callback ){
        if(obj.show==null){
            pointer.ogcatTool.loadingMask(true);
        }
        pointer.firestore.collection(obj.db).doc(obj.id).ref.get().then((querySnapshot) => {
            if(callback.success){
                let info =  querySnapshot.data();
                if(info!=null){
                    info.id = querySnapshot.id;
                }
              
                callback.success(info);
                if(obj.show==null){
                    pointer.ogcatTool.showMessage("資料取得成功 !!");
                }
            }
        }).catch(function(error) {// debugger;console.log(error);
            if(obj.show==null){
                pointer.ogcatTool.showErrorMessage("資料取得失敗!!");
            }
           
            if(callback.error){
                callback.error(error);
            }
        }).finally((data)=>{ 
            if(callback.finally){
                callback.finally(data);
            }
            if(obj.show==null){
                pointer.ogcatTool.loadingMask(false);
            }
        });
    }



    //==============================  其他 ================================
    getRef(pointer, obj){
        if(obj.ref!=null){
            return obj.ref; 
        }
        let ref =  pointer.firestore.collection(obj.db).ref.where('uid','==', obj.uid);
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