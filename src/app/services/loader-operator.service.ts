/**
 * Loader operator service 
 */

import { OperatorFunction, UnaryFunction, pipe, throwError, Subject, Observable, defer, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, finalize, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

interface loadingMessage {
    status: boolean;
    message?: string;
}

@Injectable()
export class CustomLoaderService {
    private count = 0;
    private isLoading: BehaviorSubject<loadingMessage> = new BehaviorSubject({ status: false });
    private loadingMessage = '';
    isLoading$ = this.isLoading.asObservable();
    constructor() { }
    private prepare<T>(callback: () => void): (source: Observable<T>) => Observable<T> {
        return (source: Observable<T>): Observable<T> => defer(() => {
            callback();
            return source;
        });
    }

    indicate<T>(indicator: Subject<boolean>): (source: Observable<T>) => Observable<T> {
        return (source: Observable<T>): Observable<T> => source.pipe(
            this.prepare(() => indicator.next(true)),
            finalize(() => indicator.next(false))
        )
    }

    private begin() {
        if (this.count === 0) {
            this.isLoading.next({ status: true, message: this.loadingMessage });
        }
        this.count++;
        // console.log('begin', this.count);
    }
    private finish() {
        this.count--;
        // console.log('finish', this.count);
        if (this.count === 0) {
            this.loadingMessage = '';
            this.isLoading.next({status:false});
        }

    }


    private pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
        if (!fns) {
            return this.identity as UnaryFunction<any, any>;
        }

        if (fns.length === 1) {
            return fns[0];
        }

        return function piped(input: T): R {
            return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
        };
    }
    load<T>(): UnaryFunction<T, T>;
    load<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
    load<T, A, B>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>
    ): UnaryFunction<T, B>;
    load<T, A, B, C>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>
    ): UnaryFunction<T, C>;
    load<T, A, B, C, D>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>
    ): UnaryFunction<T, D>;
    load<T, A, B, C, D, E>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>
    ): UnaryFunction<T, E>;
    load<T, A, B, C, D, E, F>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>,
        fn6: UnaryFunction<E, F>
    ): UnaryFunction<T, F>;
    load<T, A, B, C, D, E, F, G>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>,
        fn6: UnaryFunction<E, F>,
        fn7: UnaryFunction<F, G>
    ): UnaryFunction<T, G>;
    load<T, A, B, C, D, E, F, G, H>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>,
        fn6: UnaryFunction<E, F>,
        fn7: UnaryFunction<F, G>,
        fn8: UnaryFunction<G, H>
    ): UnaryFunction<T, H>;
    load<T, A, B, C, D, E, F, G, H, I>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>,
        fn6: UnaryFunction<E, F>,
        fn7: UnaryFunction<F, G>,
        fn8: UnaryFunction<G, H>,
        fn9: UnaryFunction<H, I>
    ): UnaryFunction<T, I>;
    load<T, A, B, C, D, E, F, G, H, I>(
        fn1: UnaryFunction<T, A>,
        fn2: UnaryFunction<A, B>,
        fn3: UnaryFunction<B, C>,
        fn4: UnaryFunction<C, D>,
        fn5: UnaryFunction<D, E>,
        fn6: UnaryFunction<E, F>,
        fn7: UnaryFunction<F, G>,
        fn8: UnaryFunction<G, H>,
        fn9: UnaryFunction<H, I>,
        ...fns: UnaryFunction<any, any>[]
    ): UnaryFunction<T, {}>;
    /* tslint:enable:max-line-length */
    load(...operations: OperatorFunction<any, any>[]): UnaryFunction<any, any> {
        return pipe(
            tap(() => {
                // this.loaderService.setHttpProgressStatus(true);
                this.begin();
                // console.log('begin');
            }),
            this.pipeFromArray(operations),
            tap(() => {
                this.finish();
                // console.log('finish with complete');
            }),
            catchError((error) => {
                // this.loaderService.setHttpProgressStatus(false);
                this.begin();
                // console.log('finish with error');
                return throwError(error);
            })
        );
    }
    private identity<T>(x: T): T {
        return x;
    }

    getLoderService(http: Observable<any>, message?:string): Observable<any> {
        this.loadingMessage = message === undefined ? '' : message;
        return of('').pipe(
            this.load(
                mergeMap(() => http)
            )
        );
    }

    // getloader(obs: Observable<any>, message?:string): Observable<any> {
    //     this.loadingMessage = message === undefined ? '' : message;
    //     return of('').pipe(
    //         this.load(
    //             mergeMap(() => obs)
    //         )
    //     );
    // }


}
