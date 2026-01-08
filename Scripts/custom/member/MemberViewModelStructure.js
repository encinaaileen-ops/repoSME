var MemberDynamicField = {
    ResidentialArea: 24,
    ResidentialCity: 27
};

var MemberViewModelStructure = (function ($, ko) {
    var debounceDelay = 500;

    //const value
    //EDynamicFieldTypes Enum (namespace BenefitNetFlex.Common.Enums.Member)
    function EDynamicFieldTypes() {
        return {
            Integer: 0,
            Decimal: 1,
            Text: 2,
            RichText: 3,
            Boolean: 4,
            DateTime: 5,
            Select: 6,
            Multiselect: 7
        };
    }

    var EPolicyType = {
        LifeDisability: 2,
        CriticalIllness: 3,
        PersonalAccident: 4
    };

    function isSalaryBasedPolicyType(typeId) {
        return [EPolicyType.LifeDisability, EPolicyType.CriticalIllness, EPolicyType.PersonalAccident].includes(typeId);
    }

    var EProductAttribute = {
        FreeCoverLimit: 1,
        SumInsuredType: 13,
        SalaryMultiplier : 14
    };

    var ESumInsuredType = {
        SalaryBased: 1,
        GrossSalaryBased: 3
    };    

    var EDependantType = {
        Employee: 1
    };

    //const value
    //ToDo use table for this values, where Dynamic field constructor will be implemented
    function MemberRegularFieldNames() {
        return {
            MobilePhone: "MobilePhone",
            PassportNumber: "PassportNumber",
            Email: "Email",
            Photo: "Photo",
            CountryId: "CountryId",
            ClientId: "ClientId",
            BasicSalary: "BasicSalary",
            JobPosition: "JobPosition",
        };
    }


    //main model for apply bindings 
    function MemberViewModelContainer(params) {

        var self = this;
        self.validationUrl = params.validationUrl;
        self.loadDataUrl = params.loadDataUrl;
        self.rawMemberModel = params.rawMemberModel;
        self.isEdit = params.isEdit;
        self.clientId = params.clientId;
        self.isSalaryAvailible = params.isSalaryAvailible;
        self.docsValidationUrl = params.docsValidationUrl;
        self.duplicateCheckUrl = params.duplicateCheckUrl;
        self.dependableFields = params.dependableFields;
        self.preventValidation = params.preventValidation || false;
        self.validationCallBack = params.validationCallBack;
        
        console.log('[MemberViewModelStructure] Initialized with preventValidation:', self.preventValidation);
        console.log('[MemberViewModelStructure] Has validationCallBack:', !!self.validationCallBack);
        self.MemberRegularFieldsErrors = ko.observableArray();
        self.renewalAgeWarningMessage = ko.observable("");
        self.isRenewalAgeWarningVisible = ko.observable(false);
        self.dobWarning = ko.observable("");
        self.dobWarningVisible = ko.observable(false);
        self.renewalValidationUrl = params.validateMemberRenewalMaximumAgeUrl;
        self.freeCoverLimitMaximumAgeUrl = params.validateFreeCoverLimitMaximumAgeUrl;
        self.validateAgeOfMemberUrl = params.validateAgeOfMemberUrl;
        self.serverValidator = {
            val: function (val, param) {
                var error = $.grep(self.MemberRegularFieldsErrors(),
                    function (t) {
                        return param === t.MemberRegularFieldName;
                    })[0];
                return error === undefined;
            },
            msg: function (param) {
                var error = $.grep(self.MemberRegularFieldsErrors(),
                    function (t) {
                        return param === t.MemberRegularFieldName;
                    })[0];
                if (error === undefined) {
                    return "";
                }
                // console.log(error.ValidationMessage);
                return error.ValidationMessage;
            }
        };

        var serverValidationFunction = function (postAction) {

            console.log("serverValidation");
            
            // Skip validation if preventValidation is true (used in Transfer view)
            if (self.preventValidation) {
                console.log('[serverValidation] Skipping validation due to preventValidation flag');
                // Still call the callback with true to indicate no errors
                if (self.validationCallBack) {
                    console.log('[serverValidation] Calling validationCallBack with true');
                    self.validationCallBack(true);
                }
                return;
            }
            
            $.ajax({
                url: self.validationUrl,
                type: "POST",
                data: ko.toJSON({ isEdit: self.isEdit, memberModel: self.GetMemberModel() }),
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    // console.log(data);
                    self.memberModel.MemberDynamicFields.forEach(function (e) {
                        var result = $.grep(data, function (t) { return e.id === t.MemberDynamicFieldId; })[0];
                        if (result) {
                            e.validation.serverValidation.valid(result.Valid);
                            e.validation.serverValidation.message(result.ValidationMessage);
                            e.visible(result.Visible);
                            e.validation.required(result.IsRequired);
                            if (!result.IsEnabled) {
                                e.preventEnabling = true;
                            }
                            else {
                                e.preventEnabling = false;
                            }
                            e.enabled(result.IsEnabled);
                            if (result.Values !== null && result.Values !== undefined) {
                                e.value(result.Values[0]);
                            }

                        } else {
                            e.validation.serverValidation.valid(true);
                            e.validation.serverValidation.message('');
                            e.visible(e.defaultVisibilityState);
                            e.validation.required(e.defaultRequiredState);
                            e.preventEnabling = false;
                            e.enabled(true);
                        }
                    });
                    data.forEach(function (e) {
                        if (e.MemberRegularFieldName === MemberRegularFieldNames().BasicSalary) {
                            self.memberModel.BasicSalaryVisible(e.IsEnabled);
                            if (e.Values != null) {
                                self.memberModel.BasicSalary(e.Values[0]);
                            }
                        }
                    });
                    self.MemberRegularFieldsErrors(data.filter(function (el) {
                        return el.Valid === false && el.MemberRegularFieldName && el.MemberRegularFieldName.length > 0;
                    }));

                    if (postAction instanceof Function) {
                        postAction();
                    }
                    
                    // Call validation callback if provided
                    if (self.validationCallBack) {
                        var hasErrors = self.MemberRegularFieldsErrors().length > 0;
                        self.validationCallBack(!hasErrors);
                    }

                    //console.log(self.memberModel.errors());                    
                    //if (self.memberModel.errors().length > 0) {                        
                    //    self.memberModel.errors.showAllMessages();                        
                    //}
                },
                error: function (data) {
                    console.log(data);
                    // Call validation callback with false on error
                    if (self.validationCallBack) {
                        self.validationCallBack(false);
                    }
                },
                complete: function (data) {

                },
                async: true
            });
        };

        self.serverValidation = _.debounce(serverValidationFunction, debounceDelay);
        self.immediateServerValidation = serverValidationFunction;
        
        // Method to track new policies in Transfer view
        self.pushNewPolicy = function(policy) {
            console.log('[pushNewPolicy] Called with policy:', policy);
            if (policy && policy.PolicyId) {
                var policyId = typeof policy.PolicyId === 'function' ? policy.PolicyId() : policy.PolicyId;
                if (self.newPolicyIds.indexOf(policyId) === -1) {
                    self.newPolicyIds.push(policyId);
                    console.log('[pushNewPolicy] Added new policy ID:', policyId);
                    console.log('[pushNewPolicy] Current new policy IDs:', self.newPolicyIds());
                }
            }
        };
        
        // Method to set new category for Transfer view
        self.setNewCategory = function(policyId, categoryId) {
            console.log('[setNewCategory] Called with policyId:', policyId, 'categoryId:', categoryId);
            // Track this as a new policy selection
            if (policyId && self.newPolicyIds.indexOf(policyId) === -1) {
                self.newPolicyIds.push(policyId);
                console.log('[setNewCategory] Added new policy ID:', policyId);
                console.log('[setNewCategory] Current new policy IDs:', self.newPolicyIds());
            }
        };

        //this is needed for fix circular issue on serialization
        //if child object include reference to parent? they could not serialized
        //but ref to function solve this )
        self.getSelf = function () {
            return self;
        };

        self.addedMembers = [];

        self.addMembersWizardModel = function () {
            return {
                Members: self.addedMembers,
                IsCreateWorkflow: self.CreateWorkflow() === "1" || self.CreateWorkflow() === "2",
                IsNotifyHr: self.NotifyHr() === undefined || self.NotifyHr() === "1",
                IsNotifyMember: self.NotifyMember() === undefined || self.NotifyMember() === "1",
                CommentsToInsurer: self.CommentsToInsurer(),
                ImportType: self.CreateWorkflow()
            };
        };

        self.PendingParentPolicy = ko.pureComputed(function () {
            return ko.utils.arrayFirst(self.addedMembers,
                function (member) {
                    return member.PendingParentPolicy && (member.DependantType != EDependantType.Employee);
                }) !== undefined;
        }, this);

        self.PendingWorkflowTypes = ko.pureComputed(function () {
            var temp = ko.utils.arrayFirst(self.addedMembers,
                function (member) {
                    return member.PendingWorkflowTypes;
                });
            return temp ? temp.PendingWorkflowTypes : temp;
        }, this);

        self.DuplicatesGrid = new DuplicateMembersGrid(self);

        self.memberModel = new MemberModel(self.rawMemberModel, self.getSelf, self.isEdit, params.dateFormat);
        
        // Track original policies for Transfer view
        self.originalPolicyIds = ko.observableArray([]);
        self.newPolicyIds = ko.observableArray([]);
        
        // Store initial policy IDs when member is loaded
        if (self.preventValidation && self.memberModel.PolicyList) {
            var initialPolicies = self.memberModel.PolicyList().filter(function(p) {
                return p.Checked && p.Checked();
            }).map(function(p) {
                var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : 
                              p.PolicyType ? (typeof p.PolicyType === 'function' ? p.PolicyType() : p.PolicyType) : null;
                console.log('[MemberViewModelStructure] Initial policy:', {
                    policyId: policyId,
                    policyTypeId: p.PolicyTypeId ? (typeof p.PolicyTypeId === 'function' ? p.PolicyTypeId() : p.PolicyTypeId) : null,
                    checked: p.Checked ? p.Checked() : false
                });
                return policyId;
            });
            self.originalPolicyIds(initialPolicies);
            console.log('[MemberViewModelStructure] Original policy IDs stored:', self.originalPolicyIds());
        }
        
        //return clean backend model
        self.GetMemberModel = function () {
            var copiedObject = ko.toJS(self.memberModel); //jQuery.extend(true, {}, self.memberModel);
            copiedObject.MemberDynamicFields = ko.utils
                .arrayMap(self.memberModel.MemberDynamicFields, function (item) { return item.GetBackEndFieldModel(); });

            if (copiedObject.ParentMember !== null && copiedObject.ParentMember !== undefined) {
                copiedObject.ParentMember.MemberDynamicFields = ko.utils
                    .arrayMap(self.memberModel.ParentMember.MemberDynamicFields,
                        function (item) {
                            return item.GetBackEndFieldModel === undefined ? item : item.GetBackEndFieldModel();
                        });
            }

            //if (!copiedObject.PhotoPath && !copiedObject.Photo)
            //    copiedObject.PhotoPath = "Images\\nophoto.png";
            return copiedObject;
        };

        self.CommentsToInsurer = ko.observable();
        self.NotifyMember = ko.observable();
        self.CreateWorkflow = ko.observable();
        self.NotifyHr = ko.observable();

        self.DocumentsValidationMsgs = ko.observableArray();
        self.DocumentsValidationType = ko.observable();
        self.DocumentsValidationModalShow = ko.observable(false);
        self.DocumentsValidationModalHide = function () {
            self.DocumentsValidationModalShow(false);
        };

        self.FieldsValidationMsgs = ko.observableArray();

        self.cleanDynamicFields = function () {
            self.memberModel.MemberDynamicFields.forEach(function (e) {
                e.value(null);
            });
        };

        self.ValidateDocuments = function (data) {
            // bnetflex.ui.progressbar.show();
            //console.log(memberModel);
            var result = false;
            $.ajax({
                url: self.docsValidationUrl,
                type: "POST",
                data: data, //ko.toJSON(self.GetMemberModel() ),
                contentType: 'application/json; charset=utf-8',
                async: false,
                success: function (data) {
                    //console.log(data);
                    if (data.Success) {
                        result = !data.Data.some(function (item) {
                            return !item.Valid;
                        });
                        if (!result) {
                            self.DocumentsValidationMsgs(ko.utils.arrayMap(data.Data,
                                function (item) { return new DocumentsValidationModel(item); }));
                            if (data.Data.length === 1) {
                                self.DocumentsValidationType(data.Data[0].ValidationType);
                            } else {
                                self.DocumentsValidationType('');
                            }
                            self.DocumentsValidationModalShow(true);
                        }
                    } else {
                        onFailureValdationMessage(data.Data.ValidationMessage);

                        result = false;
                    };
                },
                error: function (data) {
                    onFailureValdationMessage(data.ValidationMessage);
                    result = false;
                },
                complete: function (o) {
                    // bnetflex.ui.progressbar.hide();
                }
            });

            

            return result;
        };
        self.ShowValidationMessagesOnPolicyAddition = function(data, policies) {

            self.DocumentsValidationMsgs(ko.utils.arrayMap(data.docsVal,
                function(item) {
                    var policy = $.grep(policies, function(pol) { return pol.id === item.PolicyId; })[0];
                    item.ValidationMessage = policy ? policy.Name : "Policy (id:" + item.PolicyId + ")";
                    return new DocumentsValidationModel(item);
                }));

            var fieldsVal = ko.utils.arrayMap(data.fieldsVal,
                function(item) {

                    var policy = $.grep(policies, function(pol) { return pol.id === item.PolicyId; })[0];
                    item.PolicyName = policy ? policy.Name : "Policy (id:" + item.PolicyId + ")";
                    //console.log(item.ValidationResultList);
                    var invalidFields = ko.utils.arrayFilter(item.ValidationResultList,
                        function(it) {
                            return it.Valid === false &&
                                (it.MemberRegularFieldName || (!it.MemberRegularFieldName && it.Visible === true));
                        });
                    item.ValidationResultList = invalidFields;
                    //console.log(item.ValidationResultList);
                    return item;
                });

            self.FieldsValidationMsgs(fieldsVal);
            self.DocumentsValidationModalShow(true);
        };

        self.IsMemberValid = function() {
            var hasErrors = false;
            
            // Always clear previous custom validation errors first
            var dobElement = $('[data-bind*="value: memberModel.DOB"]').closest('.form-group');
            var genderElement = $('[data-bind*="value: memberModel.Gender"]').closest('.form-group');
            dobElement.find('.text-danger.custom-validation').remove();
            genderElement.find('.text-danger.custom-validation').remove();
            
            // Custom validation for DOB and Gender based on policy types
            if (self.memberModel.PolicyList && self.memberModel.PolicyList().length > 0) {
                var checkedPolicies = self.memberModel.PolicyList().filter(function(p) { 
                    return p.Checked && p.Checked(); 
                });
                
                // In Transfer mode, only validate based on NEW policies
                if (self.preventValidation && self.newPolicyIds && self.newPolicyIds().length > 0) {
                    // Filter to only check new policies for Transfer view
                    checkedPolicies = checkedPolicies.filter(function(p) {
                        var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : null;
                        return self.newPolicyIds.indexOf(policyId) !== -1;
                    });
                    
                    // If no new policies selected yet, skip DOB/Gender validation
                    if (checkedPolicies.length === 0) {
                        // Only validate other required fields, not DOB/Gender
                        if (self.memberModel.errors().length > 0) {
                            self.memberModel.errors.showAllMessages();
                            hasErrors = true;
                        }
                        return !hasErrors;
                    }
                }
                
                if (checkedPolicies.length > 0) {
                    var hasOnlyExempt = self.memberModel.hasOnlyExemptPolicies ? self.memberModel.hasOnlyExemptPolicies() : false;
                    
                    // Check if NOT all policies are exempt (Personal Accident or Travel)
                    if (!hasOnlyExempt) {
                        // DOB is required
                        if (!self.memberModel.DOB() || self.memberModel.DOB() === '') {
                            // Show error for DOB
                            dobElement.find('.col-lg-9').append('<span class="text-danger custom-validation">Date of Birth is required</span>');
                            hasErrors = true;
                        }
                        // Gender is required
                        if (!self.memberModel.Gender() || self.memberModel.Gender() === '' || self.memberModel.Gender() === 0) {
                            // Show error for Gender
                            genderElement.find('.col-lg-9').append('<span class="text-danger custom-validation">Gender is required</span>');
                            hasErrors = true;
                        }
                    }
                    // If only exempt policies, clear any lingering errors and don't validate
                }
            }
            
            if (self.memberModel.errors().length > 0) {
                self.memberModel.errors.showAllMessages();
                hasErrors = true;
            }
            
            return !hasErrors;
        };
    }
       
    function PolicyGridRowModel() {
        var self = this;

        self.Id = ko.observable(bnetflex.guid());

        self.Name = ko.observable();

        self.Checked = ko.observable();

        self.DestinationPolicy = ko.observable(true);

        self.PolicyId = ko.observable();
        self.PolicyTypeId = ko.observable();
        self.PolicyTypeString = ko.observable();
        self.Categories = ko.observableArray();
        self.CategoryId = ko.observable();
        self.CategoryName = ko.computed(function () {
            var elem = ko.utils.arrayFirst(self.Categories(),
                function (child) {
                    return child.Id === self.CategoryId();
                });

            return elem === undefined ? "" : elem.Name;
        });
        self.EffectiveDate = ko.observable(new Date());
        self.EffectiveDateOrigin = ko.computed(function () {
            return (self.EffectiveDate() === undefined || self.EffectiveDate() === null) ? null : dayjs(this.EffectiveDate()).format(settings.dateFormat.toUpperCase());
        }, this);
        self.StartDate = ko.observable(new Date());
        self.EndDate = ko.observable(new Date());
        self.EnablePolicySelection = ko.observable(true);
        self.EnableCategorySelection = ko.observable(true);
        self.RenewalStatus = ko.observable();
        self.FreeCoverLimitStatus = ko.observable();
        self.PendingParentPolicy = ko.observable(false);
        self.PendingWorkflowTypes = ko.observableArray([]);
        self.IsOptionalCovered = ko.observable(false);
        self.ParseFormats = ko.observable(window.kendoParseFormats);
        self.PolicyStateTypeId = ko.observable();

        self.HasSalaryBased = function () {
            var attr = GetCategoryAttribute(EProductAttribute.SumInsuredType, v =>
                v == ESumInsuredType.SalaryBased || v == ESumInsuredType.GrossSalaryBased);
            return attr !== undefined;
        };

        self.FreeCoverLimit = function () {
            var attr = GetCategoryAttribute(EProductAttribute.FreeCoverLimit, val => val >= 0);
            return attr ? attr.Value : null;
        };


        self.SalaryMultiplier = function () {
            var attr = GetCategoryAttribute(EProductAttribute.SalaryMultiplier, val => val > 0);
            return attr ? attr.Value : null;
        }

        function GetCategoryAttribute(attributeId, predicate) {
            var cat = ko.utils.arrayFirst(self.Categories(),
                function (child) {
                    return child.Id === self.CategoryId();
                });

            if (cat === undefined) {
                return false;
            }

            var attr = ko.utils.arrayFirst(cat.Attributes,
                param => param.AttributeId == attributeId && (!predicate || predicate(param.Value)));

            return attr;
        }
    }

    function MemberModel(model, parent, isEdit, dateFormat) {

        var self = this;
        self.isEdit = isEdit;
        self.parent = parent;
        self.getSelf = function() {
            return self;
        };

        self.isEmployee = ko.observable(model.ParentMemberId === null ? true : false);
        self.sVal = self.parent().serverValidator;

        self.ParentMember = model.ParentMember === null || $.isEmptyObject(model.ParentMember)
            ? {}
            : ko.toJS(new MemberModel(model.ParentMember, self.parent, true, dateFormat));
        self.MemberDynamicFields = ko.utils.arrayMap(model.MemberDynamicFields,
            function (item) { return new DynamicFieldModel(item, self.getSelf); });
        self.PolicyListString = ko.observable().extend({ depTypeValidation: { model: self } });
        self.preloadedDynamicData = model.PreloadedDynamicData;

        updateAllCascadeFields(self.MemberDynamicFields, self.parent().loadDataUrl, self.parent().dependableFields, self.preloadedDynamicData);

        self.initPoliciesGrid = function() {

            if (self.PolicyList) {
                self.PolicyList([]);
            } else {
                self.PolicyList = ko.observableArray([]);
            }

            if (window.policies === undefined) {
                return;
            }

            //member add
            ko.utils.arrayForEach(window.policies,
                function(item) {

                    var parentPolicy;
                    if (self.ParentMember.PolicyList) {
                        parentPolicy = ko.utils.arrayFirst(self.ParentMember.PolicyList,
                            function (pp) {
                                //in case of pending category transfer there are 2 policies with the same PolicyId
                                if (ko.utils.arrayFilter(self.ParentMember.PolicyList, function (tp) { return tp.PolicyId === item.PolicyId }).length > 1) {
                                    if (pp.PolicyId == item.PolicyId && ko.utils.arrayFirst(item.Categories, function (tc) { return tc.Id == pp.CategoryId }))
                                    {
                                        item.EffectiveDate = dayjs(pp.EffectiveDate).startOf('day').toDate();
                                        return true;
                                    }
                                    return false;
                                }
                                if (pp.PolicyId === item.PolicyId) {item.EffectiveDate = dayjs(pp.EffectiveDate).startOf('day').toDate();
                                }
                                return pp.PolicyId === item.PolicyId;
                            });
                        if (parentPolicy == undefined) {
                            return;
                        }
                    }

                    var policyRow = new PolicyGridRowModel();

                    policyRow.Name(item.Name);
                    policyRow.PolicyTypeString(item.PolicyTypeString);
                    policyRow.PolicyId(item.PolicyId);
                    policyRow.PolicyTypeId(item.PolicyTypeId);
                    policyRow.StartDate(bnetflex.ui.utils.date.parse(item.StartDate));
                    policyRow.EndDate(bnetflex.ui.utils.date.parse(item.EndDate));
                    policyRow.RenewalStatus(item.RenewalStatus);
                    policyRow.FreeCoverLimitStatus(item.FreeCoverLimitStatus);
                    policyRow.PendingParentPolicy(item.PendingParentPolicy);
                    policyRow.PendingWorkflowTypes(item.PendingWorkflowTypes);
                    policyRow.IsOptionalCovered(item.IsOptionalCovered);
                    policyRow.PolicyStateTypeId(item.PolicyStateTypeId);

                    self.PolicyList.push(policyRow);

                    policyRow.Categories(item.Categories);
                    if (parentPolicy) { //if is dependant
                        // policyRow.EnablePolicySelection(false);
                        policyRow.EnableCategorySelection(item.AllowDependantAdditionToDifferentCategory == 0);
                        policyRow.CategoryId(parentPolicy.CategoryId);
                        //policyRow.Checked(parentPolicy.Checked);
                        policyRow.StartDate(dayjs(new Date(item.EffectiveDate)).startOf('day').toDate());
                        policyRow.EffectiveDate(dayjs(new Date(item.EffectiveDate)).startOf('day').toDate());
                        onPolicyListChange();
                    } else { //if is employee
                        policyRow.Checked(false);
                    }

                    policyRow.CategoryId.subscribe(self.parent().serverValidation);
                    policyRow.CategoryId.subscribe(onPolicyListChange);
                    policyRow.Checked.subscribe(self.parent().serverValidation);
                    policyRow.Checked.subscribe(onPolicyListChange);
                    policyRow.EffectiveDate.subscribe(self.parent().serverValidation);
                    policyRow.EffectiveDate.subscribe(onPolicyListChange);
                });
        }

        function onPolicyListChange() {
            self.PolicyListString(
                ko.toJSON(
                    ko.utils.arrayMap(
                        ko.utils.arrayFilter(self.PolicyList(),
                            function (item) {
                                return item.Checked() && item.CategoryId();
                            }),
                        function (item) {
                            return {
                                PolicyId: item.PolicyId(),
                                CategoryId: item.CategoryId(),
                                EffectiveDate: item.EffectiveDate(),
                                Checked: true
                            };
                        })
                )
            );
            $("#PolicyListString").trigger("change");
        }

        self.isSalaryBasedWithinFreeCoverLimitValid = function () {
            if (!self.BasicSalary())
                return true;

            var failedPolicyFreeCoverLimit = ko.utils.arrayFirst(self.PolicyList(), function (policy) {
                return isSalaryBasedPolicyType(policy.PolicyTypeId()) &&
                    policy.FreeCoverLimit() &&
                    policy.Checked() &&
                    policy.SalaryMultiplier() &&
                    (policy.SalaryMultiplier() * self.BasicSalary() > policy.FreeCoverLimit());
            });

            if (failedPolicyFreeCoverLimit || isFailedFclInExistingPolicy()) {
                return false;
            }
            return true;
        }

        function isFailedFclInExistingPolicy() {
            if (typeof existingPolicies !== 'undefined' && existingPolicies != undefined && existingPolicies !== null) {
                var existingPolicy = ko.utils.arrayFirst(window.existingPolicies,
                    function (policy) {

                        if (!isSalaryBasedPolicyType(policy.PolicyType)) {
                            return false;
                        }

                        var cat = ko.utils.arrayFirst(policy.Categories,
                            function (child) {
                                return child.Id === policy.CategoryId;
                            });

                        if (cat === undefined) {
                            return false;
                        }

                        var fcl = ko.utils.arrayFirst(cat.Attributes,
                            param => param.AttributeId == EProductAttribute.FreeCoverLimit && param && param.Value > 0);

                        if (!fcl)
                            return false;

                        var sm = ko.utils.arrayFirst(cat.Attributes,
                            param => param.AttributeId == EProductAttribute.SalaryMultiplier && param && param.Value > 0);

                        if (!sm)
                            return false;

                        return sm.Value * self.BasicSalary() > fcl.Value;
                    });
                return existingPolicy !== undefined;
            }
        }

        if (self.isEdit) { //member edit
            self.PolicyList = ko.observableArray([]);
            ko.utils.arrayForEach(model.PolicyList,
                function (item) {
                    var policyRow = new PolicyGridRowModel();
                    policyRow.PolicyId(item.PolicyId);
                    policyRow.PolicyTypeId(item.PolicyType);
                    policyRow.CategoryId(item.CategoryId);
                    policyRow.Checked(item.Checked);
                    policyRow.Categories(item.Categories);
                    if (item.EffectiveDate) {
                        policyRow.EffectiveDate(bnetflex.ui.utils.date.parse(item.EffectiveDate));
                    }
                    policyRow.RenewalStatus(item.RenewalStatus);
                    policyRow.FreeCoverLimitStatus(item.FreeCoverLimitStatus);
                    policyRow.IsOptionalCovered(item.IsOptionalCovered);
                    policyRow.PolicyStateTypeId(item.PolicyStateTypeId);

                    self.PolicyList.push(policyRow);
                    onPolicyListChange();
                });
        } else {
            self.initPoliciesGrid();
        }

        self.PendingParentPolicy = ko.pureComputed(function () {
            return ko.utils.arrayFirst(self.PolicyList(),
                function (policy) {
                    return policy.PendingParentPolicy();
                }) != undefined;
        }, this);

        self.PendingWorkflowTypes = ko.pureComputed(function () {
            var temp = ko.utils.arrayFirst(self.PolicyList(),
                function (policy) {
                    return policy.PendingWorkflowTypes();
                });
            return temp ? temp.PendingWorkflowTypes() : temp;
        }, this);

        self.PoliciesVisible = ko.observable(true);

        self.HasSalaryBased = function() {
            var policySalaryBased = ko.utils.arrayFirst(self.PolicyList(),
                function(policy) {
                    return isSalaryBasedPolicyType(policy.PolicyTypeId()) &&
                        policy.HasSalaryBased() &&
                        policy.Checked();
                });

            //in case add to policy
            if (typeof existingPolicies !== 'undefined' && existingPolicies != undefined && existingPolicies !== null) {
                var policyElem = ko.utils.arrayFirst(window.existingPolicies,
                    function(policy) {

                        if (!isSalaryBasedPolicyType(policy.PolicyTypeId)) {
                            return false;
                        }

                        var elem = ko.utils.arrayFirst(policy.Categories,
                            function(child) {
                                return child.Id === policy.CategoryId;
                            });

                        if (elem === undefined) {
                            return false;
                        }

                        var attr = ko.utils.arrayFirst(elem.Attributes,
                            function(child) {
                                return child.AttributeId == EProductAttribute.SumInsuredType &&
                                    (child.Value == ESumInsuredType.SalaryBased || child.Value == ESumInsuredType.GrossSalaryBased);
                            });

                        return attr !== undefined;
                    });
                if (policyElem !== undefined) {
                    return true;
                }
            }

            //in all other cases
            return policySalaryBased !== undefined;
        };

        // Check if only Personal Accident (4) or Travel (5) policies are selected
        self.hasOnlyExemptPolicies = ko.computed(function() {
            console.log('[hasOnlyExemptPolicies] Computing...');
            
            if (!self.PolicyList || !self.PolicyList()) {
                console.log('[hasOnlyExemptPolicies] No PolicyList, returning false');
                return false;
            }
            
            var container = self.parent ? self.parent() : null;
            console.log('[hasOnlyExemptPolicies] Container found:', !!container);
            if (container) {
                console.log('[hasOnlyExemptPolicies] Container.preventValidation:', container.preventValidation);
                console.log('[hasOnlyExemptPolicies] Container.newPolicyIds:', container.newPolicyIds ? container.newPolicyIds() : 'undefined');
            }
            
            var selectedPolicies = self.PolicyList().filter(function(p) { 
                return p.Checked && p.Checked(); 
            });
            console.log('[hasOnlyExemptPolicies] Total selected policies:', selectedPolicies.length);
            
            // In Transfer mode, only check NEW policies, not original ones
            if (container && container.preventValidation && container.newPolicyIds && container.newPolicyIds().length > 0) {
                console.log('[hasOnlyExemptPolicies] Transfer mode detected, filtering to new policies only');
                // Filter to only check new policies for Transfer view
                selectedPolicies = selectedPolicies.filter(function(p) {
                    var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : null;
                    var isNew = container.newPolicyIds.indexOf(policyId) !== -1;
                    console.log('[hasOnlyExemptPolicies] Policy', policyId, 'is new:', isNew);
                    return isNew;
                });
                
                console.log('[hasOnlyExemptPolicies] New policies selected:', selectedPolicies.length);
                
                // If no new policies selected yet, DOB/Gender should be optional
                if (selectedPolicies.length === 0) {
                    console.log('[hasOnlyExemptPolicies] No new policies, returning true (exempt)');
                    return true; // Consider as exempt to avoid validation errors
                }
            }
            
            if (selectedPolicies.length === 0) {
                return false;
            }
            
            // Check if all selected policies are Personal Accident (4) or Travel (5)
            var result = selectedPolicies.every(function(p) {
                var policyTypeId = null;
                // Try different ways to get policy type ID
                if (p.PolicyTypeId && typeof p.PolicyTypeId === 'function') {
                    policyTypeId = p.PolicyTypeId();
                } else if (p.PolicyType && typeof p.PolicyType === 'function') {
                    policyTypeId = p.PolicyType();
                } else if (p.PolicyTypeId) {
                    policyTypeId = p.PolicyTypeId;
                } else if (p.PolicyType) {
                    policyTypeId = p.PolicyType;
                }
                
                var isExempt = policyTypeId === 4 || policyTypeId === 5;
                console.log('[hasOnlyExemptPolicies] Policy type', policyTypeId, 'is exempt:', isExempt);
                return isExempt;
            });
            
            console.log('[hasOnlyExemptPolicies] Final result:', result);
            return result;
        });

        // Dynamic validation for DOB based on policy types
        function checkDOBRequired(val) {
            // Don't validate if no policies are selected yet (initial state)
            if (!self.PolicyList || self.PolicyList().length === 0) {
                return true; // Skip validation on initial load
            }
            
            // If only exempt policies, DOB is optional
            if (self.hasOnlyExemptPolicies && self.hasOnlyExemptPolicies()) {
                return true; // Valid (not required)
            }
            // Otherwise, DOB is required
            // Use the passed value instead of self.DOB() since DOB might not be created yet
            return val != null && val !== '';
        }

        // Dynamic validation for Gender based on policy types  
        function checkGenderRequired(val) {
            // Don't validate if no policies are selected yet (initial state)
            if (!self.PolicyList || self.PolicyList().length === 0) {
                return true; // Skip validation on initial load
            }
            
            // If only exempt policies, Gender is optional
            if (self.hasOnlyExemptPolicies && self.hasOnlyExemptPolicies()) {
                return true; // Valid (not required)
            }
            // Otherwise, Gender is required
            // Use the passed value instead of self.Gender() since Gender might not be created yet
            return val != null && val !== '' && val !== 0;
        }

        self.Address = new AddressModel(model.Address, self.getSelf);

        //self.EffectiveDate = ko.observable(new Date());
        self.FirstName = ko.observable(model.FirstName);
        self.MiddleName = ko.observable(model.MiddleName);
        self.LastName = ko.observable(model.LastName);

        self.MemberId = ko.observable(model.MemberId);
        self.ClientId = ko.observable(model.ClientId);

        self.Email = ko.observable(model.Email).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().Email } }).extend({ email: true }).extend({ serverValidateEmailOfMember: { data: { memberId: self.MemberId(), clientId: self.ClientId() } } });
        self.Department = ko.observable(model.Department);
        self.ParentMemberName = ko.observable(model.ParentMemberName);
        updateCascadeFileds(model.ClientId, null, self.parent().loadDataUrl, self.id, MemberRegularFieldNames().ClientId, self.MemberDynamicFields, self.parent().dependableFields, self.preloadedDynamicData);
        self.CategoryId = ko.observable(model.CategoryId);
        self.CategoryString = ko.observable(model.CategoryString);
        self.JobPosition = ko.observable(model.JobPosition).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().JobPosition } });
        self.Name = ko.observable(model.Name);
        self.DependantType = ko.observable(model.DependantType).extend({ depTypeValidation: { model: self } });
        self.DependantTypeStr = ko.observable(model.DependantTypeStr);
        self.DOB = ko.observable(convertToDate(model.DOB, dateFormat))
            .extend({
                validation: {
                    validator: () => !self.parent().dobWarningVisible(),
                    message: () => self.parent().dobWarning(),
                    params: null
                }
            });
        
        // Clear custom validation error when DOB gets a value
        self.DOB.subscribe(function(value) {
            if (value && value !== '') {
                var dobElement = $('[data-bind*="value: memberModel.DOB"]').closest('.form-group');
                dobElement.find('.text-danger.custom-validation').remove();
            }
        });
        self.SalaryCurrencyId = ko.observable(model.SalaryCurrencyId).extend({ validation: { validator: checkSalaryBasedValidation, message: strings.fieldIsRequired } });
        self.ParentMemberId = ko.observable(model.ParentMemberId);
        self.UserId = ko.observable(model.UserId);
        self.EnrolledDate = ko.observable(convertToDate(model.EnrolledDate));
        self.DeletedDate = ko.observable(convertToDate(model.DeletedDate));
        self.Title = ko.observable(model.Title);
        self.TerminationDate = ko.observable(convertToDate(model.TerminationDate));
        self.ChineseName = ko.observable(model.ChineseName);
        self.OccupationRiskClass = ko.observable(model.OccupationRiskClass);
        self.AnnualSalary = ko.observable(model.AnnualSalary);
        self.BankName = ko.observable(model.BankName);
        self.BankCode = ko.observable(model.BankCode);
        self.BranchCode = ko.observable(model.BranchCode);
        self.BankAccountNumber = ko.observable(model.BankAccountNumber);

        //public string CertificateNumber = ko.observable();
        if (jQuery.isEmptyObject(self.ParentMember) || self.isEdit) {
            self.EmployeeNumber = ko.observable(model.EmployeeNumber).extend({
                serverValidateEmployeeNumber: {
                    data: { clientId: self.ClientId(), memberId: self.MemberId(), dependantType: self.DependantType(), parentMemberId: self.ParentMember.MemberId == undefined ? null : self.ParentMember.MemberId },
                    prevent: function () {
                        return self.parent().DuplicatesGrid.isVisible() && self.parent().DuplicatesGrid.IsLikeToProceed();
                    }
                }
            });
        } else {
            self.EmployeeNumber = ko.observable(self.ParentMember.EmployeeNumber);
        }

        self.NationalIDNumber = ko.observable(model.NationalIDNumber);
        self.PolicyName = ko.observable();
        self.CategoryDuplicate = ko.observable();
        self.PassportNumber = ko.observable(model.PassportNumber).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().PassportNumber } });
        self.Gender = ko.observable(model.Gender);
        
        // Clear custom validation error when Gender gets a value
        self.Gender.subscribe(function(value) {
            if (value && value !== '' && value !== 0) {
                var genderElement = $('[data-bind*="value: memberModel.Gender"]').closest('.form-group');
                genderElement.find('.text-danger.custom-validation').remove();
            }
        });
        self.MaritalStatus = ko.observable(model.MaritalStatus);
        self.NationalityId = ko.observable(model.NationalityId);
        self.AddressId = ko.observable(model.AddressId);
        self.EmploymentDate = ko.observable(convertToDate(model.EmploymentDate));
        self.BasicSalaryVisible = ko.observable(true);
        self.BasicSalary = ko.observable(model.BasicSalary).extend({ validation: { validator: checkSalaryBasedValidation, message: strings.fieldIsRequired } });
        self.Photo = ko.observable(model.Photo).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().Photo } });
        self.PhotoPath = ko.observable(model.PhotoPath);
        self.IsArchived = ko.observable(model.IsArchived);
        //self.IsVip = ko.observable(model.IsVip);
        self.CostCenter = ko.observable(model.CostCenter);
        self.Status = ko.observable(model.Status);
        self.Comments = ko.observable(model.Comments);
        self.HasPhoto = ko.observable(model.HasPhoto);

        //subscribe
        //self.EffectiveDate.subscribe(self.parent().serverValidation);
        self.FirstName.subscribe(self.parent().serverValidation);
        self.MiddleName.subscribe(self.parent().serverValidation);
        self.LastName.subscribe(self.parent().serverValidation);
        self.Email.subscribe(self.parent().serverValidation);
        self.Department.subscribe(self.parent().serverValidation);
        self.ParentMemberName.subscribe(self.parent().serverValidation);
        self.MemberId.subscribe(self.parent().serverValidation);
        self.ClientId = ko.observable(self.parent().clientId);
        self.CategoryId.subscribe(self.parent().serverValidation);
        self.CategoryString.subscribe(self.parent().serverValidation);
        self.JobPosition.subscribe(self.parent().serverValidation);
        self.Title.subscribe(self.parent().serverValidation);
        self.ChineseName.subscribe(self.parent().serverValidation);
        self.TerminationDate.subscribe(self.parent().serverValidation);
        self.OccupationRiskClass.subscribe(self.parent().serverValidation);
        self.AnnualSalary.subscribe(self.parent().serverValidation);
        self.BankName.subscribe(self.parent().serverValidation);
        self.BankAccountNumber.subscribe(self.parent().serverValidation);
        self.BankCode.subscribe(self.parent().serverValidation);
        self.BranchCode.subscribe(self.parent().serverValidation);
        self.Name.subscribe(self.parent().serverValidation);
        self.DOB.subscribe(self.parent().serverValidation);
        self.SalaryCurrencyId.subscribe(self.parent().serverValidation);
        self.ParentMemberId.subscribe(self.parent().serverValidation);
        self.DependantType.subscribe(self.parent().serverValidation);
        self.DependantTypeStr.subscribe(self.parent().serverValidation);
        self.UserId.subscribe(self.parent().serverValidation);
        self.EnrolledDate.subscribe(self.parent().serverValidation);
        self.DeletedDate.subscribe(self.parent().serverValidation);
        //public string CertificateNumber.subscribe(self.parent().serverValidation);  
        self.EmployeeNumber.subscribe(self.parent().serverValidation);
        self.NationalIDNumber.subscribe(self.parent().serverValidation);
        self.PassportNumber.subscribe(self.parent().serverValidation);
        self.Gender.subscribe(self.parent().serverValidation);
        self.MaritalStatus.subscribe(self.parent().serverValidation);
        self.NationalityId.subscribe(self.parent().serverValidation);
        self.AddressId.subscribe(self.parent().serverValidation);
        self.EmploymentDate.subscribe(self.parent().serverValidation);
        self.BasicSalary.subscribe(self.parent().serverValidation);
        self.Photo.subscribe(self.parent().serverValidation);
        self.PhotoPath.subscribe(self.parent().serverValidation);
        self.IsArchived.subscribe(self.parent().serverValidation);
        //self.IsVip.subscribe(self.parent().serverValidation);
        self.CostCenter.subscribe(self.parent().serverValidation);
        self.Status.subscribe(self.parent().serverValidation);
        self.Comments.subscribe(self.parent().serverValidation);

        //subscribe for member duplicates check
        self.FirstName.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.MiddleName.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.LastName.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.DOB.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.NationalityId.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.EmployeeNumber.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);
        self.NationalIDNumber.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);

        self.uniqueData = ko.computed(function() {
            return {
                data: {
                    FirstName: self.FirstName(),
                    MiddleName: self.MiddleName(),
                    LastName: self.LastName(),
                    DOB: self.DOB(),
                    Email: self.Email(),
                    ClientId: self.ClientId(),
                    MemberId: self.MemberId(),
                    IsCheck: self.parent().DuplicatesGrid.IsLikeToProceed(),
                    NationalIDNumber: self.NationalIDNumber(),
                    PolicyName: self.PolicyName(),
                }
            };
        }).extend({ serverValidateMemberUnique: {
            prevent: function () {
                return self.parent().DuplicatesGrid.isVisible() && self.parent().DuplicatesGrid.IsLikeToProceed()
            }
        } });

        self.FirstName.extend({ memberNameSpecialCharactersValidation: {} });
        self.MiddleName.extend({ memberNameSpecialCharactersValidation: {} });
        self.LastName.extend({ memberNameSpecialCharactersValidation: {} });

        self.freeCoverLimitMaxAgeValidationFailed = false;
        self.overAgeValidationFailed = false;
        self.hasFreeCoverLimitValidationFinished = false;
        self.hasOverAgeValidationFinished = false;

        self.checkAndShowWarnings = function () {

            setTimeout(function () {
                const messages = [];
                if (self.freeCoverLimitMaxAgeValidationFailed) {
                    messages.push(
                        "<b>Free Cover Limit Warning</b><br>" +
                        "The member you are adding is above the Free Cover Limit Maximum Age. May require to complete a Health Declaration Form and Medical Examination. Premium adjustments may apply."
                    );
                }

                if (self.overAgeValidationFailed) {
                    messages.push(
                        "<b>Maximum Age Warning</b><br>" +
                        "The member you are adding is over the maximum allowed age. Premium adjustments will be required for this member."
                    );
                }

                if (messages.length > 0) {
                    const combinedMessage = `
                        <div style="text-align: left;">
                            ${messages.join('<br><br>')}
                        </div>
                    `;

                    swal({
                        title: "Age Warning",
                        text: combinedMessage,
                        html: true,
                        icon: "warning",
                        confirmButtonColor: "#1ab394",
                        confirmButtonText: "OK",
                        type: "warning"
                    });
                }
            }, 100);
        };

        self.checkWarningsReady = function () {
            if (self.hasFreeCoverLimitValidationFinished && self.hasOverAgeValidationFinished) {
                self.checkAndShowWarnings();
                self.hasFreeCoverLimitValidationFinished = false;
                self.hasOverAgeValidationFinished = false;
            }
        };

        function isValidDob(dob) {
            if (!dob) return false;

            dob = dob.trim();

            const dobRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;
            if (!dobRegex.test(dob)) return false;

            const parsedDob = new Date(dob);
            if (isNaN(parsedDob.getTime())) return false;

            return true;
        }

        self.showMessageDob = function () {
            var depType = self.parent().memberModel.DependantType();
            var dob = self.parent().memberModel.DOB();
            self.parent().renewalAgeWarningMessage("");
            self.parent().isRenewalAgeWarningVisible(false);
            if (!isValidDob(dob)) {
                return;
            }

            var checkedPolicies = self.parent().memberModel.PolicyList().filter(function (el) {
                return el.Checked && el.Checked();
            });

            var data = {
                dob: convertToDate(dob, dateFormat),
                policyList: JSON.stringify(checkedPolicies.map(function (p) {
                    return {
                        Checked: p.Checked(),
                        CategoryId: p.CategoryId(),
                        PolicyId: p.PolicyId(),
                        EffectiveDate: convertToDate(p.EffectiveDate(), dateFormat),
                        PolicyStateTypeId: p.PolicyStateTypeId(),
                        RenewalStatus: p.RenewalStatus(),
                        FreeCoverLimitStatus: p.FreeCoverLimitStatus()
                    };
                })),
                dependantType: depType
            };

            var defaults = {
                url: self.parent().renewalValidationUrl,
                type: 'POST',
                data: data,
                async: true,
                success: function (response) {
                    if (!response.isValid) {
                        self.parent().renewalAgeWarningMessage(response.message);
                        self.parent().isRenewalAgeWarningVisible(true);
                    }
                    else {
                        self.parent().renewalAgeWarningMessage("");
                        self.parent().isRenewalAgeWarningVisible(false);
                    }
                }
            };
            
            console.log('serverRenewalMaximumAgeValidation');
            $.ajax(defaults);
        };

        self.DOB.subscribe(function (newVal) {
            console.log("DOB changed to:", newVal);
            self.showMessageDob();
            self.validateFreeCoverLimitMaximumAge();
            self.validateOverAge();
        });

        self.validateOverAge = function () {
            var depType = self.parent().memberModel.DependantType();
            var dob = self.DOB();

            if (dob == null || depType == null || depType == 0 || dob.trim().split('-').length < 3 || !/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dob.trim())) {
                console.log("Skipping OverAge validation due to missing date of birth or dependant type.");
                return;
            }

           
            var checkedPolicies = self.PolicyList().filter(function (el) {
                return el.Checked && el.Checked();
            });

            var data = {
                dob: convertToDate(dob, dateFormat),
                policyList: JSON.stringify(checkedPolicies.map(function (p) {
                    return {
                        Checked: p.Checked(),
                        CategoryId: p.CategoryId(),
                        PolicyId: p.PolicyId(),
                        EffectiveDate: convertToDate(p.EffectiveDate(), dateFormat),
                        PolicyStateTypeId: p.PolicyStateTypeId(),
                        RenewalStatus: p.RenewalStatus(),
                        FreeCoverLimitStatus: p.FreeCoverLimitStatus()
                    };
                })),
                dependantType: depType
            };
            if (self.parent().validateAgeOfMemberUrl) {
                var overAgeValidation = {
                    url: self.parent().validateAgeOfMemberUrl,
                    type: 'POST',
                    data: data,
                    async: true,
                    success: function (data) {
                        self.hasOverAgeValidationFinished = true;
                        if (data.isOverAge) {
                            self.overAgeValidationFailed = true;
                        } else {
                            self.overAgeValidationFailed = false;
                            if (!data.isValid) {
                                self.parent().dobWarning(data.message);
                                self.parent().dobWarningVisible(true);
                            }
                            else {
                                self.parent().dobWarning("");
                                self.parent().dobWarningVisible(false);
                            }
                        }
                        self.checkWarningsReady();

                    }
                };
                $.ajax(overAgeValidation);
            }
            
        };

        self.parent().dobWarningVisible.subscribe(() => {
            self.DOB.isModified(true);
        });

        self.validateFreeCoverLimitMaximumAge = function () {
            var depType = self.DependantType();
            var dob = self.DOB();
            
            if (!dob || dob.trim().split('-').length < 3 || !/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dob.trim())) {
                console.log("Skipping FreeCoverLimit validation due to missing date of birth.");
                return;
            }

            var checkedPolicies = self.PolicyList().filter(function (el) {
                return el.Checked && el.Checked();
            });

            var data = {
                dob: convertToDate(dob, dateFormat),
                policyList: JSON.stringify(checkedPolicies.map(function (p) {
                    return {
                        Checked: p.Checked(),
                        CategoryId: p.CategoryId(),
                        PolicyId: p.PolicyId(),
                        EffectiveDate: convertToDate(p.EffectiveDate(), dateFormat),
                        PolicyStateTypeId: p.PolicyStateTypeId(),
                        RenewalStatus: p.RenewalStatus(),
                        FreeCoverLimitStatus: p.FreeCoverLimitStatus()
                    };
                })),
                dependantType: depType
            };
            if (self.parent().freeCoverLimitMaximumAgeUrl) {
                var freeCoverLimitMaximumAgeValidation = {
                    url: self.parent().freeCoverLimitMaximumAgeUrl,
                    type: 'POST',
                    data: data,
                    async: true,
                    success: function (response) {
                        self.hasFreeCoverLimitValidationFinished = true;
                        if (!response.isValid) {
                            self.freeCoverLimitMaxAgeValidationFailed = true;
                        } else {
                            self.freeCoverLimitMaxAgeValidationFailed = false;
                        }
                        self.checkWarningsReady();
                    }
                };

                $.ajax(freeCoverLimitMaximumAgeValidation);
            }
        };

        function checkSalaryBasedValidation(val) {
            return !parent().isSalaryAvailible ||
                (self.DependantType == undefined || self.DependantType() != EDependantType.Employee || !self.HasSalaryBased() || (self.HasSalaryBased() && val != undefined && val != null && val != ""));
        }

        // Remove duplicate - these are now defined earlier after HasSalaryBased

        self.errors = ko.validation.group(self);
        self.getDynamicFieldForSection = function(section) {
            var result = [];
            ko.utils.arrayForEach(self.MemberDynamicFields,
                function(item) {
                    if (item.section == section)
                        result.push(item);
                });
            return result;
        };

        // Update field validations when policies change
        self.updateFieldValidations = function() {
            // Don't force re-validation - let it happen on submit
        };

        self.updatedDynamicFields = function (oldModel) {
            var fields = [];
            if (oldModel != null) {

                self.MemberDynamicFields.forEach(function (newDynamicField) {

                    var field = ko.utils.arrayFirst(oldModel.MemberDynamicFields,
                        function (oldDynamicField) {
                            var isChangedDynamicField = (newDynamicField._displayName == oldDynamicField._displayName && oldDynamicField.value() != null && oldDynamicField.value() != '');
                            return newDynamicField.visible() && (isChangedDynamicField) && ((newDynamicField.id != oldDynamicField.id) || (oldDynamicField.value() != newDynamicField.value()));
                        });

                    if (field == undefined) {
                        field = ko.utils.arrayFirst(oldModel.MemberDynamicFields,
                            function (oldDynamicField) {
                                return newDynamicField.visible() && (newDynamicField.id == oldDynamicField.id) && (oldDynamicField.value() != newDynamicField.value());
                            });
                    }

                    if (field != undefined) {
                        if (!((newDynamicField.value() == null || newDynamicField.value() == "") && (field.value() == null || field.value() == ""))) {
                            fields.push({ oldModel: field, newModel: newDynamicField });
                        }
                    }
                })
            }

            //  foreach { data: memberModel.MemberDynamicFields, as: 'newModel' }               
            //     foreach: { data: $root.oldModel.MemberDynamicFields, as: 'oldModel' }
            //       if: newModel.compare(oldModel)
            //        if: !((newModel.value() == null || newModel.value() == "") && (oldModel.value() == null || oldModel.value() == ""))-- >
            //Zvar ischetotam = (self._displayName == dynamicField._displayName && dynamicField.value() != null && dynamicField.value() != '');
            return fields;
        }
    }

    function convertToDate(str, dateFormat) {
        if (str === null)
            return null;

        const invalidValidationConst = 'Invalid Date';

        let date = dayjs(str).format();

        if (date === invalidValidationConst) {
            const matchArray = str.match(/-?\d+/);

            if (matchArray && matchArray.length > 0) {
                const timestamp = parseInt(matchArray[0], 10);

                return dateFormat
                    ? dayjs(timestamp).format(dateFormat.toUpperCase())
                    : dayjs(timestamp).format('DD-MMM-YYYY');
            }
        }

        if (dateFormat != null) {
            date = dayjs(str).format(dateFormat.toUpperCase());
        }
        return date;
    }

    function DynamicFieldModel(model, parent) {

        var self = this;

        self.defaultVisibilityState = model.DefaultVisibilityState;
        self.defaultRequiredState = model.DefaultRequiredState;
        self.defaultEnabledState = model.DefaultEnabledState;

        self.id = model.MemberDynamicFieldId;
        self.type = model.Type;
        self.name = model.Name;
        self.section = model.Section;

        self.parent = parent;
        self.template = "EDynamicFieldType_" + self.type + '_template';
        self.controlId = model.MemberDynamicFieldId + '_' + generateUidNotMoreThan1Million();


        if (model.MemberDynamicFieldValues[0]) {
            self.value = ko.observable(model.MemberDynamicFieldValues[0]);
        } else {
            self.value = ko.observable(model.DefaultValue);
        }

        self.visible = ko.observable(model.IsVisible);
        self.optionLabel = model.OptionLabel;
        if (self.type === EDynamicFieldTypes().Select && !model.OptionLabel) {
            self.optionLabel = 'Please select...';
        }

        self.enabled = ko.observable(model.IsEnabled);
        self.selectModel = new SelectModel(model.AvailableList, model.MemberDynamicFieldValues);
        self.changeVisibility = function() {
            if (self.visible() === true) {
                self.visible(false);
            } else {
                self.visible(true);
            }
           
        };

        self._displayName = model.DisplayName;
  

        self.validation = {
            required: ko.observable(model.IsRequired),
            requiredMessage: ko.observable(model.ErrorMessage || "The " + self._displayName + " field is required"),
            serverValidation: {
                valid: ko.observable(true),
                message: ko.observable('')
            }
        };

        self.validation.requiredAndVisible = ko.computed(function () {
            return self.validation.required() && self.visible();
        });


        self.validation.serverValidation.validOrNotVisible = ko.computed(function () {
            return self.validation.serverValidation.valid() || (!self.visible());
        });

        self.displayName = ko.computed(function () {
            return self._displayName + (self.validation.required() ? " (*)" : "");
        });


        self.visible.subscribe(
            function (value) {
                if (value === false) {
                    self.selectModel.SelectedItems([]);
                    self.value(null);
                    if (self.type === EDynamicFieldTypes().Multiselect) {
                        var multiSelect = $("#" + self.controlId).data("kendoMultiSelect");
                        if (multiSelect)
                            multiSelect.value([]);
                    } else if (self.type === EDynamicFieldTypes().Select) {
                        var selControl = $("#" + self.controlId).data("kendoDropDownList");
                        if (selControl)
                            selControl.value(null);
                    }
                }
            });

        self.value.subscribe(self.parent().parent().serverValidation);
        self.preventEnabling = false;

        if (self.type === EDynamicFieldTypes().Select) {
            self.value.subscribe(function (e) {
                self.parent().MemberDynamicFields.forEach(function (e) { if (e.type === EDynamicFieldTypes().Select)
                    (false); });
                $('.k-i-arrow-s').addClass('k-loading');

                var onComplete = function () {
                    $('.k-i-arrow-s').removeClass('k-loading');
                    self.parent().MemberDynamicFields.forEach(function (e) { if (e.type === EDynamicFieldTypes().Select && !e.preventEnabling) e.enabled(true); });
                };

                updateCascadeFileds(e, onComplete, self.parent().parent().loadDataUrl, self.id, null, self.parent().MemberDynamicFields, self.parent().parent().dependableFields, self.parent().preloadedDynamicData);

            });
        }

        function generateUidNotMoreThan1Million() {
            return ("00000" + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5);
        }

        //get origin backend model
        self.GetBackEndFieldModel = function () {
            return new BackEndDynamicFieldModel(
                self.id, self.name, self.type, self.type === EDynamicFieldTypes().Multiselect ? self.selectModel.SelectedItems() : [self.value()]);
        }
    }

    function SelectModel(listOfItems, selectedItems) {
        listOfItems.forEach(function (it) { it.Id = it.Id.toString() });
        this.ListOfItems = ko.observableArray(listOfItems);
        this.SelectedItems = ko.observableArray(selectedItems);
        //     this.SelectedItems.subscribe(onValueChanged, null, "arrayChange");
    }

    function BackEndDynamicFieldModel(memberDynamicFieldId, name, type, memberDynamicFieldValues) {
        this.MemberDynamicFieldId = memberDynamicFieldId;
        this.Name = name;
        this.Type = type;
        this.MemberDynamicFieldValues = memberDynamicFieldValues;
    }

    function AddressModel(model, parent) {
        var self = this;
        self.parent = parent;

        //subscribe for update cascade fields
       

        self.sVal = self.parent().parent().serverValidator;

        self.AddressId = ko.observable(model.AddressId);
        self.CityId = ko.observable(model.CityId);
        self.City = ko.observable(model.City);
        self.CityOther = ko.observable(model.CityOther);
        self.CountryId = ko.observable(model.CountryId);
        updateCascadeFileds(model.CountryId, null, self.parent().parent().loadDataUrl, null, MemberRegularFieldNames().CountryId, self.parent().MemberDynamicFields, self.parent().parent().dependableFields, self.parent().preloadedDynamicData);
        self.Country = ko.observable(model.Country);
        self.CorrespondenceAddress = ko.observable(model.CorrespondenceAddress);
        self.Telephone = ko.observable(model.Telephone);
        self.MobilePhone = ko.observable(model.MobilePhone).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().MobilePhone } });
        self.AddressText = ko.observable(model.AddressText);
        self.POBox = ko.observable(model.POBox);
        self.Area = ko.observable(model.Area);
        self.AreaOther = ko.observable(model.AreaOther);
        self.Fax = ko.observable(model.Fax);
        //subsribe
        self.AddressId.subscribe(self.parent().parent().serverValidation);
        self.CityId.subscribe(self.parent().parent().serverValidation);
        self.City.subscribe(self.parent().parent().serverValidation);
        self.CityOther.subscribe(self.parent().parent().serverValidation);
        self.CountryId.subscribe(self.parent().parent().serverValidation);
        self.CountryId.subscribe(function (e) {
            updateCascadeFileds(e, null, self.parent().parent().loadDataUrl, null, MemberRegularFieldNames().CountryId, self.parent().MemberDynamicFields, self.parent().dependableFields, self.parent().preloadedDynamicData);
        });
        self.Country.subscribe(self.parent().parent().serverValidation);
        self.CorrespondenceAddress.subscribe(self.parent().parent().serverValidation);
        self.Telephone.subscribe(self.parent().parent().serverValidation);
        self.MobilePhone.subscribe(self.parent().parent().serverValidation);
        self.AddressText.subscribe(self.parent().parent().serverValidation);
        self.POBox.subscribe(self.parent().parent().serverValidation);
        self.Area.subscribe(self.parent().parent().serverValidation);
        self.AreaOther.subscribe(self.parent().parent().serverValidation);
        self.Fax.subscribe(self.parent().parent().serverValidation);
    }

    function DocumentsValidationModel(model) {
        var self = this;
        self.Valid = ko.observable(model.Valid);
        self.ValidationMessage = ko.observable(model.ValidationMessage);
        self.MissingDocuments = ko.observableArray(model.MissingDocuments);
    }

    function DuplicateMembersGrid(parentObj) {
        var self = this;
        var parent = parentObj;
        self.Duplicates = ko.observableArray();
        self.IsLikeToProceed = ko.observable(false);

        self.isVisible = ko.computed(function () {
            const nationalId = parent.memberModel && typeof parent.memberModel.NationalIDNumber === 'function'
                ? parent.memberModel.NationalIDNumber()
                : null;

            const hasNationalId = nationalId !== null && nationalId !== undefined && nationalId.trim() !== "";
            const hasDuplicates = self.Duplicates().length > 0;

            return hasDuplicates && hasNationalId;
        });

        var getDuplicatesDataFunction = function () {
            //console.log(memberModel);
            //var result = false;
            //var data = parent.GetMemberModel();
            $.ajax({
                url: parent.duplicateCheckUrl,
                type: "POST",
                data: ko.toJSON(parent.GetMemberModel()), //ko.toJSON(self.GetMemberModel() ),
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function (data) {
                    //console.log(data);
                    if (data.Success) {
                        //result = !data.Data.some(function (item) {
                        //    return !item.Valid;
                        //});
                        //   if (!result) {
                        self.Duplicates(ko.utils
                            .arrayMap(data.Data.DuplicateModels, function (item) {
                                return new DuplicateMemberViewModel(item);
                            }));
                        //        //  self.DocumentsValidationModalShow(true);
                    }
                    //} else {
                    //    onFailureValdationMessage(data.Data.ValidationMessage);

                    //    result = false;
                    //};
                },
                error: function (data) {
                    //  onFailureValdationMessage(data.ValidationMessage);
                    result = false;
                },
                complete: function (o) {
                    // bnetflex.ui.progressbar.hide();
                }
            });

            //    return result;
        }

        self.getDuplicatesData = _.debounce(getDuplicatesDataFunction, debounceDelay);
    }


    function DuplicateMemberViewModel(model) {
        var self = this;
        self.memberName = ko.observable(model.MemberName);
        self.dob = ko.observable(model.DOB);
        self.nationality = ko.observable(model.Nationality);
        self.employeeNumber = ko.observable(model.EmployeeNumber);
        self.subgroupName = ko.observable(model.SubgroupName);
        self.nationalIDNumber = ko.observable(model.NationalIDNumber);
        self.policyName = ko.observable(model.PolicyName);
        self.categoryDuplicate = ko.observable(model.CategoryName);
    }

    function updateAllCascadeFields(memberDynamicFields, url, dependableFields, preloadedDynamicData) {

        memberDynamicFields.forEach(function (e) { if (e.type === EDynamicFieldTypes().Select) e.enabled(false); });
        $('.k-i-arrow-s').addClass('k-loading');
        memberDynamicFields.forEach(function (e) {
            if (e.type === EDynamicFieldTypes().Select) {
                updateCascadeFileds(e.value(), null, url, e.id, null, memberDynamicFields, dependableFields, preloadedDynamicData);
            }
        });
        $('.k-i-arrow-s').removeClass('k-loading');
        memberDynamicFields.forEach(function (e) { if (e.type === EDynamicFieldTypes().Select) e.enabled(true); });
    }

    function updateCascadeFileds(e, onComplete, url, dynamicFieldId, regularFieldName, dynamicFileds, dependableFields, preloadedDynamicData) {
        if (!e || Array.isArray(e)) {
            if (onComplete) {
                onComplete();
            }
            return;
        }
        if (preloadedDynamicData) {
            var dynamicField = ko.utils.arrayFirst(preloadedDynamicData,
                function(dyn) {
                    return dyn.FieldId == dynamicFieldId && dyn.Value == e && dyn.RegularFieldName == regularFieldName;
                });
            if (dynamicField) {
                processDynamicField(dynamicField, dynamicFileds);
                return;
            }

        }
        if (dependableFields) {
            var isDependable = ko.utils.arrayFirst(dependableFields,
                function(item) {
                    return (dynamicFieldId !== null && dynamicFieldId === item.DependsFromDynamicFieldId) ||
                        (regularFieldName !== null && regularFieldName === item.DependsFromRegularFieldName);
                });
            if (!isDependable) {
                return;
            }
        }

        $.ajax({
            url: url,
            type: "POST",
            data: ko.toJSON({ value: e, fieldId: dynamicFieldId, regularFieldName: regularFieldName }),
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
                processDynamicField(result, dynamicFileds);

            },
            error: function (result) {
                console.log(result);
            },
            complete: function (result) {
                if (onComplete) {
                    onComplete();
                }
            },
            async: true
        });
    }

    function processDynamicField(result, dynamicFields) {
        result.Data.forEach(function (field) {
            var existingFiled = ko.utils.arrayFirst(dynamicFields, function (item) {
                return item.id === field.MemberDynamicFieldId;
            });
            if (existingFiled) {
                var selectedItem = existingFiled.value();
                existingFiled.selectModel.ListOfItems([]);

                var mappedList = ko.utils.arrayMap(field.AvailableList, function (item) { return { Name: item.Name, Id: item.Id.toString() }; });
                existingFiled.selectModel.ListOfItems.push.apply(existingFiled.selectModel.ListOfItems, mappedList);

                var selectedItemExists = mappedList.filter(function (item) { return item.Id === selectedItem; });
                if (selectedItemExists && selectedItemExists.length > 0) {
                    existingFiled.value([selectedItem]);
                    existingFiled.value(selectedItem);
                } else {
                    existingFiled.value("");
                }
            }
        });
    }

    return {

        model: function (params) {

            $(params.formSelector).validate();

            ko.validation.init({
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                },
                decorateInputElement: true
                //registerExtenders: true,
                //insertMessages: true,
            });


            ko.bindingHandlers.trim = {
                update: function (element, valueAccessor) {
                    $(element).blur(function () {  
                        var str = ko.utils.unwrapObservable(valueAccessor());
                        if (str != null) {
                            var trimmedString = str.replace(/\s+/g, ' ');
                            var result = $.trim(trimmedString);
                            valueAccessor()(result);
                        }
                    });
                }
            };

            ko.validation.rules['depTypeValidation'] = {
                validator: function (val, parms, callback) {
                    if (parms.model.DOB != null) {
                        parms.model.DOB.valueHasMutated();
                    }
                    return true;
                },
                message: function (params) {
                    return params.message;
                }
            }

            function employeeNumberValidationFunction (val, parms, callback) {

                if (!params.validateEmployeeNumberUrl) {
                    return;
                }

                if (parms.prevent()) {
                    callback(true);
                    return;
                }

                parms.data.employeeNumber = val;

                var defaults = {
                    url: params.validateEmployeeNumberUrl,
                    type: 'POST',
                    async: true,
                    success: function (data) {
                        parms.message = data.message;
                        callback(data.isValid);
                    }
                };

                var options = $.extend(defaults, parms);
                $.ajax(options);
            }
            self.employeeNumberValidation = _.debounce(employeeNumberValidationFunction, debounceDelay);

            ko.validation.rules['serverValidateEmployeeNumber'] = {
                async: true,
                validator: employeeNumberValidation,
                message: function (params) {
                    return params.message;
                }
            };

            function emailValidationFunction(val, parms, callback) {

                if (!params.validateEmailOfMemberUrl) {
                    return;
                }

                parms.data.email = val;

                var defaults = {
                    url: params.validateEmailOfMemberUrl,
                    type: 'POST',
                    async: true,
                    success: function (data) {
                        parms.message = data.message;
                        callback(data.isValid);
                    }
                };

                var options = $.extend(defaults, parms);
                $.ajax(options);
            };
            self.emailValidation = _.debounce(emailValidationFunction, debounceDelay);

            ko.validation.rules['serverValidateEmailOfMember'] = {
                async: true,
                validator: emailValidation,
                message: function (params) {
                    return params.message;
                }
            };

            ko.validation.rules['memberNameSpecialCharactersValidation'] = {
                async: true,
                validator: function (val, parms, callback) {

                    if (val == '' || val == null) {
                        callback(true);
                        return;
                    }

                    var regex = /^[a-zA-Z0-9А-яІі\'\-\.ñ ]+$/g
                    if (!regex.test(val)) {
                        callback(false);
                    } else {
                        callback(true);
                    }

                    console.log('memberNameSpecialCharactersValidation');
                },
                message: params.specialCharactersValidationMessage
            };

            //handler for validation
            ko.bindingHandlers.dataVal = {
                init: function (element, valueAccessor) {
                    var val = valueAccessor();
                    if (val.requiredAndVisible()) {

                        $(element).attr('data-val', true);
                        $(element).attr('data-val-required', val.requiredMessage());
                        $(element).rules('add', "required");

                    } else {
                        $(element).removeAttr('data-val');
                        $(element).removeAttr('data-val-required');
                        $(element).rules("remove", "required");
                    }

                    if (!val.serverValidation.validOrNotVisible()) {
                        $(element).attr('data-rule-invalid', "true");
                        $(element).closest('.parentdiv').addClass("has-error");

                        var spanMsg = document.createElement("span");
                        $(spanMsg).text(val.serverValidation.message());
                        $(spanMsg).addClass("text-danger").addClass("spanMsg");
                        $(element).closest('.parentdiv').append(spanMsg);
                    } else {
                        $(element).removeAttr('data-rule-invalid');
                        $(element).closest('.parentdiv').removeClass("has-error");

                        $(element).closest('.parentdiv').children(".spanMsg").remove();
                    }

                },
                update: function (element, valueAccessor) {

                    var val = valueAccessor();
                    if (val.requiredAndVisible()) {

                        $(element).attr('data-val', true);
                        $(element).attr('data-val-required', val.requiredMessage());
                        $(element).rules('add', "required");

                    } else {
                        $(element).removeAttr('data-val');
                        $(element).removeAttr('data-val-required');
                        $(element).rules("remove", "required");
                    }

                    if (!val.serverValidation.validOrNotVisible()) {
                        var spans = $(element).closest('.parentdiv').find('.spanMsg');
                        if (spans.length !== 0) {
                            spans.remove();
                        }
                        $(element).attr('data-rule-invalid', "true");
                        $(element).closest('.parentdiv').addClass("has-error");

                        var spanMsg = document.createElement("span");
                        $(spanMsg).text(val.serverValidation.message())
                        $(spanMsg).addClass("text-danger").addClass("spanMsg");
                        $(element).closest('.parentdiv').append(spanMsg);
                    } else {
                        $(element).removeAttr('data-rule-invalid');
                        $(element).closest('.parentdiv').removeClass("has-error");

                        $(element).closest('.parentdiv').children(".spanMsg").remove();
                    }
                }
            };

            ko.validation.registerExtenders();
            // for documents validation modal window
            ko.bindingHandlers.showModal = {
                init: function (element, valueAccessor) { $(element).modal({ backdrop: 'static', keyboard: true, show: false }); },
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

            return new MemberViewModelContainer(params);
        }
    }

}(jQuery, ko))


