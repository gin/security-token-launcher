import React from 'react';

// Copied from wormhole-sdk example/create-fixed-token
/*
  Consume 1 WHC to create a new fixed token.
*/

// Set NETWORK to either testnet or mainnet
const NETWORK = `testnet`

const WH = require("wormhole-sdk/lib/Wormhole").default

// Instantiate Wormhole based on the network.
if (NETWORK === `mainnet`)
  var Wormhole = new WH({ restURL: `https://rest.bitcoin.com/v1/` })
else var Wormhole = new WH({ restURL: `https://trest.bitcoin.com/v1/` })

const fs = require("fs")

// Open the wallet generated with create-wallet.
let walletInfo
try {
  walletInfo = require(`../../wallet.json`)
} catch (err) {
  console.log(
    `Could not open wallet.json. Generate a wallet with create-wallet first.
    Exiting.`
  )
  process.exit(0)
}

// Create a fixed token.
async function createFixedToken(category, subcategory, name, url, description, amount) {
  try {
    const mnemonic = walletInfo.mnemonic

    // root seed buffer
    const rootSeed = Wormhole.Mnemonic.toSeed(mnemonic)

    // master HDNode
    if (NETWORK === `mainnet`)
      var masterHDNode = Wormhole.HDNode.fromSeed(rootSeed)
    else var masterHDNode = Wormhole.HDNode.fromSeed(rootSeed, "testnet") // Testnet

    // HDNode of BIP44 account
    const account = Wormhole.HDNode.derivePath(masterHDNode, "m/44'/145'/0'")

    const change = Wormhole.HDNode.derivePath(account, "0/0")

    // get the cash address
    //let cashAddress = Wormhole.HDNode.toCashAddress(change);
    const cashAddress = walletInfo.cashAddress

    // Create the fixed token.
    const fixed = await Wormhole.PayloadCreation.fixed(
      //console.log(txHex);
      1, // Ecosystem, must be 1.
      8, // Precision, number of decimal places. Must be 0-8.
      0, // Predecessor token. 0 for new tokens.
      category,
      subcategory,
      name,
      url,
      description,
      amount
      //      "Companies", // Category.
      //      "Bitcoin Cash Mining", // Subcategory
      //      "QMC", // Name/Ticker
      //      "www.qmc.cash", // URL
      //      "Made with BITBOX", // Description.
      //      "1000" // amount
    )

    // Get a utxo to use for this transaction.
    const u = await Wormhole.Address.utxo([cashAddress])
    const utxo = findBiggestUtxo(u[0])

    // Create a rawTx using the largest utxo in the wallet.
    utxo.value = utxo.amount
    const rawTx = await Wormhole.RawTransactions.create([utxo], {})

    // Add the token information as an op-return code to the tx.
    const opReturn = await Wormhole.RawTransactions.opReturn(rawTx, fixed)

    // Set the destination/recieving address
    const ref = await Wormhole.RawTransactions.reference(opReturn, cashAddress)

    // Generate a change output.
    const changeHex = await Wormhole.RawTransactions.change(
      ref, // Raw transaction we're working with.
      [utxo], // Previous utxo
      cashAddress, // Destination address.
      0.000005 // Miner fee.
    )

    const tx = Wormhole.Transaction.fromHex(changeHex)
    const tb = Wormhole.Transaction.fromTransaction(tx)

    // Finalize and sign transaction.
    const keyPair = Wormhole.HDNode.toKeyPair(change)
    let redeemScript
    tb.sign(0, keyPair, redeemScript, 0x01, utxo.satoshis)
    const builtTx = tb.build()
    const txHex = builtTx.toHex()

    // sendRawTransaction to running BCH node
    const broadcast = await Wormhole.RawTransactions.sendRawTransaction(txHex)
    console.log(`Transaction ID: ${broadcast}`)

    // Write out the basic information into a json file for other apps to use.
    const tokenInfo = { tokenTx: broadcast }
    fs.writeFile("token-tx.json", JSON.stringify(tokenInfo, null, 2), function(
      err
    ) {
      if (err) return console.error(err)
      console.log(`token-tx.json written successfully.`)
    })
  } catch (err) {
    console.log(err)
  }
}
//createFixedToken()

// SUPPORT/PRIVATE FUNCTIONS BELOW

// Returns the utxo with the biggest balance from an array of utxos.
function findBiggestUtxo(utxos) {
  let largestAmount = 0
  let largestIndex = 0

  for (let i = 0; i < utxos.length; i++) {
    const thisUtxo = utxos[i]

    if (thisUtxo.satoshis > largestAmount) {
      largestAmount = thisUtxo.satoshis
      largestIndex = i
    }
  }

  return utxos[largestIndex]
}



class MultiParamForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isGoing: true,
      numberOfGuests: 2,

      name: 'Home',
      url: '',
      category: 'Home',
      subcategory: 'Home',
      description: '',
      amount: '',
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    alert(`Created ${this.state.amount} tokens for the home at ${this.state.url}`);
    createFixedToken(this.state.category, this.state.subcategory, this.state.name, this.state.url, this.state.description, this.state.amount)
    event.preventDefault();
  }


  render() {
    return (
      <div>
        <h3>Tokenize Form</h3>
        <form onSubmit={this.handleSubmit}>
          <label>
            URL (e.g. Zillow, Redfin):
            <br />
            <input
              name="url"
              type="string"
              value={this.state.url}
              onChange={this.handleInputChange} />
          </label>
          <br />
          <br />
          <label>
            Amount of tokens:
            <br />
            <input
              name="amount"
              type="string"
              value={this.state.amount}
              onChange={this.handleInputChange} />
          </label>
          <br />
          <br />
          <input type="submit" value="Create tokens for my home now" />
        </form>
      </div>
    );
  }
}

export default MultiParamForm
