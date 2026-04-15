import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { RegionService } from '../services/region.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RegionResolver implements Resolve<any> {

  constructor(private regionService: RegionService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const region = route.paramMap.get('region')!;
    return this.regionService.getRegion(region);
  }
}
