define(['knockout',
    'text!custom/reminders/reminder-group-component.html',
    'custom/utils/simple-grid-model',
], function (ko, htmlString, sgrid) {

    function RemindersGroupViewModel(params) {      

        var self = this;

        self.Options = {
            loadReminderGroupsUrl: '/',
            pageSize: 3,
            IsLoaded: function () { },
            strings: {}
        };

        $.extend(self.Options, params);

        self.getSelf = function () {
            return self;
        };
        
        self.GroupsGrid = new GroupsGridModel(self.getSelf);
        self.GroupsGrid.SetPageAndLoadData(1);
    }

    RemindersGroupViewModel.prototype.doSomething = function () {
    };

    function GroupsGridModel(parentFunc) {

        var self = this;

        self.ParentFunc = parentFunc;

        self.getSelf = function () {
            return self;
        };

        sgrid.call(self, parentFunc);

        self.PageSize = self.ParentFunc().Options.pageSize;

        self.GetParamsForLoadRows = function () {

            var filterModel = {};
            var pagingModel = { page: self.Page(), pageSize: self.PageSize };
            var resultModel = $.extend({}, pagingModel, filterModel);
            return resultModel;
        };

        self.ExpandeCurrentMonth = function () {
            var today = new Date();
            var panel = $('#collapsed' + today.getFullYear() + '-' + (today.getMonth()+1 ));
            panel.collapse("show");
        }

        self.Url = ko.computed(function () {
            return self.ParentFunc().Options.loadReminderGroupsUrl;
        });

        self.LoadRows = function () {
            $.ajax({
                url: self.Url(),
                type: "POST",
                data: ko.toJSON(self.GetParamsForLoadRows()),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        self.Total(data.Total);
                        self.SetGripPages();
                        // console.log(data.Data);
                        self.Rows(ko.utils.arrayMap(data.Items, function (item) {
                            return new RowModel(item, self.getSelf);
                        }));
                        self.ExpandeCurrentMonth();
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                    self.ParentFunc().Options.IsLoaded(true);

                }
            });
        };

        self.PageControlLabelTemplate = self.ParentFunc().Options.strings.MonthsPageControlLabelTemplate;

    }

    function RowModel(model, parentFunc) {
        var self = this;
        self.ParentFunc = parentFunc;

        self.Name =  model.Name ;
        self.Year = model.Year;
        self.Month = model.Month;
        self.QntByTypeList = ko.utils.arrayMap(model.QntByTypeList, function (item) {
            return new QntLabelModel(item);
        });

    }

    function QntLabelModel(model) {
        var self = this;
        self.Type = model.Type;
        self.Qnt = model.Qnt;
        self.Classes = ["label-warning", "label-danger", "label-pink", "label-blue", "label-dark-red", "label-cyan", "label-purple", "label-primary"];
        self.CssClass = ko.computed(function () {
            return "label " + self.Classes[self.Type - 1];
        });
    }

    return { viewModel: RemindersGroupViewModel, template: htmlString };
});