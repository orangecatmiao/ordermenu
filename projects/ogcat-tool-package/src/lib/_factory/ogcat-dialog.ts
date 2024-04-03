declare var bootbox: any;
import { Injectable } from '@angular/core';


@Injectable()

export class OgcatDialog {
    buttons = {
        confirm: {
            label: '確定',
            className: 'btn-primary'
        },
        cancel: {
            label: '取消',
            className: 'btn-light'
        },
    }

    buttonsALERT= {
        ok: {
            label: '確定',
            className: 'btn-primary'
        },
    }
    constructor() {}

    /**
     * 確認對話框
     * @param mobj 
     * @param callback 回呼函示
     */
    confirm(mobj:any, callback?:object){
        if(typeof mobj =='string'){
            mobj ={
                message:mobj,
            }
            if(callback){
                mobj.callback = callback;
            }
        }
        let org={
            message:"",
            buttons: this.buttons,
        }
        var messageObj = Object.assign(org,mobj)
        bootbox.confirm({
            message: messageObj.message,
            buttons: messageObj.buttons,
            callback: function (result) {
                if(result===true){
                    if(messageObj.callback && messageObj.callback.success){
                        messageObj.callback.success();
                    }
                }else{
                    if(messageObj.callback && messageObj.callback.error){
                        messageObj.callback.error();
                    }
                }
            
            }
        });
    }


    /**
     * 提醒(警示)對話框
     * @param str 顯示的字串
     * @param callback 
     */
    alert(str: string, callback?:Function){
        bootbox.alert({
            message: str,
            size: 'small',
            buttons:this.buttonsALERT,
            callback: function () {
                if(callback){
                    callback();
                }
            }
        })
    }

    /**
     * 提示對話框
     * @param mobj 
     * @param callback 
     */
    prompt(mobj:any, callback?:Function){
        let org={
            title:"提示視窗",
            message:"",
            inputType:"text",
            buttons: this.buttons,
        }
        var messageObj = Object.assign(org,mobj)
        bootbox.prompt({
            title: messageObj.title,
            inputType: messageObj.inputType,
            buttons: messageObj.buttons,
            callback: function (result) {
                if(callback){
                    callback(result);
                }
            }
        });
    }
    

}
