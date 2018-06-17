import $ from 'jquery'
import SineWaves from 'sine-waves'


$(function() {
    var waves = new SineWaves({
        el: document.getElementById('waves'),

        speed: -8,

        width: function() {
            return $(window).width() + 100;
        },

        height: function() {
            return $(window).height() - 100;
        },

        rotate: 180,

        ease: 'SineOut',

        waves: [{
            timeModifier: 1,
            lineWidth: 3,
            amplitude: 220,
            wavelength: 200,
            segmentLength: 20
        }, {
            timeModifier: 1,
            lineWidth: 2,
            amplitude: 150,
            wavelength: 120,
        }, {
            timeModifier: 1,
            lineWidth: 1,
            amplitude: -150,
            wavelength: 50,
            segmentLength: 10,
        }, {
            timeModifier: 1,
            lineWidth: 0.5,
            amplitude: -100,
            wavelength: 100,
            segmentLength: 10,
        }],

        initialize: function() {

        },

        resizeEvent: function() {
            var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

            var index = -1;
            var length = this.waves.length;
            while (++index < length) {
                this.waves[index].strokeStyle = gradient;
            }

            // Reset values back to 0
            index = void 0;
            length = void 0;
            gradient = void 0;
        }
    });
});

