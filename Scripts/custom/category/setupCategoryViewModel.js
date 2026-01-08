var EPolicyType =
{
    Medical: 1,
    LifeDisability: 2,
    CriticalIlness : 3
};



function formInvalid(formName) {
    var form = $(formName);
    updateValidation(formName, true);
    return !form.valid();
}

function productFormInvalid(formName) {
    var form = $(formName);
    updateProductFormValidation(formName, true);

    var validator = form.validate();
    var isValid = form.valid();      

    if (!isValid) {
        console.log('Errors:', validator.errorList);
        swal({
            title: 'Form Invalid',
            text: 'Cannot proceed due to incomplete field',
            icon: 'error',
            confirmButtonColor: "#1ab394",
            confirmButtonText: 'OK',
            type: "error"
        });
    }
    return !isValid;
}

function AddCategoryPageViewModel(options, bundles, urls, strings) {
    var self = this;
    self.strings = strings;
    self.urls = urls;
    self.isEditable = ko.observable(options.isEditeble);
    self.policyId = options.policyId;
    self.carrierId = options.carrierId;
    self.policyCategory = options.policyCategory;
    self.clientId = options.clientId;
    self.PolicyStateId = options.policyStateId;

    self.categoryDetailsViewModel = new CategoryDetailsViewModel(self);
    self.setupProductsViewModel = new SetupProductsViewModel(self);
    self.products = ko.observableArray();
    self.productsSelectionInvalid = ko.observable(false);
    self.selectedProductsCount = function () { return self.setupProductsViewModel.bundlesTitle().length; }

    if (options.policyType != EPolicyType.LifeDisability && options.policyType != EPolicyType.Medical) {
        ko.utils.arrayMap(bundles, function (item) {
            self.setupProductsViewModel.loadBundleData(item.Id, item.Name);
        });
    } else {
        ko.utils.arrayMap(bundles, function (item) {
            self.products.push(new SelectProductViewModel(item.Id, item.Name, self));
        });
    }


    //wizard =>
    self.wizard = $('#add-bundle-wizzard').wizard();
    self.wizardNext = function () {
        self.wizard.wizard('next');
    };
    self.selectedWizardStep = ko.observable();

    self.wizardButtonText = ko.observable(strings.next);

    self.onWizardNext = function () {
        self.selectedWizardStep(self.wizard.wizard('selectedItem').step);

        switch (self.selectedWizardStep()) {
            case 1:
                showProgressBar();
                $.when.apply($, window.ajaxRequests).then(function () {
                    const validIds = self.setupProductsViewModel.bundlesTitle().map(b => b.id);
                    const seen = new Set();

                    self.setupProductsViewModel.bundlesData.remove(function (item) {
                        const isInvalid = !validIds.includes(item.id);
                        const isDuplicate = seen.has(item.id);
                        seen.add(item.id);
                        return isInvalid || isDuplicate;
                    });
                    self.setupProductsViewModel.bundlesData.sort((a, b) => a.id - b.id);
                    self.setupProductsViewModel.bundlesTitle(self.setupProductsViewModel.bundlesData().map(function (db) {
                        return { id: db.id, name: db.name() };
                    }));
                    self.setupProductsViewModel.bundlesTitle.sort((a, b) => a.id - b.id);
                    closeProgressBar();
                    $("#category-form-step").css({ 'pointer-events': 'none' });
                    if (self.categoryDetailsViewModel.mainWizardNext(self.wizardNext)) {
                        self.setupProductsViewModel.intWizard();
                    }
                });
                break;
            case 2:
                self.setupProductsViewModel.bundlesWizardNext();
                break;
            default:
                self.wizardNext();
        }
    }
    //wizard <=

    self.onFinish = function () {
        bnetflex.ui.progressbar.show();
        var model = collectData(self);
        $.post(urls.saveData, model, function (result) {

            if (AgeBendsError === result) {
                failedValidationAgeBandsPopup(result);
                bnetflex.ui.progressbar.hide();
            } else {
                var url = urls.categoryDetails + result;
                window.location = url;
            }
        }).fail(function (e) {
            bnetflex.ui.progressbar.hide();

            if (AgeBendsError === e.responseJSON) {

                failedValidationAgeBandsPopup(e.responseJSON);
            }
            else {
                $("#add-bundle-wizzard").hide();
                $("#errorMessage").show();
            }

        }).always(function (e) {
            console.log(e);
        });
    };
}

const AgeBendsError = 'Cannot save category as there are missing age bands';

function failedValidationAgeBandsPopup(result) {
    swal({
        html: true,
        title: 'Warning',
        text: result,
        //showCancelButton: true,
        confirmButtonColor: "#1ab394",
        confirmButtonText: 'OK',
        type: "warning",
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
    });
}

function CategoryDetailsViewModel(parent) {
    var self = this;
    self.name = ko.observable();
    self.description = ko.observable();
    self.policyId = ko.observable();
    self.medicalNetworkId = ko.observable();

    self.mainWizardNext = function (mainNext) {

        var isValid = true;

        if (formInvalid("#category_form")) {
            isValid = false;
        }
        if (parent.selectedProductsCount() <= 0) {
            parent.productsSelectionInvalid(true);
            isValid = false;
        }
        if (isValid) {
            mainNext();
        }

        return isValid;
    }
}

function SetupProductsViewModel(parent) {
    var self = this;
    self.parent = parent;
    self.product = ko.observable();
    self.bundlesTitle = ko.observableArray();
    self.bundlesData = ko.observableArray();

    self.loadedBundlesData = [];
    window.ajaxRequests = [];

    self.loadBundleData = function (bundleId, name) {
        self.bundlesTitle.push({ id: bundleId, name: name });
        var loadedBundle = ko.utils.arrayFirst(self.loadedBundlesData, function (item) {
            return item.id == bundleId;
        });
        if (loadedBundle) {
            self.bundlesData.push(loadedBundle);
        } else {
            var request = $.ajax({
                url: parent.urls.getBundle + '?bundleId=' + bundleId,
                type: "GET",
                success: function(data) {
                    var vm = new ProductsViewModel(data, true, "", self.bundlesData);
                    self.product(vm);
                    self.bundlesData.push(vm);
                    self.loadedBundlesData.push(vm);
                },
                cache: false
            });
            window.ajaxRequests.push(request);
        }
    }

    self.removeBundle = function (id) {
        self.bundlesTitle.remove(function (item) { return item.id === id; });
        self.bundlesData.remove(function (item) { return item.id === id; });
    }

    self.intWizard = function () {

        if (self.bundlesTitle().length <= 1) {
            self.parent.wizardButtonText(parent.strings.finish);
        }

        $('.nav-tabs a[href="#tab-' + 1 + '"' + ']').tab('show');

        self.wizard = $('#add-category-wizard').wizard();

        self.wizard.on('finished.fu.wizard', function () {
            self.parent.onFinish();
        });

        self.wizard.on('stepclicked.fu.wizard', function (event, data) {
            self.parent.wizardButtonText(parent.strings.next);
            $('.nav-tabs a[href="#tab-' + data.step + '"' + ']').tab('show');
        });

        self.wizard.wizard('selectedItem', {
            step: 1
        });
    }

    self.bundlesWizardNext = function () {
        var current = self.wizard.wizard('selectedItem');

        if (productFormInvalid("#product-form-" + current.stepname)) {
            return;
        }
        $('.nav-tabs a[href="#tab-' + (current.step + 1) + '"' + ']').tab('show');
        self.wizard.wizard('next');
        if ((current.step + 1) == self.bundlesTitle().length) {
            self.parent.wizardButtonText(parent.strings.finish);
        }
    }
}


function SelectProductViewModel(id, name, parent) {
    var self = this;
    self.id = ko.observable(id);
    self.name = ko.observable(name);
    self.isSelected = ko.observable(false);
    self.isSelected.subscribe(function (value) {
        if (value) {
            parent.productsSelectionInvalid(false);
            parent.setupProductsViewModel.loadBundleData(self.id(), self.name());
        } else {
            parent.setupProductsViewModel.removeBundle(self.id());
            if (parent.selectedProductsCount() <= 0) {
                parent.productsSelectionInvalid(true);
            }
        }
    });
}


function collectData(self) {
    return {
        Category: {
            Name: self.categoryDetailsViewModel.name(),
            Description: self.categoryDetailsViewModel.description(),
            MedicalNetworkId: self.categoryDetailsViewModel.medicalNetworkId(),
            ClientId: self.clientId
        },
        PolicyCategory: self.policyCategory,
        PolicyCategoryPlanes: [
            {
                PolicyCategory: self.policyCategory == null ? {
                    Policy: {
                        CarrierId: self.carrierId,
                        PolicyId: self.policyId
                    },
                    Category: {
                        Name: self.categoryDetailsViewModel.name(),
                        Description: self.categoryDetailsViewModel.description()
                    }
                } :
                self.policyCategory,
                Plans: ko.utils.arrayMap(self.setupProductsViewModel.bundlesData(), function (bundle) {
                    var model = {
                        BundleId: bundle.id,
                        Products: ko.utils.arrayMap(bundle.products(), function (product) {
                            return {
                                ScopeOfCover: product.scopeOfCover(),
                                GeographicalLimits: product.geographicalLimits(),
                                EmployeesInsured: product.employeesInsured(),
                                UnderwirtingNotes: product.underwirtingNotes(),
                                ProductId: product.productId,
                                Attributes: ko.utils.arrayMap(product.attributes(), function (attribute) {
                                    if (attribute.metadata.length === 0) {
                                        return {
                                            AttributeId: attribute.id,
                                            Value: attribute.value(),
                                            CurrencyId: attribute.currencyId(),
                                            TemplateAttributeId: attribute.templateAttributeId
                                        };
                                    }
                                }),
                                SubRiders: ko.utils.arrayMap(product.productRiders(), function (productRider) {
                                    return {
                                        ProductId: productRider.productId,
                                        DocumentList: [],
                                        Attributes: ko.utils.arrayMap(productRider.attributes(), function (attribute) {
                                            return {
                                                AttributeId: attribute.id,
                                                Value: attribute.value(),
                                                CurrencyId: attribute.currencyId(),
                                                TemplateAttributeId: attribute.templateAttributeId
                                            };
                                        })
                                    }
                                })
                            }
                        }),
                        DocumentList: ko.utils.arrayMap(bundle.documentsUploadViewModel.documents(), function (doc) {
                            console.log(doc);
                            return {
                                Path: doc.bloblPath,
                                FileName: doc.name,
                                Type: doc.typeId(),
                                Roles: typeof doc.rolesIds() === 'string' ? doc.rolesIds().split(',') : doc.rolesIds()
                            }
                        }),
                        ProductsPricing: bundle.pricingViewModel.collectPricingData(),
                        PremiumRates: bundle.pricingViewModel.getPremiumRates(),
                        OptionalCoverRates: bundle.pricingViewModel.getOptionalCoversRates(),
                        HeadcountsStart: bundle.pricingViewModel.getHeadcountsStart(),
                        HeadcountsEnd: bundle.pricingViewModel.getHeadcountsEnd(),
                        PersonnelCoverage: bundle.pricingViewModel.getPersonnelCoverage()
                    };

                    AddAttributesBasedOnMetadata(model, bundle.products(), ProductAction.Add);

                    return model;
                })
            }
        ]
    }
}