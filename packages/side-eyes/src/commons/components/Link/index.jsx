import React from 'react'

// as we can't open target="_self" links in extention popup we'll use a component to always add target="_blank"
export default class Link extends React.Component {
  render() {
    return <a target="_blank" {...this.props} />
  }
}
