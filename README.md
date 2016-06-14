## Bitshares Wallet Template

This is a very basic Bitshares wallet template built using graphenejs-lib.

### Overview
This wallet makes use of the AccountLogin class from graphenejs-lib to provide a login function using a brainkey seed of `account + role + password`.

This means you can login using only your account name and password, and no private information is stored in the browser nor sent to the API server.

The wallet is set up to use the Bitshares testnet. Compiled html + js is available in the `dist` folder, to launch simply doubleclick the index.html file.

The following account and password can be used to try it out:

```
account: azdazddazdazd2
password: "Min16CharPassword"
```

You may also create an account and it will be setup to use your account name + password as seeds for the brainkey.

### Functions
Currently, only login, account creation and transfers are available. More will be added later.
