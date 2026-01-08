var isEditMode = false;
var idCounter = 0;
function ProductsViewModel(data, editMode, carrierName, bundlesData) {
    var self = this;
    isEditMode = editMode;

    self.guid = idCounter++;
    self.id = data.BundleId;
    self.name = ko.observable(data.Name);
    self.carrierName = ko.observable(carrierName);
    self.carrierId = ko.observable(data.CarrierId);
    self.policyId = null;
    self.policy = null;
    self.isEditable = ko.observable(editMode);
    self.products = ko.observableArray();
    self.documentsUploadViewModel = new DocumentsUploadViewModel(editMode);

    var pricingData = data.hasOwnProperty('BundlePricing') ? data.BundlePricing : data.ProductsPricing;
    pricingData.showOptionalCovers = data.IsOptionalCoversEnabled;
    var premiumRatesData = data.hasOwnProperty('BundlePricing') ? data.BundleAnnualPremiumRates : data.PremiumRates;
    pricingData.OptionalCoverRates = data.OptionalCoverRates;
    var headcountsStartData = data.HeadcountsStart;
    var headcountsEndData = data.HeadcountsEnd;
    var personnelCoverage = data.PersonnelCoverage;
    pricingData.OptionalCoverRates = data.OptionalCoverRates;
    self.pricingViewModel = new PricingViewModel(pricingData, premiumRatesData, getMaxAge(data.Products), bundlesData, headcountsStartData, headcountsEndData, personnelCoverage, self.products());

    self.collectData = function (callback) {
        updateValidation("#form-" + self.id);
        updateValidation("#form-" + self.id);
        var isPlan = data.hasOwnProperty('PlanId');
        if ($("#form-" + self.id).valid()) {
            var collectedData = {
                BundleId: editMode ? data.BundleId : null,
                PlanId: (editMode && isPlan) ? data.PlanId : null,
                PolicyCategoryId: isPlan ? data.PolicyCategoryId : null,
                Name: data.Name,
                DocumentList: ko.utils.arrayMap(self.documentsUploadViewModel.documents(), function (doc) {
                    return {
                        DocumentId: doc.id,
                        Path: doc.bloblPath,
                        FileName: doc.name,
                        Type: doc.typeId(),
                        Roles: typeof doc.rolesIds() === 'string' ? doc.rolesIds().split(',') : doc.rolesIds()
                    }
                }),
                Products: ko.utils.arrayMap(self.products(), function (product) {
                    return {
                        ScopeOfCover: product.scopeOfCover(),
                        GeographicalLimits: product.geographicalLimits(),
                        EmployeesInsured: product.employeesInsured(),
                        UnderwirtingNotes: product.underwirtingNotes(),
                        ProductId: product.productId,
                        Name: product.name,
                        Attributes: ko.utils.arrayMap(product.attributes(), function (attribute) {
                            return {
                                AttributeId: attribute.id,
                                Id: attribute.templateAttributeId,
                                Value: attribute.value(),
                                CurrencyId: attribute.currencyId(),
                                TemplateAttributeId: attribute.editTemplateId
                            };
                        }),
                        SubRiders: ko.utils.arrayMap(product.productRiders(), function (productRider) {
                            return {
                                ProductId: productRider.productId,
                                DocumentList: [],
                                Attributes: ko.utils.arrayMap(productRider.attributes(), function (attribute) {
                                    return {
                                        AttributeId: attribute.id,
                                        Id: attribute.templateAttributeId,
                                        Value: attribute.value(),
                                        CurrencyId: attribute.currencyId(),
                                        TemplateAttributeId: attribute.editTemplateId
                                    };
                                })
                            }
                        }),

                    };
                }),
                ProductsPricing: isPlan ? self.pricingViewModel.collectPricingData() : null,
                BundlePricing: isPlan ? null : self.pricingViewModel.collectPricingData(),
                PremiumRates: isPlan ? self.pricingViewModel.getPremiumRates() : null,
                HeadcountsStart: isPlan ? self.pricingViewModel.getHeadcountsStart() : null,
                HeadcountsEnd: isPlan ? self.pricingViewModel.getHeadcountsEnd() : null,
                PersonnelCoverage: isPlan ? self.pricingViewModel.getPersonnelCoverage() : null,
                OptionalCoverRates: isPlan ? self.pricingViewModel.getOptionalCoversRates() : [],
                BundleAnnualPremiumRates: isPlan ? null : self.pricingViewModel.getPremiumRates()
            };

            AddAttributesBasedOnMetadata(collectedData, self.products(), ProductAction.Edit);
            if (callback) {
                callback(collectedData);
            }
            return collectedData;
        }
        return null;
    }

    ko.utils.arrayForEach(data.Products, function (product) {
        if (product) {
            self.products.push(new ProductViewModel(product, product.SubRiders, isEditMode));
        }

        self.pricingViewModel.updateProducts(self.products());
    });

    ko.utils.arrayForEach(data.DocumentList, function (document) {
        if (document) {
            self.documentsUploadViewModel.addDocument(document);
        }
    });
}


function BundleViewModel(data, editMode) {
    var self = this;
    isEditMode = editMode;
    self.id = data.BundleId;
    self.bundleName = ko.observable(data.Name);
    self.bundleCode = ko.observable(data.Code);
    self.description = ko.observable(data.Description);
    self.carrierId = data.CarrierId;
    self.editType = ko.observable();
    self.copyToCarrierId = ko.observable();
    self.isEditBundle = ko.observable(true);

    self.editType.subscribe(function (value) {
        switch (parseInt(value)) {
            case 1:
                self.isEditBundle(true);
                break;
            case 2:
                self.isEditBundle(false);
                break;
        }
    });
}

function getMaxAge(products) {
    var maxAge = 0;
    ko.utils.arrayForEach(products,
        function(product) {
            ko.utils.arrayForEach(product.Attributes,
                function (attribute) {
                    var age = parseInt(attribute.Value);
                    if (attribute.AttributeId === 3 && attribute.Type === 7 && age > maxAge) {
                        maxAge = age;
                    }
                });
        });
    return maxAge;
}