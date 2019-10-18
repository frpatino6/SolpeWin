import { Component, OnInit, OnDestroy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Orders } from '../shared/models/Orders';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { SetupItemViewArgs } from "nativescript-angular/directives";
import { HomeService } from '../shared/home.service';
import { RouterExtensions } from 'nativescript-angular/router';
import { CurrencyPipe } from '@angular/common';
import {
  LoadingIndicator,
  Mode,
  OptionsCommon
} from '@nstudio/nativescript-loading-indicator';

const indicator = new LoadingIndicator();

@Component({
  moduleId: module.id,
  selector: 'ns-detail-request',
  templateUrl: './detail-request.component.html',
  styleUrls: ['./detail-request.component.css']
})
export class DetailRequestComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    indicator.hide()
  }

  public dataPedidos: Orders[] = new Array();
  public dataGroupPedidos: Orders[] = new Array();
  public numeroPedido = ""
  public totalPedido = 0;


  constructor(
    private currencyPipe: CurrencyPipe,
    private router: RouterExtensions,
    private _router: Router,
    private page: Page,
    private route: ActivatedRoute,
    private homeServices: HomeService) {

    this.page.actionBarHidden = true;
    var self = this;
    this.route.queryParams.subscribe(params => {
      self.dataPedidos = JSON.parse(params["pedidoDetails"]);
      self.dataGroupPedidos = JSON.parse(params["groupPedidoDetails"]);
      console.log("Pedidos recibidos " + self.dataGroupPedidos[0])

      self.totalPedido = params["totalPedido"];
      if (self.dataPedidos.length > 0)
        self.numeroPedido = self.dataPedidos[0].numero;

    });
  }
  onSetupItemView(args: SetupItemViewArgs) {
    args.view.context.third = (args.index % 3 === 0);
    args.view.context.header = ((args.index + 1) % this.dataPedidos.length === 1);
    args.view.context.footer = (args.index + 1 === this.dataPedidos.length);
  }
  ngOnInit() {

  }
  parseCurrencyFormat(value) {
    return this.currencyPipe.transform(value);
  }
  onClick() {
    indicator.show({
      message: 'Actualizando estado del pedido...',
      dimBackground: true,
      hideBezel: true,
      color: '#4B9ED6'
    });

    this.homeServices.updatePedidoState(this.numeroPedido)
      .subscribe((result) => {
        indicator.hide();
        this.router.back();
      }, (error) => {
        this.showMessageDialog(error.message)
        indicator.hide();
      });
  }
  onBack() {
    this.router.back();
  }
  showMessageDialog(message) {
    var dialogs = require("tns-core-modules/ui/dialogs");
    dialogs.alert({
        title: "Solpe",
        message: message,
        okButtonText: "Aceptar"
    }).then(function () {
        console.log("Dialog closed!");
    });
}
}
