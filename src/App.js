import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Popup from './components/Popup';
import Cart from './components/Cart';
import $ from 'jquery';
import { FaShoppingCart, FaArrowRight } from 'react-icons/fa';

function toggleCart() {
  var open = (document.getElementById('cart-container').style.visibility !== 'visible');
  var cartBtn = document.getElementById('cartBtn');
  
  // Change the icon in the cart button
  var newIcon = open ? <FaArrowRight /> : <FaShoppingCart />;
  ReactDOM.unmountComponentAtNode(cartBtn);
  ReactDOM.render(newIcon, cartBtn);
  
  // Animate the cart sliding into view or out of view from right to left or from left to right
  var cart = document.getElementById('cart');
  var cartCont = document.getElementById('cart-container');
  if (open) {
    cartCont.style.visibility = 'visible';
  }
  var docWidth = document.getElementById('main').clientWidth;
  var leftValue = open ? (docWidth - cart.clientWidth) + 'px' : '100%';
  $('#cart').animate({left: leftValue}, 0);
  if (!open) {
    cartCont.style.visibility = 'hidden';
  }
}

export default class App extends Component {
  componentDidMount() {
    /*var cartBtn = document.getElementById('cartBtn');
    var docWidth = document.getElementById('main').clientWidth;
    var docHeight = document.getElementById('main').clientHeight;
    cartBtn.style.bottom = -(docHeight - 100) + 'px';
    cartBtn.style.right = -(docWidth - 50) + 'px';*/
  }

  render() {
    return (
      <div id="page">
        <Header />
        <MainContent />
        <Popup />
        <Cart />
        <button className="btn btn-dark" id="cartBtn" onClick={toggleCart}><FaShoppingCart /></button>
      </div>
    )
  }
}