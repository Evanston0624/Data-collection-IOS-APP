import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AlertController, IonInput } from '@ionic/angular';
import { fromEvent, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { CustomLoaderService } from '../services/loader-operator.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
  registrationForm: FormGroup;
  searchField$ = new Subject<string>();
  loading$ = new Subject<boolean>();
  @ViewChild('inputAccount', { static: true }) inputAccount: IonInput | any;
  // checkingAccount = false;
  constructor(private route: Router, private userService: UserService,
              private fb: FormBuilder, private alertCtrl: AlertController,
              private router: Router,
              private loaderService: CustomLoaderService) {

  }


  ngOnInit() {
    //
    this.registrationForm = this.fb.group({
      name: [
        '',
        [Validators.required]
      ],
      account: [
        '',
        [
          Validators.required, Validators.minLength(4), Validators.maxLength(13)
        ]
      ],
      email: [
        '',
        [Validators.required, Validators.minLength(5), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]
      ],
      phone: [
        '',
        [Validators.required, // Validators.minLength(4),Validators.maxLength(14), 
         Validators.pattern('^09+[0-9]{8}$')]
      ],
      password: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(13),
        (control) => this.validatePasswords(control, 'password1')]
      ],
      password2: [
        '',
        [Validators.required, // Validators.minLength(4), Validators.maxLength(13),
        (control) => this.validatePasswords(control, 'password2')]
      ],
    });

    fromEvent(this.inputAccount.el, 'keyup')
      .pipe(
        debounceTime(1000),
        map((event: any) => event.target.value),
        distinctUntilChanged(),
        filter(res => res.length >= 4 && res.length <= 13),
        switchMap(term => this.userService.checkAccount(term))
      )
      .subscribe({
        next: (data) => {
          if (data) {
            if (this.account.hasError('userExist')) {
              this.account.setErrors(null);
            }
          }
          else {
            this.account.setErrors({ userExist: true });
          }
          this.inputAccount.setFocus();
        }
      });
    /*
    load(...operations: OperatorFunction<any, any>[]): UnaryFunction<any, any> {
      return pipe(
        tap(() => this.begin()),
        this.pipeFromArray(operations),
        tap(() => this.finish()),
        catchError((error) => {
          this.finish();
          return throwError(error);
        })
      );
    }
    */
  }
  // pipeFromArray<T = any, R = any>(fns: Array<UnaryFunction<any, any>>): UnaryFunction<T, R>;

  get password1(): AbstractControl {
    return this.registrationForm.get('password');
  }

  get password2(): AbstractControl {
    return this.registrationForm.get('password2');
  }

  get account(): AbstractControl {
    return this.registrationForm.get('account');
  }



  registration() {
    const regUserInfo: RegistrationUserInfoModel = {
      name: this.registrationForm.get('name').value,
      at: this.registrationForm.get('account').value,
      pw: this.registrationForm.get('password').value,
      mobile: this.registrationForm.get('phone').value,
      email: this.registrationForm.get('email').value,
    };

    this.userService.registration(regUserInfo).subscribe({
      next: (result) => {
        this.presentAlert(result);
      },
      error: (err) => { },
      complete: () => { }
    });
  }

  validatePasswords(control: AbstractControl, name: string) {
    if (this.registrationForm === undefined ||
      this.password1.value === '' ||
      this.password2.value === '') {
      return null;
    } else if (this.password1.value === this.password2.value) {
      if (name === 'password1' && this.password2.hasError('passwordMismatch')) {
        this.password1.setErrors(null);
        this.password2.updateValueAndValidity();
      } else if (name === 'password2' && this.password1.hasError('passwordMismatch')) {
        this.password2.setErrors(null);
        this.password1.updateValueAndValidity();
      }
      return null;
    } else {
      return { passwordMismatch: { value: 'The provided passwords do not match' } };
    }
  }

  async presentAlert(regResult) {
    const alert = await this.alertCtrl.create({
      // header: '取得每日資料錯誤',
      // subHeader: 'Subtitle',
      message: regResult ? '註冊成功!!' : '註冊失敗!!',

      buttons: [
        {
          text: '知道了',
          handler: () => {
            if (regResult) {
              this.router.navigate(['/']);
            }
          }
        }]
    });

    await alert.present();
  }
}
