import React from 'react';

class ProposalHistory extends React.Component {
  constructor (props) {
    super();
    this.state = {
      selectedProposal: { name: 'latest' },
    };
    this.updateProposal = this.updateProposal.bind(this);
  }
  updateProposal(proposal) {
    this.setState(function () { return {selectedProposal: proposal} });
  }
  render() {
    return (
      <div>
        <h3>Current Listing Proposals</h3>
        <p>{this.state.selectedProposal.addr}</p>
        <ul>
          {
            this.props.proposals
              .filter(p => p.pass === true)
              .map(p => {
                return (
                  <button
                    style={p === this.state.selectedProposal ? { color: '#d0021b' }: null}
                    onClick={this.updateProposal.bind(null, p)}
                    key={p.addr}>
                    {p.addr} : number of owners = {p.owners}
                  </button>
                )
              })
          }
        </ul>
      </div>
    )
  }
}

export default ProposalHistory
