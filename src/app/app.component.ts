import { Component, OnInit, InjectionToken, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { abis } from '../abis';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs/Observable/of';

declare let Web3: any;

declare global {
  interface Window { web3: any; }
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

  constructor(private http: HttpClient) {

  }
  ngOnInit() {
    this.web3 = new Web3(window.web3.currentProvider);
    const contract = this.web3.eth.contract(abis[0]);
    this.merkleMine = contract.at(environment.contract_addresses[0]);
    console.log(this.merkleMine);
  }

  getProof(add: string) {
    if (!add) {
      this.error = 'Please enter a valid address';
      return;
    }
    this.loading = true;
    this.http.get(`${environment.base_url}${add}`)
    .subscribe((v: any) => {
      console.log(v);
      if (v !== null) {
        this.proof = v.proof;
        this.merkleMine.generated(add.toLocaleLowerCase(), (error, claimed) => {
          this.loading = false;
          if (!claimed) {
            this.error = 'Amount already claimed';
          } else {
            this.success = 'Congratulations! Your address has been found! Claim your tokens now!';
          }
        });
      } else {
        this.loading = false;
        this.error = 'Sorry, Your address does not exist!';
      }
    });
  }

  claim(addr) {
    this.merkleMine.generate(addr.toLowerCase(), this.proof, (e, val) => {
      const address = val;
      this.merkleMine.Generate().watch({filter: { address }}, () => {
        // event mined. user has been paid out;
      });
    });
  }
}
