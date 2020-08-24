/**
 * Chart Info Tab
 */
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartService } from '../services/chart.service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { CustomLoaderService } from '../services/loader-operator.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild("lineCanvasType1") lineCanvasType1: ElementRef;
  @ViewChild("lineCanvasType2") lineCanvasType2: ElementRef;
  @ViewChild("lineCanvasType3") lineCanvasType3: ElementRef;
  @ViewChild("lineCanvasType4") lineCanvasType4: ElementRef;
  private lineChartList: Chart[] = [];
  private lineCanvasList: ElementRef[] = [];
  private dataList: { labels, data }[] = [];

  private lineChartOptions = [
    {
      labelText: '分數',
      options:{
        scales: {
          yAxes: [{ticks: { max: 6, min: 0, stepSize: 1 }}]
        }
      }
    },{
      labelText: '時間',
      options:{
        scales: {
          yAxes: [{ticks: { max: 24, min: 0, stepSize: 4 }}]
        }
      }
    },{
      labelText: '時間',
      options:{
        scales: {
          yAxes: [{ticks: { max: 24, min: 0, stepSize: 4 }}]
        }
      }
    },{
      labelText: '公里',
      options:{
        scales: {
          yAxes: [{ticks: { min: 0, stepSize: 2 }}]
        }
      }
    }
  ]

  constructor(private http: HttpClient,
    private chartService: ChartService,
    public loadingController: LoadingController, private loaderService: CustomLoaderService) { }
  ngAfterViewInit(): void {
    // throw new Error("Method not implemented.");
    this.lineCanvasList.push(this.lineCanvasType1);
    this.lineCanvasList.push(this.lineCanvasType2);
    this.lineCanvasList.push(this.lineCanvasType3);
    this.lineCanvasList.push(this.lineCanvasType4);

  }
  ngOnDestroy(): void {
    this.destroyed$.next(true);
  }

  prepareData(data, type) {
    let dataKey = type === 4 ? 'Distance' : 'write';
    let labelKey = 'Datetime';
    let resultData = {labels: [], data: []};
    data.map((x)=>{
      // console.log(x, moment(x[labelKey]));
      resultData.labels.push(moment(x[labelKey]).format('MM/DD'));
      if(type === 2 || type === 3) {
        resultData.data.push(moment(x[labelKey]).hour()+(moment(x[labelKey]).minute()/60));
      }
      else if(type === 4) {
        resultData.data.push(x[dataKey]/1000);
      }
      else {
        resultData.data.push(x[dataKey]);
      }
      
    });
    return resultData;
  }

  ngOnInit(): void {

    // this.presentLoading();
    // this.loadData();

  }
  loadData() {
    forkJoin(
      this.chartService.getChartInfo('1'),
      this.chartService.getChartInfo('2'),
      this.chartService.getChartInfo('3'),
      this.chartService.getChartInfo('4'))
      .pipe(
        
        map(([respType1, respType2, respType3, respType4]) => {
          return [
            respType1.success === 1 ? this.prepareData(respType1.data,1) : { labels: [], data: [] },
            respType2.success === 1 ? this.prepareData(respType2.data,2) : { labels: [], data: [] },
            respType3.success === 1 ? this.prepareData(respType3.data,3) : { labels: [], data: [] },
            respType4.success === 1 ? this.prepareData(respType4.data,4) : { labels: [], data: [] },
          ];
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        ([respType1, respType2, respType3, respType4]) => {
          // this.loadingController.dismiss();
          // console.log(respType1, respType2, respType3, respType4);
          this.dataList = [respType1, respType2, respType3, respType4];
          this.prepareChart();
        });
  }
  
  prepareChart() {
    this.lineCanvasList.forEach((lineCanvas, idx) => {
      this.lineChartList.push(new Chart(lineCanvas.nativeElement, {
        type: "line",
        options: this.lineChartOptions[idx].options,
        data: {
          labels: this.dataList[idx]?.labels,
          datasets: [
            {
              label: this.lineChartOptions[idx].labelText,
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba(75,192,192,1)",
              borderCapStyle: "butt",
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter",
              pointBorderColor: "rgba(75,192,192,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(75,192,192,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: this.dataList[idx]?.data,
              spanGaps: false
            }
          ]
        }
      }));
    });

  }

  ionViewDidEnter() {
    this.loadData();
    // console.log('on ionViewDidEnter');
  }



}
