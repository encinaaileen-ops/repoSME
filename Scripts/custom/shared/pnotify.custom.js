function onSuccess(text) {
    //$.pnotify({
    //    title: 'Success',
    //    text: text + ' saved successfully',
    //    type: 'success',
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000
    //});

    new PNotify({
        title: 'Success',
        text: text + ' saved successfully',
        type: 'success',
        icon: false,
        history: false,
        animate_speed: 200,
        delay: 2000
    })
}

function onFailure(text) {
    //$.pnotify({
    //    title: 'Failed!',
    //    text: text + ' failed to save',
    //    type: 'error',
    //    hide: false,
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000
    //});

    new PNotify({
        title: 'Failed!',
        text: text + ' failed to save',
        type: 'error',
        hide: false,
        icon: false,
        history: false,
        animate_speed: 200,
        delay: 2000
    })
}

function onSuccessMessage(text) {
    //$.pnotify({
    //    title: 'Success!',
    //    text: text,
    //    type: 'success',
    //    hide: true,
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000
    //});

     new PNotify({
        title: 'Success!',
        text: text,
        type: 'success',
        hide: true,
        icon: false,
        history: false,
        animate_speed: 200, 
        delay: 2000
    })
}

function onFailureValdationMessage(text) {
    //$.pnotify({
    //    title: 'Failed!',
    //    text: text,
    //    type: 'error',
    //    hide: false,
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000
    //});

     new PNotify({
        title: 'Failed!',
        text: text,
        type: 'error',
        hide: false,
        icon: false,
        history: false,
        animate_speed: 200,
        delay: 2000
    })
}

function onWarningValdationMessage(text) {
    //$.pnotify({
    //    title: 'Failed!',
    //    text: text,
    //    type: 'error',
    //    hide: false,
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000
    //});

    new PNotify({
        title: 'Failed!',
        text: text,
        type: 'error',
        hide: false,
        icon: false,
        history: false,
        animate_speed: 200,
        delay: 2000
    })
}

function notifyArray(data) {
    if (data != null) {
        $.each(data, function (key, notify) {
            switch (notify.AlertType) {
                case 1:
                    {
                        onSuccessMessage(notify.Message);
                        break;
                    }
                case 2:
                    {
                        onFailureValdationMessage(notify.Message);
                        break;
                    }
                case 3:
                    {
                        onWarningValdationMessage(notify.Message);
                        break;
                    }
            }
        });
    }
}

function onError(text) {
    //$.pnotify({
    //    title: 'Error!',
    //    text: text,
    //    type: 'error',
    //    hide: true,
    //    icon: false,
    //    history: false,
    //    animate_speed: 200,
    //    delay: 2000,
    //    addclass: "alert-danger"
    //});

    new PNotify({
        title: 'Error!',
        text: text,
        type: 'error',
        hide: true,
        icon: false,
        history: false,
        animate_speed: 200,
        delay: 2000,
        addclass: "alert-danger"
    })
}