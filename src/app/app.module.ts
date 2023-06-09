import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { PagesModule } from './pages/pages.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Util } from './shared/util';

@NgModule({
  declarations: [
    AppComponent,
    NopagefoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    PagesModule,
    SweetAlert2Module.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [Util],
  bootstrap: [AppComponent]
})
export class AppModule { }
