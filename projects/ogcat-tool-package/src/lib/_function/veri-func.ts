import { FormControl } from '@angular/forms';




export function email(email: FormControl) {
    let reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    return reg.test(email.value) ? null : {
        validateEmail: false
      };
}



export function nickname(nick: FormControl) {
  return nick.value.trim()!='' ? null : {
    validateEmail: false
  }; 
}
