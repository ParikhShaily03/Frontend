// auth.interceptor.ts
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  let isRefreshing = false;

  // Skip auth endpoints (e.g., login or refresh itself)
  if (req.url.includes('/auth/') || req.url.includes('/Auth/refresh-token')) {
    return next(req);
  }

  const token = authService.getToken();
  let modifiedReq = req;

  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // If this is a refresh token request, don't try to refresh again
        if (req.url.includes('/Auth/refresh-token')) {
          authService.revokeToken();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        if (isRefreshing) {
          // Already refreshing, avoid loop
          return throwError(() => error);
        }

        isRefreshing = true;
        const refreshToken = authService.getRefreshToken();

        if (!refreshToken) {
          // No refresh token, log out
          authService.revokeToken();
          router.navigate(['/login']);
          isRefreshing = false;
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            isRefreshing = false;

            const newToken = res?.token;
            if (!newToken) {
              authService.revokeToken();
              router.navigate(['/login']);
              return throwError(() => new Error('No new token received'));
            }

            authService.setToken(newToken);
            if (res.refreshToken) {
              authService.setRefreshToken(res.refreshToken);
            }

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });

            return next(retryReq);
          }),
          catchError((err) => {
            isRefreshing = false;
            authService.revokeToken();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};