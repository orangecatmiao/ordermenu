import { Injectable } from '@angular/core';


@Injectable()
export class RandomFactory {

  constructor() {}//private ds: DataService


  getRandomLetter(max){
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 0; i < max; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }


  getRandomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }


  getRandomUID(mcode:string){
    let uid = mcode + '-' + new Date().getTime() + '-' +this.getRandomLetter(5);
    return uid;
  }








}
