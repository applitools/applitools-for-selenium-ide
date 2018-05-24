// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import React from "react";
import PropTypes from "prop-types";
import "./style.css";

export default class Checkbox extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    label: PropTypes.string,
    width: PropTypes.number,
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired
  };
  render() {
    const checked = (this.props.checked || (this.props.hasOwnProperty("checked") && this.props.checked !== false));
    return (
      <div className="control">
        <input
          key="checkbox"
          type="checkbox"
          className="checkbox"
          id={this.props.id}
          name={this.props.name}
          checked={checked}
          onChange={this.props.onChange}
        />
        <label key="label" htmlFor={this.props.id}><span>{checked ? "✓" : ""}</span><div>{this.props.label}</div></label>
      </div>
    );
  }
}
