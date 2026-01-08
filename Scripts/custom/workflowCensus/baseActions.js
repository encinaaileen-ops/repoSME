
var attachedDocuments = [];
getAlreadyEttachedDocuments = function (data, downloadUrl) {
    ko.utils.arrayForEach(data.Data, function (file) {
        attachedDocuments.push(file);
    });

    addAtachedDocumentsToAction(downloadUrl);
}


function addAtachedDocumentsToAction(downloadUrl) {
    ko.utils.arrayForEach(attachedDocuments, function (file) {
        if (!$('#file-list')) {
            return;
        }
        var typeName = file.TypeName ? '(' + file.TypeName + ')' : '';
        $('#file-list').append('<span id= file_' + file.DocumentId + '><i class="fa fa-paperclip"></i><a href="' + downloadUrl + '?path=' + encodeURIComponent(file.Path) + '">' + file.FileName + '&nbsp</a>' + typeName + '<a><i onclick="removeFile(' + file.DocumentId + ' )" class="fa fa-trash-o k-delete-button k-icontext color-red"></i></a> |</span>');
    });
}

function appendAttachedDocuments() {
    //debugger;

    if ($('#file-list')[0] == undefined) {
        ko.utils.arrayForEach(attachedDocuments, function (file) {
            model.Documents.push({ DocumentName: file.FileName, DocumentUrl: file.Path, MemberDocumentTypeId: file.Type });
        });
    }
    else {
        ko.utils.arrayForEach(attachedDocuments, function (file) {
            var doc = $("#file_" + file.DocumentId)[0];
            if (doc) {
                model.Documents.push({ DocumentName: file.FileName, DocumentUrl: file.Path, MemberDocumentTypeId: file.Type });
            }
        });
    }
 
}