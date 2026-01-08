define(['knockout'], function (ko) {

    //var module = {};

    //$.extend(module, params);

    function SimpleGridModel(parentFunc) {

        var self = this;

        self.ParentFunc = parentFunc;

        self.getSelf = function () {
            return self;
        }

        self.Page = ko.observable(0); //represent current page

        self.PageSize = 10; //use this to set up page size

        self.PaginationControlSize = 10; //use to setup count of page numbers in pagination control

        self.Total = ko.observable(0);

        self.TotalPages = ko.computed(function () {
            return Math.ceil(self.Total() / self.PageSize);
        });

        self.GridPages = ko.observableArray([]);
        //method for setup and update pagination control after page changes (move number sequence left or right)
        self.SetGripPages = function () {
            var item = self.Page();
            var maxPagesQnt = self.PaginationControlSize;
            var floor = Math.floor(maxPagesQnt / 2) //identify the middle of sequence 
            var leftB = item > floor ? item - floor : 1; //left bound of sequence 
            var rightB = self.TotalPages() > leftB + maxPagesQnt - 1 ? leftB + maxPagesQnt - 1 : self.TotalPages(); //right bound of sequence 
            var list = [];
            for (var i = leftB; i <= rightB; i++) {
                list.push(i);
            }
            self.GridPages(list);
        }

        self.Rows = ko.observableArray();

        //self.GetParamsForLoadRows = function () {

        //    var filterModel = {};
        //    var pagingModel = { page: self.Page(), pageSize: self.PageSize };
        //    var resultModel = $.extend({}, pagingModel, filterModel);
        //    return resultModel;
        //};

        //self.Url = ko.computed(function () {
        //    return module.loadRemindersUrl;
        //});

        //self.LoadRows = function () {
        //    $.ajax({
        //        url: self.Url(),
        //        type: "POST",
        //        data: ko.toJSON(self.GetParamsForLoadRows()),
        //        contentType: 'application/json; charset=utf-8',
        //        async: true,
        //        success: function (data) {
        //            if (!data.Success) {
        //                onFailureValdationMessage(data.ValidationMessage);
        //            } else {
        //                self.Total(data.Total);
        //                self.SetGripPages();
        //                //console.log(data.Data);
        //                self.Rows(ko.utils.arrayMap(data.Data, function (item) {
        //                    return item;
        //                }));
        //            };
        //        },
        //        error: function (data) {
        //            onFailureValdationMessage(data.ValidationMessage);
        //        },
        //        complete: function (o) {
        //        }
        //    });
        //}

        self.SetPageAndLoadData = function (item) {

            self.Page(item);
            self.LoadRows();
        }


        self.ConcretePageClick = function (item) {
            if (item === self.Page())
                return;
            self.SetPageAndLoadData(item);
        }

        self.PreviosPageClick = function () {
            if (self.Page() > 1)
                self.SetPageAndLoadData(self.Page() - 1);
        }

        self.NextPageClick = function () {
            if (self.Page() < self.TotalPages())
                self.SetPageAndLoadData(self.Page() + 1);
        }

        self.RowTmpl = "carrierTemplateRowTmpl";

        self.ActivePageCSS = function (item) {
            return item === self.Page() ? "active" : "";
        }

        self.IsCurrentPage = function (item) {
            return item === self.Page();
        }

        self.formatString =  function () {
            var args = Array.prototype.slice.call(arguments);
            var str = arguments[0];
            args.shift();
            
            return str.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] !== 'undefined'
                      ? args[number]
                      : match
                    ;
                });
            };
        

        self.PageControlLabelTemplate = "{0} - {1} of {2} items";

        self.PageControlLabel = ko.computed(function () {
            var currentPageRightBound = (self.Page() * self.PageSize);
            currentPageRightBound = currentPageRightBound < self.Total() ? currentPageRightBound : self.Total();
            var res = self.formatString(self.PageControlLabelTemplate,
                (self.Page() * self.PageSize - self.PageSize + 1),
                currentPageRightBound,
                self.Total()
                );
            return res;
           // return (self.Page() * self.PageSize - self.PageSize + 1) + " - " + currentPageRightBound + " of " + self.Total() + " items";
        })

    }

    return SimpleGridModel;
});