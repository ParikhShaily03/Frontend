import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app/app.routes';
import { withHashLocation } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { NotificationService } from './app/services/notification.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient( withInterceptors([authInterceptor])),
      NotificationService,
 
    
  // provideAnimations(),
    importProvidersFrom(
      ReactiveFormsModule,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
        timeOut: 2000,
        extendedTimeOut: 1000,
        easeTime: 300,
        tapToDismiss: true,
        preventDuplicates: true, 
        
      })
    ),
  ],  
});
