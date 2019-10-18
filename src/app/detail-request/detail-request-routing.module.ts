import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import {DetailRequestComponent  } from "./detail-request.component";

const routes: Routes = [
    { path: "", component: DetailRequestComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class DetailRequestRoutingModule { }
