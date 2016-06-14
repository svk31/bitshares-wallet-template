import React from "react";
import {FetchChain, TransactionBuilder, Login} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";
import {AssetAmount} from "helpers/Assets";
import { withRouter } from "react-router";

Login.setRoles(["active", "owner"]);

class CreateAccount extends React.Component {

    constructor(props) {
        super();

        console.log("login props:", props);
        this.state = {
            block: null,
            account: null,
            accountName: null
        };
    }



    _attemptCreate(e) {
        e.preventDefault();
        let {accountName} = this.state;

        let {pubKeys} = Login.generateKeys(accountName, this.refs.password.value);

        debugger;
        let create_account_promise = fetch( "https://testnet.bitshares.eu" + "/api/v1/accounts", {
            method: "post",
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "account": {
                    "name": accountName,
                    "owner_key": pubKeys.owner,
                    "active_key": pubKeys.active,
                    "memo_key": pubKeys.active,
                    //"memo_key": memo_private.private_key.toPublicKey().toPublicKeyString(),
                    "refcode": null,
                    "referrer": ""
                }
            })
        }).then(r => r.json());

        create_account_promise.then(result => {
            debugger;
            if (result.error) {
                throw result.error;
            }
            FetchChain("getAccount", [accountName])
            .then(res => {
                let [account] = res;
                let success = Login.checkKeys({
                    accountName,
                    password: this.refs.password.value,
                    auths: {
                        active: account.getIn([0, "active"]).toJS().key_auths
                    }
                });

                this.setState({success});
            });
        });


        //     console.log("account:", account.toJS());
        //
        //     let success = Login.checkKeys({
        //         accountName: accountName,
        //         password: this.refs.password.value,
        //         auths: {
        //             active: account.getIn([0, "active"]).toJS().key_auths
        //         }
        //     });
        //
        //     if (success) {
        //         this.props.router.push("/wallet");
        //     } else {
        //         this.setState({
        //             error: true
        //         });
        //     }
        // });
    }

    _onInputAccount(e) {
        console.log("to:", e.target.value);
        let {value} = e.target;
        if (value.length > 2) {
            Apis.instance().db_api().exec("lookup_accounts", [
                value, 1
            ])
            .then(accounts => {
                let [account] = accounts;
                console.log("account:", account);
                this.setState({
                    accountName: account[0] === value ? null: value
                });
            }).catch(err => {
                console.log("error:", err);
            });
        }
    }

    _onPassWordConfirm() {

    }

    render() {
        let {success, accountName} = this.state;

        return (
            <div>
                <div className="col-xs-12 col-sm-6 col-sm-offset-3">
                    <h2>Create a new account</h2>
                    <form
                        onSubmit={this._attemptCreate.bind(this)}
                        className="form-group"
                    >
                        <label for="account-name">Account:</label>
                        <div>
                            <input
                                id="account-name"
                                className="form-control"
                                type="text"
                                onChange={this._onInputAccount.bind(this)}
                                placeHolder="Your account name"
                            />
                        </div>

                        <label for="pass-input">Password: </label>
                        <div>
                            <input
                                ref="password"
                                id="pass-input"
                                className="form-control"
                                type="password"
                                placeHolder="Enter password"
                            />
                        </div>

                        <label for="pass-repeat">Confirm password: </label>
                        <div>
                            <input
                                ref="password"
                                id="pass-repeat"
                                className="form-control"
                                type="password"
                                placeHolder="Confirm your password"
                            />
                        </div>

                        <div style={{paddingTop: 20}} className="button-group">
                            <button
                                type="submit"
                                style={{display: "inline-block"}}
                                className={"btn btn-primary"}
                            >
                                Create Account
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        );
    }
};

export default withRouter(CreateAccount);
