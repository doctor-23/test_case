"use strict";

$(document).ready(function () {
  // check browser for webp format
  function testWebP(callback) {
    var webP = new Image();

    webP.onload = webP.onerror = function () {
      callback(webP.height == 2);
    };

    webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  }

  testWebP(function (support) {
    if (support == true) {
      document.querySelector('body').classList.add('webp');
    } else {
      document.querySelector('body').classList.add('no-webp');
    }
  });
  ;
  $('.hamburger').on('click', function () {
    var headerHeight = document.getElementById('header').offsetHeight + 'px';
    $(this).toggleClass('open');
    $('#header .top-bar_nav').toggleClass('scale').css({
      'top': headerHeight,
      'height': 'calc(100vh - ' + headerHeight + ')'
    });
  });
  $('#header').on('click', '.top-bar_nav ul li', function () {
    $('#header .hamburger').removeClass('open');
    $('#header .top-bar_nav').removeClass('scale');
  });
});