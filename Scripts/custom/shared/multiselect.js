

var kendo = window.kendo,
    ui = kendo.ui,
    ns = "teambase",
    PICK = 'pick',
    CHANGE = 'change',
    extend = $.extend,
    proxy = $.proxy,
    ID = "id",
    CLICK = "click",
    FOCUSED = "k-state-focused",
    STATEDISABLED = "k-state-disabled",
    DISABLED = "disabled",
    MOUSEENTER = "mouseenter" + ns,
    MOUSELEAVE = "mouseleave" + ns,
    HOVEREVENTS = MOUSEENTER + " " + MOUSELEAVE,
    ns = ".kendoMultiSelect",
    DATABINDING = "dataBinding",
    DATABOUND = "dataBound",
    CHANGE = "change",
    RESTSTART="requestStart",
    RESTEND = "requestEnd",
    SELECT = "select",
    GROUPED = "grouped",

    LI = "li";

kendo.ui.plugin(ui.MultiSelect.extend({
    options: {
        name: 'TagList',
        autoClose: false
    },
    close: function () {
        this.activeItem = null;
    }
}));

function getItemStyle(item) {
    if (item.PolicyStatus == 3) {
        return 'style="color: red; background-color: #CDFFCC !important;"';
    } else if (item.PolicyStatus == 2) {
        return 'style="background-color: #CDFFCC !important;"';
    }
}

kendo.data.binders.widget.taglist = kendo.data.binders.widget.multiselect;

kendo.ui.plugin(ui.Widget.extend({
    init: function (element, options) {
        var that = this;
        ui.Widget.fn.init.call(that, element, options);

        that.childrenField = options.dataSource.options.schema.model.children || 'items';
        that.policyStatus = options.dataSource.options.schema.model.PolicyStatus || 'status';
        that.valueField = options.dataValueField || 'id';
        that.textField = options.dataTextField || 'text';
        that._dataSource();
        that._search();
        that._selections();
        that.input = that.taglist.input;
        that.tagList = that.taglist.tagList;
        that.taglist.list.empty().html(that._dialog);
        that.enable(options.enable);
        that.expand(options.expand);  
    },
    options: {
        name: 'TeambaSelect',
        varlue: this.value,
    },
    items: function () {
        return this.element.children();
    },

    expand: function(expand){
        if (expand && this.treeview) {
            this.treeview.expand('.k-item');
        }

    },
    enable: function(bool){
        if (!bool) {
        this.element.find('.k-state-focused').removeClass('k-state-focused');
        this.dataSource.data([]);
        }
        if (this.taglist.value().length) {
            this.taglist.value([]);
        }

        this._syncValues();
    },

    clear: function() {
        var that = this;
        that._getNodes(that.dataSource.data(), true).forEach(function (c) { return c.set('checked', false); });
        this._syncValues();
    },

    value: function(arg){
        var that = this;
        if (arg) {

        } else {
            return that._getNodes(that.dataSource.data(), true).map(function (c) { return c[that.valueField] }) || [];
        }
    },

    realValue: function () {
        var that = this;
        var checked =  that._getNodes(that.dataSource.data(), true).map(function (c) { return c[that.valueField] });
        if (checked && checked.length) {
            return checked;

        } else if (that.options.placeholder == 'All') {
            return that._getNodes(that.dataSource.data()).map(function (c) { return c[that.valueField] });
        }
        return [];
    },

    refresh: function (e) {
        var that = this;
    },
    events: [
        DATABINDING,
        DATABOUND,
        CHANGE,
    ],

    setDataSource: function (dataSource) {

        this.options.dataSource = dataSource;
        this._dataSource();
        this.treeview.setDataSource(this.dataSource);
    },

    setPlaceholder: function(text){
        this.taglist.setOptions({ placeholder: text });
        this.taglist._placeholder();
    },
   
     _dataSource: function () {
        var that = this;

        if (that.dataSource && that._refreshHandler) {
            that.dataSource.unbind(CHANGE, that._refreshHandler);
        }
        if (that.dataSource && that._fetchBeginHandler) {
            that.dataSource.unbind(RESTSTART, that._fetchBeginHandler);
        }
        if (that.dataSource && that._fetchEndHandler) {
            that.dataSource.unbind(RESTEND, that._fetchEndHandler);
        }
        else {
            that._refreshHandler = $.proxy(that.refresh, that);
            that._fetchBeginHandler = $.proxy(function (e) {
                var data = arguments;
                that.enable(false);
                setTimeout(function () {
                    that.options[RESTSTART] && that.options[RESTSTART].apply(that, data);
                },0)
            }, that);
            that._fetchEndHandler = $.proxy(function () {
                var data = arguments;
                that.enable(true);
                setTimeout(function () {
                    that.treeview.setDataSource(that.dataSource.data());
                    that.options[RESTEND] && that.options[RESTEND].apply(that, data);
                    setTimeout(function () {
                        that.expand(that.options);
                    }, 0);
                }, 0)
            }, that);

        }

        that.dataSource = kendo.data.DataSource.create(that.options.dataSource);
        if (that.options.autoLoad) {
            that.dataSource.fetch();
        }

        that.dataSource.bind(CHANGE, that._refreshHandler);
        that.dataSource.bind(RESTSTART, that._fetchBeginHandler);
        that.dataSource.bind(RESTEND, that._fetchEndHandler);

           },

     _syncValues: function () {
         var that = this;
         var checked = that._getNodes(that.dataSource.data(), true);
         var value = checked.map(function (c) { return c[that.valueField]; });
         that.taglist.setDataSource(checked);
         that.taglist.value(value);
         that.taglist.list.find('.k-nodata').remove();
         that.setPlaceholder(that.dataSource.data().length && 'All' || that.options.placeholderNoItems || 'None');
         this.taglist.enable(!!that.dataSource.data().length);
         that.taglist.input.attr('readonly', "readonly");
         return value;
     },


     _selections: function () {

        var that = this, template = that._tplate();
        that._dialog = $(template.dialog(that.options));
        that._treeview = $(template.treeview(that.options));
        that._dialog.append(that._treeview);
        that.treeview = that._treeview.kendoTreeView({
            dataSource: that.dataSource.data(),
            placeholder: that.options.placeholder,
            autoBind: true,
            loadOnDemand: false,
            checkboxes: {
                checkChildren: false,
            },

            

            select: function (e) {
                e.preventDefault();
                var item = this.dataItem(e.node);
                if (item.hasChildren) {
                    item.set('unlinked', !item.unlinked)
                }
                that.trigger(GROUPED, { data: item, node: e.node });

            },
            check: function (e) {
                var item = this.dataItem(e.node);
                that.trigger(SELECT, { data: item, node: e.node });

                if (!item.unlinked) {
                    var nodes = that._getNodes(item[that.childrenField]);
                    nodes.forEach(function (n) {
                        n.set('checked', item.checked);
                    });

                }
               that._syncValues();
                that.trigger(CHANGE, that.value());
                if (that.dataSource.filter()) {
                    that.dataSource.query({ field: that.options.dataTextField, value: '', operator: function (item, value) { return true; } });
                }
            },
            dataBound: function () {
               that._syncValues();
            },
            template: kendo.template(template.link)

        }).data('kendoTreeView');
    },

    _search: function () {
        var that = this,
        template = that._tplate();

        that._taglist = $(template.taglist(that.options));
        that.element.append(that._taglist);
        that.taglist = that._taglist.kendoTagList({
            placeholder: that.options.placeholder,
            dataTextField: that.textField,
            dataValueField: that.valueField ,
            deselect: function (e) {
                var found = that.dataSource.get(e.dataItem[that.valueField]);
                if (found) {
                    found.set('checked', false);
                }
               that.trigger(CHANGE, that.value());
            },
            filtering: function (e) {
                e.preventDefault();
                /*

                that.dataSource.filter({
                    filter: {
                        field: function (item) {
                            return item;
                        },
                        value: e.filter.value,
                        operator: function (item, keyword) {
                            keyword = keyword.toLowerCase();
                            switch (true) {
                                case !keyword.length:
                                case item[that.options.dataTextField].toLowerCase().includes(keyword):
                                    return true;
                                case item.hasChildren:
                                    var nodes = that._getNodes(item[that.childrenField]);
                                    var node = nodes.find(function (n) {
                                        return n[that.options.dataTextField].toLowerCase().includes(keyword);
                                    });
                                    return !!node;
                                default:
                                    return false;
                            }

                        }
                    }
                });
                that.treeview.setDataSource(that.dataSource.view());
                */
                return false;
            }
        }).data('kendoTagList');
    },

    _tplate: function () {
        var that = this;
        
        return {
            taglist: kendo.template('<select id="multiselect" />'),
            treeview: kendo.template('<div id="treeview"  class="custom-treeview"/>'),
            dialog: kendo.template('<div class="dialog" style=" max-height: 200px; overflow-y: auto;"/>'),
            link: kendo.template('<span #=getItemStyle(item)# >${item["'+ that.textField +'"]}&nbsp;&nbsp;</span>' +
                                 '#if(item.hasChildren){ ' +
                                 'if(item.unlinked){#' +
                                 '<i class="fa fa-unlink" title="Group"></i>' +
                                 '#}else{#' +
                                 '<i class="fa fa-link" title="Ungroup"></i>' +
                                 '#}}#'
                                 ),
            checkbox:
                kendo.template(
                '<span class="k-checkbox-wrapper" data-click="that._check"' +
                'role="presentation">' +
                '<input type="checkbox" tabindex="-1" onclick="click"  class="k-checkbox" data-bind="checked:checked, events: {check: onCheck}">' +
                '<span class="k-checkbox-label"></span>' +
                '</span>'
            )
    }},

    _getNodes: function getNodes(nodes, checked, that, result) {
        var result = result || [], that = that || this;
        if(nodes){
            for (var i = 0; i < nodes.length; i++) {
                switch (true) {
                    case checked && nodes[i].checked:
                        result.push(nodes[i]);
                        break;
                    case !(checked || nodes[i].checked):
                        result.push(nodes[i]);
                        break;
                    case checked == undefined: {
                        result.push(nodes[i]);
                    }
                }
                if (nodes[i].hasChildren) {
                    result = getNodes(nodes[i][that.childrenField], checked, that, result);
                }
            }
        }
        return result;
    },
}))

