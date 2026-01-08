var BulkLogic = (function () {
    var self = bulkLogic.prototype;


    /*

    params - you can see default parameters in self._default
            required:
                - excelBulkName             - UploadFileConstants.ExcelBulkName
                - excelBulkExtensions:      - UploadFileConstants.ExcelBulkExtensions
                - documentsBulkExtension:   - UploadFileConstants.MemberDocumentsBulkExtension
                - memberDocumentsBulkName:  - UploadFileConstants.MemberDocumentsBulkName

    urls - required:
                - validateUrl               - common BulkOperation/ValidateAdditionData
                - checkValidationUrl        - common BulkOperation/CheckBulkValidationProgress
                - checkBulkOperationStatusUrl - common BulkOperation/CheckBulkOperationStatus
                - cancelUrl                 - (cancel button url)
                - backUrl                   - (back button url)
                - backImportUrl             - (back to import button url)

    localization - required:
                - warningTitle         - common for duplicateWarning alert
                - duplicateWarningMessage       - common for duplicateWarning alert
                - warningYesButton     - common for duplicateWarning alert
                - warningNoButton      - common for duplicateWarning alert

    */
    function bulkLogic(params, urls, localization) {
        self._data = $.extend(self._default, params || {});
        self._urls = urls;
        self._localization = localization;
        $(self._init);
    }


    // initialize
    //-------------------------------------------------------------------------

    self._init = function () {

        // init excel upload control
        $(self._data.exelFile).kendoUpload({
            multiple: false,
            select: self._onExcelSelect,
            error: function (e) { },
            localization: {
                select: strings.selectFiles
            }
        });

        // init member documents upload control
        $(self._data.documentsFile).kendoUpload({
            multiple: false,
            select: self._onDocumentsSelect,
            remove: self._onRemoveDocments,
            error: function (e) { },
            localization: {
                select: strings.selectFiles
            }
        });

        // init member documents upload control
        $(self._data.picturesFile).kendoUpload({
            multiple: false,
            select: self._onPicturesSelect,
            remove: self._onRemovePictures,
            error: function (e) { },
            localization: {
                select: strings.selectFiles
            }
        });

        // init invoice documents upload control
        $(self._data.invoiceDocumentsFile).kendoUpload({
            multiple: false,
            select: self._onInvoiceDocumentsSelect,
            remove: self._onRemoveInvoiceDocments,
            error: function (e) { },
            localization: {
                select: strings.selectFiles
            }
        });

        // needed to reload properties 
        $(document).ajaxComplete(self._ajaxComplete);


        $(document).on('click', self._data.importBtn, self._onImport);

        $(document).on('click', self._data.importValidOnlyBtn, self._onImport);
        $(self._data.validateBtn).click(self._onValid);

        $(self._data.progressFrom).ready(function() {
            var content = $(self._data.progressFrom).html();
            if ($.trim(content) !== "") {
                self._showProgressPage();
            }
        });

        $("body").on("click", ".bulk-btn", self._onButtonClick);

        self._reload();
    };


    // validation
    //-------------------------------------------------------------------------

    self._onValid = function (e) {
        var $importForm = $(self._data.importForm);
        updateValidation($importForm);
        var isValid = $importForm.valid();
        if (!isValid)
            return;


            var isValid = true;
            if ($(self._data.createWorkflow).length && ($(self._data.notifyMemberForm).length && $(self._data.notifyMemberForm).is(':visible') || !$(self._data.notifyMemberForm).length)) {
                if (!self._checkIsCreateWorkflowList()) {
                    isValid = false;
                }
            }

            if ($(self._data.notifyHr).length) {
                if (!self._checkNotifyHrList()) {
                    isValid = false;
                }
            }

            if ($(self._data.notifyMember).length && ($(self._data.notifyMemberForm).length && $(self._data.notifyMemberForm).is(':visible') || !$(self._data.notifyMemberForm).length)) {
                if (!self._checkNotifyMemberList()) {
                    isValid = false;
                }
            }

            if ($(self._data.notifyInsurer).length) {
                if (!self._checkNotifyInsurerList()) {
                    isValid = false;
                }
            }

            if ($(self._data.updateType).length) {
                if (!self._checkUpdateTypeList()) {
                    isValid = false;
                }
            }

            if ($(self._data.transferType).length) {
                if (!self._checkTransferTypeList()) {
                    isValid = false;
                }
            }

            if ($(self._data.createWorklowListAddition).length) {
                if (!self._checkIsCreateAdditionWorkflowList()) {
                    isValid = false;
                }
            }


            if ($(self._data.createWorklowListDeletion).length) {
                if (!self._checkIsCreateDeletionWorkflowList()) {
                    isValid = false;
                }
            }


            if ($(self._data.categoryImportList).length) {
                if (!self._checkIsCreateCategoryWorkflowList()) {
                    isValid = false;
                }
            }

            if (!self._checkExcelFile()) {
                return;
            }
            if (!isValid) return;
 
        var data = new FormData();
        data.append(self._data.excelBulkName, self.execFileStream.rawFile);

        if (self.documentsFileStream) {
            if (!self._checkDocumentsArchive()) {
                return;
            } else {
                data.append(self._data.memberDocumentsBulkName, self.documentsFileStream.rawFile);
            }
        }

        if (self.picturesFileStream) {
            if (!self._checkPicturesArchive()) {
                return;
            } else {
                data.append(self._data.memberPicturesBulkName, self.picturesFileStream.rawFile);
            }
        }

        if (self.invoiceDocumentsFileStream) {
            if (!self._checkInvoiceDocumentsArchive()) {
                return;
            } else {
                data.append(self._data.invoiceDocumentsBulkName, self.invoiceDocumentsFileStream.rawFile);
            }
        }

        var ddlCreateWorkflow = $(self._data.createWorkflow).data("kendoDropDownList");
        if (ddlCreateWorkflow != undefined) {
            self._data.isCreateWorkflowListValue = ddlCreateWorkflow.value();
            data.append("isCreateWorkflow", self._data.isCreateWorkflowListValue === "1" || self._data.isCreateWorkflowListValue === "2");
        } else {
            data.append("isCreateWorkflow", true);
        }

        var ddlImportType = $(self._data.createWorkflow).data("kendoDropDownList");
        if (ddlImportType != undefined) {
            data.append("importType", ddlImportType.value());
        } else {
            data.append("importType", 1);
        }


        var ddlValidationType = $(self._data.validationType).data("kendoDropDownList");
        if (ddlValidationType != undefined) {
            var validationTypeValue = ddlValidationType.value();
            data.append("validationType", validationTypeValue);
        }

        var ddlNotifyHr = $(self._data.notifyHr).data("kendoDropDownList");
        if (ddlNotifyHr != undefined) {
            var isNotifyHrListValue = ddlNotifyHr.value();
            data.append("isNotifyHr", isNotifyHrListValue === "1");
        } else {
            data.append("isNotifyHr", false);
        }

        var ddlNotifyMember = $(self._data.notifyMember).data("kendoDropDownList");
        if (ddlNotifyMember != undefined) {
            var isNotifyMemberListValue = ddlNotifyMember.value();
            data.append("isNotifyMember", isNotifyMemberListValue === "1");
        } else {
            data.append("isNotifyMember", false);
        }

        var ddlNotifyInsurer = $(self._data.notifyInsurer).data("kendoDropDownList");
        if (ddlNotifyInsurer != undefined) {
            var isNotifyInsurerListValue = ddlNotifyInsurer.value();
            data.append("isNotifyInsurer", isNotifyInsurerListValue === "3");
        } else {
            data.append("isNotifyInsurer", false);
        }

        var ddlUpdateType = $(self._data.updateType).data("kendoDropDownList");
        if (ddlUpdateType != undefined) {
            var UpdateTypeListValue = ddlUpdateType.value();
            data.append("updateType", UpdateTypeListValue);
        } else {
            data.append("updateType", 1);
        }

        var ddlShowSalary = $(self._data.showSalary);
        if (ddlShowSalary.length) {
            var showSalary = ddlShowSalary.is(":checked");
            data.append("showSalary", showSalary);
        } else {
            data.append("showSalary", true);
        }

        var ddlTransferType = $(self._data.transferType).data("kendoDropDownList");
        if (ddlTransferType != undefined) {
            var transferTypeListValue = ddlTransferType.value();
            data.append("transferType", transferTypeListValue);
        } else {
            data.append("transferType", 1);
        }

        var ddlCreateWorkflowAddition = $(self._data.createWorklowListAddition).data("kendoDropDownList");
        if (ddlCreateWorkflowAddition != undefined && $("#import_type_addition").is(':visible')) {
            var createWorkflowAdditionListValue = ddlCreateWorkflowAddition.value();
            data.append("importTypeAddition", createWorkflowAdditionListValue);
        }

        var ddlCreateWorkflowDeletion = $(self._data.createWorklowListDeletion).data("kendoDropDownList");
        if (ddlCreateWorkflowDeletion != undefined) {
            var createWorkflowDeletionListValue = ddlCreateWorkflowDeletion.value();
            data.append("importTypeDeletion", createWorkflowDeletionListValue);
        }

        var ddlDocumentType = $(self._data.memberDocumentType).data("kendoDropDownList");
        if (ddlDocumentType != undefined) {
            var docType = ddlDocumentType.value();
            data.append("documentType", docType);
        } else {
            data.append("documentType", null);
        }

        var isCOCRequired = $(self._data.isCOCRequired)
        if (isCOCRequired != undefined) {
            data.append("isCOCRequired", isCOCRequired.is(':checked'));
        }


        var ddlCreateWorkflowCategory = $(self._data.categoryImportList).data("kendoDropDownList");
        if (ddlCreateWorkflowCategory != undefined && $("#import_type_category").is(':visible')) {
            var createWorkflowCategoryListValue = ddlCreateWorkflowCategory.value();
            data.append("importTypeAddition", createWorkflowCategoryListValue);
        }

        //else {
        //    data.append("isNotifyHr", false);
        //}

        bnetflex.ui.progressbar.show();

        var xhr = new XMLHttpRequest();


        xhr.addEventListener("load", function () {
            if (this.status === 200) {
                setTimeout(self._checkStatus, 1000);
            } else if (this.status === 409) {
                bnetflex.ui.progressbar.hide();
                onFailureValdationMessage('Malware detected!');
            } else {
                bnetflex.ui.progressbar.hide();
                onFailureValdationMessage(strings.errorOnSubmit);
            }
        }, false);

        xhr.open('POST', self._urls.validateUrl, true);
        xhr.send(data);
    };

    self._checkDocumentsArchive = function() {
        if ($.inArray(self.documentsFileStream.extension.toLowerCase(), self._data.documentsBulkExtension.split(',')) < 0 || self.documentsFileStream.size > 52428800) {
            $(self._data.documentsFileSizeError).show();
            return false;
        }
        return true;
    };

    self._checkPicturesArchive = function () {
        if ($.inArray(self.picturesFileStream.extension.toLowerCase(), self._data.documentsBulkExtension.split(',')) < 0 || self.picturesFileStream.size > 52428800) {
            $(self._data.picturesFileSizeError).show();
            return false;
        }
        return true;
    };

    self._checkInvoiceDocumentsArchive = function () {
        if ($.inArray(self.invoiceDocumentsFileStream.extension.toLowerCase(), self._data.documentsBulkExtension.split(',')) < 0 || self.invoiceDocumentsFileStream.size > 52428800) {
            $(self._data.invoiceDocumentsFileSizeError).show();
            return false;
        }
        return true;
    };

    // Event select excel file
    //-------------------------------------------------------------------------

    self._onExcelSelect = function (e) {
        self.execFileStream = e.files[0];
    };

    // needed to reload properties 
    //-------------------------------------------------------------------------

    self._ajaxComplete = function (event, xhr, settings) {
        if (settings.url.indexOf('/bulkoperation/') > 0) {
            self._reload();
        }
    };


    // reload properties
    //-------------------------------------------------------------------------

    self._reload = function () {
        $('#back-details').attr('data-href', self._urls.backUrl);
        $('#import-back-btn').attr('data-href', self._urls.backImportUrl);
        $('#cancel-btn').attr('data-href', self._urls.cancelUrl);
    };


    // data validation progress
    //-------------------------------------------------------------------------

    self._checkStatus = function () {
        $.ajax({
            url: self._urls.checkValidationUrl,
            type: 'POST',
            data: JSON.stringify({}),
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                if (data.result.Success) {
                    if (!data.result.BulkOperationModel.HasInProgress) {
                        self._transferComplete(data);
                    } else {
                        setTimeout(self._checkStatus, 2000);
                    }
                } else {
                    onFailureValdationMessage(data.result.ValidationMessage);
                    bnetflex.ui.progressbar.hide();
                }
            },
            error: function () {
                onFailureValdationMessage("Oops something went wrong");
                bnetflex.ui.progressbar.hide();
            }
        });
    };


    // callback end validation
    //-------------------------------------------------------------------------

    self._transferComplete = function (data) {
        var validationResult = data.result;
        if (validationResult.Success) {
            if (data.hasSystemError) {
                window.location = data.errorPageUrl;
                return;
            }
            $(self._data.mainForm).html('');
            $(self._data.validationResultFrom).html(data.partialView);
        } else {
            if (validationResult.ValidationMessage != null) {
                onFailureValdationMessage(validationResult.ValidationMessage);
            } else {
                onFailureValdationMessage(self._data.errorOnSubmit);
            }
        }
        bnetflex.ui.progressbar.hide();
    };
    //
    //-------------------------------------------------------------------------

    self._checkExcelFile = function () {
        if (!self.execFileStream || $.inArray(self.execFileStream.extension.toLowerCase(), self._data.excelBulkExtensions.split(',')) < 0) {
            $(self._data.excelFileError).show();
            return false;
        }
        return true;
    };

    // callback on click buttons 
    //-------------------------------------------------------------------------

    self._onButtonClick = function () {
        var href = $(this).attr('data-href');
        if (href)
            window.location = href;
        else
            console.error("data-href is empty");
    }


    //-------------------------------------------------------------------------

    self._checkIsCreateWorkflowList = function () {
        var isCreateWorkflowList = $(self._data.createWorkflow).data("kendoDropDownList");
        if (isCreateWorkflowList.value() === "") {
            $(self._data.createWorkflowError).show();
            return false;
        }
        return true;
    }

    self._checkNotifyHrList = function () {
        var isNotifyHRList = $(self._data.notifyHr).data("kendoDropDownList");
        if (isNotifyHRList.value() === "") {
            $(self._data.notifyHrError).show();
            return false;
        }
        return true;
    }

    //self._checkExcelFile = function () {
    //    var isExcelFile = $(self._data.exelFile).files;
    //    if (isExcelFile.length() === "") {
    //        $(self._data.excelFileError).show();
    //        return false;
    //    }
    //    return true;
    //}

    self._checkNotifyMemberList = function () {
        var isNotifyMemberList = $(self._data.notifyMember).data("kendoDropDownList");
        if (isNotifyMemberList.value() === "") {
            $(self._data.notifyMemberError).show();
            return false;
        }
        return true;
    }

    self._checkNotifyInsurerList = function () {
        var isNotifyInsurerList = $(self._data.notifyInsurer).data("kendoDropDownList");
        if (isNotifyInsurerList.value() === "") {
            $(self._data.notifyInsurerError).show();
            return false;
        }
        return true;
    }

    self._checkUpdateTypeList = function () {
        var updateTypeList = $(self._data.updateType).data("kendoDropDownList");
        if (updateTypeList.value() === "") {
            $(self._data.updateTypeError).show();
            return false;
        }
        return true;
    }

    self._checkTransferTypeList = function () {
        var transferTypeList = $(self._data.transferType).data("kendoDropDownList");
        if (transferTypeList.value() === "") {
            $(self._data.transferTypeError).show();
            return false;
        }
        return true;
    }

    self._checkIsCreateAdditionWorkflowList = function () {
        var IsCreateAdditionWorkflowList = $(self._data.createWorklowListAddition).data("kendoDropDownList");
        if (IsCreateAdditionWorkflowList.value() === "") {
            $(self._data.createWorklowListAdditionError).show();
            return false;
        }
        return true;
    }

    self._checkIsCreateDeletionWorkflowList = function () {
        var isCreateDeletionWorkflowList = $(self._data.createWorklowListDeletion).data("kendoDropDownList");
        if (isCreateDeletionWorkflowList.value() === "") {
            $(self._data.createWorklowListDeletionError).show();
            return false;
        }
        return true;
    }

    self._checkIsCreateCategoryWorkflowList = function () {
        var isCreateCategoryWorkflowList = $(self._data.categoryImportList).data("kendoDropDownList");
        if (isCreateCategoryWorkflowList.value() === "") {
            $(self._data.createCategoryWorkflowListError).show();
            return false;
        }
        return true;
    }

    //-------------------------------------------------------------------------

    self.createWorkflowOnChange = function () {
        $(self._data.createWorkflowError).hide();
    }

    self.notifyHrOnChange = function () {
        $(self._data.notifyHrError).hide();
    }

    self.notifyMemberOnChange = function () {
        $(self._data.notifyMemberError).hide();
    }


    self.notifyUpdateTypeOnChange = function () {
        $(self._data.updateTypeError).hide();
    }

    self.notifyTransferTypeOnChange = function () {
        $(self._data.transferTypeError).hide();
    }

    self.notifyWorkflowAdditionOnChange = function () {
        $(self._data.createWorklowListAdditionError).hide();
    }

    self.notifyWorkflowDeletionOnChange = function () {
        $(self._data.createWorklowListDeletionError).hide();
    }


    self.createCategoryWorkflowOnChange = function () {
        $(self._data.createCategoryWorkflowListError).hide();
    }

    //-------------------------------------------------------------------------

    self._onImport = function () {
        var messages = [];

        var duplicatesCount = $(this).data("duplicates-count");
        if (self._data.showDuplicatesWarning === true && duplicatesCount > 0) {
            messages.push(String.format(self._localization.duplicateWarningMessage, duplicatesCount));
        }
        if (self._data.isHr == true && self._data.isCreateWorkflowListValue == '0') {
            messages.push(self._localization.notifyInsurerWarningMessage);
        }
        if (messages.length > 0) {
            var swalFunction = function() {
                swal({
                    title: self._localization.warningTitle,
                    text: messages.join(';\n'),
                        type: "warning",
                        showCancelButton: false,
                        confirmButtonColor: "#18a689",
                        confirmButtonText: self._localization.warningYesButton,
                        closeOnConfirm: true
                    },
                    function() { //Yes action
                        self._importAction();
                    });
            };

            swalExtend({
                swalFunction: swalFunction,
                hasCancelButton: false,
                buttonNum: 1,
                buttonColor: ["#ed5565"],
                buttonNames: [self._localization.warningNoButton],
                clickFunctionList: [
                    function() { //No action
                        console.log('click No button');
                        return;
                    }
                ]
            });
        } else {
            self._importAction();
        }
    };

    self._importAction = function () {
        bnetflex.ui.progressbar.show();

        $.ajax({
            url: $('#add-bulk-url').val(),
            type: "POST",
            contentType: "application/json; charset=utf-8",
            complete: function (e) {
                var response = jQuery.parseJSON(e.responseText);
                $(self._data.validationResultFrom).html("");
                $(self._data.progressFrom).html(response);
                bnetflex.ui.progressbar.hide();
                self._showProgressPage();
                //public._localization();
                //clearInterval(clearCacheTimerId);
            }
        });
    }

    //-------------------------------------------------------------------------

    self._showProgressPage = function () {

        if (self._data.useProgressBar) {
            $.ajax({
                url: self._urls.checkBulkOperationStatusUrl,
                type: "POST",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.hasInProgress) {
                        $("#operationBlockedMessage").text(self._localization.bulkOperationInProgress);
                        //TODO remove when signalR will works correct
                        var timerId = setInterval(function () {
                            $.ajax({
                                url: self._urls.checkBulkOperationStatusByOperationIdUrl + "?id=" + data.operationId,
                                type: "POST",
                                contentType: "application/json; charset=utf-8",
                                success: function (response) {
                                    if (!response.hasInProgress) {
                                        clearInterval(timerId);
                                        $(self._data.progressFrom).html("");
                                        if (response.status == 2) {
                                            $(self._data.finshedFrom).html(data.partialView);
                                        } else {
                                            $(self._data.finshedFrom).html(response.partialView); 
                                        }
                                    }

                                }
                            });
                        }, 10000);

                        var hub = $.connection.backgroundOperationHub;

                        var operationProgress = $("#operationProgressBar").kendoProgressBar({
                            min: 0,
                            max: data.count,
                            type: "value",
                            animation: {
                                duration: 1
                            },
                            value: false
                        }).data("kendoProgressBar");

                        hub.client.onUpdateStatusMessage = function (statusMessage) {
                            $("#operationStatusMessage").text(statusMessage);
                            operationProgress.value(false);
                            console.log("hub.client.onUpdateStatusMessage");
                        }

                        hub.client.onUpdateProgress = function (progress) {
                            if (operationProgress.value() < progress) {
                                console.log(progress);
                                operationProgress.value(progress);
                                console.log("hub.client.onUpdateProgress");
                            }
                        };
                        hub.client.onComplete = function (id) {
                            $(self._data.progressFrom).html("");
                            $(self._data.finshedFrom).html(data.partialView);
                            self._reload();
                            $('#download-errors-link').attr('href', self._urls.downloadErrorsUrl + id);
                            $('#download-members-link').attr('href', self._urls.downloadMembersUrl + id);
                            clearInterval(timerId);
                            console.log("hub.client.onComplete");
                        };
                        hub.client.onError = function (message) {
                            $(self._data.progressFrom).html("");
                            $(self._data.finshedFrom).html(data.errorView);
                            //if (message) {
                            //    $(self._data.errorMessage).html(message);
                            //}
                            self._reload();
                            console.log("hub.client.onError");
                        };
                        hub.client.onPartiallyComplete = function(message) {
                            $(self._data.progressFrom).html("");
                            $(self._data.finshedFrom).html(data.partiallyProcessedView);
                            if (message) {
                                $(self._data.processedItems).html(message);
                            }
                            self._reload();
                            console.log("hub.client.onPartiallyComplete");
                        }
                        // $.connection.hub.logging = true;
                        $.connection.hub.qs = "bulkOperationId=" + data.operationId;
                        $.connection.hub.start();
                    }
                }
            });
        }
        //TODO remove when all bulk operations will be shifted to background worker
        else {
            var timerId = setInterval(function () {
                $.ajax({
                    url: self._urls.checkBulkOperationStatusUrl,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        if (!data.hasInProgress) {
                            clearInterval(timerId);
                            $(self._data.progressFrom).html("");
                            $(self._data.finshedFrom).html(data.partialView);
                        }
                    }
                });
            }, 1000);
        }
    };


    //-------------------------------------------------------------------------


    // Event select document files
    //-------------------------------------------------------------------------

    self._onDocumentsSelect = function (e) {
        self.documentsFileStream = e.files[0];
        $(self._data.documentsFileSizeError).hide();
    };

    self._onRemoveDocments = function (e) {
        if (self.documentsFileStream.uid === e.files[0].uid) {
            self.documentsFileStream = undefined;
        }
        $(self._data.documentsFileSizeError).hide();
    }

    //----------------Pictures
    self._onPicturesSelect = function (e) {
        self.picturesFileStream = e.files[0];
        $(self._data.picturesFileSizeError).hide();
    };

    self._onRemovePictures = function (e) {
        if (self.picturesFileStream.uid === e.files[0].uid) {
            self.picturesFileStream = undefined;
        }
        $(self._data.picturesFileSizeError).hide();
    }

    //--------------Invoice Documents
    self._onInvoiceDocumentsSelect = function (e) {
        self.invoiceDocumentsFileStream = e.files[0];
        $(self._data.invoiceDocumentsFileSizeError).hide();
    };

    self._onRemoveInvoiceDocments = function (e) {
        if (self.invoiceDocumentsFileStream.uid === e.files[0].uid) {
            self.invoiceDocumentsFileStream = undefined;
        }
        $(self._data.invoiceDocumentsFileSizeError).hide();
    }
    //-------------------------------------------------------------------------


    // Default parameters
    //-------------------------------------------------------------------------

    self._default = {
        exelFile: "#excel-file",
        excelFileError: "#excel-file-error",

        documentsFile: "#documents-file",
        documentsFileError: "#documents-file-error",
        documentsFileSizeError: "#documents-file-size-error",

        invoiceDocumentsFile: "#invoice-documents-file",
        invoiceDocumentsFileError: "invoice-documents-file-error",
        invoiceDocumentsFileSizeError: "#invoice-documents-file-size-error",

        picturesFile: "#pictures-file",
        picturesFileError: "#pictures-file-error",
        picturesFileSizeError: "#pictures-file-size-error",

        createWorkflow: "#create-workflow-list",
        createWorkflowError: "#create-workflow-list-error",
        createWorkflowForm: "#import_type_update",

        notifyHr: "#notify_hr_list",
        notifyHrError: "#notify-hr-list-error",

        notifyInsurer: "#notify_insurer_list",
        notifyInsurerError: "#notify-insurer-list-error",

        notifyMember: "#notify-member-list",
        notifyMemberError: "#notify-member-list-error",
        notifyMemberForm: "#notify_member_update",

        updateType: "#update_type_list",
        updateTypeError: "#update-type-list-error",

        showSalary: "#ems_show_salary",

        validateBtn: "#validate-btn",
        importForm: "#import-member-form",
        importBtn: "#import-btn",
        importValidOnlyBtn: "#import-valid-only-btn",

        form: "#importMemberForm",
        mainForm: "#mainForm",
        validationResultFrom: "#validationResult",
        progressFrom: "#progress",
        finshedFrom: "#finshed",
        validationType: "#validation-type-list",
        errorMessage: "#errorMessage",
        processedItems: "#processedItems",

        createWorklowListAddition: "#create-workflow-list-addition",
        createWorklowListAdditionError: "#create-workflow-list-addition-error",

        createWorklowListDeletion: "#create-workflow-list-deletion",
        createWorklowListDeletionError: "#create-workflow-list-deletion-error",

        transferType: "#transfer_type_list",
        transferTypeError: "#transfer-type-list-error",

        isCOCRequired: "#is_COC_Required",

        categoryImportList: "#create-workflow-list-category",
        createCategoryWorkflowListError: "#create-workflow-list-category-error",

        showDuplicatesWarning: false
    };

    //-------------------------------------------------------------------------

    return bulkLogic;
})();