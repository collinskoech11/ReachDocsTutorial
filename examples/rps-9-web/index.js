import React from 'react';
import AppViews from './views/AppViews';
import DeployerViews from './views/DeployerViews';
import AttacherViews from './views/AttacherViews';
import {renderDOM, renderView} from './views/render';
import './index.css';
import * as backend from './build/index.main.mjs';// import the compiled backend
import {loadStdlib} from '@reach-sh/stdlib';//load stlib as reach 

const reach = loadStdlib(process.env);
reach.setWalletFallback(reach.walletFallback({}))
const handToInt = {'ROCK': 0, 'PAPER': 1, 'SCISSORS': 2};//On these lines we define a few helpful constants and defaults for later, some corresponding to the enumerations we defined in Reach.
const intToOutcome = ['Bob wins!', 'Draw!', 'Alice wins!'];
const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {view: 'ConnectAccount', ...defaults};// we initilize the component state to display Connect Account dialog 
  }
  async componentDidMount() {// Hook into rects componentDidMount lifecycle event, which is called when the compnent starts 
    const acc = await reach.getDefaultAccount();// accesses the default browser account 
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    this.setState({acc, bal});
    
    if (await reach.canFundFromFaucet()) {// see if we can access the Reach developer testing network 
      this.setState({view: 'FundAccount'});// if canFundFaucet was true  we set the display to Fund Account dialog 
    } else {
      this.setState({view: 'DeployerOrAttacher'});// If canFundFaucet was false  we set the component to skip 
    }
  }
  async fundAccount(fundAmount) {// we define what happens when the user clicks the Fund Accont button 
    await reach.fundFromFaucet(this.state.acc, reach.parseCurrency(fundAmount));//we transfer funds from the faucet to the users account 
    this.setState({view: 'DeployerOrAttacher'});// we set the component state to display 
  }
  async skipFundAccount() { this.setState({view: 'DeployerOrAttacher'}); }// we define what to do when the user clicks the skip button, which is to set the component state to display 
  selectAttacher() { this.setState({view: 'Wrapper', ContentView: Attacher}); }// we set the sub component based on whether the user clicks Deployer or Attacher
  selectDeployer() { this.setState({view: 'Wrapper', ContentView: Deployer}); }
  render() { return renderView(this, AppViews); }//we render the appropriate view from rps-9-web/views/AppViews.js.
}

class Player extends React.Component {
  random() { return reach.hasRandom.random(); }
  async getHand() { // Fun([], UInt)
    const hand = await new Promise(resolveHandP => {
      this.setState({view: 'GetHand', playable: true, resolveHandP});
    });
    this.setState({view: 'WaitingForResults', hand});
    return handToInt[hand];
  }
  seeOutcome(i) { this.setState({view: 'Done', outcome: intToOutcome[i]}); }
  informTimeout() { this.setState({view: 'Timeout'}); }
  playHand(hand) { this.state.resolveHandP(hand); }
}

class Deployer extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'SetWager'};
  }
  setWager(wager) { this.setState({view: 'Deploy', wager}); }
  async deploy() {
    const ctc = this.props.acc.contract(backend);
    this.setState({view: 'Deploying', ctc});
    this.wager = reach.parseCurrency(this.state.wager); // UInt
    this.deadline = {ETH: 10, ALGO: 100, CFX: 1000}[reach.connector]; // UInt
    backend.Alice(ctc, this);
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({view: 'WaitingForAttacher', ctcInfoStr});
  }
  render() { return renderView(this, DeployerViews); }
}
class Attacher extends Player {
  constructor(props) {
    super(props);
    this.state = {view: 'Attach'};
  }
  attach(ctcInfoStr) {
    const ctc = this.props.acc.contract(backend, JSON.parse(ctcInfoStr));
    this.setState({view: 'Attaching'});
    backend.Bob(ctc, this);
  }
  async acceptWager(wagerAtomic) { // Fun([UInt], Null)
    const wager = reach.formatCurrency(wagerAtomic, 4);
    return await new Promise(resolveAcceptedP => {
      this.setState({view: 'AcceptTerms', wager, resolveAcceptedP});
    });
  }
  termsAccepted() {
    this.state.resolveAcceptedP();
    this.setState({view: 'WaitingForTurn'});
  }
  render() { return renderView(this, AttacherViews); }
}

renderDOM(<App />);