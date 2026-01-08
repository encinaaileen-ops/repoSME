(function ($) {
	var settings;
	var methods = {
		init: function(options) {
			settings = $.extend({
				url: '',
				topInputId: 'search-top-input',
				documentsGridId: 'search-documents-grid',
				documentsGridTempaletId: 'search-document-grid-template',
				documentsNotFound: 'search-documents-grid-notfound',
				employeesCountId: 'search-employees-count',
				documentsCountId: 'search-documents-count',
				mainInputId: 'search-main-input',
				mainButtonId: 'search-main-button'
			}, options);
			
			//initEmployeeGrig();
			//initDocumentGrig();

			$id(settings.mainButtonId).click(function () {
				console.log('click');
				getSearchResult($id(settings.mainInputId).val());
			});
			//var searchText = $id(settings.topInputId).val();
			//getSearchResult(searchText);
			console.log(settings.text);
			getSearchResult(settings.text);
		}
	};

	function getSearchResult(text) {
		if (!text) {
			hideGrid(); return;
		}
		$id(settings.topInputId).val('');
		$.getJSON(settings.url + '?searchStr=' + text, function (searchResult) {
			if (searchResult == null) { return; }
			$id(settings.mainInputId).val(text);
			$id(settings.documentsCountId).html(searchResult.Documents.length);
			fillDocumentsGrid(searchResult.Documents);

		});
		return;
	}
	
	function fillDocumentsGrid(documents) {
		if (documents.length > 0) {
			$("#" + settings.documentsNotFound).hide();
			var grid = $id(settings.documentsGridId).data("kendoGrid");
			grid.dataSource.data(documents);
			$("#collapseTwo .k-grid").show();
			$("#collapseTwo").collapse('show');
		} else {
			hideGrid();
		}
	}

	function hideGrid() {
		$("#" + settings.documentsNotFound).show();
			$("#collapseTwo .k-grid").hide();
			if ($("#collapseTwo").hasClass("in")) {
				$("#collapseTwo").collapse('hide');
			}
	}

	function $id(id) {
		return $('#' + id);
	}

	$.fn.search = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			return $.error(method + 'not found');
		}
	};
})(jQuery);