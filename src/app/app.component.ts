import { Component, OnInit, InjectionToken, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare let Web3: any;
import { environment } from '../environments/environment';
import { abis } from '../abis';


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

  constructor(private http: HttpClient) {

  }
  ngOnInit() {
    this.web3 = new Web3(window.web3.currentProvider);
    const contract = this.web3.eth.contract(abis[0]);
    this.merkleMine = contract.at(environment.contract_addresses[0]);
    console.log(this.web3);
  }

  getProof(add: string) {
    if (!add) {
      // show error
      return;
    }
    this.http.get(`${environment.base_url}${add}`).subscribe((v: any) => {
      if (v !== null) {
        console.log(v.address.toLowerCase());
        this.merkleMine.generate(v.address.toLowerCase(), v.proof, (e) => {
          console.log(e);
        });
      } else {
        // error case
      }

    });
  }

}
