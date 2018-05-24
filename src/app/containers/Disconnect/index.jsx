import React from "react";
import Link from "../../components/Link";
import sadFace from "../../assets/images/sad_face.png";
import "./style.css";

export default class Disconnect extends React.Component {
  render() {
    return (
      <div className="disconnect">
        <img src={sadFace} width="200px" style={{
          margin: "20px"
        }} />
        <p>
          Please make sure the Selenium IDE window is open. For more information visit <Link href="https://applitools.com">https://applitools.com</Link>
        </p>
      </div>
    );
  }
}
