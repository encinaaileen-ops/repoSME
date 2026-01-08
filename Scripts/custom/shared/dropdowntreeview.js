function DropdownTreeView(index, datasource, selectEvent, selectedItem) {
    var self = this;
    var treeviewIdSelector = "#treeview" + index;
    var treeViewSearchInput = "#treeViewSearchInput" + index;
    var treeviewvalue = "#treeview_value" + index;
    var containerSelector = "#container" + index;
    var deleteTreeTextSelector = "#delete_tree_text_" + index;

    this.val = function () {
        return $(treeviewvalue).val();
    }

    this.treeview = function () {
        return $(treeviewvalue);
    }


    this.clear = function() {
        $(deleteTreeTextSelector).click();
    }

    this.setData = function (obj) {
        var list = (JSON.parse(JSON.stringify(obj)));
        var newDataSource = new kendo.data.HierarchicalDataSource({
            data: list,
            schema: {
                model: {
                    id: "id",
                    children: "items",
                    hasChildren: function (node) {
                        return (node.items && node.items.length > 0);
                    }
                }
            }
        });
        $(treeviewIdSelector).data("kendoTreeView").setDataSource(newDataSource);
    }

    var newList = (JSON.parse(JSON.stringify(datasource)));

	if (selectedItem != undefined && selectedItem != null) {
		for (var i = 0; i < newList.length; i++) {
			newList[i].expanded = false;
			if (newList[i].id == selectedItem) {
				newList[i].selected = true;
				$(treeviewvalue).val(selectedItem).change();
				$(treeViewSearchInput).val(newList[i].text);
			}
			
			for (var y = 0; y < newList[i].items.length; y++) {
				if (newList[i].items[y].id == selectedItem) {
					newList[i].items[y].selected = true;
					newList[i].expanded = true;
					$(treeviewvalue).val(selectedItem).change();
					$(treeViewSearchInput).val(newList[i].items[y].text);
				} else {
					newList[i].items[y].selected = false;
				}
			}
		}
	}

	var inline = new kendo.data.HierarchicalDataSource({
	    data: newList,
	    schema: {
	        model: {
	            id: "id",
	            children: "items",
	            hasChildren: function (node) {
	                return (node.items && node.items.length > 0);
	            }
	        }
	    }
	});

	var $tv = $(treeviewIdSelector).kendoTreeView({
	    dataSource: inline,
		schema   : {
		    model: {
		        id: "id",
		        children: "items",
		        hasChildren: function (node) {
		            return (node.items && node.items.length > 0);
		        }
		    }
		},
		select: onSelect
	}).data("kendoTreeView");

	$(deleteTreeTextSelector).click(function () {
	    $(treeViewSearchInput).val("");
	    $(treeViewSearchInput).keyup();
	});

	$(containerSelector).hover(
        function () {
            $(deleteTreeTextSelector).css("color", "black");
        },
        function () {
            $(deleteTreeTextSelector).css("color", "white");
        }
    );

	$(document).mouseup(function (e) {
		var container = $(containerSelector);

		if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
		{
			$(treeviewIdSelector).hide();
		}
	});

	InitSearch(treeviewIdSelector, treeViewSearchInput, "#treeviewDropdownBtn" + index);

	function InitSearch(treeViewId, searchInputId, treeviewDropdownBtn) {
		var tv = $(treeViewId).data('kendoTreeView');

		$(searchInputId).on('keyup', function() {
			$(treeViewId + ' li.k-item').show();

			$('span.k-in > span.highlight').each(function() {
				$(this).parent().text($(this).parent().text());
			});

			// ignore if no search term
			if ($.trim($(this).val()) === '') {
				tv.select() //gets currently selected <li> element
					.find("span.k-state-selected")
					.removeClass("k-state-selected"); //removes the highlight class

			    //$('#lblselected').html("Selecting: --");
				selectEvent(0);
				$(treeviewvalue).val("").change();;
				return;
			}

			var term = this.value.toUpperCase();
			var tlen = term.length;

			$(treeViewId + ' span.k-in').each(function(index) {
				var text = $(this).text();
				var html = '';
				var q = 0;
				var p;

				while ((p = text.toUpperCase().indexOf(term, q)) >= 0) {
					html += text.substring(q, p) + '<span class="highlight">' + text.substr(p, tlen) + '</span>';
					q = p + tlen;
				}

				if (q > 0) {
					html += text.substring(q);
					$(this).html(html);

					$(this).parentsUntil('.k-treeview').filter('.k-item').each(function(index, element) {
						tv.expand($(this));
						$(this).data('SearchTerm', term);
					});
				}
			});

			$(treeViewId + ' li.k-item:not(:has(".highlight"))').hide();
		});


		$(searchInputId).on('blur', function() {
			if ($(treeViewSearchInput).val() == '') {
				//$('#treeview').hide();
			} else {
				$(treeviewIdSelector).show();
			}
		});

		$(searchInputId).on('focus', function() {
			$(treeviewIdSelector).show();
			$(treeViewSearchInput).keyup();
		});

		$(treeviewDropdownBtn).on('click', function() {
			$(treeviewIdSelector).toggle();
		});
	}
    
	function onSelect(e) {
		var item = this.dataItem(e.node);
		
		//alert("Selecting: " + this.text(e.node) + "ID:" + item.id);
		//$('#lblselected').html("Selecting: " + this.text(e.node) + " & ID:" + item.id);
		$(treeviewvalue).val(item.id).change();
		$(treeviewIdSelector).hide();
		$(treeViewSearchInput).val(item.text);
		$(treeviewIdSelector).hide();
		selectEvent(item.id);
	}
}

function addCostBreakdownRowString(index) {

    return '<div>' +
                '<div id="container' + index + '" style="float: left; min-height: 36px; width: 100%; min-width: 150px; position: relative; border-width: 1px; border-style: solid; border-color: #e0e0e0; border-radius: 3px; background-color: white;">' +
                    '<span style="min-width: 150px; width: 100%; display: table;">' +
                        '<span style="width: 100%; display: table-cell";">' +
                            '<input  type="text" id="treeViewSearchInput' + index + '" style="width: 100%; min-width: 100px; height: 33px; border-width: 1px; border-style: none; padding-left: 10px;" placeholder="' + strings.all + '" />' +
                        '</span>'+
                        '<span  id="delete_tree_text_' + index + '" style="color: white; cursor: pointer; display: table-cell; padding-left: 4px;">X</span>' +
                        '<span id="treeviewDropdownBtn' + index + '" unselectable="on" class="k-select" style="display: table-cell; padding-left: 4px; padding-right: 8px">' +
		                    '<span unselectable="on" class="k-icon k-i-arrow-s">select</span>' +
                        '</span>' +
                    '</span>' +
                    '<div id="treeview' + index + '" style="z-index: 5; border-width: 1px; border-style: solid; border-color: #e0e0e0; border-radius: 3px; box-shadow: #DADADA 3px 3px 3px; position: absolute; display: block; background-color: white; width: auto; display:none; height: 400px; overflow-y: auto;"></div>' +
                '</div>' +
                '<input  ' /*+ 'data-val-required="Please select budget element"'*/ + ' class="treeview-value" name="treeview_value' + index + '" id="treeview_value' + index + '" type="text" style="width: 0; height: 0; border-width: 1px; border-style: none; padding: 0; margin: 0" />' +
		        '<div>' +
                    '</br><span class="text-danger field-validation-valid" data-valmsg-for="treeview_value' + index + '" data-valmsg-replace="true"></span>' +
                '</div>' +
		    '</div>' +
            '<style>'+
                '.k-in {' +
                    'width: 92%;' +
                '}'+
            '</style>'+
            '<script>' +
                '$(document).ready(function () {' +
//                    'var container = $("#container' + index + '");' +
//                    'var items = $("#container' + index + ' .k-in");' +
                    'var treeView = $("#treeview' + index + '");' +
                    'treeView.width("100%");' +
//                    'items.css("width", "92%")' +
                '});'+
            '</script>';
}