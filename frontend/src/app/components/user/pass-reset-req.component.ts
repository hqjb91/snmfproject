import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-pass-reset-req',
  templateUrl: './pass-reset-req.component.html',
  styleUrls: ['./pass-reset-req.component.css']
})
export class PassResetReqComponent implements OnInit {

  form: FormGroup;
  errorMessage: string = "";

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required]]
    });
   }

  ngOnInit(): void {
  }

  processForm() {
    this.authService.resetPassReq(this.form.get('username').value).subscribe( resp => {
      this.router.navigate(['/login']);
    }, err => {
      console.error(err.error.error);
      this.errorMessage = err.error.error;
    });

  }

}
