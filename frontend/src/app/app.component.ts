import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Reku';

  constructor(private authService:AuthService, private router:Router){}

  ngOnInit(){
    // this.router.navigate(['/']);
    this.authService.verifyJwt().subscribe( response => {
      if(response['success']) {
        console.log('test');
        this.authService.isAuth = true;
        this.authService.authStatusListener.next(true);
        this.router.navigate(['/game']);
      }
    })
  }

}
