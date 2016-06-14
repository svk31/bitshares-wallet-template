import React from "react";
import {FetchChain, TransactionBuilder, Login} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";
import {AssetAmount} from "helpers/Assets";
import { withRouter } from "react-router";

Login.setRoles(["active"]);

class LoginComponent extends React.Component {

    constructor(props) {
        super();

        console.log("login props:", props);
        this.state = {
            block: null,
            account: null,
            accountName: null
        };
    }

    _attemptLogin(e) {
        e.preventDefault();
        let {accountName} = this.state;

        Promise.all([
            FetchChain("getAccount", [accountName])
        ])
        .then(res => {
            let [account] = res;

            let success = Login.checkKeys({
                accountName: accountName,
                password: this.refs.password.value,
                auths: {
                    active: account.getIn([0, "active"]).toJS().key_auths
                }
            });

            if (success) {
                this.props.router.push("/wallet");
            } else {
                this.setState({
                    error: true
                });
            }
        });
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
                    accountName: account[0] === value ? account[0] : null
                });
            }).catch(err => {
                console.log("error:", err);
            });
        }
    }

    render() {
        let {success, accountName} = this.state;


        return (
            <div>
                <div className="col-xs-8 col-xs-offset-2 col-sm-6 col-sm-offset-3">
                    <h2>Login</h2>
                    <form
                        onSubmit={this._attemptLogin.bind(this)}
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

                        <div style={{paddingTop: 20}} className="button-group">
                            <button
                                type="submit"
                                style={{display: "inline-block"}}
                                className={"btn btn-primary"}
                            >
                                Login
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        );
    }
};

export default withRouter(LoginComponent);
