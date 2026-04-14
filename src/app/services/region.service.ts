import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegionService {

  constructor(private http: HttpClient) {}

  getRegion(lang: string, region: string): Observable<any> {
    console.log(`[RegionService] Fetching region data for ${region} in language ${lang}`);
    return this.http.get(`/assets/data/${lang}/${region}.json`);
  }
}
