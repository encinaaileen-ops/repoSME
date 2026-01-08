// Login page functionality
$(document).ready(function () {
    // Initialize the page
    initializeLogin();

    // Check for system messages
    checkSystemMessage();
});

function initializeLogin() {
    // Hide reset password form initially
    $('#reset_password').hide();

    // Focus on username field
    $('#signin_username').focus();

    // Handle form submission
    $('#signin_form').on('submit', function (e) {
        var username = $('#signin_username').val();
        var password = $('#signin_password').val();

        // Basic validation
        if (!username || !password) {
            e.preventDefault();

            if (!username) {
                $('#signin_username').parent().addClass('has-error');
                $('#signin_username').focus();
            }
            if (!password) {
                $('#signin_password').parent().addClass('has-error');
                if (username) {
                    $('#signin_password').focus();
                }
            }

            return false;
        }
    });

    // Remove error class on input
    $('#signin_username, #signin_password').on('input', function () {
        $(this).parent().removeClass('has-error');
    });

    // Initialize iCheck for checkboxes
    if ($.fn.iCheck) {
        $('.i-checks').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green'
        });
    }
}

function showResetPassForm() {
    $('#signin').fadeOut(300, function() {
        $('#reset_password').fadeIn(300);
        $('#reset_password input:first').focus();
    });
    return false;
}

function showSigninForm() {
    $('#reset_password').fadeOut(300, function() {
        $('#signin').fadeIn(300);
        $('#signin_username').focus();
    });
    return false;
}

function checkSystemMessage() {
    // Check if system message endpoint exists
    if (typeof getSystemMessageUrl !== 'undefined' && getSystemMessageUrl) {
        $.ajax({
            url: getSystemMessageUrl,
            type: 'GET',
            success: function (data) {
                if (data && data.message) {
                    $('#systemMessageBox .alert').html(data.message);
                    $('#systemMessageBox').show();
                }
            },
            error: function () {
                // Silent fail - don't show error to user
            }
        });
    }
}

// Handle 2FA if enabled
if (typeof continueWith2FA !== 'undefined' && continueWith2FA) {
    $(document).ready(function() {
        $('#signin_2fa').focus();

        if (typeof continueWith2FAFooterMessage !== 'undefined' && continueWith2FAFooterMessage) {
            $('#systemMessageBox .alert').html(continueWith2FAFooterMessage);
            $('#systemMessageBox').show();
        }
    });
}