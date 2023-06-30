import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(value: any): any {
  let cureentYear : any = new Date().getFullYear()
  let birthYear : any = new Date(value ).getFullYear()

  let age = cureentYear - birthYear
        // console.log(value);
    return age;    
  }

}
