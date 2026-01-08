var CarrierViewModel = (function ($, ko, undefined) {

    var module = {};

    function Init(params) {
        $.extend(true, module, params);
    }

    function CarrierModel(model) {

        var self = this;
        self.getSelf = function () {
            return self;
        }
        self.model = model;  

        self.CarrierId = ko.observable(self.model.CarrierId);    

        self.TemplatesTab = new TemplatesTabModel(self.getSelf);

    }

    function TemplatesTabModel(parentFunc) {

        var self = this;
        self.getSelf = function () {
            return self;
        }
        self.ParentFunc = parentFunc;

        self.TemplatesGrid = new TemplatesGridModel(self.getSelf);

        self.TemplatesGrid.SetPageAndLoadData(1);

        self.initValidator = function () {            
            $(module.TemplatesTab.EditTemplateFormSelector).validate({
                debug: false,
                submitHandler: function (form) {
                    return false;
                }
            });
        }

        self.initValidator();
    }

    function TemplatesGridModel(parentFunc) {

        var self = this;

        self.ParentFunc = parentFunc;

        self.getSelf = function () {
            return self;
        }


        self.Page = ko.observable(0); //represent current page

        self.PageSize = 10; //use this to set up page size

        self.Total = ko.observable();

        self.TotalPages = ko.computed(function () {
            return Math.ceil(self.Total() / self.PageSize);
        });

        self.GridPages = ko.observableArray([]);
        //method for setup and update pagination control after page changes (move number sequence left or right)
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

        self.Rows = ko.observableArray();

        self.GetParamsForLoadRows = function () {

            var filterModel = { CarrierId: module.Model.CarrierId };
            var pagingModel = { page: self.Page(), pageSize: self.PageSize };
            var resultModel = $.extend({}, pagingModel, filterModel);
            return resultModel;
        };
        
        self.Url = ko.computed(function () {
            return  module.TemplatesTab.GetTemplatesUrl;
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
                        self.Rows(ko.utils.arrayMap(data.Data, function (item) {
                            return item;
                        }));
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });
        }

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
            return item === self.Page() ? "k-state-selected" : "";
        }

        self.IsCurrentPage = function (item) {
            return item === self.Page();
        }

        self.PageControlLabel = ko.computed(function () {
            var currentPageRightBound = (self.Page() * self.PageSize);
            currentPageRightBound = currentPageRightBound < self.Total() ? currentPageRightBound : self.Total();
            return (self.Page() * self.PageSize - self.PageSize + 1) + " - " + currentPageRightBound + " of " + self.Total() + " items";
        })



        self.EditTemplateModel = ko.observable(new EditTemplateModel({}, false, self.getSelf));

        self.RemoveTemplate = function (item) {
            //console.log(item);           
            //return;
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this records!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true
            },
               function () {
                   $.ajax({
                       url: module.TemplatesTab.DeleteTemplatesUrl,
                       type: 'POST',
                       contentType: 'application/json; charset=utf-8',
                       data: JSON.stringify(item),
                       // async: false,
                       success: function (data) {
                           if (!data.Success) {
                               onFailureValdationMessage(data.ValidationMessage);
                           }
                           self.LoadRows();
                       },
                       error: function (data) {
                           onFailureValdationMessage(data.ValidationMessage);
                           self.LoadRows();
                       }
                   });
               });
        }

        var ExportTemplate = function (templateId, ifXML) {
            var url = ko.computed(function() {
                return module.TemplatesTab.ExportCarrierTemplate +
                    "?carrierTemplateId=" +
                    templateId +
                    "&ifXML=" +
                    ifXML;
            });
            location.href = url();
        }

        self.ExportTemplateForXml = function (item) {
            if (item != null) {
                ExportTemplate(item.CarrierTemplateId, true);
            }
        }

        self.ExportTemplateForXlsx = function (item) {
            if (item != null) {
                ExportTemplate(item.CarrierTemplateId, false);
            }
        }

       
        

        self.EditTemplate = function (item) {
            self.EditTemplateModel(new EditTemplateModel(item, false, self.getSelf));
            self.EditTemplateModel().EditMode();
        }
        self.AddTemplate = function () {
            self.EditTemplateModel(new EditTemplateModel({ CarrierId: module.Model.CarrierId , CarrierTemplateId: 0 }, true, self.getSelf));
            self.EditTemplateModel().EditMode();
        }

    }

    function EditTemplateModel(model,IsAddition, parentFunc) {

        var self = this;

        var isMembershipListChosen = false;

        var templateTypeVal;

        self.ParentFunc = parentFunc;

        self.OptionLabel = ko.observable('Please, select...');

        self.IsAddition = ko.observable(IsAddition);


        self.PolicyTypes = ko.observableArray();

        self.CarrierTemplateTypes = ko.observableArray();

        self.WorkflowTypes = ko.observableArray();

        self.Languages = ko.observableArray();


        self.PolicyType = ko.observable(model.PolicyType).extend({ required: true });
    
        self.WorkflowType = ko.observable(model.WorkflowType);

        self.LanguageId = ko.observable(model.LanguageId).extend({ required: true });

        self.CarrierTemplateType = ko.observable(model.CarrierTemplateType).extend({ required: true });

        self.PolicyType.subscribe(function (value) {
            if (isMembershipListChosen) {
                self.Service.SetCarrierTemplateTypes(self.CarrierTemplateTypes, self.GetDropDownLoadParams());
                self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams(templateTypeVal));
            }
            else if (!isMembershipListChosen) {
                self.Service.SetWorkflowTypes(self.WorkflowTypes, self.GetDropDownLoadParams());
                self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams());
            }          
        });

        self.WorkflowType.subscribe(function (value) {
            self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams());
            self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams());
        });

        self.CarrierTemplateType.subscribe(function (value) {
            templateTypeVal = value;
            if (value == 1) {
                self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams(value));
                self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams(value));
                self.OptionLabel(' ');
                $('#WorkflowType').select().val('');
                isMembershipListChosen = true;
                $('#workflowType').hide();
            }
            if (value == 2) {
                self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams());
                self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams());
                self.Service.SetWorkflowTypes(self.WorkflowTypes, self.GetDropDownLoadParams());
                isMembershipListChosen = false;
                $('#workflowType').show();
            }
                
        });

        self.LanguageId.subscribe(function (value) {
            if (isMembershipListChosen) {
                self.Service.SetCarrierTemplateTypes(self.CarrierTemplateTypes, self.GetDropDownLoadParams());
                self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams(templateTypeVal));
            }
            else if (!isMembershipListChosen) {
                self.Service.SetWorkflowTypes(self.WorkflowTypes, self.GetDropDownLoadParams());
                self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams());
            }   
        });

        self.CarrierId = ko.observable(model.CarrierId).extend({ required: true });

        self.CarrierTemplateId = ko.observable(model.CarrierTemplateId).extend({ required: true });

        self.TemplateFileXlsx = ko.observable().extend({ required: true });

        self.TemplateFileXml = ko.observable().extend({ required: true } /*{ message: 'Enter account name.' } */);

        
        self.EditTemplateModalShow = ko.observable(false);

        self.EditTemplateModalHide = function () {
            self.EditTemplateModalShow(false);
        }

        self.EditMode = function (IsAddition) {         
            self.EditTemplateModalShow(true);
        }


        self.FormTemplate = "carrierEditTemplateFormTmpl";

        self.Url = ko.computed(function () {
            return self.IsAddition() ? module.TemplatesTab.AddTemplatesUrl : module.TemplatesTab.UpdateTemplatesUrl;
        });

        self.errors = ko.validation.group(self);

        self.PostData = function () {
      
            //console.log(ko.toJS(self.errors()));

            updateValidation('#editEmailTemplateForm');
            $("#editEmailTemplateForm").validate();
            if (!$("#editEmailTemplateForm").valid()) {
                return;
            }

            //if (self.errors().length > 0) {
            //    self.errors.showAllMessages();
            //    return;
            //}               

            var formData = new FormData($(module.TemplatesTab.EditTemplateFormSelector)[0]);           
            showProgressBar();
            $.ajax({
                url: self.Url(),
                type: 'POST',
                data: formData,
                async: false,
                success: function (data) {
                    self.EditTemplateModalHide();
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    }
                    self.ParentFunc().LoadRows();
                },
                error: function (data) {
                    if (data.ValidationMessage != undefined) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        onFailureValdationMessage("System error!");
                    }
                    self.ParentFunc().LoadRows();

                },
                complete: function () {
                    closeProgressBar();
                },
                cache: false,
                contentType: false,
                processData: false
            });
        }


        self.Service = new ServiceModel();

       
            self.GetDropDownLoadParams = function (data) {
                if (self.IsAddition())
                    return {
                        CarrierId: self.CarrierId(),
                        PolicyType: self.PolicyType(),
                        CarrierTemplateType: data == null ? self.CarrierTemplateType() : data,
                        WorkflowType: self.WorkflowType(),
                        LanguageId: self.LanguageId()
                    };

                else {
                    return {
                        CarrierId: null,
                        PolicyType:  null,
                        CarrierTemplateType: null,
                        WorkflowType: null,
                        LanguageId: null
                    };
                }
            }
        
            self.Service.SetPolicyTypes(self.PolicyTypes, self.GetDropDownLoadParams());

            self.Service.SetCarrierTemplateTypes(self.CarrierTemplateTypes, self.GetDropDownLoadParams());

            self.Service.SetWorkflowTypes(self.WorkflowTypes, self.GetDropDownLoadParams());

            self.Service.SetLanguages(self.Languages, self.GetDropDownLoadParams());
       
        //setTimeout(function () {
        //    console.log(ko.toJS(self));
        //}, 3000);

            if (!self.IsAddition()) {
                self.PolicyTypes.push({ 'Name': model.PolicyTypeName, 'Id': model.PolicyType })
                self.CarrierTemplateTypes.push({ 'Name': model.CarrierTemplateTypeName, 'Id': model.CarrierTemplateType });
                if (model.WorkflowType != null) {
                    self.WorkflowTypes.push({ 'Name': model.WorkflowTypeName, 'Id': model.WorkflowType });
                }
                else{
                    self.OptionLabel(' ');
                };
                self.Languages.push({ 'Name': model.LanguageName, 'Id': model.LanguageId });
            }

    }

    function ServiceModel() {

        self = this;

        self.SetPolicyTypes = function (policyTypesArray, params) {
            delete params.PolicyType;
            //console.log(ko.toJS(params));
            $.ajax({
                url: module.TemplatesTab.GetCarrierTemplatePolicyTypes,
                type: "POST",
                data: ko.toJSON(params),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        policyTypesArray(ko.utils.arrayMap(data.Data, function (item) {
                            return item;
                        }));
                       // console.log(ko.toJS(policyTypesArray));
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });

        }


        self.SetCarrierTemplateTypes = function (templateTypesArray, params) {
            delete params.CarrierTemplateType;
            //console.log(ko.toJS(params));
            $.ajax({
                url: module.TemplatesTab.GetCarrierTemplateTypes,
                type: "POST",
                data: ko.toJSON(params),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        templateTypesArray(ko.utils.arrayMap(data.Data, function (item) {
                            return item;
                        }));
                        console.log(ko.toJS(templateTypesArray));
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });

        }


        self.SetWorkflowTypes = function (workflowTypesArray, params) {
            delete params.WorkflowType;
            //console.log(ko.toJS(params));
            $.ajax({
                url: module.TemplatesTab.GetCarrierTemplateWorkflowTypes,
                type: "POST",
                data: ko.toJSON(params),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        workflowTypesArray(ko.utils.arrayMap(data.Data, function (item) {
                            return item;
                        }));
                        //console.log(ko.toJS(workflowTypesArray));
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });

        }

        self.SetLanguages = function (languagesArray, params) {
            delete params.LanguageId;
           // console.log(ko.toJS(params));
            $.ajax({
                url: module.TemplatesTab.GetCarrierTemplateLanguages,
                type: "POST",
                data: ko.toJSON(params),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    if (!data.Success) {
                        onFailureValdationMessage(data.ValidationMessage);
                    } else {
                        languagesArray(ko.utils.arrayMap(data.Data, function (item) {
                            return item;
                        }));
                       // console.log(ko.toJS(languagesArray));
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                },
                complete: function (o) {
                }
            });

        }

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

            return new CarrierModel(params);
        }

    }

}(jQuery, ko))