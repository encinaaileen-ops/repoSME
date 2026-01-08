var EmailTemplateViewModel = (function ($, ko, undefined) {

    var module = {};
  
    function Init(params) {      
         $.extend(true, module, params);        
    }

    function EmailTemplateModel(params) {

        var self = this;
        self.getSelf = function () {
            return self;
        }
        $.extend(self, params);       

        // <origin fields>

        self.EmailTemplateId = ko.observable(self.model.EmailTemplateId);
        self.Name = ko.observable(self.model.Name);
        self.From = ko.observable(self.model.From);
        self.To = ko.observable(self.model.To);
        self.CC = ko.observable(self.model.CC);
        self.BCC = ko.observable(self.model.BCC);
        self.Subject = ko.observable(self.model.Subject);
        self.Body = ko.observable(self.model.Body);

        self.EmailTemplateId = ko.observable(self.model.EmailTemplateId);
        // </origin fields>

        self.SelectRecipientsWindow = new SelectRecipientsWindowModel({}, self.getSelf);

        self.GetCleanModel = function () {
            var cleanObj = ko.toJS(self);
            delete cleanObj.model;     

            cleanObj.Recipients = {
                Members:[],
                MemberGroups: [],
                HRManagers: []
            };

            ko.utils.arrayForEach(cleanObj.SelectRecipientsWindow.Recipients, function(item) {
                if (item.Type === 2) // //TODO:  replace with enum 
                    cleanObj.Recipients.MemberGroups.push(item);                    
                else if (item.Type === 3) // //TODO:  replace with enum 
                    cleanObj.Recipients.HRManagers.push(item);
                else
                    cleanObj.Recipients.Members.push(item);
            });

            delete cleanObj.SelectRecipientsWindow;

            console.log(cleanObj);

            return cleanObj;
        }

        self.SubmitModel = function (formElement) {
            if (!$(formElement).valid())
                return;

            bnetflex.ui.progressbar.show();

            var formData = new FormData();
            var data = ko.toJSON(self.GetCleanModel());
            formData.append("modelJson", data);

            var upload = $("#Documents").getKendoUpload();
            if (upload) {
                var files = upload.getFiles();
                for (var i = 0; i < files.length; i++) {
                    formData.append(files[i].rawFile.name, files[i].rawFile);
                }
            }

            $.ajax({
                url: self.submitAction,
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                //contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    //console.log(data);
                    if (data.Success) {
                        onSuccessMessage('Ok');
                        window.location.href = self.redirectAction;
                    } else {
                        onFailureValdationMessage(data.ValidationMessage);
                    };
                },
                error: function (data) {
                    //bnetflex.ui.progressbar.hide();
                    onFailureValdationMessage("Status: " + data.status + ". " + data.statusText);
                },
                complete: function (o) {
                    bnetflex.ui.progressbar.hide();
                }
            });

        }

        self.Discard = function () {
            bnetflex.ui.progressbar.show();
            window.location.href = self.redirectBackAction;
            
        }

        self.ResipientsModalShow = ko.observable(false);

        self.ResipientsModalHide = function () {
            self.ResipientsModalShow(false);
        }

        self.showRecipientsModal = function () {
            self.ResipientsModalShow(true);
        }

        self.initValidator = function () {
    
            jQuery.validator.addMethod(
               "rcp",
               function (value, element) {
                   if (self.SelectRecipientsWindow.Recipients().length > 0)
                       return true;
                   return false;
               },
               "Select Recipients"
            );
            $(self.formSelector).validate({
                debug: false,
                rules: {
                    To: {
                        rcp: true
                    },
                    CC: {
                        multiemail: true
                    },
                    BCC: {
                        multiemail: true
                    }
                },
                submitHandler: function (form) {
                    return false;
                }
            });
        }

        self.initValidator();
        
    }

    function SelectRecipientsWindowModel(model, parentFunc) {

        var self = this;
        self.getSelf = function () {
            return self;
        }
        self.ParentFunc = parentFunc;
    

        self.ResipientTypes = ko.observableArray( module.RecipientTypesDropDown );

        self.SelectedRcpType = ko.observable(module.EEmailRecipientType.Members);

        self.SelectedRcpType.subscribe(function (value) {           
            $("#SearchResultsBox").collapse('hide');
            $("#filtersBox").collapse('show');
        });    

        self.FiltersPanel = new FiltersPanelModel(self.getSelf);     


        self.Recipients = ko.observableArray();      

        self.AddRecipient = function (item) {
            var result = [];
            if (item.Type === module.EEmailRecipientType.Members) {
                result = $.grep(self.Recipients(), function (e) {
                    return e.Id === item.Id && e.Type === item.Type;
                });
            }
            else {
                result = $.grep(self.Recipients(), function (e) {
                    return e.Name === item.Name;
                });
            }
            if (result.length === 0)
                self.Recipients.push(item);
        }

        self.RemoveRecipient = function (item) {
            self.Recipients.remove(item);
        }

        self.RemoveAllRecipients = function () {
            self.Recipients([]);
        }         


        self.SearchResultsGrid = new SearchResultsGridModel(self.getSelf);

        self.SearchRecipients = function () {           
            $("#SearchResultsBox").collapse('show');          
            self.SearchResultsGrid.SetPageAndLoadData(1); // if search button will be pressed we should load data for first page :)     
        }

    }

    function SearchResultsGridModel(parentFunc) {

        var self = this;
        self.ParentFunc = parentFunc;

        
        self.Page = ko.observable(0);

        self.PageSize = 5; //use this to set up page size

        self.Total = ko.observable();

        self.TotalPages = ko.computed(function () {
            return Math.ceil(self.Total() / self.PageSize);
        });

        self.GridPages = ko.observableArray([]);
        //method for setup and update pagination control after page changes (move number sequence left or right)
        //don't judge me for this :), I found that this will be better than use kendo with knockout
        self.SetGripPages = function () {
            var item = self.Page();
            var maxPagesQnt = 5; //use to setup count of page numbers in pagination control
            var floor = Math.floor(maxPagesQnt / 2) //identify the middle of sequence 
            var leftB = item > floor ? item - floor : 1; //left bound of sequence 
            var rightB = self.TotalPages() > leftB + maxPagesQnt - 1 ? leftB + maxPagesQnt - 1 : self.TotalPages(); //right bound of sequence 
            var list = [];
            for (var i = leftB; i <= rightB; i++) {
                list.push(i);
            }
            self.GridPages(list);
        }


        self.SearchResults = ko.observableArray();

        self.GetFiltersAndPagingModel = function () {

            var filterModel = self.ParentFunc().FiltersPanel.GetCleanModel();
            var pagingModel = { page: self.Page(), pageSize: self.PageSize};
            var resultModel = $.extend({}, pagingModel, filterModel);
            return resultModel;
        };

        self.Url = ko.computed(function () {
            return recipientIsMember(self.ParentFunc().SelectedRcpType()) ? module.SearchMembersUrl :
                self.ParentFunc().SelectedRcpType() == module.EEmailRecipientType.HRManagers ? module.SearchHrsUrl : module.SearchMemberGroupsUrl;
        });

        self.LoadSearchResultAjax = function (onSuccess, onError, onComplete) {
            $.ajax({
                url: self.Url(),
                type: "POST",
                data: ko.toJSON(self.GetFiltersAndPagingModel()),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (onSuccess) {
                        if (data.Errors) {
                            onFailureValdationMessage(data.Errors);
                        }
                        else {
                            var res = {};
                            res.Total = data.Total;
                            res.Data = [];
                            for (var i = 0; i < data.Data.length; i++) {
                                var item = data.Data[i];
                                if (item.Type === module.EEmailRecipientType.Members || item.Type === module.EEmailRecipientType.HRManagers)
                                    res.Data.push(new MemberSearchResultItemModel(item));
                                else
                                    res.Data.push(new GroupSearchResultItemModel(item));
                            }
                            onSuccess(res);
                        }
                    }
                },
                error: function (data) {
                    if (onError) {
                        onError(data);
                    }
                    onFailureValdationMessage(data.ValidationMessage);                 
                },
                complete: function (o) {
                    if (onComplete) {
                        onComplete(o);
                    }
                }
            });
        };

        self.LoadSearchResult = function () {

            self.LoadSearchResultAjax(function (data) {

                self.Total(data.Total);
                self.SetGripPages();
                //console.log(data.Data);
                self.SearchResults(ko.utils.arrayMap(data.Data, function (item) {
                    return item;
                }));

            });

        }

        self.SetPageAndLoadData = function (item) {

            self.Page(item);
            self.LoadSearchResult();
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

        self.RowSearchResultsTmpl = "rowSearchResultsTmpl";

        self.ActivePageCSS = function (item) {
            return item === self.Page() ? "active" : "";
        }
        
    }

    function FiltersPanelModel(parentFunc) {

        var self = this;
        self.ParentFunc = parentFunc;

        self.ClientId = ko.observable();

        self.CategoryId = ko.observable();

        self.PolicyId = ko.observable();

        self.RecipientType = ko.observable(module.EEmailRecipientType.Members);

        self.MemberNamePattern = ko.observable();

        self.HRNamePattern = ko.observable();

        self.EmplNumberPattern = ko.observable();

        self.MemberGroupId = ko.observable(null); //null meens all groups

        self.MemberGroups = ko.observableArray( module.RecipientGroupsDropDown); 

        self.ResetAllFilters = function () {
            self.ClientId(null);
            clientDropdown.clear(); //global variable from _clientCategoryPolicyFilter. Yeah, yeah, I also hate this (

            self.CategoryId(null);
            var catControl = $('#category_list').data("kendoDropDownList");
            if (catControl)
                catControl.value(null); //need to change this controls manually beacause it's kendo!!! ((

            self.PolicyId(null);
            var polControl = $('#policy_list').data("kendoDropDownList");
            if (polControl)
                polControl.value(null); //need to change this controls manually beacause it's kendo!!! ((


            self.MemberNamePattern(null);
            self.HRNamePattern(null);
            self.EmplNumberPattern(null);
            self.MemberGroupId(null);
        }

        self.ClientId.subscribe(function (value) {
            //console.log("ClientId changed: " +  value);
            self.CategoryId(null); //need to change this controls manually beacause it's kendo!!! ((
            self.PolicyId(null); //need to change this controls manually beacause it's kendo!!! ((

        });

        self.CategoryId.subscribe(function (value) {
            // console.log("CategoryId changed: " + value);
            self.PolicyId(null); //need to change this controls manually beacause it's kendo!!! ((
        });

        //self.PolicyId.subscribe(function (value) {
        //    console.log("PolicyId changed: " + value);
        //});

        self.ShouldShowSearchFields = ko.observable(1);

        self.GetCleanModel = function () {
            var obj = ko.toJS(self);
            delete obj.MemberGroups;
            if (recipientIsMember(self.ParentFunc().SelectedRcpType())) {
                delete obj.MemberGroupId;
            } else {
                obj.MemberNamePattern = obj.HRNamePattern;
                delete obj.EmplNumberPattern;
                delete obj.HRNamePattern;
            }
            if (!obj.ClientId) {
                obj.ClientId = clientDropdown.val();
            }
            if (!obj.PolicyId) {
                var polControl = $('#policy_list').data("kendoDropDownList");
                obj.PolicyId = polControl.value();
            }
            if (!obj.CategoryId) {
                var catControl = $('#category_list').data("kendoDropDownList");
                obj.CategoryId = catControl.value();
            }
            obj.EmailTemplateId = self.ParentFunc().ParentFunc().EmailTemplateId();

            return obj;
        }
        self.ParentFunc().SelectedRcpType.subscribe(function (value) {
            self.RecipientType(value);
            if (recipientIsMember(value)) {
                self.ShouldShowSearchFields(1);
            }
            else if (value === module.EEmailRecipientType.MemberGroups){
                self.ShouldShowSearchFields(2);
            }
            else if (value === module.EEmailRecipientType.HRManagers) {
                self.ShouldShowSearchFields(3);
            }
        });
    }

    var recipientIsMember = function (value) {
        if (value === module.EEmailRecipientType.Members ||
               value === module.EEmailRecipientType.AllMedicalPolicyMembers ||
               value === module.EEmailRecipientType.AllLifePolicyMembers ||
               value === module.EEmailRecipientType.AllDHAMembers)
            return true;
        else return false;
    }

    function BaseSearchResultItemModel(model) {
        var self = this;
        self.Id = model.Id;
        self.Name = model.Name;
        if (model.FullName === undefined) {
            self.FullName = model.Name;
        }
        else {
            self.FullName = model.FullName;
        }
        
        self.Type = model.Type;
        self.Style = ko.computed(function () {
            return self.Type === module.EEmailRecipientType.Members || self.Type === module.EEmailRecipientType.HRManagers ? "label-primary" : "label-success"; //TODO:  replace with enum
        });
        self.DisplayName = ko.computed(function () {
            return self.Type === module.EEmailRecipientType.Members || self.Type === module.EEmailRecipientType.HRManagers ? self.Name : self.FullName; //TODO:  replace with enum
        });
    }

    function MemberSearchResultItemModel(model) {
        var self = this;
        BaseSearchResultItemModel.call(self, model);
        self.Email = model.Email;
    }

    function GroupSearchResultItemModel(model) {
        var self = this;
        BaseSearchResultItemModel.call(self, model);
        self.ClientId = model.ClientId;
        self.CategoryId = model.CategoryId;
        self.PolicyId = model.PolicyId;
    }

    return {
        GetModel: function (params) {

            ko.bindingHandlers.showModal = {
                init: function (element, valueAccessor) { },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if (ko.utils.unwrapObservable(value)) {
                        $(element).modal('show');
                    }
                    else {
                        $(element).modal('hide');
                    }
                }
            };

            Init(params);

            return new EmailTemplateModel(params);
        }
    }

}(jQuery, ko))