$(function () { bindEvents(); });
function bindEvents() {
    updateValidation("#signin");
    $('#btnSubmit').click(function () {
        submitLoginForm();
    });
    $("input").keypress(function (event) {
        console.log('kp');
        if (event.which == 13) {
            event.preventDefault();
            submitLoginForm();
        }
    });

    $('#reset_password_form').submit(function () {
        if ($(this).valid()) {

            var data = $(this).serialize();

            var $btnSubmit = $("#send_reset_email_button");
            var $inputEmial = $('#signin_email');

            $btnSubmit.prop('disabled', true);
            $btnSubmit.prepend('<i class="fa fa-spinner fa-pulse">');
            $inputEmial.prop('disabled', true);

            $.ajax({
                url: this.action,
                type: this.method,
                data: data,
                success: function (data) {
                    if (data.model.IsSuccess) {
                        $inputEmial.val('');
                        showLoginForm(true);
                    } else {
                        $("#reset_password").html(data.message);
                        bindEvents();
                    }
                },
                error: function (errorData) { },
                complete: function () {
                    $btnSubmit.prop('disabled', false);
                    $btnSubmit.find("i").remove();
                    $inputEmial.prop('disabled', false);
                }
            });
        }
        return false;
    });
}

function submitLoginForm() {
    $("#signin_form input").prop('disabled', true);
    $("#signin_form button").prop('disabled', true);

    var $form = $('#signin_form');

    if ($form.valid()) {
        //progressbar("body_id");
        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            data: {
                MemberUserName: $('#signin_member_username').val(),
                SuperuserUserName: $('#signin_superuser_username').val(),
                SuperuserPassword: $('#signin_superuser_password').val(),
                Secret: $('#signin_secret').val(),
                RememberMe: $('#signin_remeber').prop('checked'),
                TimezoneOffset: new Date().getTimezoneOffset()
            },
            success: function (data) {
                console.log(data);
                if (data.model.IsSuccess) {
                    window.location.href = data.model.StartPageUrl;
                } else {
                    $("#signin").html(data.message);
                    bindEvents();
                }
            },
            error: function (errorData) {
                $("input").prop('disabled', false);
                $("button").prop('disabled', false);
            },
            complete: function () {
                //loadingEnd();
            }

        });
    }
    return false;
}

function showResetPassForm() {
    $("#signin").hide();
    $("#reset_password").show();
    $('#resetpass_username').val($('#signin_username').val());
    updateValidation("#reset_password");
}

function showLoginForm(sended) {
    if (sended) {
        $("#reset_password_email_sended").show();
    } else {
        $("#reset_password_email_sended").hide();
    }
    $("#reset_password").hide();
    $("#signin").show();
    updateValidation("#signin");
}