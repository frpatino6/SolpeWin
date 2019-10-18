import { Component, OnInit, ChangeDetectorRef, OnDestroy } from "@angular/core";
import * as firebase from 'nativescript-plugin-firebase';
import { Page } from "tns-core-modules/ui/page/page";
import { registerElement } from 'nativescript-angular/element-registry';
import { CardView } from 'nativescript-cardview';
import { HomeService } from "../shared/home.service";
import { Orders } from "../shared/models/Orders";
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import * as _ from 'lodash';
import { CurrencyPipe } from "@angular/common";
registerElement(
    "PullToRefresh",
    () => require("@nstudio/nativescript-pulltorefresh").PullToRefresh
);
import {
    LoadingIndicator,
    Mode,
    OptionsCommon
} from '@nstudio/nativescript-loading-indicator';

const indicator = new LoadingIndicator();

const options: OptionsCommon = {
    message: 'Cargando Solpes y pedidos',
    details: '',
    progress: 0.65,
    margin: 10,
    dimBackground: true,
    color: '#4B9ED6', // color of indicator and labels
    // background box around indicator
    // hideBezel will override this if true
    backgroundColor: 'yellow',
    userInteractionEnabled: false, // default true. Set false so that the touches will fall through it.
    hideBezel: true, // default false, can hide the surrounding bezel
    mode: Mode.AnnularDeterminate, // see options below
    android: {
        // view: someStackLayout.android, // Target view to show on top of (Defaults to entire window)
        cancelable: false,
        cancelListener: function (dialog) {
            console.log('Loading cancelled');
        }
    },
    ios: {
        // view: someButton.ios, // Target view to show on top of (Defaults to entire window)
        square: false
    }
};
require("nativescript-localstorage");

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
})

registerElement('CardView', () => CardView);

@Component({
    selector: "Home",
    moduleId: module.id,
    styleUrls: ['./home.component.css'],
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit, OnDestroy {

    public dataSolpe: Orders[] = new Array();
    public dataPedidos: Orders[] = new Array();
    public dataGroupPedidos: Orders[] = new Array();
    public dataGroupSolpes: Orders[] = new Array();
    private _token: String;
    private emailUser: String;
    public TitleTabSolpe;
    public TitleTabPedidos;
    public totalSolpe = 0;
    public totalPedidos = 0
    public pullRefresh;

    constructor(private page: Page, private homeServices: HomeService, private router: Router,
        private currencyPipe: CurrencyPipe,
        private route: ActivatedRoute, private routerExtensions: RouterExtensions,
        private ref: ChangeDetectorRef) {
        this.page.actionBarHidden = true;
        this.onRegisterButtonTap();

        this.route.queryParams.subscribe(params => {
            this.emailUser = params["email"];

        });
        var self = this;

        this.page.on(Page.navigatingToEvent, function () {
            self.GetOrderByUser();
        })
    }

    setTitleTabSolpe() {
        this.totalSolpe = this.dataGroupSolpes.length;
        this.totalPedidos = this.dataGroupPedidos.length;
        this.TitleTabSolpe = { title: "Solicitud de pedidos " + this.totalSolpe, iconSource: "res://solpe" };
        this.TitleTabPedidos = { title: "Pedidos " + this.totalPedidos, iconSource: "res://pedidos" };
    }

    ngOnDestroy(): void {


    }

    ngOnInit(): void {

        firebase.addOnMessageReceivedCallback((message) => {
            if(this.pullRefresh!=undefined)
                this.pullRefresh.refreshing = false;
            this.GetOrderByUser();
        }).then(
            (instance) => {

            },
            (error) => {
                alert("Error al recibir el mensaje: " + error);
            }
        );
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                indicator.hide();
            }
        });

        this.setTitleTabSolpe();

    }

    GetOrderByUser() {
        var self = this;
        indicator.show({
            message: 'Cargando ordenes...',
            dimBackground: true,
            hideBezel: true,
            color: '#4B9ED6'
        });
        var email = localStorage.getItem('emailUser')
        this.homeServices.getOrders(email)
            .subscribe((result) => {
                indicator.hide();

                self.dataSolpe = result.filter(type => type.tipo_Doc == "S");
                self.dataPedidos = result.filter(type => type.tipo_Doc != "S");
                self.dataGroupPedidos = _.chain(self.dataPedidos).groupBy("numero").map(function (v, i) {
                    return {
                        numero: i,
                        id: _.get(_.find(v, 'numero'), 'numero'),
                        cantidad: _.get(_.find(v, 'cantidad'), 'cantidad'),
                        valorLiteral: _.get(_.find(v, 'valorLiteral'), 'valorLiteral'),
                        tipo_Doc: _.get(_.find(v, 'tipo_Doc'), 'tipo_Doc'),
                        texto: _.get(_.find(v, 'texto'), 'texto'),
                        destino: _.get(_.find(v, 'destino'), 'destino'),
                        mandante: _.get(_.find(v, 'mandante'), 'mandante'),
                        usuario: _.get(_.find(v, 'usuario'), 'usuario'),
                        posicion: _.get(_.find(v, 'posicion'), 'posicion'),
                        valor: _.get(_.find(v, 'valor'), 'valor'),
                        estado: _.get(_.find(v, 'estado'), 'estado'),
                        proveedor: _.get(_.find(v, 'proveedor'), 'proveedor'),
                    };

                }).value();

                self.dataGroupSolpes = _.chain(self.dataSolpe).groupBy("numero").map(function (v, i) {
                    return {
                        numero: i,
                        id: _.get(_.find(v, 'numero'), 'numero'),
                        cantidad: _.get(_.find(v, 'cantidad'), 'cantidad'),
                        valorLiteral: _.get(_.find(v, 'valorLiteral'), 'valorLiteral'),
                        tipo_Doc: _.get(_.find(v, 'tipo_Doc'), 'tipo_Doc'),
                        texto: _.get(_.find(v, 'texto'), 'texto'),
                        destino: _.get(_.find(v, 'destino'), 'destino'),
                        mandante: _.get(_.find(v, 'mandante'), 'mandante'),
                        usuario: _.get(_.find(v, 'usuario'), 'usuario'),
                        posicion: _.get(_.find(v, 'posicion'), 'posicion'),
                        valor: _.get(_.find(v, 'valor'), 'valor'),
                        estado: _.get(_.find(v, 'estado'), 'estado'),
                        proveedor: _.get(_.find(v, 'proveedor'), 'proveedor')
                    };

                }).value();

                if (this.dataSolpe.length == 0 && this.dataPedidos.length == 0)
                    alert("No tienen pendiente pedidos por aprobar");
                else
                    console.log(self.dataGroupPedidos)

                this.setTitleTabSolpe()
                this.ref.detectChanges();

                if(this.pullRefresh!=undefined)
                    this.pullRefresh.refreshing = false;
            }, (error) => {
                indicator.hide();
                this.showMessageDialog(error.message)
            });
    }

    onClick(number, pos) {
        indicator.show({
            message: 'Actualizando estado del pedido seleccionado...',
            dimBackground: true,
            hideBezel: true,
            color: '#4B9ED6'
        });
        this.homeServices.updateOrdersSolpe(number, pos)
            .subscribe((result) => {
                this.GetOrderByUser();
            }, (error) => {
                indicator.hide();
                this.showMessageDialog(error.message)

            });
    }
    onRegisterButtonTap() {
        let self = this;
       
    }
    onClickDetailView(numeroPedido) {

        let navigationExtras = {
            queryParams: {
                'pedidoDetails': JSON.stringify(this.dataPedidos.filter(e => e.numero == numeroPedido)),
                'groupPedidoDetails': JSON.stringify(this.dataGroupPedidos.filter(e => e.numero == numeroPedido)),
                'totalPedido': this.getTotal(numeroPedido)
            }
        }

        this.routerExtensions.navigate(["/detail"], navigationExtras);
        // indicator.show({
        //     message: 'Cargando detalle del pedido...',
        //     dimBackground: true,
        //     hideBezel: true,
        //     color: '#4B9ED6'
        // });
    }
    onClickPedido(numero) {
        indicator.show({
            message: 'Actualizando estado del pedido seleccionado...',
            dimBackground: true,
            hideBezel: true,
            color: '#4B9ED6'
        });
        this.homeServices.updatePedidoState(numero)
            .subscribe((result) => {
                indicator.hide();
                this.GetOrderByUser();
            }, (error) => {
                indicator.hide();
                this.showMessageDialog(error.message)
            });
    }

    getLineas(numeroPedido) {
        let numLineas: number = this.dataPedidos.filter(e => e.numero == numeroPedido).length;

        return numLineas
    }
    getTotal(numeroPedido) {
        var result = 0;
        this.dataPedidos.filter(e => e.numero == numeroPedido).forEach(element => {
            result += element.valor * element.cantidad;
        });
        return this.currencyPipe.transform(result);
    }
    parseCurrencyFormat(value) {
        return this.currencyPipe.transform(value);
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
    refreshListSolpe(args) {
        this.pullRefresh = args.object;
        this.GetOrderByUser();
    }
}
