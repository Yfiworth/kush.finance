import React, { Component } from "react";
import { Statistic, Collapse } from "antd";
import kSeedToken from "../contracts/kSeedToken.json";
import KushToken from "../contracts/kKushToken.json";
import KushOGToken from "../contracts/kushOGToken.json";
import getWeb3 from "../getWeb3";
import { setWeb3 } from "../shared";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
const { Panel } = Collapse;

class FloatWallet extends Component {
  state = {
    kseedBalance: 0,
    totalkSeedSupply: 0,
    totalkSeedStaked: 0,
    totalKushSupply: 0,
    totalKushOGSupply: 0,
    isViewingGifts: false,
    showkseedBalance: localStorage.getItem("kseedBalance") === "true" ? true : false,
    showkseedSupply: localStorage.getItem("kseedSupply") === "true" ? true : false,
    showkseedTotal: localStorage.getItem("kseedTotal") === "true" ? true : false,
    showkkushSupply: localStorage.getItem("kkushSupply") === "true" ? true : false,
    totalkushOGSupply: localStorage.getItem("kushOGSupply") === "true" ? true : false,
  };


  toFixed(num, fixed) {
    var re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
    return num.toString().match(re)[0];
  }

  getRoundedkSeedBalance() {
    return this.toFixed(this.state.kseedBalance, 6);
  }

  getRoundedTotalkSeedStaked() {
    let _kseedStaked = this.state.totalkSeedStaked;
    if (!isNaN(_kseedStaked)) {
      return parseFloat(_kseedStaked).toFixed(2);
    }

    return _kseedStaked;
  }

  getkSeedBalance = async () => {
    let _kseedBalance = await this.kseedInstance.methods
      .balanceOf(this.accounts[0])
      .call();
    this.setState({
      kseedBalance: this.web3.utils.fromWei(_kseedBalance),
    });
  };

  getkSeedSupply = async () => {
    let _kseedSupply = await this.kseedInstance.methods.totalSupply().call();
    this.setState({
      totalkSeedSupply: this.web3.utils.fromWei(_kseedSupply),
    });
  };

  totalkSeedStaked = async () => {
    let _totalkSeedStaked = await this.kushInstance.methods
      .totalStakedSupply()
      .call();

    this.setState({
      totalkSeedStaked: this.web3.utils.fromWei(_totalkSeedStaked),
    });
  };

  getKushSupply = async () => {
    let _kushSupply = await this.kushInstance.methods.totalSupply().call();

    this.setState({
      totalKushSupply: this.web3.utils.fromWei(_kushSupply),
    });
  };
    getkushOGSupply = async () => {
    let _kushOGSupply = await this.kushogInstance.methods.totalSupply().call();
    this.setState({
      totalKushOGSupply: this.web3.utils.fromWei(_kushOGSupply),
    });
  };

  setkSeedAddress = async () => {
    await this.kushInstance.methods
      .setkSeedAddress(this.kseedInstance._address)
      .send({
        from: this.accounts[0],
        gas: 1000000,
      });
  };

  _getWeb3 = () => {
    return this.web3;
  };

  componentDidMount = async () => {
    document.title = "Kush.Finance";

    try {
      // // Get network provider and web3 instance.
      if (!window.ethereum) {
        //  Create WalletConnect Provider
        const provider = new WalletConnectProvider({
          infuraId: "ba0fa4b3210c4528bf4aaefc58eb1251", // Required
        });

        //  Enable session (triggers QR Code modal)
        await provider.enable();

        //  Create Web3
        this.web3 = new Web3(provider);
      } else {
        this.web3 = await getWeb3();
      }

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.kseedInstance = new this.web3.eth.Contract(
        kSeedToken.abi,
        process.env.REACT_APP_KSEED_TOKEN_CONTRACT_ADDRESS
      );

      this.kushInstance = new this.web3.eth.Contract(
        KushToken.abi,
        process.env.REACT_APP_KUSH_TOKEN_CONTRACT_ADDRESS
      );
      this.kushOGInstance = new this.web3.eth.Contract(
        KushOGToken.abi,
        process.env.REACT_APP_KUSHOG_TOKEN_CONTRACT_ADDRESS
      );

      setWeb3(this.web3);

      this.getkSeedSupply();
      this.getKushSupply();
      this.totalkSeedStaked();
      this.getkushOGSupply();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true }, this.getkSeedBalance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Web3 Connection Failed. Do you have MetaMask or your Wallet unlocked?`
      );
      console.error(error);
    }
  };
  render() {
    return (
      <>
        {(this.state.showkseedBalance||this.state.showkseedSupply||this.state.showkseedTotal||this.state.showkkushSupply|this.state.showkushOGSupply) &&
          <div className="float-wallet">
            <Collapse defaultActiveKey={1} ghost>
              <Panel header="Wallet" key="1">
                { this.state.showkseedBalance && <Statistic title="Your k.SEED Balance" value={this.getRoundedkSeedBalance()} precision={2} />}
                <div className="kush-balance"></div>
                { this.state.showkseedSupply && <Statistic title="Total k.SEED Supply" value={this.state.totalkSeedSupply} precision={2} />}
                { this.state.showkseedTotal && <Statistic title="Total k.SEED Seeded" value={this.getRoundedTotalkSeedStaked()} precision={2}/>}
                { this.state.showkkushSupply && <Statistic title="Total k.KUSH Supply" value={this.state.totalKushSupply} precision={2}/>}
                { this.state.showkushOGSupply && <Statistic title="Total k.OG Supply" value={this.state.totalKushOGSupply} precision={2}/>}
              </Panel>
            </Collapse>
          </div>
        }
      </>
    )
  }
}
export default FloatWallet;
