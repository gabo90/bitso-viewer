import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// models
import { Trade } from '../models/trade';
// services
import { Api } from '../services/api.service';

export interface Message {
	action: string,
  book: string,
  type: string
}

@Injectable()
export class TradeService {
  
  constructor(
    private http: HttpClient
  ){}

  getAll(range?:any) {
    let query = range ? range : "";
    return this.http.get<Trade[]>(Api.TRADES, {params: query});
  }

  createTrade(trade: Trade) {
    return this.http.post<Trade>(Api.TRADES, trade);
  }
}