define(['knockout',
    'text!custom/reminders/reminders-component.html',
    'custom/utils/simple-grid-model',
], function (ko, htmlString, sgrid) {

    //// First, checks if it isn't implemented yet.
    //if (!String.prototype.format) {
    //    String.prototype.format = function () {
    //        var args = arguments;
    //        return this.replace(/{(\d+)}/g, function (match, number) {
    //            return typeof args[number] !== 'undefined'
    //              ? args[number]
    //              : match
    //            ;
    //        });
    //    };
    //}

    function RemindersViewModel(params) {

        var self = this;

        self.Options = {
            loadRemindersUrl: '/',
            filterParams:{ },            
            pageSize: 5,
            strings: {
                LoadMore: 'Load More', HideAll: 'Hide All',
            },
            OnLoadSuccess: function () { },
            ShowPagingControl:true
        };

        $.extend(self.Options, params);
    
       
        self.getSelf = function () {
            return self;
        }

        
     
        self.RemindersGrid = new RemindersGridModel(self.getSelf);
        self.RemindersGrid.SetPageAndLoadData(1);
    }
 
    RemindersViewModel.prototype.doSomething = function () {
    };

    function RemindersGridModel(parentFunc) {

        var self = this;

        self.ParentFunc = parentFunc;

        self.getSelf = function () {
            return self;
        }

        sgrid.call(self, parentFunc);

        self.PageSize = self.ParentFunc().Options.pageSize;

        self.GetParamsForLoadRows = function () {

            var filterModel = self.ParentFunc().Options.filterParams;
            var pagingModel = { page: self.Page(), pageSize: self.PageSize };
            var resultModel = $.extend({}, pagingModel, filterModel);
            return resultModel;
        };

        self.Url = ko.computed(function () {
            return self.ParentFunc().Options.loadRemindersUrl;
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
                        //console.log(data.Data);
                        ko.utils.arrayPushAll(self.Rows, ko.utils.arrayMap(data.Items, function (item) {
                            return item;
                        }));
                        //self.Rows(ko.utils.arrayMap(data.Items, function (item) {
                        //    return item;
                        //}));
                        self.ParentFunc().Options.OnLoadSuccess(data);
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });
        }

        self.LoadMore = function () {
            if (self.Page() < self.TotalPages())
                self.SetPageAndLoadData(self.Page() + 1);
            else
            {
                self.Rows(self.Rows().slice(1, self.PageSize));
                self.Page(1)
            }
                
        }

        self.LoadMoreButtonVisibility = ko.computed(function () {
            return self.Total() > self.PageSize;
        });

        self.LoadMoreButtonCssBtnStyle = ko.computed(function () {
            return self.TotalPages() > self.Page() ? "btn btn-white" : "btn btn-warning";
        });

        self.LoadMoreButtonCssIcon = ko.computed(function () {
            return self.TotalPages() > self.Page() ? "fa fa-arrow-down" : "fa fa-arrow-up";
        });

        self.LoadMoreButtonText = ko.computed(function () {
            return self.TotalPages() > self.Page() ? self.ParentFunc().Options.strings.LoadMore : self.ParentFunc().Options.strings.HideAll;
        });

        self.PageControlLabel = ko.computed(function () {
            var currentPageRightBound = (self.Page() * self.PageSize);
            currentPageRightBound = currentPageRightBound < self.Total() ? currentPageRightBound : self.Total();
            return 1 + " - " + currentPageRightBound + " of " + self.Total() + " items";
        })

    }
 
    return { viewModel: RemindersViewModel, template: htmlString};
});