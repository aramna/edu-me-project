import $ from 'jquery'


$(function() {

    var count = $('.slide').length,
        i = 1;

    function nextSlide() {
        if (i < count) {
            $('.active').removeClass('active').next('.slide').addClass('active');
            i++;
        }
    }

    function prevSlide() {
        if (i > 1) {
            $('.active').removeClass('active').prev('.slide').addClass('active');
            i--;
        }
    }

    $('.slide:first-of-type').addClass('active');
    $('.container').on('click touchend', function() {
        if (i == count) {
            $('.active').removeClass('active');
            $('.slide:first-of-type').addClass('active');
            i = 1;
        } else {
            nextSlide();
        }
    });

    window.onkeyup = function(e) {
        if (e.keyCode == 39) {
            nextSlide();
        }
        if (e.keyCode == 37) {
            prevSlide();
        }
    }

});