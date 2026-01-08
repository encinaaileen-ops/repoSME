var EPolicyType = {
    LifeDisability: 2,
    CriticalIllness: 3,
    PersonalAccident: 4
};

var MemberViewModelStructure = (function ($, ko) {
    var debounceDelay = 500;

    //main model for apply bindings 
    function MemberViewModelContainer(params) {
        var self = this;
        
        console.log('[MemberModalViewModelStructure] Initialized with params:', {
            preventValidation: params.preventValidation,
            isEdit: params.isEdit,
            hasValidationCallBack: !!params.validationCallBack
        });

        self.preventValidation = params.preventValidation;
        self.validationCallBack = params.validationCallBack;
        
        // Track original and new policies for Transfer view
        self.originalPolicyIds = ko.observableArray([]);
        self.newPolicyIds = ko.observableArray([]);
        
        console.log('[MemberModalViewModelStructure] preventValidation:', self.preventValidation);
        
        self.id = params.memberId;

        self.dependantTypes = params.dependantTypes;
        self.countries = params.countries;
        self.currencies = params.currencies;
        self.documentTypes = params.documentTypes;
        self.genders = genderList;
        self.maritalStatuses = maritalStatusList;

        self.validationUrl = params.validationUrl;
        self.loadDataUrl = params.loadDataUrl;
        self.rawMemberModel = params.rawMemberModel;
        self.isEdit = params.isEdit;
        self.clientId = params.clientId;
        self.isSalaryAvailible = params.isSalaryAvailible;
        self.docsValidationUrl = params.docsValidationUrl;
        self.duplicateCheckUrl = params.duplicateCheckUrl;
        self.dependableFields = params.dependableFields;
        self.principalModel = params.principalModel;
        self.MemberRegularFieldsErrors = ko.observableArray();
        self.renewalAgeWarningMessage = ko.observable("");
        self.isRenewalAgeWarningVisible = ko.observable(false);
        self.dobWarning = ko.observable("");
        self.dobWarningVisible = ko.observable(false);
        self.FreeCoverLimitStatus = ko.observable();
        self.dateFormat = params.dateFormat;
        self.renewalValidationUrl = params.validateMemberRenewalMaximumAgeUrl;
        self.freeCoverLimitMaximumAgeUrl = params.validateFreeCoverLimitMaximumAgeUrl;
        self.isFreeCoverLimitWarningVisible = ko.observable(false);
        self.freeCoverLimitWarningMessage = ko.observable("");
        self.serverValidator = {
            val: function (val, param) {
                //console.log(self.id + " val: " + val + ", param: " + param);
                var error = self.MemberRegularFieldsErrors().filter(function (t) {
                    return param.name === t.MemberRegularFieldName;
                })[0];
                if (error == undefined && param && param.field && param.name === "Email") {
                    var emailError = param.field.rules().filter(function (rl) {
                        return rl.rule === "serverValidateEmailOfMember" && rl.params.message !== undefined;
                    });
                    //console.log(self.id + " email: " + (param.field.isValid()));
                    if (emailError != 0 && param.oldVal() != param.field()) {
                        param.oldVal(param.field());
                        return true;
                    }
                    return emailError == 0;
                }
                return error === undefined;
            },
            msg: function (param) {
                var error = self.MemberRegularFieldsErrors().filter(function (t) {
                    return param.name === t.MemberRegularFieldName;
                })[0];
                if (error == undefined && param && param.field && param.name === "Email") {
                    var emailError = param.field.rules().filter(function (rl) {
                        return rl.rule === "serverValidateEmailOfMember" && rl.params.message !== undefined;
                    });
                    //console.log(self.id + " email: " + (param.field.isValid()));
                    return emailError[0].params.message;
                }
                if (error == undefined) {
                    return "";
                }
                // console.log(error.ValidationMessage);
                return error.ValidationMessage;
            }
        };

        var serverValidationFunction = function (e) {
            if (self.preventValidation)
                return;
            console.log('serverValidation');

            $.ajax({
                url: self.validationUrl,
                type: "POST",
                data: ko.toJSON({
                    isEdit: self.isEdit,
                    isIncompleteTransfer: parent != null && parent.transferViewModel != null &&
                        parent.transferViewModel.transferConfigurationViewModel != null && parent.transferViewModel.transferConfigurationViewModel.isIncompleteTransfer(),
                    memberModel: self.GetMemberModel() }),
                dataType: "json",
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    // console.log(data);
                    self.memberModel.MemberDynamicFields.forEach(function (e) {
                        var result = $.grep(data, function (t) { return e.id === t.MemberDynamicFieldId; })[0];
                        if (result) {
                            e.hasError(!result.Valid);
                            e.errorMessage(result.ValidationMessage);
                            e.visible(result.Visible);
                            e.isRequired(result.IsRequired);
                            if (!result.IsEnabled) {
                                e.preventEnabling = true;
                            }
                            else {
                                e.preventEnabling = false;
                            }
                            e.enabled(result.IsEnabled);
                            if (result.Values != null && result.Values != undefined) {
                                e.value(result.Values[0]);
                            }

                        } else {
                            e.hasError(false);
                            e.errorMessage('');
                            e.visible(e.defaultVisibilityState);
                            e.isRequired(e.defaultRequiredState);
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
                },
                error: function (data) {
                    console.log(data);
                },
                complete: function (data) {
                    if (params.validationCallBack) {
                        params.validationCallBack(self.IsMemberValid());
                    }
                    self.ValidateDocuments();
                    self.showMessageDob();
                },
                async: true
            });
        }

        self.serverValidation = _.debounce(serverValidationFunction, debounceDelay);
        
        // Methods for Transfer view to track new policies
        self.pushNewPolicy = function(policy) {
            console.log('[pushNewPolicy] Called with policy:', policy);
            
            // Try to extract policy ID from various possible structures
            var policyId = null;
            if (policy) {
                if (policy.PolicyId) {
                    policyId = typeof policy.PolicyId === 'function' ? policy.PolicyId() : policy.PolicyId;
                } else if (policy.Id) {
                    policyId = typeof policy.Id === 'function' ? policy.Id() : policy.Id;
                } else if (typeof policy === 'number' || typeof policy === 'string') {
                    policyId = policy;
                }
            }
            
            console.log('[pushNewPolicy] Extracted policyId:', policyId);
            
            if (policyId && self.newPolicyIds.indexOf(policyId) === -1) {
                self.newPolicyIds.push(policyId);
                console.log('[pushNewPolicy] Added new policy ID:', policyId);
                console.log('[pushNewPolicy] Current new policy IDs:', self.newPolicyIds());
            } else if (!policyId) {
                console.log('[pushNewPolicy] Could not extract policy ID from:', policy);
            }
        };
        
        self.setNewCategory = function(policyId, categoryId) {
            console.log('[setNewCategory] Called with policyId:', policyId, 'categoryId:', categoryId);
            
            // Convert to number if it's a string
            if (typeof policyId === 'string' && !isNaN(policyId)) {
                policyId = parseInt(policyId, 10);
            }
            
            if (policyId && self.newPolicyIds.indexOf(policyId) === -1) {
                self.newPolicyIds.push(policyId);
                console.log('[setNewCategory] Added new policy ID:', policyId);
                console.log('[setNewCategory] Current new policy IDs:', self.newPolicyIds());
            } else if (policyId && self.newPolicyIds.indexOf(policyId) !== -1) {
                console.log('[setNewCategory] Policy ID already tracked:', policyId);
            }
        };

        var showMessageDobFunction = function (e) {

            var depType = self.memberModel.DependantType();
            var dob = self.memberModel.DOB();
            self.renewalAgeWarningMessage("");
            self.freeCoverLimitWarningMessage("");
            self.isRenewalAgeWarningVisible(false);
            self.isFreeCoverLimitWarningVisible(false);
            var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$|^(0[1-9]|[12][0-9]|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/;

            if (dateRegex.test(dob)) {
                var parsedDob = new Date(dob);
                if (isNaN(parsedDob.getTime())) {
                    return;
                }
            } else {
                return;
            }

            if (dob == null || depType == null || depType == 0) {
                return;
            }

            if (!dob || dob.trim().split('-').length < 3 || !/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(dob.trim())) {
                return;
            }

            var data = {
                dob: convertToDate(dob, self.dateFormat),
                policyList: JSON.stringify(self.memberModel.PolicyList().map(function (p) {
                    return {
                        CategoryId: p.CategoryId(),
                        PolicyId: p.PolicyId(),
                        EffectiveDate: convertToDate(p.EffectiveDate(), self.dateFormat),
                        PolicyStateTypeId: p.PolicyStateTypeId()
                    };
                })),
                dependantType: depType
            };

            var freeCoverDefauts = {
                url: self.freeCoverLimitMaximumAgeUrl,
                    type: 'POST',
                    data: data,
                    async: true,
                    success: function (response) {
                        if (!response.isValid) {
                        self.freeCoverLimitWarningMessage(response.message);
                        self.isFreeCoverLimitWarningVisible(true);
                        } else {
                        self.freeCoverLimitWarningMessage("");
                        self.isFreeCoverLimitWarningVisible(false);
                        }
                    }
            };

            var defaults = {
                url: self.renewalValidationUrl,
                type: 'POST',
                data: data,
                async: true,
                success: function (response) {
                    if (!response.isValid) {
                        self.renewalAgeWarningMessage(response.message);
                        self.isRenewalAgeWarningVisible(true);
                    }
                    else {
                        self.renewalAgeWarningMessage("");
                        self.isRenewalAgeWarningVisible(false);
                    }
                }
            };
            
                console.log('serverRenewalMaximumAgeValidation');
                console.log('serverFreeCoverLimitMaximumAgeValidation');
                $.ajax(defaults);
                $.ajax(freeCoverDefauts);
            };

        self.showMessageDob = _.debounce(showMessageDobFunction, debounceDelay);
        //this is needed for fix circular issue on serialization
        //if child object include reference to parent? they could not serialized
        //but ref to function solve this )
        self.getSelf = function() {
            return self;
        }

        //ToDo Remove that after viewmodel will be used in member addition wizard
        self.addedMembers = [];

        self.addMembersWizardModel = function() {
            return {
                Members: self.addedMembers,
                IsCreateWorkflow: self.CreateWorkflow() === "1" || self.CreateWorkflow() === "2",
                IsNotifyHr: self.NotifyHr() === undefined || self.NotifyHr() === "1",
                IsNotifyMember: self.NotifyMember() === undefined || self.NotifyMember() === "1",
                CommentsToInsurer: self.CommentsToInsurer(),
                ImportType: self.CreateWorkflow()
            };
        }
        //ToDo Remove that after viewmodel will be used in member addition wizard

        self.DuplicatesGrid = new DuplicateMembersGrid(self);

        self.memberModel = new MemberModel(self.rawMemberModel, self.getSelf, self.isEdit, params.dateFormat, self.principalModel);
        
        // Store initial policy IDs when member is loaded (for Transfer view)
        if (self.preventValidation && self.memberModel.PolicyList) {
            var initialPolicies = self.memberModel.PolicyList().filter(function(p) {
                return p.Checked && p.Checked();
            }).map(function(p) {
                var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : 
                              p.PolicyType ? (typeof p.PolicyType === 'function' ? p.PolicyType() : p.PolicyType) : null;
                console.log('[MemberModalViewModelStructure] Initial policy:', {
                    policyId: policyId,
                    policyTypeId: p.PolicyTypeId ? (typeof p.PolicyTypeId === 'function' ? p.PolicyTypeId() : p.PolicyTypeId) : null,
                    checked: p.Checked ? p.Checked() : false
                });
                return policyId;
            });
            self.originalPolicyIds(initialPolicies);
            console.log('[MemberModalViewModelStructure] Original policy IDs stored:', self.originalPolicyIds());
        }

        //return clean backend model
        self.GetMemberModel = function() {
            var copiedObject = ko.toJS(self.memberModel);
            if (copiedObject.PolicyList.length != 1 && findDestinationPolicies(copiedObject.PolicyList)) {
                copiedObject.PolicyList = copiedObject.PolicyList.filter(function (policy) {
                    return policy.DestinationPolicy;
                });
            }
            copiedObject.MemberDynamicFields = ko.utils
                .arrayMap(self.memberModel.MemberDynamicFields, function (item) { return item.GetBackEndFieldModel(); });

            if (copiedObject.principalModel != null && copiedObject.principalModel != undefined) {
                copiedObject.ParentMember = copiedObject.principalModel;
                copiedObject.ParentMember.MemberDynamicFields = ko.utils
                    .arrayMap(copiedObject.principalModel.MemberDynamicFields, function(item) {
                        return item.GetBackEndFieldModel === undefined ? item : item.GetBackEndFieldModel();
                    });
            }

            updateDates(copiedObject);
            return copiedObject;
        }
        
        function updateDates(copiedObject) {
            //Does not apply for dynamic fields
            for (var key in copiedObject) {
                if (copiedObject[key] != null) {
                    if (typeof copiedObject[key].getMonth === "function") {
                        var convertedDate = convertToDate(copiedObject[key], params.dateFormat);
                        copiedObject[key] = convertedDate;
                    }
                }

            }
        }

        self.CommentsToInsurer = ko.observable();
        self.NotifyMember = ko.observable();
        self.CreateWorkflow = ko.observable();
        self.NotifyHr = ko.observable();

        self.DocumentsValidationMsgs = ko.observableArray();
        self.DocumentsValidationType = ko.observable();
        self.DocumentsValidationModalShow = ko.observable(false);
        self.DocumentsValidationModalHide = function() {
            self.DocumentsValidationModalShow(false);
        }
        self.isDocumentsValid = ko.computed(function() {
            return self.DocumentsValidationMsgs().length == 0;
        });

        self.cleanDynamicFields = function () {
            self.memberModel.MemberDynamicFields.forEach(function (e) {
                e.value(null);
            });
        }

        self.ValidateDocuments = function() {
            // bnetflex.ui.progressbar.show();
            //console.log(memberModel);
            console.log('ValidateDocuments');

            var result = false;
            $.ajax({
                url: self.docsValidationUrl,
                type: "POST",
                data: ko.toJSON({
                    model: self.GetMemberModel(),
                    transferType: parent.transferViewModel != null || parent.transferViewModel != undefined ? parent.transferViewModel.transferConfigurationViewModel.selectedTransferType() : null
                }),
                contentType: 'application/json; charset=utf-8',
                async: true,
                success: function(data) {
                    if (data.Success) {
                        result = data.Data.some(function(item) {
                            return !item.Valid;
                        });
                        if (result) {
                            self.DocumentsValidationMsgs(ko.utils
                                .arrayMap(data.Data, function(item) { return new DocumentsValidationModel(item); }));
							if (data.Data.length === 1) {
                                self.DocumentsValidationType(data.Data[0].ValidationType);
                            } else {
                                self.DocumentsValidationType('');
                            }
                            self.DocumentsValidationModalShow(true);
                        }
                        else {
                            self.DocumentsValidationMsgs([]);
                        }
                    } else {
                        result = false;
                    };
                },
                error: function(data) {
                    result = false;
                },
                complete: function (data) {
                    if (params.validationCallBack) {
                        params.validationCallBack(self.IsMemberValid() && self.isDocumentsValid());
                    }
                }
            });

            return result;
        }

        self.IsMemberValid = function () {
            console.log('[IsMemberValid] Called');
            var isValid = true;
            
            // Reset DOB and Gender errors first
            if (self.memberModel.DOB.error) {
                self.memberModel.DOB.error(null);
            }
            if (self.memberModel.Gender.error) {
                self.memberModel.Gender.error(null);
            }
            
            // Check DOB and Gender based on policy types  
            if (self.memberModel.PolicyList && self.memberModel.PolicyList().length > 0) {
                var checkedPolicies = self.memberModel.PolicyList().filter(function(p) { 
                    return p.Checked && p.Checked(); 
                });
                
                console.log('[IsMemberValid] Total checked policies:', checkedPolicies.length);
                
                // In Transfer mode, only validate based on NEW policies
                if (self.preventValidation) {
                    console.log('[IsMemberValid] Transfer mode detected (preventValidation=true)');
                    console.log('[IsMemberValid] New policy IDs:', self.newPolicyIds ? self.newPolicyIds() : []);
                    
                    if (self.newPolicyIds && self.newPolicyIds().length > 0) {
                        console.log('[IsMemberValid] Filtering to new policies only');
                        var newCheckedPolicies = checkedPolicies.filter(function(p) {
                            var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : null;
                            var isNew = self.newPolicyIds.indexOf(policyId) !== -1;
                            console.log('[IsMemberValid] Policy', policyId, 'is new:', isNew);
                            return isNew;
                        });
                        
                        console.log('[IsMemberValid] New policies to validate:', newCheckedPolicies.length);
                        checkedPolicies = newCheckedPolicies;
                    }
                    
                    // If no new policies selected yet, skip DOB/Gender validation
                    if (checkedPolicies.length === 0) {
                        console.log('[IsMemberValid] No new policies, skipping DOB/Gender validation');
                        // Only validate other required fields
                        if (!self.validationObject.isValid() || self.memberModel.MemberDynamicFields.some(function (df) { return df.hasError() && df.visible() && df.isRequired() })) {
                            self.validationObject.errors.showAllMessages();
                            return false;
                        }
                        return true;
                    }
                }
                
                if (checkedPolicies.length > 0) {
                    var hasOnlyExempt = self.memberModel.hasOnlyExemptPolicies ? self.memberModel.hasOnlyExemptPolicies() : false;
                    console.log('[IsMemberValid] hasOnlyExempt:', hasOnlyExempt);
                    
                    // Check if NOT all policies are exempt (Personal Accident or Travel)
                    if (!hasOnlyExempt) {
                        console.log('[IsMemberValid] Validating DOB and Gender as required');
                        // DOB is required
                        if (!self.memberModel.DOB() || self.memberModel.DOB() === '') {
                            console.log('[IsMemberValid] DOB is missing');
                            // Force the validator to return false to show error
                            if (self.memberModel.DOB.error) {
                                self.memberModel.DOB.error(MemberRequiredFieldsMessages().DOB);
                            }
                            isValid = false;
                        }
                        // Gender is required  
                        if (!self.memberModel.Gender() || self.memberModel.Gender() === '' || self.memberModel.Gender() === 0) {
                            console.log('[IsMemberValid] Gender is missing');
                            // Force the validator to return false to show error
                            if (self.memberModel.Gender.error) {
                                self.memberModel.Gender.error(MemberRequiredFieldsMessages().Gender);
                            }
                            isValid = false;
                        }
                    } else {
                        console.log('[IsMemberValid] Only exempt policies, DOB/Gender are optional');
                    }
                }
            }
            
            if (!self.validationObject.isValid() || self.memberModel.MemberDynamicFields.some(function (df) { return df.hasError() && df.visible() && df.isRequired() }) || !isValid) {
                self.validationObject.errors.showAllMessages();
                console.log('[IsMemberValid] Returning false due to validation errors');
                return false;
            }
            console.log('[IsMemberValid] Returning true - validation passed');
            return true;
        }

        self.getSelectedPolicyIds = function() {

            return self.memberModel.PolicyList().filter(function (p) { return p.Checked() }).map(function (p) { return p.PolicyId() });
        }

        self.pushNewPolicy = function (item) {
            //var policy = self.memberModel.PolicyList().filter(function (p) { return p.PolicyId() == item.id })[0];
            //self.memberModel.PolicyList([]);
            //if (policy != undefined) {
            //    policy.Checked(true);
            //    policy.DestinationPolicy(true);
            //}
            //else {
                var policyRow = new PolicyGridRowModel();
                policyRow.PolicyId(item.id);
                policyRow.Checked(true);
                policyRow.DestinationPolicy(true);
                policyRow.PolicyTypeId(item.policyTypeId);
                policyRow.Categories(item.categories);
                policyRow.PolicyStateTypeId(item.PolicyStateTypeId);
                if (item.EffectiveDate) {
                    policyRow.EffectiveDate(bnetflex.ui.utils.date.parse(item.EffectiveDate));
            }
            self.memberModel.PolicyList().push(policyRow);
            
            // Track this as a new policy for Transfer mode validation
            if (item.id && self.newPolicyIds && self.newPolicyIds.indexOf(item.id) === -1) {
                self.newPolicyIds.push(item.id);
                console.log('[pushNewPolicy] Added new policy ID to tracking:', item.id);
                console.log('[pushNewPolicy] Current new policy IDs:', self.newPolicyIds());
            }
            //}
            self.serverValidation();
        };

        self.setNewCategory = function (policyId, categoryId) {
            var policy = self.memberModel.PolicyList().filter(function (p) { return p.PolicyId() == policyId })[0];
            if (!policy) return;

            policy.CategoryId(categoryId);

            var policyWithCategories = self.memberModel.PolicyList().filter(function (p) {
                return p.PolicyId() == policyId && p.Categories && p.Categories() != null
            })[0];

            if (policyWithCategories) {
                var categories = policyWithCategories.Categories();

                if (!policy.Categories) {
                    policy.Categories = ko.observable(categories);
                } else if (typeof policy.Categories === 'function') {
                    policy.Categories(categories);
                }

                var newCategory = categories.filter(function(c) {
                    return (c.CategoryId || c.Id) == categoryId;
                })[0];

                if (newCategory && newCategory.Attributes) {
                    var sumInsuredTypeAttr = newCategory.Attributes.filter(function(attr) {
                        return attr.AttributeId == 13;
                    })[0];

                    var isSalaryBased = sumInsuredTypeAttr &&
                                       (sumInsuredTypeAttr.Value == "1" || sumInsuredTypeAttr.Value == "3");

                    if (isSalaryBased) {
                        self.validateSalaryBasedCategory(policy, newCategory);
                    }
                }
            }

            // Track this as a new policy for Transfer mode validation
            if (policyId && self.newPolicyIds) {
                // Convert to number if it's a string
                var numericPolicyId = typeof policyId === 'string' && !isNaN(policyId) ? parseInt(policyId, 10) : policyId;
                
                if (self.newPolicyIds.indexOf(numericPolicyId) === -1) {
                    self.newPolicyIds.push(numericPolicyId);
                    console.log('[setNewCategory] Added new policy ID to tracking:', numericPolicyId);
                    console.log('[setNewCategory] Current new policy IDs:', self.newPolicyIds());
                }
            }
            
            self.serverValidation();

            //ultra-spike
            var currentSalaryCurrencyId = self.memberModel.SalaryCurrencyId();
            self.memberModel.SalaryCurrencyId("");
            self.memberModel.SalaryCurrencyId(currentSalaryCurrencyId);

            var currentBasicSalary = self.memberModel.BasicSalary();
            self.memberModel.BasicSalary("");
            self.memberModel.BasicSalary(currentBasicSalary);
            self.validateFreeCoverLimit(policyId, categoryId);
        };

        self.validateFreeCoverLimit = function (policyId, categoryId) {
            var policy = self.memberModel.PolicyList().filter(function (p) { return p.PolicyId() == policyId })[0];
            if (!policy || !policy.Categories()) {
                return;
            }
            var cat = ko.utils.arrayFirst(policy.Categories(), function (item) {
                return item.Id == categoryId;
            });
            if (!cat) {
                return;
            }
            var fclAttribute = ko.utils.arrayFirst(cat.Attributes,
                function (att) {
                    return att.AttributeId == EProductAttribute.FreeCoverLimit && att.Value > 0;
                });
            var salMultiplierAttribute = ko.utils.arrayFirst(cat.Attributes,
                function (att) {
                    return att.AttributeId == EProductAttribute.SalaryMultiplier && att.Value > 0;
                });
            if (fclAttribute && salMultiplierAttribute) {
                if (self.memberModel.BasicSalary() * salMultiplierAttribute.Value > fclAttribute.Value) {
                    swal("Warning", "The member you are adding have sum insured above Free cover limit.\n\n" +
                        "Note that premium adjustments will be required for this member.\n\n" +
                        "Are you sure you want to continue and add this member? ");
                }
            }
        };


        self.validateSalaryBasedCategory = function (policy, category) {
            if (policy.HasSalaryBased && typeof policy.HasSalaryBased === 'function') {
                policy.HasSalaryBased(true);
            }

            if (self.memberModel.BasicSalary && self.memberModel.SalaryCurrencyId) {
                if (self.memberModel.BasicSalary.valueHasMutated) {
                    self.memberModel.BasicSalary.valueHasMutated();
                }
                if (self.memberModel.SalaryCurrencyId.valueHasMutated) {
                    self.memberModel.SalaryCurrencyId.valueHasMutated();
                }
            }
        };

       self.removePolicy = function (item) {
           var policy = self.memberModel.PolicyList().filter(function (p) { return p.PolicyId() == item.PolicyId })[0];
           if (policy != undefined) {
               policy.Checked(false);
               policy.DestinationPolicy(false);
               self.serverValidation();
           }
       };

        self.validationObject = ko.validatedObservable({
            memberModel: self.memberModel
        });


        self.validationErrors = ko.computed(function() {
            var errorsArray = [];
            self.validationObject.errors().forEach(function (error) { errorsArray.push(error); });
            self.memberModel.MemberDynamicFields.forEach(function (df) {
                if (df.errorMessage()) {
                    errorsArray.push(df._displayName + " - " + df.errorMessage());
                }
            });
			self.DocumentsValidationMsgs().forEach(function (doc) { return errorsArray.push(doc.ValidationMessage()); });
            return errorsArray;
        });
		
		self.memberFormErrors = ko.computed(function(){
			var errorsArray = [];
            self.validationObject.errors().forEach(function (error) { errorsArray.push(error); });
            self.memberModel.MemberDynamicFields.forEach(function (df) {
                if (df.errorMessage()) {
                    errorsArray.push(df._displayName + " - " + df.errorMessage());
                }
            });
            return errorsArray;
		});
		
		self.memberDocumentsErrors = ko.computed(function(){
			var errorsArray = [];
			self.DocumentsValidationMsgs().forEach(function (doc) { return errorsArray.push(doc.ValidationMessage()); });
            return errorsArray;
		});

        self.preventValidation = false;
    }

    function PolicyGridRowModel() {
        var self = this;

        self.Id = ko.observable(bnetflex.guid());

        self.Name = ko.observable();

        self.Checked = ko.observable();

        self.PolicyId = ko.observable();
        self.PolicyTypeId = ko.observable();
        self.PolicyTypeString = ko.observable();
        self.Categories = ko.observableArray();
        self.CategoryId = ko.observable();
        self.CategoryName = ko.computed(function () {
            if (self.Categories() == null)
                return "";
            var elem = ko.utils.arrayFirst(self.Categories(),
                function(child) {
                    return child.Id === self.CategoryId();
                });

            return elem === undefined ? "" : elem.Name;
        });
        self.EffectiveDate = ko.observable();
        self.EffectiveDateOrigin = ko.computed(function () {
            return (self.EffectiveDate() == undefined || self.EffectiveDate() == null) ? null : dayjs(this.EffectiveDate()).format(settings.dateFormat.toUpperCase());
        }, this);
        self.StartDate = ko.observable();
        self.EndDate = ko.observable();
        self.EnablePolicySelection = ko.observable(true);
        self.EnableCategorySelection = ko.observable(true);
        self.DestinationPolicy = ko.observable(false);
        self.PolicyStateTypeId = ko.observable();

        self.HasSalaryBased = function () {
            if (self.Categories() == null)
                return false;

            var elem = ko.utils.arrayFirst(self.Categories(),
                function (child) {
                    return child.Id == self.CategoryId();
                });

            if (elem === undefined) {
                return false;
            }

            var attr = ko.utils.arrayFirst(elem.Attributes,
                function (child) {
                    return child.AttributeId == EProductAttribute.SumInsuredType && 
                        (child.Value == ESumInsuredType.SalaryBased || child.Value == ESumInsuredType.GrossSalaryBased);;
                });

            return attr !== undefined;
        };
    }

    function MemberModel(model, parent, isEdit, dateFormat, principalModel) {

        var self = this;
        self.isEdit = isEdit;
        self.parent = parent;
        self.dateFormat = dateFormat || 'dd-MM-yyyy';
        self.getSelf = function() {
            return self;
        };

        self.isEmployee = ko.observable(model.ParentMemberId == null ? true : false);
        self.sVal = self.parent().serverValidator;
        self.principalModel = principalModel;
        self.ParentMember = model.ParentMember === null || $.isEmptyObject(model.ParentMember)
            ? {}
            : ko.toJS(new MemberModel(model.ParentMember, self.parent, true, self.dateFormat));
        self.MemberDynamicFields = ko.utils.arrayMap(model.MemberDynamicFields,
            function(item) { return new DynamicFieldModel(item, self.getSelf); });
        self.PolicyListString = ko.observable();
        self.preloadedDynamicData = model.PreloadedDynamicData;

        updateAllCascadeFields(self.MemberDynamicFields, self.parent().loadDataUrl, self.parent().dependableFields, self.preloadedDynamicData);

        self.initPoliciesGrid = function() {

            if (self.PolicyList) {
                self.PolicyList([]);
            } else {
                self.PolicyList = ko.observableArray([]);
            }

            if (window.policies == undefined) {
                return;
            }

            //member add
            ko.utils.arrayForEach(window.policies,
                function(item) {

                    var parentPolicy;
                    if (self.ParentMember.PolicyList) {
                        parentPolicy = ko.utils.arrayFirst(self.ParentMember.PolicyList,
                            function (pp) {
                               if (pp.PolicyId === item.PolicyId) {
                                   item.EffectiveDate = dayjs(pp.EffectiveDate).startOf('day').toDate();
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
                    policyRow.PolicyStateTypeId(item.PolicyStateTypeId);

                    self.PolicyList.push(policyRow);

                    policyRow.Categories(item.Categories);
                    if (parentPolicy) { //if is dependant
                        // policyRow.EnablePolicySelection(false);
                        policyRow.EnableCategorySelection(item.AllowDependantAdditionToDifferentCategory == 0);
                        policyRow.CategoryId(parentPolicy.CategoryId);
                        policyRow.Checked(parentPolicy.Checked);
                        policyRow.StartDate(dayjs(new Date(item.EffectiveDate)).startOf('day').toDate());
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

        function isSalaryBasedPolicyType(typeId) {
            return [EPolicyType.LifeDisability, EPolicyType.CriticalIllness, EPolicyType.PersonalAccident].includes(typeId);
        }

        function onPolicyListChange() {
            self.PolicyListString(
                ko.toJSON(
                    ko.utils.arrayMap(
                        ko.utils.arrayFilter(self.PolicyList(),
                            function (item) {
                                return item.Checked();
                            }),
                        function (item) {
                            return {
                                PolicyId: item.PolicyId(),
                                CategoryId: item.CategoryId(),
                                EffectiveDate: item.EffectiveDate(),
                                Checked: true,
                                PolicyStateTypeId: item.PolicyStateTypeId()
                            }
                        })
                )
            );
            $("#PolicyListString").trigger("change");
        }

        self.updateClientId = function (clientId) {
            self.ClientId(clientId);
            updateCascadeFileds(clientId, null, self.parent().loadDataUrl, null, MemberRegularFieldNames().ClientId, self.MemberDynamicFields, self.parent().dependableFields, self.preloadedDynamicData);
        }


        if (self.isEdit) { //member iedit
            self.PolicyList = ko.observableArray([]);
            ko.utils.arrayForEach(model.PolicyList,
                function(item) {
                    var policyRow = new PolicyGridRowModel();
                    policyRow.PolicyId(item.PolicyId);
                    policyRow.CategoryId(item.CategoryId);
                    policyRow.Checked(item.Checked);
                    policyRow.Categories(item.Categories);
                    policyRow.PolicyTypeId(item.PolicyType);
                    if (item.EffectiveDate) {
                        policyRow.EffectiveDate(bnetflex.ui.utils.date.parse(item.EffectiveDate));
                    }
                    policyRow.PolicyStateTypeId(item.PolicyStateTypeId);
                    self.PolicyList.push(policyRow);
                    onPolicyListChange();
                });
        } else {
            self.initPoliciesGrid();
        }

        self.DocumentList = ko.observableArray([]);

        self.HasSalaryBased = function () {
            var policySalaryBased = ko.utils.arrayFirst(self.PolicyList(),
                function (policy) {
                    return isSalaryBasedPolicyType(policy.PolicyTypeId()) &&
                        policy.HasSalaryBased() &&
                        policy.Checked();
                });
            return policySalaryBased !== undefined;
        }

        // Check if only Personal Accident (4) or Travel (5) policies are selected
        self.hasOnlyExemptPolicies = ko.computed(function() {
            console.log('[hasOnlyExemptPolicies] Computing...');
            console.log('[hasOnlyExemptPolicies] self.parent:', self.parent);
            
            if (!self.PolicyList || !self.PolicyList()) {
                console.log('[hasOnlyExemptPolicies] No PolicyList, returning false');
                return false;
            }
            
            // Get the parent container (MemberViewModelContainer)
            var container = self.parent ? (typeof self.parent === 'function' ? self.parent() : self.parent) : null;
            console.log('[hasOnlyExemptPolicies] Container found:', !!container);
            if (container) {
                console.log('[hasOnlyExemptPolicies] Container.preventValidation:', container.preventValidation);
                console.log('[hasOnlyExemptPolicies] Container.newPolicyIds:', container.newPolicyIds ? container.newPolicyIds() : 'undefined');
                console.log('[hasOnlyExemptPolicies] Container.originalPolicyIds:', container.originalPolicyIds ? container.originalPolicyIds() : 'undefined');
            }
            
            var selectedPolicies = self.PolicyList().filter(function(p) { 
                return p.Checked && p.Checked(); 
            });
            console.log('[hasOnlyExemptPolicies] Total selected policies:', selectedPolicies.length);
            selectedPolicies.forEach(function(p) {
                console.log('[hasOnlyExemptPolicies] Policy:', {
                    PolicyId: p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : null,
                    PolicyTypeId: p.PolicyTypeId ? (typeof p.PolicyTypeId === 'function' ? p.PolicyTypeId() : p.PolicyTypeId) : null,
                    PolicyType: p.PolicyType ? (typeof p.PolicyType === 'function' ? p.PolicyType() : p.PolicyType) : null
                });
            });
            
            // In Transfer mode, only check NEW policies, not original ones
            if (container && container.preventValidation) {
                console.log('[hasOnlyExemptPolicies] Transfer mode detected (preventValidation=true)');
                console.log('[hasOnlyExemptPolicies] newPolicyIds length:', container.newPolicyIds ? container.newPolicyIds().length : 0);
                
                // If we have new policies tracked, filter to only those
                if (container.newPolicyIds && container.newPolicyIds().length > 0) {
                    console.log('[hasOnlyExemptPolicies] Filtering to new policies only');
                    var newSelectedPolicies = selectedPolicies.filter(function(p) {
                        var policyId = p.PolicyId ? (typeof p.PolicyId === 'function' ? p.PolicyId() : p.PolicyId) : null;
                        var isNew = container.newPolicyIds.indexOf(policyId) !== -1;
                        console.log('[hasOnlyExemptPolicies] Policy', policyId, 'is new:', isNew);
                        return isNew;
                    });
                    
                    console.log('[hasOnlyExemptPolicies] New policies selected:', newSelectedPolicies.length);
                    selectedPolicies = newSelectedPolicies;
                }
                
                // If no new policies selected yet, DOB/Gender should be optional
                if (selectedPolicies.length === 0) {
                    console.log('[hasOnlyExemptPolicies] No new policies selected, returning true (exempt)');
                    return true; // Consider as exempt to avoid validation errors
                }
            } else {
                console.log('[hasOnlyExemptPolicies] Not in Transfer mode or container not found');
            }
            
            if (selectedPolicies.length === 0) {
                console.log('[hasOnlyExemptPolicies] No policies selected, returning false');
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


        self.Address = new AddressModel(model.Address, self.getSelf);


        //self.EffectiveDate = ko.observable(convertToDate(model.EffectiveDate));
        self.FirstName = ko.observable(model.FirstName);
        self.MiddleName = ko.observable(model.MiddleName);
        self.LastName = ko.observable(model.LastName);
        self.ChineseName = ko.observable(model.ChineseName);

        self.Email = ko.observable(model.Email);
        self.EmailOld = ko.observable(model.Email);
        self.Department = ko.observable(model.Department);
        self.ParentMemberName = ko.observable(model.ParentMemberName);
        self.MemberId = ko.observable(model.MemberId);
        self.ClientId = ko.observable(model.ClientId);
        updateCascadeFileds(model.ClientId, null, self.parent().loadDataUrl, self.id, MemberRegularFieldNames().ClientId, self.MemberDynamicFields, self.parent().dependableFields, self.preloadedDynamicData);
        self.ClientId.subscribe(function (e) {
            updateCascadeFileds(e, null, self.parent().parent().loadDataUrl, null, MemberRegularFieldNames().ClientId, self.parent().MemberDynamicFields, self.parent().parent().dependableFields, self.parent().preloadedDynamicData);
        });
        self.CategoryId = ko.observable(model.CategoryId);
        self.CategoryString = ko.observable(model.CategoryString);
        self.JobPosition = ko.observable(model.JobPosition);
        self.Name = ko.observable(model.Name);
        
        // Dynamic validation for DOB based on policy types
        function checkDOBRequired(val) {
            // Don't validate if no policies are selected yet (initial state)
            if (!self.PolicyList || self.PolicyList().length === 0) {
                return true; // Skip validation on initial load
            }
            
            var checkedPolicies = self.PolicyList().filter(function(p) { 
                return p.Checked && p.Checked(); 
            });
            
            // If no policies checked, skip validation
            if (checkedPolicies.length === 0) {
                return true;
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
            
            var checkedPolicies = self.PolicyList().filter(function(p) { 
                return p.Checked && p.Checked(); 
            });
            
            // If no policies checked, skip validation
            if (checkedPolicies.length === 0) {
                return true;
            }
            
            // If only exempt policies, Gender is optional
            if (self.hasOnlyExemptPolicies && self.hasOnlyExemptPolicies()) {
                return true; // Valid (not required)
            }
            // Otherwise, Gender is required
            // Use the passed value instead of self.Gender() since Gender might not be created yet
            return val != null && val !== '' && val !== 0;
        }
        self.DOB = ko.observable(convertToDate(model.DOB, dateFormat)).extend({ 
            validation: { 
                validator: function(val) {
                    // Check if DOB is required based on policy types
                    return checkDOBRequired(val);
                },
                message: MemberRequiredFieldsMessages().DOB
            } 
        });
        
        // Clear validation error when DOB gets a value
        self.DOB.subscribe(function(value) {
            if (value && value !== '' && self.DOB.error) {
                self.DOB.error(null);
            }
        });
        self.SalaryCurrencyId = ko.observable(model.SalaryCurrencyId);
        self.ParentMemberId = ko.observable(model.ParentMemberId);
        self.DependantType = ko.observable(model.DependantType);
        self.DependantTypeStr = ko.observable(model.DependantTypeStr);
        self.UserId = ko.observable(model.UserId);
        self.EnrolledDate = ko.observable(convertToDate(model.EnrolledDate, dateFormat));
        self.DeletedDate = ko.observable(convertToDate(model.DeletedDate, dateFormat));
        //public string CertificateNumber = ko.observable();
        if (jQuery.isEmptyObject(self.ParentMember) || self.isEdit) {
            self.EmployeeNumber = ko.observable(model.EmployeeNumber);
        } else {
            self.EmployeeNumber = ko.observable(self.ParentMember.EmployeeNumber);
        }

        self.NationalIDNumber = ko.observable(model.NationalIDNumber);
        self.PolicyName = ko.observable();
        self.CategoryDuplicate = ko.observable();
        self.PassportNumber = ko.observable(model.PassportNumber);
        self.PassportExpiryDate = ko.observable(convertToDate(model.PassportExpiryDate, dateFormat));
        self.Gender = ko.observable(model.Gender).extend({ 
            validation: { 
                validator: function(val) {
                    // Check if Gender is required based on policy types
                    return checkGenderRequired(val);
                },
                message: MemberRequiredFieldsMessages().Gender
            } 
        });
        
        // Clear validation error when Gender gets a value
        self.Gender.subscribe(function(value) {
            if (value && value !== '' && value !== 0 && self.Gender.error) {
                self.Gender.error(null);
            }
        });
        self.MaritalStatus = ko.observable(model.MaritalStatus);
        self.NationalityId = ko.observable(model.NationalityId);
        self.AddressId = ko.observable(model.AddressId);
        self.EmploymentDate = ko.observable(convertToDate(model.EmploymentDate, dateFormat));
        self.TerminationDate = ko.observable(convertToDate(model.TerminationDate, dateFormat));
        self.BasicSalaryVisible = ko.observable(true);
        self.BasicSalary = ko.observable(model.BasicSalary);
        self.AnnualSalary = ko.observable(model.AnnualSalary);
        self.IsArchived = ko.observable(model.IsArchived);
        //self.IsVip = ko.observable(model.IsVip);
        self.CostCenter = ko.observable(model.CostCenter);
        self.JobGrade = ko.observable(model.JobGrade);
        self.Status = ko.observable(model.Status);
        self.Comments = ko.observable(model.Comments);

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
        self.Name.subscribe(self.parent().serverValidation);
        self.DOB.subscribe(self.parent().serverValidation);

        //self.DOB.subscribe(function (n) {
        //    if (n && Object.prototype.toString.call(n) === '[object Date]') {
        //        self.DOB(kendo.toString(n, self.dateFormat));
        //    }
        //});
       
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
        self.PassportExpiryDate.subscribe(self.parent().serverValidation);
        self.Gender.subscribe(self.parent().serverValidation);
        self.MaritalStatus.subscribe(self.parent().serverValidation);
        self.NationalityId.subscribe(self.parent().serverValidation);
        self.AddressId.subscribe(self.parent().serverValidation);
        self.EmploymentDate.subscribe(self.parent().serverValidation);
        self.BasicSalary.subscribe(self.parent().serverValidation);
        self.AnnualSalary.subscribe(self.parent().serverValidation);
        self.IsArchived.subscribe(self.parent().serverValidation);
        //self.IsVip.subscribe(self.parent().serverValidation);
        self.CostCenter.subscribe(self.parent().serverValidation);
        self.JobGrade.subscribe(self.parent().serverValidation);
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

        self.NationalIDNumber.subscribe(self.parent().DuplicatesGrid.getDuplicatesData);

        //self.errors = ko.validation.group(self);

        self.FirstName.extend({ memberNameSpecialCharactersValidation: {} });
        self.MiddleName.extend({ memberNameSpecialCharactersValidation: {} });
        self.LastName.extend({ memberNameSpecialCharactersValidation: {} });

       

        self.getDynamicFieldForSection = function (section) {
            var result = [];
            ko.utils.arrayForEach(self.MemberDynamicFields, function (item) {
                if (item.section == section)
                    result.push(item);
            });
            return result;
        }

        // Update field validations when policies change
        self.updateFieldValidations = function() {
            // Don't force re-validation - let it happen on submit
        }

        self.Duplicates = ko.observableArray();
        self.IsLikeToProceed = ko.observable(false);

        function checkSalaryBasedValidation(val) {
            return !parent().isSalaryAvailible ||
                (self.DependantType == undefined || self.DependantType() != EDependantType.Employee || !self.HasSalaryBased() || (self.HasSalaryBased() && val != undefined && val != null && val != ""));
            return response;
        }

        // Remove duplicate - these are now defined earlier after HasSalaryBased
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

        self.validationObject = ko.validatedObservable({
            MemberDynamicFields: self.MemberDynamicFields,
            FirstName: self.FirstName.extend({ required: { params: true, message: MemberRequiredFieldsMessages().FirstName } }),
            LastName: self.LastName.extend({ required: { params: true, message: MemberRequiredFieldsMessages().LastName } }),
            Email: self.Email.extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: { name: MemberRegularFieldNames().Email, field: self.Email, oldVal: self.EmailOld } } }).extend({ email: true }).extend({ serverValidateEmailOfMember: { data: { memberId: self.MemberId(), clientId: self.ClientId() } } }),
            //Email: self.Email.extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().Email } }).extend({ email: true }).extend({ serverValidateEmailOfMember: { data: { memberId: self.MemberId() } } }),
            DOB: self.DOB.extend({
                    serverValidateAgeOfMember: {
                        dependantType: self.DependantType(), policyList: self.PolicyList(), model: self
                    } }),
            DependantType: self.DependantType.extend({ required: { params: true, message: MemberRequiredFieldsMessages().DependantType } }),
            EmployeeNumber: self.EmployeeNumber.extend({
                serverValidateEmployeeNumber: {
                    data: { clientId: self.ClientId(), memberId: self.MemberId(), dependantType: self.DependantType(), parentMemberId: self.ParentMember.MemberId == undefined ? null : self.ParentMember.MemberId },
                    prevent: function () {
                        return self.parent().DuplicatesGrid.isVisible() && self.parent().DuplicatesGrid.IsLikeToProceed();
                    }
                }
            }),
            NationalIDNumber: self.NationalIDNumber.extend({ required: { params: true, message: MemberRequiredFieldsMessages().NationalIDNumber } }),
            PassportNumber: self.PassportNumber.extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: { name: MemberRegularFieldNames().PassportNumber, field: self.PassportNumber } } }),
            //PassportNumber: self.PassportNumber.extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().PassportNumber } }),
            Gender: self.Gender,
            MaritalStatus: self.MaritalStatus.extend({ required: { params: true, message: MemberRequiredFieldsMessages().MaritalStatus } }),
            NationalityId: self.NationalityId.extend({ required: { params: true, message: MemberRequiredFieldsMessages().NationalityId } }),

            BasicSalary: self.BasicSalary.extend({ validation: { validator: checkSalaryBasedValidation, message: MemberRequiredFieldsMessages().BasicSalary } }),
            SalaryCurrencyId: self.SalaryCurrencyId.extend({ validation: { validator: checkSalaryBasedValidation, message: MemberRequiredFieldsMessages().SalaryCurrencyId } }),
            JobPosition: self.JobPosition.extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: { name: MemberRegularFieldNames().JobPosition, field: self.JobPosition } } })
        });
    }

    function DynamicFieldModel(model, parent) {

        var self = this;

        self.isRequired = ko.observable(model.IsRequired);

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


        self.visible = ko.observable(self.value() ? true : model.IsVisible);
        self.optionLabel = model.OptionLabel;
        if (self.type === EDynamicFieldTypes().Select && !model.OptionLabel) {
            self.optionLabel = 'Please select...';
        }

        self.enabled = ko.observable(model.IsEnabled);
        self.selectModel = new SelectModel(model.AvailableList, model.MemberDynamicFieldValues);

        //self.changeVisibility = function () {
        //    if (self.visible() === true) {
        //        self.visible(false);
        //    } else {
        //        self.visible(true);
        //    }
        //}
        self._displayName = model.DisplayName;
        self.displayName = ko.computed(function () {
            return self._displayName + (self.isRequired() ? " (*)" : "");
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
                self.parent().MemberDynamicFields.forEach(function (e) { if (e.type === EDynamicFieldTypes().Select) e.enabled(false); });
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
        };


        self.validationObject = ko.validatedObservable({
            value: self.value.extend({
                required: {
                    onlyIf: function () { return self.isRequired() && self.visible() },
                    message: model.ErrorMessage || "The " + self._displayName + " field is required"
                }
            })
        });

        self.hasError = ko.observable(false);
        self.errorMessage = ko.observable('');
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
        self.MobilePhone = ko.observable(model.MobilePhone).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: { name: MemberRegularFieldNames().MobilePhone, field: self.MobilePhone} } });
        //self.MobilePhone = ko.observable(model.MobilePhone).extend({ validation: { validator: self.sVal.val, message: self.sVal.msg, params: MemberRegularFieldNames().MobilePhone } });
        self.AddressText = ko.observable(model.AddressText);
        self.POBox = ko.observable(model.POBox);
        self.Area = ko.observable(model.Area);
        self.AreaOther = ko.observable(model.AreaOther);
        self.Fax = ko.observable(model.Fax);

        self.validationObject = ko.validatedObservable({
            CountryId: self.CountryId.extend({ required: { params: true, message: MemberRequiredFieldsMessages().CountryId } }),
        });

        //subsribe
        self.AddressId.subscribe(self.parent().parent().serverValidation);
        self.CityId.subscribe(self.parent().parent().serverValidation);
        self.City.subscribe(self.parent().parent().serverValidation);
        self.CityOther.subscribe(self.parent().parent().serverValidation);
        self.CountryId.subscribe(self.parent().parent().serverValidation);
        self.CountryId.subscribe(function (e) {
            updateCascadeFileds(e, null, self.parent().parent().loadDataUrl, null, MemberRegularFieldNames().CountryId, self.parent().MemberDynamicFields, self.parent().parent().dependableFields, self.parent().preloadedDynamicData);
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

        self.IsLikeToProceed.subscribe(function () {
            if (ko.validation.utils.isValidatable(parent.memberModel.EmployeeNumber))
                ko.validation.validateObservable(parent.memberModel.EmployeeNumber);
        });

        var getDuplicatesDataFunction = function () {
            //console.log(memberModel);
            //var result = false;
            //var data = parent.GetMemberModel();
            console.log('getDuplicatesData');

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
                function (dyn) {
                    return dyn.FieldId == dynamicFieldId && dyn.Value == e && dyn.RegularFieldName == regularFieldName;
                });
            if (dynamicField) {
                processDynamicField(dynamicField, dynamicFileds);
                return;
            }

        }
        var isDependable = ko.utils.arrayFirst(dependableFields, function (item) {
            return (dynamicFieldId !== null && dynamicFieldId === item.DependsFromDynamicFieldId)
                || (regularFieldName !== null && regularFieldName === item.DependsFromRegularFieldName);
        });
        if (!isDependable) {
            return;
        } 
        console.log('updateCascadeFileds');

        $.ajax({
            url: url,
            type: "POST",
            data: ko.toJSON({ value: e, fieldId: dynamicFieldId, regularFieldName: regularFieldName }),
            dataType: "json",
            contentType: 'application/json; charset=utf-8',
            async: true,
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
            }
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

    function findDestinationPolicies(policyList) {
        if (policyList.filter(function (policy) {
            return policy.DestinationPolicy;
        }).length == 0) {
            return false;
        }
        else {
            return true;
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
        // var date = new Date(parseInt(str.replace("/Date(", "").replace(")/", ""), 10)).toISOString();
        return date;
    }
    isLoaded = true;

    return {

        model: function (params) {

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
           
            function validateAgeOfMember(val, parms, callback) {
                var data = {
                    dob: convertToDate(val, params.dateFormat),
                    policyList: JSON.stringify(parms.policyList.map(function (p) {
                        return {
                            CategoryId: p.CategoryId(),
                            PolicyId: p.PolicyId(),
                            EffectiveDate: convertToDate(p.EffectiveDate(), params.dateFormat)
                        };
                    })),
                    dependantType: parms.dependantType
                };

                if (params.validateFreeCoverLimitMaximumAgeUrl) {
                    var freeCoverLimitMaximumAgeValidation = {
                        url: params.validateFreeCoverLimitMaximumAgeUrl,
                        type: 'POST',
                        data: data,
                        async: true,
                        success: function (data) {
                            parms.model.hasFreeCoverLimitValidationFinished = true;

                            if (!data.isValid) {
                                parms.model.freeCoverLimitMaxAgeValidationFailed = true;
                            } else {
                                parms.model.freeCoverLimitMaxAgeValidationFailed = false;
                            }
                            parms.model.checkWarningsReady();
                        }
                    };
                    console.log("VALD FCLMA");
                    $.ajax(freeCoverLimitMaximumAgeValidation);

                    
                }
                
                if (params.validateAgeOfMemberUrl) {
                    var overAgeValidation = {
                        url: params.validateAgeOfMemberUrl,
                        type: 'POST',
                        data: data,
                        async: true,
                        success: function (data) {
                            parms.model.hasOverAgeValidationFinished = true;
                            if (data.isOverAge) {
                                parms.model.overAgeValidationFailed = true;
                            } else {
                                parms.model.overAgeValidationFailed = false;
                            }
                            parms.message = data.message;
                            parms.model.checkWarningsReady();
                            callback(data.isValid);
                        }
                    };
                    console.log("validateAgeOfMembe ");
                    $.ajax(overAgeValidation);

                }
            }

            ko.validation.rules['serverValidateEmployeeNumber'] = {
                async: true,
                validator: function (val, parms, callback) {

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
                    console.log('serverValidateEmployeeNumber');
                    $.ajax(options);
                },
                message: function (params) {
                    return params.message;
                }
            };

            ko.validation.rules['serverValidateAgeOfMember'] = {
                async: true,
                validator: validateAgeOfMember,
                message: function (params) {
                    return params.message;
                }
            };

            ko.validation.rules['serverValidateEmailOfMember'] = {
                async: true,
                validator: function (val, parms, callback) {

                    parms.data.email = val;
                    
                    var defaults = {
                        url: params.validateEmailOfMemberUrl,
                        type: 'POST',
                        async: true,
                        success: function (data) {
                            console.log(parms.data.memberId + " emailValidation result: " + data.isValid);
                            parms.message = data.message;
                            callback(data.isValid);
                        }
                    };

                    var options = $.extend(defaults, parms);
                    console.log('serverValidateEmailOfMember');

                    $.ajax(options);
                },
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


