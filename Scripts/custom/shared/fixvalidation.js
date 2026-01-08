
function updateValidation(selector) {
    $.validator.setDefaults({ ignore: "" });

	$(selector).removeData('validator');
	$(selector).removeData('unobtrusiveValidation');
	$.validator.unobtrusive.parse(selector);

    var elements = $(selector).find("[data-val]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        if (element.parents(":hidden").length > 0) {
            element.attr("data-val", "false");
        } else {
            element.attr("data-val", "true");
        }
    }

    var elements2 = $(selector).find("[data-rule-integervalidation]");
	for (var i = 0; i < elements2.length; i++) {
	    var element = $(elements2[i]);
	    if (element.parents(":hidden").length > 0) {	        
	        element.attr("data-rule-integervalidation", "false");
	    } else {	       
	        element.attr("data-rule-integervalidation", "true");
	    }
	}
}

function updateProductFormValidation(selector) {
    $.validator.setDefaults({ ignore: "" });

    $(selector).removeData('validator');
    $(selector).removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(selector);

    var elements = $(selector).find("[data-val]");
    for (var i = 0; i < elements.length; i++) {
        var element = $(elements[i]);
        if (element.parents(":hidden").length > 0 && (element.parents(".productSettingsSection").length <= 0 || element.parents("[product-attribute-data-validation=false]").length > 0)) {
            element.attr("data-val", "false");
        } else {
            element.attr("data-val", "true");
        }
    }

    var elements2 = $(selector).find("[data-rule-integervalidation]");
    for (var i = 0; i < elements2.length; i++) {
        var element = $(elements2[i]);
        if (element.parents(":hidden").length > 0) {
            element.attr("data-rule-integervalidation", "false");
        } else {
            element.attr("data-rule-integervalidation", "true");
        }
    }

    var elements3 = $(selector).find("[data-rule-decimalvalidation]");
    for (var i = 0; i < elements3.length; i++) {
        var element = $(elements3[i]);
        if (element.parents(":hidden").length > 0) {
            element.attr("data-rule-decimalvalidation", "false");
        } else {
            element.attr("data-rule-decimalvalidation", "true");
        }
    }

    $(selector).removeData('validator');
    $(selector).removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(selector);
}

(function($) {
    var defaultOptions = {
        validClass: 'has-success',
        errorClass: 'has-error',        
        highlight: function (element, errorClass, validClass) {          
            //$(element).closest("div")
            //    .removeClass(validClass)
            //    .addClass('has-error');
            //$(element).closest("td")
            //    .removeClass(validClass)
            //    .addClass('has-error');
        },
        unhighlight: function (element, errorClass, validClass) {           
            //$(element).closest("div")
            //    .removeClass('has-error')
            ////.addClass(validClass)
            //;
            //$(element).closest("td")
            //    .removeClass('has-error')
            //    //.addClass(validClass)
            //;
        },
        ignore: "",
        //onkeyup: true,
        //onfocusout: true,
        onsubmit: true
    };

    $.validator.setDefaults(defaultOptions);

    $.validator.unobtrusive.options = {
        errorClass: defaultOptions.errorClass,
        validClass: defaultOptions.validClass,
    };


    //re-set all client validation given a jQuery selected form or child
    $.fn.resetValidation = function() {

        var $form = this.closest('form');

        //reset jQuery Validate's internals
        $form.validate().resetForm();

        //reset unobtrusive validation summary, if it exists
        $form.find("[data-valmsg-summary=true]")
            .removeClass("validation-summary-errors")
            .addClass("validation-summary-valid")
            .find("ul").empty();

        //reset unobtrusive field level, if it exists
        $form.find("[data-valmsg-replace]")
            .removeClass("field-validation-error")
            .addClass("field-validation-valid")
            .empty();

        return $form;
    };

    //reset a form given a jQuery selected form or a child
    //by default validation is also reset
    $.fn.formReset = function(resetValidation) {
        var $form = this.closest('form');

        $form[0].reset();

        if (resetValidation == undefined || resetValidation) {
            $form.resetValidation();
        }

        return $form;
    }

})(jQuery);