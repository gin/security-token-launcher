import React from 'react';
import ReactDOM from 'react-dom';
require('./index.css');
import MultiParamForm from './components/MultiParamForm.js';
import ProposalHistory from './components/ProposalHistory.js';

class App extends React.Component {
  render() {
    return (
      <div className='container'>
        <h1>EasyICO</h1>
        <h2>A security token launcher on the Bitcoin Cash network for your home</h2>
        <hr />
        <ProposalHistory proposals={[
          { addr: '15 Sandy Ln Pittsford, NY 14534', pass: true, owners: 3},
          { addr: '1 O\'Farrell Street, San Francisco, California 94102', pass: false, owners: 4},
          { addr: '333 O\'Farrell Street, San Francisco, California 94102', pass: true, owners: 4},
          { addr: 'latest', pass: true, owners: 5}, ]}
        />
        <hr />
        <MultiParamForm />
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
