import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { LoginComponent } from "./login/login.component";
import { BackendService } from "./shared/backend.service";

const routes: Routes = [
    { path: "", redirectTo: BackendService.isUserLoggedIn() ? "/home" : "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "home", loadChildren: () => import("~/app/home/home.module").then((m) => m.HomeModule) },
    { path: "detail", loadChildren: () => import("~/app/detail-request/detail-request.module").then((m) => m.DetailRequestModule) },
    
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
