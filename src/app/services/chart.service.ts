/**
 * 取得使用者回饋資料
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CustomLoaderService } from './loader-operator.service';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(private http: HttpClient, private loaderService: CustomLoaderService) { }
  /**
   * 11.	[GET] 取得生活作息與GPS資訊(用於使用者回饋的圖表)
   * http://140.116.82.102:8080/apptext/SelectInfChart.php?at=&ict=
   * 
	 * (at)account = 0-9^A-Z^a-z^_
	 * (ict)work class= 1-4
   */
  getChartInfo(work): Observable<any> {
    const options = {
      params: { qat: '', ict: work }
    };
    return of('').pipe(
      this.loaderService.load(
        mergeMap(() => this.http.get(`SelectInfChart.php`, options))
      )
    );
  }
}
