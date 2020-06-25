var c = console;

$('#submit').on('click', function(e) {
    e.preventDefault();

    $('.needs-validation input').each(function() {
        var $this = $(this),
            valid = true;

        // All fields are required
        if (this.value === '') { valid = false; }

        // Per-input requirements
        switch(this.id) {
            case 'cbcUrl':
                if (this.value.split(':')[0] !== 'https') { valid = false; }
                if (this.value.split('.')[1] !== 'conferdeploy') { valid = false;  }
                if (this.value.slice(-1) === '/') { valid = false;  }
                break;

            case 'orgKey':
                if (this.value.length != 8) { valid = false; }
                break;

            case 'customApiId':
                if (this.value.length != 10) { valid = false; }
                break;

            case 'customApiKey':
                if (this.value.length != 24) { valid = false; }
                break;
        }

        if (valid) {
            $this.addClass('is-valid');
            $this.removeClass('is-invalid');
            localStorage[this.id] = this.value;
        } else {
            $this.addClass('is-invalid');
            $this.removeClass('is-valid');
        }
    });
});


$(document).ready(function() {
    var fields = ['cbcUrl', 'orgKey', 'customApiId', 'customApiKey'];

    for (var i in fields) {
        if (fields[i] in localStorage) {
            c.log(localStorage[fields[i]]);
            $('#' + fields[i]).val(localStorage[fields[i]]);
        }
    }

    $('.btn-primary').css('background-image', 'none');

});