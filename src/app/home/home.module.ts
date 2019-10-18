import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import {HomeService} from '../shared/home.service'
import { CurrencyPipe } from "@angular/common";
import { NativescriptBottomNavigationModule} from "nativescript-bottom-navigation/angular";

@NgModule({
    imports: [
        NativescriptBottomNavigationModule,
        NativeScriptCommonModule,
        HomeRoutingModule,
        NativeScriptFormsModule
    ],
    declarations: [
        HomeComponent
    ],
    providers:[HomeService,CurrencyPipe],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule { }
