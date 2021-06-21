$(document).ready(function () {
    @@include('_webp_config.js');
    
    $('.hamburger').on('click', function (){
        var headerHeight = document.getElementById('header').offsetHeight + 'px';
        $(this).toggleClass('open');
        $('#header .top-bar_nav').toggleClass('scale')
            .css({
                'top': headerHeight,
                'height': 'calc(100vh - ' + headerHeight + ')'
            })
    });

    $('#header').on('click', '.top-bar_nav ul li', function () {
        $('#header .hamburger').removeClass('open');
        $('#header .top-bar_nav').removeClass('scale')
    });
})


