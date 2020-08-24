
// import { Content } from "@ionic/angular";
import {
  Directive,
  ElementRef,
  Input,
  Renderer2
} from "@angular/core";
import { DomController } from '@ionic/angular';
import { AfterViewInit, OnInit } from '@angular/core';

@Directive({
  selector: "[scroll-hide]",
  inputs: ["scrollContent"] // make sure you add this inputs array with the scrollContent value in order for the @Input to be recognized!
})
export class ScrollHideDirective implements AfterViewInit, OnInit {
  @Input('scrollContent') scrollArea;

  @Input('minHeight') minHeight;
  @Input('triggerDistance') triggerDistance;
  // To detect what position the header is in so that you don't trigger too many events into the dom
  private hidden: boolean = false;
  //private triggerDistance: number = 90;

  constructor(private element: ElementRef, private renderer: Renderer2, private domCtrl: DomController) {


  }

  ngOnInit() {
    if(this.minHeight == null || isNaN(this.minHeight)){
      this.minHeight = 175;
    }

    if(this.triggerDistance == null || isNaN(this.triggerDistance)){
      this.triggerDistance = 90;
    }
  }

  ngAfterViewInit() {

    // console.log(this.scrollArea)
    console.log(this.element.nativeElement.height);
    this.initStyles();
    this.scrollArea.ionScroll.subscribe((scrollEvent: CustomEvent) => {

      let delta = scrollEvent.detail.deltaY;

      if (scrollEvent.detail.currentY === 0 && this.hidden) {
        this.show();
      }
      else if (!this.hidden && delta > this.triggerDistance) {
        this.hide();
      } else if (this.hidden && delta < -this.triggerDistance) {
        this.show();
      }

    });
  }

  initStyles() {

    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'transition', '0.3s linear');
    });

  }

  hide() {

    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'min-height', '0px');
      this.renderer.setStyle(this.element.nativeElement, 'height', '0px');
      this.renderer.setStyle(this.element.nativeElement, 'opacity', '0');
      this.renderer.setStyle(this.element.nativeElement, 'padding', '0');
    });

    this.hidden = true;

  }

  show() {

    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'height', `${this.minHeight}px`);
      this.renderer.removeStyle(this.element.nativeElement, 'opacity');
      this.renderer.removeStyle(this.element.nativeElement, 'min-height');
      this.renderer.removeStyle(this.element.nativeElement, 'padding');
    });

    this.hidden = false;

  }

}