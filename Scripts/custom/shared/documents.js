var documentGrid = null;
$(document).ready(function() {
    documentGrid = new DocumentGrid("documents_grid");

    $("#add_document").click(function () {
        documentGrid.addDocRow();
    });
});

function DocumentGrid(gridId) {
    var self = this;
    var gridIdSelector = "#" + gridId;

    this.addDocRow = function () {
        $(gridIdSelector + ' tbody').append(addEssentialDocRowString($(gridIdSelector + ' tbody tr').length));
        initializeEssentialDocumentGridRow();
    }

    function fillDocuments(data) {
        $(data).each(function(index) {
            $(gridIdSelector + ' tbody').append(addEssentialDocRowStringWithData(this, $(gridIdSelector + ' tbody tr').length));
            initializeEssentialDocumentGridRow();
        });
    }

    function addEssentialDocRowStringWithData(item, rowLength) {
        return '<tr role="row" class="uploaded-document-row">' +
            '<td>' +
            '<input  value="' + item.ChangeEventDocumentId + '" type="hidden" name="DocumentList[' + rowLength + '].ChangeEventDocumentId" />' +
            '<a href="' + window.action_DownloadDocument + '?path=' + item.Path + '&filename=' + item.FileName + '"><img src="../../Content/Images/fileformats/' + /[^.]+$/.exec(item.FileName) + '.png" onerror="this.src=\'../../Content/Images/fileformats/_blank.png\';"/>' + item.FileName + '</a></td>' +
            '<td>' +
            '<div  class="control-group"><input value="' + item.Type + '" data-val="true" data-val-number="The document type must be choosed" data-val-required="The document type must be choosed" class="essentialCombobox" name="DocumentList[' + rowLength + '].Type" /></div>' +
            '</td>' +
            '<td>' +
            '<button type="button" class="btn btn-white btn-bitbucket" onclick="deleteEssentioalDocRow(this)"><i class="fa fa-trash color-red"></i></a>' +
            '</td></tr>';
    }

    function addEssentialDocRowString(rowLength) {
        return '<tr role="row">' +
            '<td><div class="control-group"><input data-val="true" data-val-required="The document file is required" class="essentialDocument btn-blue" name="DocumentList[' + rowLength + '].File" type="file"/>' +
            '<span class="text-danger field-validation-valid" data-valmsg-for="DocumentList[' + rowLength + '].File" data-valmsg-replace="true"></span>' +
            '</div>' +
            '</td>' +
            '<td><div class="control-group"><input style="width: 100%" data-val="true" data-val-number="The document type must be choosed" data-val-required="The document type must be choosed" class="essentialCombobox" name="DocumentList[' + rowLength + '].Type" />' +
            '<input class="essentialOther text-box single-line" data-val="true" data-val-required="The Other field is required." name="DocumentList[' + rowLength + '].Other" style="display:none" type="text" value="hidden">' +
            '<span class="text-danger field-validation-valid" data-valmsg-for="DocumentList[' + rowLength + '].Type" data-valmsg-replace="true"></span>' +
            '<span class="field-validation-valid text-danger" data-valmsg-for="DocumentList[' + rowLength + '].Other" data-valmsg-replace="true"></span>' +
            '</div>' +
            '</td>' +
            '<td>' +
            '<a href="javascript:void(0)" class="btn btn-white btn-bitbucket" onclick="documentGrid.deleteEssentioalDocRow(this)"><i class="fa fa-trash color-red"></i></a>' +
            '</td></tr>';
    }

    function initializeEssentialDocumentEntireGrid() {
        $(gridIdSelector + ' tbody tr').each(function(index) {
            $(this).find('.essentialCombobox').kendoDropDownList({
                dataTextField: "Name",
                dataValueField: "Id",
                dataSource: window.documentTypeList,
                optionLabel: {
                    Text: "",
                    Value: ""
                }
            });
        });
    }

    function initializeEssentialDocumentGridRow() {
        $(gridIdSelector + ' tbody tr:last .essentialCombobox').kendoDropDownList({
            dataTextField: "Name",
            dataValueField: "Id",
            dataSource: window.documentTypeList,
            //"change": onDocumentSelect,
            optionLabel: {
                Name: "",
                Id: ""
            }
        });

    }

    this.deleteEssentioalDocRow = function (elem) {
        $(elem).closest('tr').remove();

        $(gridIdSelector + ' tbody tr').each(function(index) {
            $(this).find('input.essentialCombobox').attr('name', 'DocumentList[' + index + '].Type');
            $(this).find('.essentialCombobox').closest('td').find('.field-validation-valid').attr('data-valmsg-for', 'DocumentList[' + index + '].Type');
            $(this).find('.essentialCombobox').closest('td').find('.field-validation-error').attr('data-valmsg-for', 'DocumentList[' + index + '].Type');

            $(this).find('input.essentialOther').attr('name', 'DocumentList[' + index + '].Other');
            $(this).find('.essentialOther').closest('td').find('.field-validation-valid').attr('data-valmsg-for', 'DocumentList[' + index + '].Other');
            $(this).find('.essentialOther').closest('td').find('.field-validation-error').attr('data-valmsg-for', 'DocumentList[' + index + '].Other');

            if ($(this).find('.essentialDocument').length > 0) {
                $(this).find('input.essentialDocument').attr('name', 'DocumentList[' + index + '].File');
                $(this).find('.essentialDocument').closest('td').find('.field-validation-valid').attr('data-valmsg-for', 'DocumentList[' + index + '].File');
                $(this).find('.essentialDocument').closest('td').find('.field-validation-error').attr('data-valmsg-for', 'DocumentList[' + index + '].File');
            } else {
                $(this).find('input[type=hidden]').attr('name', 'DocumentList[' + index + '].ChangeEventDocumentId');
            }
        });
    }
}

