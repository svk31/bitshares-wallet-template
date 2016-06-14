import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, IndexRoute, Link, useRouterHistory } from "react-router";

import ApiWrapper from "./ApiWrapper";
import Wallet from "Wallet/Wallet";
import LoginComponent from "Wallet/Login";
import CreateAccount from "Wallet/CreateAccount";
import {Login} from "graphenejs-lib";

import { createHashHistory } from "history";
// useRouterHistory creates a composable higher-order function
const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

class App extends React.Component {
    render() {
        return <div className="container-fluid">{this.props.children}</div>;
    }
}

const Welcome = () => {
    return (
        <div className="col-xs-12 col-sm-8 col-sm-offset-2">
            <div className="jumbotron ">
                <h2>Simple Bitshares Wallet Template</h2>
            </div>
            <div className="row">
                <div className="col-sm-6">
                    <div className="thumbnail">
                        <div className="caption">
                            <h3>I don't have an account</h3>
                            <p>...</p>
                            <p><Link to="create-account" className="btn btn-primary" role="button">Create new account</Link></p>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6">
                    <div className="thumbnail">
                        <div className="caption">
                            <h3>I already have an account</h3>
                            <p>...</p>
                            <p><Link to="wallet" className="btn btn-primary" role="button">Login now</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function checkAuth(nextState, replace) {
    console.log("nextState:", nextState);
    if (!Login.get("loggedIn")) {
        replace({pathname: "/login"});
    }
}

function onEnterLogin(nextState, replace) {
    if (Login.get("loggedIn")) {
        replace({pathname: "/"});
    }
}

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Welcome} />
        <Route component={ApiWrapper}>
            <Route path="wallet" onEnter={checkAuth}>
                <IndexRoute component={Wallet} />
            </Route>
            <Route path="login" component={LoginComponent} onEnter={onEnterLogin} />
            <Route path="create-account" component={CreateAccount} />
        </Route>
    </Route>
);

ReactDOM.render(<Router history={appHistory} routes={routes}/>, document.getElementById("content"));
