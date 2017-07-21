import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as globalVars from "../service/global";
import { Inject } from "@angular/core";

import "../../node_modules/browser-sync/node_modules/socket.io-client/socket.io.js";

@Component({
    moduleId: module.id,
    selector: "nick-name",
    templateUrl: "nickName.component.html"
})

export class NickNameComponent {
    nickname: string = null;
    status: string = null;
    suggest: boolean = true;
    queries: string[];
    name: string = null;
    constructor(private route: ActivatedRoute,
        private router: Router, ) {
        this.router = router;
        this.route = route;
    }
    ngOnInit(): void {
        var _this = this;
        _this.suggest = false;
        _this.queries = [];
        _this.name = sessionStorage.getItem('nickName');
        var storedNames = JSON.parse(localStorage.getItem("names"));
        this.route.queryParams.subscribe(params => {
            _this.status = params['status'];
        });
        if (_this.status === "false") {
            $("#status").text("*Username Already Exists.");
            this.suggest = true;
            for (let i = 0; i < 3; i++) {
                let randomNo = Math.floor((Math.random() * 99));
                var finalNo = "0";
                if (randomNo <= 9) { finalNo = "0" + randomNo; }
                else if (randomNo <= 100) { finalNo = "" + randomNo; }
                this.queries[i] = this.name + finalNo;
                for (let j = 0; j < storedNames.length; j++) {
                    if (this.queries[i] === storedNames[j].slice(0, -2)) {
                        this.queries[i] = this.name + finalNo + "0";
                    }
                }
            }
        }

    }
    submit(data) {
        this.nickname = data.value;
        if (this.nickname) {
            let randomNo = Math.floor((Math.random() * 30));
            let finalNo = 0;
            if (randomNo <= 9) { finalNo = 0 + randomNo; }
            else if (randomNo <= 31) { finalNo = randomNo; }
            let query = this.nickname + finalNo;
            globalVars.socket = io({ query: "userName=" + query });

            this.router.navigate(['/chat'], { queryParams: { name: query } });
        }
    }

    addNickname($event, nickname) {
        if ($event.which === 13) { // ENTER_KEY
            this.submit(nickname);
        }
    }
}

