import React from "react";
import {ChainStore, FetchChain, TransactionBuilder, Login} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";
import {AssetAmount} from "helpers/Assets";

export default class Wallet extends React.Component {

    constructor() {
        super();

        this.state = {
            account: null,
            amount: new AssetAmount({asset_id: "1.3.0", amount: 1}),
            toAccountId: null,
            toAccountName: null
        };

        this.updateAccount = this.updateAccount.bind(this);
    }

    componentWillMount() {
        Login.setRoles(["active"]);

        ChainStore.subscribe(this.updateAccount);
        this.setState({subscribed: true});
        Promise.all([
            FetchChain("getAccount", Login.get("name"))
        ])
        .then(res => {
            let [account] = res;
            this.setState({account});
        });
    }

    componentWillUnmount() {
        if (this.state.subscribed) {
            ChainStore.unsubscribe(this.updateAccount);
        }
    }

    updateAccount() {
        let account = ChainStore.getAccount(Login.get("name"));
        if (account) {
            this.setState({account});
        }
    }

    makeTransfer(e) {
        e.preventDefault();
        let {account, toAccountId, amount} = this.state;
        if (!toAccountId || !account || !amount.getSats()) {
            return;
        }

        let tr = new TransactionBuilder();
        let transfer_op = tr.get_type_operation("transfer", {
            fee: {
                amount: 0,
                asset_id: "1.3.0"
            },
            from: account.get("id"),
            to: toAccountId,
            amount: { amount: amount.getSats(), asset_id: "1.3.0"}
        });


        tr.add_operation( transfer_op );
        tr.set_required_fees().then(() => {
            console.log("fees set");
            Login.signTransaction(tr);

            this.setState({
                broadcasting: true,
                success: false
            });
            tr.broadcast().then((success) => {
                this.setState({
                    broadcasting: false,
                    success: true
                });
                console.log("transaction broadcast success!", success);
            }).catch(err => {
                console.log("transaction broadcast error!", err);
            });
        }).catch(err => {
            console.log("login error:", err);
        });

    }

    onInputTo(e) {
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
                    toAccountId: account[0] === value ? account[1] : null,
                    toAccountName: account[0] === value ? account[0] : null
                });
            }).catch(err => {
                console.log("error:", err);
            });
        }
    }

    onInputAmount(e) {
        let {value} = e.target;
        this.state.amount.setAmount(value).then(() => {
            this.forceUpdate();
        });
    }

    render() {
        let {account, broadcasting, success, toAccountName, amount} = this.state;

        let disabled = !toAccountName || !account || !amount.getSats();

        return (
            <div>
                <div className="col-xs-8 col-xs-offset-2">
                    {account ? <div style={{paddingBottom: 20}}>My account: <span style={{fontSize: "1.5rem", fontWeight: "bold"}}>{account.get("name")}</span></div> : null}
                    {account ? (
                            <form
                                onSubmit={this.makeTransfer.bind(this)}
                                className="form-group"
                            >
                                <label for="to-account">Send to: </label>
                                <div className="input-group">
                                    <input
                                        id="to-account"
                                        className="form-control"
                                        type="text"
                                        onChange={this.onInputTo.bind(this)}
                                        placeHolder="Account to send to"
                                    />
                                    <span className="input-group-addon">{toAccountName ? "OK" : "NOK"}</span>
                                </div>

                                <label for="amount-input">Amount: </label>
                                <div>
                                    <input
                                        defaultValue={amount.getAmount()}
                                        id="amount-input"
                                        className="form-control"
                                        type="number"
                                        onChange={this.onInputAmount.bind(this)}
                                        placeHolder="Amount to send"
                                    />
                                </div>

                                <div style={{paddingTop: 20}} className="button-group">
                                    <button
                                        type="submit"
                                        style={{display: "inline-block"}}
                                        className={"btn btn-primary" + (disabled ? " disabled" : "")}
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                    ) : null}

                    {broadcasting ? <p>Broadcasting transaction now</p> : null}
                    {success ? (
                    <div>
                        <p>Transaction successfully broadcast</p>
                        <p>Sent {amount.getAmount()} TEST to {toAccountName}</p>
                    </div>
                    ) : null}
                </div>
            </div>
        );
    }
};
