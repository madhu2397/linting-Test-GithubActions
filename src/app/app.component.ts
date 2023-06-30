import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pipes in angular';
  users: any[] = [
    {name: "Madhuri", salary:25, city:"Nesari", DOB: new Date("11/23/1997")},
    {name: "Asmita", salary:24, city:"Halkarni", DOB:new Date ("11/10/1998")},
    {name: "Priyanka", salary:23, city:"Bhadgaon", DOB: new Date("11/26/1998")},
    {name: "Geet", salary:25, city:"Gadhinglaj", DOB:new Date( "10/17/1997")},

  ]
}
