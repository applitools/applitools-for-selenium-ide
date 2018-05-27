import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class ButtonList extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };
  render() {
    return (
      <ul className="buttons">
        {this.props.items.map((item) => (
          <ListButton key={item} name={item} label={this.props.label} onClick={this.props.onClick} />
        ))}
      </ul>
    );
  }
}

class ListButton extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired
  };
  render() {
    return (
      <li tabIndex="0" onClick={() => {this.props.onClick(this.props.name);}}>
        <button tabIndex="-1">{this.props.name}</button>
        {this.props.label && <a>{this.props.label}</a>}
      </li>
    );
  }
}
