import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  errorMessage: string = "";

  constructor(private fb:FormBuilder, private authService: AuthService, private router: Router, private gameService: GameService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    })
  }

  processLogin(){
    this.authService.login(this.form.get('username').value, this.form.get('password').value)
    .subscribe( response => {
      this.gameService.username = this.form.get('username').value;
      this.router.navigate(['/game']);
    },
      err => {
        if((err.error).includes('Incorrect username and password')){
          this.errorMessage = 'Incorrect username or password. Please try again.'
        }
          
    });
  }
}
