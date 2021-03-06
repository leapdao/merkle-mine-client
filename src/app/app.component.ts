import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { abis } from '../abis';
import { switchMap } from 'rxjs/operators';
import Web3 from '../web3_workaround';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { FormBuilder, Validators, AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

declare global {
  interface Window { ethereum: any; }
}

function ethAddressValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const address = control.value;
    console.log(nameRe.test(address));
    if (!nameRe.test(address)) {
      // check if it has the basic requirements of an address
      return { 'address': true };
    }
    // If it's all small caps or all all caps, return true
    return null;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  web3: any;
  merkleMine: any;

  protected address: string;
  protected error: string;
  protected success: string;
  protected proof: any;
  protected loading: boolean;
  protected addressForm;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    // Observable.bind
  }
  ngOnInit() {
    this.web3 = new Web3(environment.eth_nodes[0]);
    this.merkleMine = new this.web3.eth.Contract(abis[0], environment.contract_addresses[0]);

    this.addressForm = this.fb.group({
      address: new FormControl('', {
        validators: [Validators.required, ethAddressValidator(/^(0x)?[0-9a-f]{40}$/i)],
        updateOn: 'change',
      }),
    });
  }

  getProof(add: string) {
    const address = add.toLocaleLowerCase();

    const generatedObs = bindNodeCallback(cb => this.merkleMine.methods.generated(address).call(cb));
    if (!add) {
      this.error = 'Please enter a valid address';
      return;
    }
    this.loading = true;
    this.http.get(`${environment.base_url}${add}`)
      .pipe(
        switchMap(
          (v: any) => {
            this.loading = false;
            if (v !== null) {
              this.proof = v.proof;
              return generatedObs();
            } else {
              this.error = 'Sorry, Your address does not exist!';
              return ErrorObservable.create(this.error);
            }
          }
        ),
      ).subscribe(v => {
          this.success = 'Congratulations. Your address has been found! Claim your tokens now!';
      }, e => {
        // error
      }
    );
  }

  async claim(addr) {
    if (window.ethereum) {
      await window.ethereum.enable();
      const address = addr.toLowerCase();
      const generateEventObs = bindNodeCallback(cb => this.merkleMine.events.Generate({filter: { address }}, cb));
      const generateObs = bindNodeCallback(cb => this.merkleMine.methods.generate(address, this.proof).call(cb));
      generateObs().pipe(
        switchMap((e, txHash) => {
          console.log(e, txHash);
          return generateEventObs();
        })
      ).subscribe(
        v => {
          console.log(v);
          alert('You have received tokens!');
        },
        e => {
          console.log(e);
        }
      );
    } else {
      // no metamask
    }
  }
}
