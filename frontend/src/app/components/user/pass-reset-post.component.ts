import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-pass-reset-post',
  templateUrl: './pass-reset-post.component.html',
  styleUrls: ['./pass-reset-post.component.css']
})
export class PassResetPostComponent implements OnInit {

  form: FormGroup;
  errorMessage: string = "";

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private activatedRoute : ActivatedRoute) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    });
   }

  ngOnInit(): void {
  }

  processForm() {
    this.authService.resetPassPost(this.form.get('password').value, this.activatedRoute.snapshot.params.token)
      .subscribe( resp => {
        this.router.navigate(['/login']);
      }, err => {
        this.errorMessage = err.error.error;
      })
  }

}
