import React from "react";
import twitterLogo from '../assets/twitter-logo.svg';
// Constants
const TWITTER_HANDLE = 'pawankumarcode';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const Footer = () => {

    return (
        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
                className="footer-text"
                href={TWITTER_LINK}
                target="_blank"
                rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
    )
}
export default Footer;