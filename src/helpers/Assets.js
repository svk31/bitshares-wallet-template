import {FetchChain} from "graphenejs-lib";

export class AssetAmount {

    constructor(amountObject = {asset_id: "1.3.0", amount: 0}) {
        let {asset_id, amount} = amountObject;
        this.amount = amount;
        this.asset_id = asset_id;

        this._setSatsFromFull(amount);
    }

    setAssetId(asset_id) {
        this.asset_id = asset_id;
    }

    setAmount(amount) {
        this.amount = amount;
        return this._setSatsFromFull(amount);
    }

    _setSatsFromFull(amount) {
        return FetchChain("getObject", [this.asset_id]).then(asset => {
            let precision = Math.pow(10, asset.getIn([0,"precision"]));
            this.satAmount = Math.floor(this.amount * precision);
            console.log("Set sat amount to:", this.satAmount);
        });
    }

    getSats() {
        return this.satAmount;
    }

    getAmount() {
        return this.amount;
    }
}
