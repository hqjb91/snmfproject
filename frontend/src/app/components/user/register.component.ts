import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup;
  errorMessage: string = "";

  constructor(private fb:FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    })
  }

  processRegister(){
    this.authService.register(this.form.get('username').value, this.form.get('password').value, this.form.get('email').value)
      .subscribe( response => {
        this.router.navigate(['/login']);
      },
        err => {
          if(err.error.error == "User already registered") {
            this.errorMessage = "User already registered. Please try another username."
          }
      });
  }
}
