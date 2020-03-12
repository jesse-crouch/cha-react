import React, { Component } from 'react';
import './App.css';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Popup from './components/Popup';
import Cart from './components/Cart';
import { FaShoppingCart } from 'react-icons/fa';
import { toggleCart } from './components/cartMethods';

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