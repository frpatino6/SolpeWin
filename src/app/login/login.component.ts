import {
    Component,
    ElementRef,
    ViewChild,
    OnInit,
    OnDestroy
} from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { User } from "../shared/user.model";
import { UserService } from "../shared/user.service";
import { ActivatedRoute, Router, NavigationStart } from "@angular/router";
import { messaging, Message } from "nativescript-plugin-firebase/messaging";

import {
    LoadingIndicator,
    Mode,
    OptionsCommon
} from "@nstudio/nativescript-loading-indicator";
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
const options: OptionsCommon = {
    message: "Autenticando...",
    progress: 0.65,
    margin: 10,
    dimBackground: true,
    color: "#4B9ED6", // color of indicator and labels
    // background box around indicator
    // hideBezel will override this if true
    backgroundColor: "yellow",
    userInteractionEnabled: false, // default true. Set false so that the touches will fall through it.
    hideBezel: true, // default false, can hide the surrounding bezel
    mode: Mode.AnnularDeterminate, // see options below
    android: {
        cancelable: true,
        cancelListener: function(dialog) {
            console.log("Loading cancelled");
        }
    },
    ios: {
        square: false
    }
};

const indicator = new LoadingIndicator();

require("nativescript-localstorage");
require("nativescript-plugin-firebase");
@Component({
    selector: "app-login",
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        indicator.hide();
    }
    private _message: string;
    public _token: String;
    public isLoggingIn = true;
    public user: User;
    public processing = false;
    @ViewChild("password", { static: true }) password: ElementRef;
    @ViewChild("confirmPassword", { static: true }) confirmPassword: ElementRef;

    constructor(
        private page: Page,
        private userService: UserService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private routerExtensions: RouterExtensions
    ) {
        this.page.actionBarHidden = true;
        this.user = new User();
        this.onRegisterButtonTap();
        this.doRegisterForPushNotifications();
        this.doRegisterPushHandlers();

        //this.user.email = "";
        //this.user.password = "";
        this.user.email = "";
        this.user.password = "";
    }

    public doRegisterPushHandlers(): void {
        // note that this will implicitly register for push notifications, so there's no need to call 'registerForPushNotifications'
        messaging.addOnPushTokenReceivedCallback(token => {
            // you can use this token to send to your own backend server,
            // so you can send notifications to this specific device
            console.log("Firebase plugin received a push token: " + token);
            this._token = token;
            // var pasteboard = utils.ios.getter(UIPasteboard, UIPasteboard.generalPasteboard);
            // pasteboard.setValueForPasteboardType(token, kUTTypePlainText);
        });
        messaging
            .addOnMessageReceivedCallback(message => {
                console.log(
                    "Push message received in push-view-model: " +
                        JSON.stringify(message, getCircularReplacer())
                );

                setTimeout(() => {}, 500);
            })
            .then(
                () => {
                    console.log("Added addOnMessageReceivedCallback");
                },
                err => {
                    console.log(
                        "Failed to add addOnMessageReceivedCallback: " + err
                    );
                }
            );
    }

    public doGetCurrentPushToken(): void {
        messaging
            .getCurrentPushToken()
            .then(token => {
                console.log(`Current push token: ${token}`);
                this._token = token;
                // alert({
                //   title: "Current Push Token",
                //   message: (!token ? "Not received yet (note that on iOS this does not work on a simulator)" : token + ("\n\nSee the console log if you want to copy-paste it.")),
                //   okButtonText: "OK, thx"
                // });
            })
            .catch(err =>
                console.log("Error in doGetCurrentPushToken: " + err)
            );
    }

    public doRegisterForPushNotifications(): void {
        messaging
            .registerForPushNotifications({
                onPushTokenReceivedCallback: (token: string): void => {
                    console.log(
                        ">>>> Firebase plugin received a push token: " + token
                    );
                },

                onMessageReceivedCallback: (message: Message) => {
                    console.log(
                        "Push message received in push-view-model: " +
                            JSON.stringify(message, getCircularReplacer())
                    );

                    setTimeout(() => {
                        alert({
                            title: "Push message!",
                            message:
                                message !== undefined &&
                                message.title !== undefined
                                    ? message.title
                                    : "",
                            okButtonText: "Sw33t"
                        });
                    }, 500);
                },

                // Whether you want this plugin to automatically display the notifications or just notify the callback. Currently used on iOS only. Default true.
                showNotifications: true,

                // Whether you want this plugin to always handle the notifications when the app is in foreground.
                // Currently used on iOS only. Default false.
                // When false, you can still force showing it when the app is in the foreground by adding 'showWhenInForeground' to the notification as mentioned in the readme.
                showNotificationsWhenInForeground: false
            })
            .then(() => console.log(">>>> Registered for push"))
            .catch(err => console.log(">>>> Failed to register for push"));
    }
    ngOnInit(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                indicator.hide();
            }
        });
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            // this.notifyPropertyChange("message", value);
        }
    }

    private updateMessage(text: String) {
        this.message += text + "\n";
        alert(this.message);
    }
    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }
    onRegisterButtonTap() {
        let self = this;
    }
    onUnregisterButtonTap() {
        let self = this;
    }
    submit() {
        if (!this.user.email || !this.user.password) {
            this.message = "Please provide both an email address and password.";
            return;
        }

        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
        }
    }

    login() {
        this.doGetCurrentPushToken();
        this.user.accessToken = this._token;
        indicator.show(options);

        this.userService.login(this.user).subscribe(
            result => {
                localStorage.setItem("emailUser", this.user.email);
                let navigationExtras = {
                    queryParams: { email: this.user.email }
                };
                this.routerExtensions.navigate(["/home"], navigationExtras);
                indicator.hide();
            },
            error => {
                indicator.hide();
                this.showMessageDialog(error.message);
            }
        );
    }

    register() {
        if (this.user.password != this.user.confirmPassword) {
            this.message = "Your passwords do not match.";
            return;
        }
        this.userService.register(this.user);
        // .then(() => {
        //     this.processing = false;
        //     this.alert("Your account was successfully created.");
        //     this.isLoggingIn = true;
        // })
        // .catch(() => {
        //     this.processing = false;
        //     this.alert("Unfortunately we were unable to create your account.");
        // });
    }

    forgotPassword() {
        prompt({
            title: "Forgot Password",
            message:
                "Enter the email address you used to register for APP NAME to reset your password.",
            inputType: "email",
            defaultText: "",
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        }).then(data => {
            if (data.result) {
                this.userService.resetPassword(data.text.trim());
                // .then(() => {
                //     this.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
                // }).catch(() => {
                //     this.alert("Unfortunately, an error occurred resetting your password.");
                // });
            }
        });
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    get messages(): string {
        return this._message;
    }

    set messages(value: string) {
        if (this._message !== value) {
            this._message = value;
        }
    }
    showMessageDialog(message) {
        var dialogs = require("tns-core-modules/ui/dialogs");
        dialogs
            .alert({
                title: "Solpe",
                message: message,
                okButtonText: "Aceptar"
            })
            .then(function() {
                console.log("Dialog closed!");
            });
    }
}
