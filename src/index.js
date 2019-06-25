import React from 'react';
import ReactDOM from 'react-dom';
import qs from 'qs';
import Main from './components/main';
import './custom-css.css';


class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  }

  render() {
    return (
      <div>
        <Main/>
      </div>
    );
  }
}

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(
  <Index />,
  container
);
