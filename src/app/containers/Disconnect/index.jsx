import React from "react";
import MoreInfo from "../../components/MoreInfo";
import sadFace from "../../assets/images/sad_face.png";
import "./style.css";

export default class Disconnect extends React.Component {
  render() {
    return (
      <div className="disconnect">
        <img src={sadFace} width="200px" style={{
          margin: "20px"
        }} />
        <footer>
          <p>Please make sure the Selenium IDE window is open. <MoreInfo /></p>
        </footer>
      </div>
    );
  }
}
