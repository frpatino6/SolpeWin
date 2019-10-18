import { Component, OnInit } from "@angular/core";
import * as firebase from 'nativescript-plugin-firebase';
import { HomeService } from "./shared/home.service";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {
    ngOnInit(): void {
        
    }
    constructor( private homeServices: HomeService){
       var self= this;
    
    }
}
