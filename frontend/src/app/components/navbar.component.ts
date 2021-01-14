import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuth: boolean = false;
  private authListenerSub$: Subscription;

  constructor(private authService:AuthService, private router:Router) { }

  ngOnInit(): void {
    this.isAuth = this.authService.getIsAuth();
    this.authListenerSub$ = this.authService.getAuthStatusListener()
                                .subscribe(isAuth => {
                                  this.isAuth = isAuth
                                });
  }

  logout(){
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSub$.unsubscribe();
  }
}
