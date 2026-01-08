$(function () { bindEvents(); });
function bindEvents() {
    updateValidation("#signin");
    $("#btnSubmit").unbind("click").click(function () {
        submitLoginForm();
    });
    $("input").unbind("keypress").keypress(function (event) {
        //console.log('kp');
        if (event.which == 13) {
            if ($("#signin").is(":visible")) {
                event.preventDefault();
                submitLoginForm();
            } else {
                event.preventDefault();
                $("#reset_password_form").submit();
            }
        }
    });
    $("#btnChangePassword").unbind("click").click(function (event) {
        event.preventDefault();
        submitResetPasswordForm();
    });

    $("#reset_password_form").unbind("submit").submit(function () {
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
                        // Hide error message
                        var resetPasswordErrorMessage = $('#reset_password_error_message');
                        resetPasswordErrorMessage.text("");

                        // Show attempts left / rate limit warning message
                        if (data.model.AttemptsLeftWarningMessage) {
                            var resetPasswordRateLimitWarning = $('#reset_password_rate_limit_warning');
                            resetPasswordRateLimitWarning.text(data.model.AttemptsLeftWarningMessage);
                        }
                        else {
                            // Hide attempts left / rate limit warning message
                            var resetPasswordRateLimitWarning = $('#reset_password_rate_limit_warning');
                            resetPasswordRateLimitWarning.text("");
                        }
                        // Show login form
                        $inputEmial.val('');
                        showLoginForm(true);
                    } else {
                        // Bind and refresh the html
                        $("#reset_password").html(data.message);
                        bindEvents();
                    }
                },
                error: function (errorData) {
                    // Show error message
                    var resetPasswordErrorMessage = $('#reset_password_error_message');
                    resetPasswordErrorMessage.text(errorData.responseJSON.model.ErrorMessage);
                },
                complete: function () {
                    $btnSubmit.prop('disabled', false);
                    $btnSubmit.find("i").remove();
                    $inputEmial.prop('disabled', false);
                }
            });
        }
        return false;
    });

    if (window.continueWith2FA) {
        $('#systemMessageBox').show();
        $('#systemMessageBox .alert-info').html(window.continueWith2FAFooterMessage);
    }
    else {
        $.ajax({
            url: window.getSystemMessageUrl,
            success: function (data) {
                if (data.success === true) {
                    $('#systemMessageBox').show();
                    $('#systemMessageBox .alert-info').html(data.response);
                }
            }
        });
    }
}

function submitLoginForm() {
	$("#signin_form input").prop('disabled', true);
	$("#signin_form button").prop('disabled', true);

    var $form = $('#signin_form');

    const dataContainer = document.getElementById("2fa-data-container");
    const continueWith2FA = dataContainer?.dataset?.continuewith2fa;
    const userName2FA = dataContainer?.dataset?.username;
    const userNameHtmlInput = $('#signin_username').val();

    if ($form.valid()) {
        //progressbar("body_id");
        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            data: {
                UserName: userNameHtmlInput ? userNameHtmlInput : userName2FA,
                Password: $('#signin_password').val(),
                RememberMe: $('#signin_remeber').prop('checked'),
                TimezoneOffset: new Date().getTimezoneOffset(),
                ReturnUrl: window.location.search,
                Check2FACode: continueWith2FA === "True",
                _2FACode: $('#signin_2fa').val()
            },
            success: function (data) {
                //console.log(data);
                if (data.model.IsPasswordChangeNeeded) {
                    if (data.model.ContinueWith2FA) {
                        window.proceedWith2FAAfterPwdUpdate = true;
                    }
                    passwordExpiryValues.StartPageUrl = window.location.href;
                    showChangePasswordNotification(data.model.PopupMessage, data.model.PasswordExpireDays,
                        function() { onSignInSuccess(data) });
                } else {
                    onSignInSuccess(data);
                };
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

function onSignInSuccess(data) {
    if (data.model.IsSuccess && (!data.model.ContinueWith2FA)) { 
        window.location.href = data.model.StartPageUrl;
    } else {
        $("#signin").html(data.message);
        bindEvents();
        if (data.model.ShutdownMessage !== null && data.model.ShutdownMessage != undefined) {
            $("#shutdown_message").show();
        }
    }
}

function submitResetPasswordForm() {
    $("#changepassword_form input").prop("disabled", true);
    $("#changepassword_form button").prop("disabled", true);

    var $form = $("#changepassword_form");
    if ($form.valid()) {
        $.ajax({
            url: $form.attr("action"),
            type: $form.attr("method"),
            data: {
                Username: $("#changepassword_username").val(),
                CurrentPassword: $("#changepassword_currentPassword").val(),
                Password: $("#changepassword_password").val(),
                ConfirmPassword: $("#changepassword_confirmPassword").val(),
                StartPageUrl: passwordExpiryValues.StartPageUrl
            },
            success: function (data) {
                if (window.proceedWith2FAAfterPwdUpdate) {
                    location.reload();
                }
                onSignInSuccess(data);
            },
            error: function (errorData) {
                $("input").prop("disabled", false);
                $("button").prop("disabled", false);
                console.log(errorData);
            },
            complete: function () {
                //loadingEnd();
            }

        });
    }
    return false;
}

function showChangePasswordNotification(msg, pwdDays, afterConfirm) {
    swal({
        title: passwordExpiryValues.titleWarning,
        text: msg,
        showCancelButton: false,
        confirmButtonColor: "#ec6c62",
        confirmButtonText: passwordExpiryValues.btnName,
        type: "warning",
        closeOnConfirm: true
    }, function() { afterConfirm(); })};

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
        // Hide attempts left / rate limit warning
        var resetPasswordRateLimitWarning = $('#reset_password_rate_limit_warning');
        resetPasswordRateLimitWarning.text("");
    }
    $("#reset_password").hide();
    $("#signin").show();
    updateValidation("#signin");
}