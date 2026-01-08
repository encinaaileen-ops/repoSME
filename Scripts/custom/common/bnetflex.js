bnetflex = {
    ui: {
        progressbar: {
            show: function() {
                $('#ProgressBarWindow').data("kendoWindow").open().center();
            },
            hide: function() {
                $('#ProgressBarWindow').data("kendoWindow").close();
            }
        },
        utils: {
            fixedBlockPosition: {
                init: function (blockId, topOffset) {
                    var fixmeTop = $(blockId).offset().top;
                    $(window).scroll(function () {
                        var currentScroll = $(window).scrollTop();
                        if (currentScroll >= fixmeTop) {
                            $(blockId).css({
                                position: 'fixed',
                                top: topOffset + 'px',
                                width: $(blockId).width()
                            });
                        } else {
                            $(blockId).css({
                                position: 'static'
                            });
                        }
                    });
                }
            },
            adaptiveBlockHeight: {
                init: function (blockId, topOffset) {
                    var resize = function() {
                        var $window = $(window);
                        var windowHeigth = $window.height();
                        $(blockId).height(windowHeigth - topOffset + 'px');
                    }
                    $(window).on('resize', resize);

                    resize();
                }
            },
            date: {
                parse:
                    function(val) {
                        return new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10));
                    },
                toString:
                    function (val) {
                        return val == undefined || val == null ? '' : kendo.toString(kendo.parseDate(new Date(parseInt(val.replace("/Date(", "").replace(")/", ""), 10))), settings.dateFormat);
                    }
            }

        }
    },
    string: {
        formatFileSize: function (bytes, decimals) {
            if (bytes == 0) return '0 Byte';
            var k = 1000;
            var dm = decimals + 1 || 3;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
        }
    },
    kendo: {
        getStringFromArray: function (array) {
            var result = "";

            for (var i = 0; i < array.length; i++) {
                result += "<span>" + array[i] + "</span>";
                if (i < array.length - 1) {
                    result += "<span>, </span>";
                }
            }
            return result;
        },
        generatePdf: function (id, fileName) {
            kendo.drawing.drawDOM($("#" + id))
				.then(function (group) {
					// Render the result as a PDF file
					return kendo.drawing.exportPDF(group, {
						paperSize: "auto",
						template: $("#page-templXateXX").html(),
						margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" }
					});
				})
				.done(function (data) {
					// Save the PDF file
					kendo.saveAs({
						dataURI: data,
						fileName: fileName,
						proxyURL: "//demos.telerik.com/kendo-ui/service/export"
					});
				});
        },
        getLinksFromArray: function (array, href) {
            var result = "";

            for (var i = 0; i < array.length; i++) {
                result += "<a href='" + href + array[i].QueryString + "'>" + array[i].Name + "</a>";
                if (i < array.length - 1) {
                    result += "<span>, </span>";
                }
            }
            return result;
        }
    },
    guid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

Array.prototype.diff = function (a) {
    return this.filter(function (i) { return a.indexOf(i) < 0; });
};

function redirectToAction(url) {
    window.location.href = url;
}

function initializeRemotelyValidatingElementsWithAdditionalFields($form) {
    var remotelyValidatingElements = $form.find("[data-val-remote]");
    $.each(remotelyValidatingElements, function (i, element) {
        var $element = $(element);
        var additionalFields = $element.attr("data-val-remote-additionalfields");
        if (additionalFields.length == 0) return;
        var rawFieldNames = additionalFields.split(",");
        var fieldNames = $.map(rawFieldNames, function (fieldName) { return fieldName.replace("*.", ""); });
        $.each(fieldNames, function (i, fieldName) {
            $form.find("#" + fieldName).change(function () {
                // force re-validation to occur
                $element.removeData("previousValue");
                $element.valid();
            });
        });
    });
}

function validateTab(selector, form) {
    $(form + " [data-val=true]").attr("data-val", "false");
    updateValidation(form);
    $(selector + " [data-val=false]").attr("data-val", "true");
    updateValidation(form);
    var isValid = $(form).valid();
    if (!isValid) {
        return false;
    }
    return true;
}

$(function () {
    $('#preloader_anim').hide();
    $('#preloader_bg').hide();
    $('body').css('overflow', 'auto');
});

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function displayKendoLoading(target) {
    var element = $(target);
    kendo.ui.progress(element, true);
}

function hideKendoLoading(target) {
    var element = $(target);
    kendo.ui.progress(element, false);
}

function getUrlQueryFromObj(obj) {
    var query = jQuery.param(obj);
    return query;
}