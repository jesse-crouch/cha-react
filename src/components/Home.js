import React from 'react'
import MapComponent from './MapComponent'

export default function Home() {
    return (
        <div className="main-content" style={{position: "relative"}} id="mainContent">
            <div className="separator"></div>
            <div className="content" style={{backgroundImage: "url('../images/resources/banner.png')", backgroundSize: "cover", backgroundPositionY: "bottom"}}>
                <img src="/images/branding/logo_white_lg.png" width="60%" style={{margin: "2em 20%"}} alt="" />
                <div className="banner-text text-center" style={{paddingBottom: "3em", width: "70%", margin: "0 15%", textShadow: "0px 0px 10px rgba(0,0,0,0.91)"}}>
                    <p id="bannerTitle">
                        Training That Focuses On The Mind And Body
                    </p>
                    <p id="bannerSubtitle">
                        Run by NCCP and Hockey Canada Certified Coach Harry Cosgrove, who has been coaching hockey athletes for twenty years. Cosgrove Hockey Academy boasts a state of the art facility equipped to train all levels of players. We believe in building confidence, core skills and sound hockey minds.
                    </p>
                </div>
            </div>
            <div className="separator" style={{background: "blue"}}></div>
            <div className="carousel slide" data-ride="carousel" data-interval="5000">
                <ol className="carousel-indicators">
                    <li className="" data-slide-to="0"></li>
                    <li data-slide-to="1" className="active"></li>
                    <li data-slide-to="2" className=""></li>
                </ol>
                <div className="carousel-inner">
                    <div className="carousel-item">
                        <img className="d-block w-100" src="images/carousel-home/1.png" alt="" />
                    </div>
                    <div className="carousel-item active">
                        <img className="d-block w-100" src="images/carousel-home/2.png" alt="" />
                    </div>
                    <div className="carousel-item">
                        <img className="d-block w-100" src="images/carousel-home/3.png" alt="" />
                    </div>
                </div>
            </div>
            <div className="carousel slide" data-ride="carousel" data-interval="5000">
                <ol className="carousel-indicators">
                    <li className="" data-slide-to="0"></li>
                    <li data-slide-to="1" className="active"></li>
                    <li data-slide-to="2" className=""></li>
                </ol>
                <div className="carousel-inner">
                    <div className="carousel-item">
                        <img className="d-block w-100" src="images/carousel-home/3.png" alt="" />
                    </div>
                    <div className="carousel-item active">
                        <img className="d-block w-100" src="images/carousel-home/1.png" alt="" />
                    </div>
                    <div className="carousel-item">
                        <img className="d-block w-100" src="images/carousel-home/2.png" alt="" />
                    </div>
                </div>
            </div>
            <h1 className="text-center" style={{fontWeight: "bold", color: "white", background: "black", padding: "0.3em"}}>Location</h1>
            <div className="card-deck" id="contactContainer" style={{width: "80%", margin: "3% auto"}}>
                <div className="card" id="map" style={{maxWidth: "100%", position: "relative", overflow: "hidden"}}>
                    <MapComponent />
                </div>
                <div className="text-center card" id="address" style={{maxWidth: "100%", margin: "auto", background: "#e6e6e6", border: 'none'}}>
                    <h3 style={{fontWeight: "bold"}}>Come Visit!</h3>
                    <h5>1 Silver Street</h5>
                    <h5>St.Thomas, Ontario, Canada</h5>
                    <h5>519-520-6337</h5>
                    <h5>cosgrovehockeyacademy@gmail.com</h5>
                </div>
            </div>
            <div className="socials text-center">
                <a href="https://www.facebook.com/cosgrovehockeyacademy/">
                    <img src="/images/socials/facebook.png" alt="" />
                </a>
                <a href="https://twitter.com/cosgrovehockey/">
                    <img src="/images/socials/twitter.png" alt="" />
                </a>
                <a href="https://www.instagram.com/cosgrovehockeyacademy/">
                    <img src="/images/socials/instagram.png" alt="" />
                </a>
            </div>
        </div>
    )
}
