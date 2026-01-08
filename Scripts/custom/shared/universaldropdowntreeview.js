function universaldropdowntreeview(index, datasource, options, selectedItem) {
    var self = this;
    self.index = index;
    self.treeviewIdSelector = "#unitreeview" + self.index;
    self.treeViewSearchInput = "#unitreeViewSearchInput" + self.index;
    self.treeviewvalue = "#unitreeview_value" + self.index;
    self.containerSelector = "#unicontainer" + self.index;
    self.deleteTreeTextSelector = "#unidelete_tree_text" + self.index;
    self.options = options;

    this.val = function () {
        return $(self.treeviewvalue).val();
    }

    this.value = function (value) {
        var treeview = $(self.treeviewIdSelector).data("kendoTreeView");
        var dataSource = treeview.dataSource;
        var dataItem = dataSource.get(value); // find item with id = 5
        var node = treeview.findByUid(dataItem.uid);
        treeview.select(node);
        treeview.trigger('select', { node: node });
    }

    this.treeview = function () {
        return $(self.treeviewvalue);
    }

    this.clear = function () {
        $(deleteTreeTextSelector).click();
    }

    var newList = (JSON.parse(JSON.stringify(datasource)));

    if (selectedItem != undefined && selectedItem != null) {
        for (var i = 0; i < newList.length; i++) {
            newList[i].expanded = false; //was false
            if (newList[i].id == selectedItem) {
                newList[i].selected = true;
                $(self.treeviewvalue).val(selectedItem).trigger('change');
                $(self.treeViewSearchInput).val(newList[i].text).trigger('change');
            }

            for (var y = 0; y < newList[i].items.length; y++) {
                if (newList[i].items[y].id == selectedItem) {
                    newList[i].items[y].selected = true;
                    newList[i].expanded = true;
                    $(self.treeviewvalue).val(selectedItem).trigger('change');
                    if (options.showParent) {
                        $(self.treeViewSearchInput).val(newList[i].text + " > " + newList[i].items[y].text).trigger('change');
                    } else {
                        $(self.treeViewSearchInput).val(newList[i].items[y].text).trigger('change');
                    }
                }

                for (var z = 0; z < newList[i].items[y].items.length; z++) {
                    if (newList[i].items[y].items[z].id == selectedItem) {
                        newList[i].items[y].items[z].selected = true;
                        newList[i].items[y].expanded = true;
                        newList[i].expanded = true;
                        $(self.treeviewvalue).val(selectedItem).trigger('change');
                        $(self.treeViewSearchInput).val(newList[i].items[y].items[z].text).trigger('change');
                    } else {
                        newList[i].items[y].items[z].selected = false;
                    }
                }
            }
        }
    }

    var inline = new kendo.data.HierarchicalDataSource({
        data: newList,
        schema: {
            model: {
                id: "id",
                //expanded: true,
                children: "items",
                hasChildren: function (node) {
                    return (node.items && node.items.length > 0);
                }
            }
        }
    });

    var $tv = $(self.treeviewIdSelector).kendoTreeView({
        dataSource: inline,
        schema: {
            model: {
                id: "id",
                expanded: true,
                children: "items",
                hasChildren: function (node) {
                    return (node.items && node.items.length > 0);
                }
            }
        },
        select: onSelect
    }).data("kendoTreeView");



    $(self.deleteTreeTextSelector).click(function () {
        $(self.treeViewSearchInput).val("").trigger('change');
        $(self.treeViewSearchInput).keyup();
    });

    $(self.containerSelector).hover(
        function () {
            $(self.deleteTreeTextSelector).css("color", "black");
        },
        function () {
            $(self.deleteTreeTextSelector).css("color", "white");
        }
    );

    $(document).mouseup(function (e) {
        var container = $(self.containerSelector);

        if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
        {
            $(self.treeviewIdSelector).hide();
        }
    });

    InitSearch(self.treeviewIdSelector, self.treeViewSearchInput, "#unitreeviewDropdownBtn" + self.index);

    function InitSearch(treeViewId, searchInputId, treeviewDropdownBtn) {
        var tv = $(treeViewId).data('kendoTreeView');

        $(searchInputId).on('keyup', function () {
            $(treeViewId + ' li.k-item').show();

            $('span.k-in > span.highlight').each(function () {
                $(this).parent().text($(this).parent().text());
            });

            // ignore if no search term
            if ($.trim($(this).val()) === '') {
                tv.select() //gets currently selected <li> element
					.find("span.k-state-selected")
					.removeClass("k-state-selected"); //removes the highlight class

                //$('#lblselected').html("Selecting: --");
                //selectEvent(0);
                $(self.treeviewvalue).val("").trigger('change');;
                return;
            }

            var term = this.value.toUpperCase();
            var tlen = term.length;

            $(treeViewId + ' span.k-in').each(function (index) {
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

                    $(this).parentsUntil('.k-treeview').filter('.k-item').each(function (index, element) {
                        tv.expand($(this));
                        $(this).data('SearchTerm', term);
                    });
                }
            });

            //$(treeViewId + ' li.k-item:not(:has(".highlight"))').hide();
        });


        $(searchInputId).on('blur', function () {
            if ($(self.treeViewSearchInput).val() == '') {
                //$('#treeview').hide();
            } else {
                $(self.treeviewIdSelector).show();
            }
        });

        $(searchInputId).on('focus', function () {
            $(self.treeviewIdSelector).show();
            $(self.treeViewSearchInput).keyup();
        });

        $(treeviewDropdownBtn).on('click', function () {
            $(self.treeviewIdSelector).toggle();
        });
    }

    function onSelect(e) {
        var item = this.dataItem(e.node);
        var parent = this.parent(e.node); // `this` refers to the treeview object
        if ((!parent.length) && options.disableParents) {
            return;
        }
        //var parentText = this.text(parent);
        //alert("Selecting: " + this.text(e.node) + "ID:" + item.id);
        //$('#lblselected').html("Selecting: " + this.text(e.node) + " & ID:" + item.id);
        $(self.treeviewvalue).val(item.id).trigger('change');
        $(self.treeviewIdSelector).hide();

        if (parent.length && options.showParent) {
            var parentItem = this.dataItem(parent[0]);
            $(self.treeViewSearchInput).val(parentItem.text + ' > ' + item.text).trigger('change');
        } else {
            $(self.treeViewSearchInput).val(item.text).trigger('change');
        }

        $(self.treeviewIdSelector).hide();
        //selectEvent(item.id);
    }

    return self;
}