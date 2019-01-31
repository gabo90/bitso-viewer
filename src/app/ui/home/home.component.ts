import { Component, OnInit } from '@angular/core';
import { first, map } from 'rxjs/operators';
// services
import { TradeService } from '../../services/trade.service'
import { Api } from '../../services/api.service'
// models
import { Trade } from "../../models/trade";
// vendor
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  ws: any;
  trades: Trade[];
  now:any = moment;
  filter_active:boolean = false;

  constructor(private tradeService:TradeService) { this.trades = []; }

  ngOnInit() {
    this.tradeService.getAll()
      .pipe(first())
      .subscribe(
        (trades) => {
          this.trades = trades;
          this.listen();
        },
        err => {
          console.log(err);
        }
      ) 
  }

  listen() {
    this.ws = new WebSocket(Api.BITSO_CHANNEL);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'trades' }));
    }

    this.ws.onmessage = (message) =>{
      let data = JSON.parse(message.data);
  
      if (data.type == 'trades' && data.payload) {
        for (let t of data.payload) {
          let trade: Trade = {
            tid: t.i,
            book: data.book,
            amount: t.a,
            rate: t.r,
            value: t.v,
            maker_side: t.t
          }

          this.saveTrade(trade)
        }
      }
    }
  }

  getTrades(event) {
    let value = event.target.value;
    let range = {}
    if (value)
    {
      this.filter_active = true;
      let now_ = this.now().utc();
      let from_date = now_.add(-value, 'hours');
      let to_date = this.now().utc();
      range = { from_date: from_date.format(), to_date: to_date.format() }
    }
    else
    {
      this.filter_active = false;
    }

    this.tradeService.getAll(range)
      .pipe(first())
      .subscribe(
        (trades) => {
          this.trades = trades;
        },
        err => {
          console.log(err);
        }
      ) 
  }

  saveTrade(trade) {
    this.tradeService.createTrade(trade)
      .pipe(first())
      .subscribe(
        (resp) => {
          if (!this.filter_active)
            this.trades.push(resp)
        },
        err => {
          console.log(err);
        }
      )
  }
}
