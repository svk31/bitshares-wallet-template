import React from "react";
import {ChainStore, FetchChain} from "graphenejs-lib";
import {Apis} from "graphenejs-ws";

ChainStore.setDispatchFrequency(20);
// let connectionString = "wss://bitshares.openledger.info/ws";
let connectionString = "wss://testnet.bitshares.eu/ws";

export default class ApiWrapper extends React.Component {

    constructor() {
        super();

        this.state = {
            apiReady: false,
            chainStoreReady: false,
            chain: null,
            block: null
        };

        this.updateBlock = this.updateBlock.bind(this);
    }

    componentWillMount() {
        Apis.instance(connectionString).init_promise.then((res) => {
            console.log("Api connected to chain:", res[0].network_name);
            this.setState({
                apiReady: true,
                chain: res[0].network_name
            });

            ChainStore.init().then(() => {
                this.setState({
                    chainStoreReady: true,
                    subscribed: true
                });

                ChainStore.subscribe(this.updateBlock);
                FetchChain("getObject", ["2.1.0"])
                .then(res => {
                    let [global] = res;

                    this.setState({
                        block: global.get("head_block_number")
                    });
                });
            });
        });
    }

    updateBlock() {
        let global = ChainStore.getObject("2.1.0");

        if (global) {
            this.setState({
                block: global.get("head_block_number")
            });
        }
    }

    componentWillUnmount() {
        if (this.state.subscribed) {
            ChainStore.unsubscribe(this.updateBlock);
        }
    }

    render() {
        let {apiReady, chainStoreReady, chain, block} = this.state;

        return (
            <div className="row">
                {!apiReady || !chainStoreReady ? null :
                <div>
                    {this.props.children}

                </div>
                }
                <div className="footer">
                    <div className="container text-center" style={{height: "100%", paddingTop: 10}}>
                        <span>Network status: <span className="badge"  >{apiReady ? "OK" : "NOT OK"}</span></span>
                        <span style={{paddingLeft: 20}}>Connected to network: <span className="badge">{chain}</span></span>
                        {block ? <span style={{paddingLeft: 20}}>Current block: <span className="badge">#{block}</span></span> : null}
                    </div>
                </div>
            </div>
        );
    }
}
