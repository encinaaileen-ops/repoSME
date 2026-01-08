var ProductAttributeTableJobGrade = 11;
var ProductAttributeTableDependantType = 7;
var ProductAttributeMinimumAge = 2;
var ProductAttributeMaximumAge = 3;
var ProductAttributeRenewalMaximumAge = 40;
var ProductAttributeJobGrade = 33;
var ProductAttributeMetadataDependantType = 1;
var ProductAttributeMetadataJobGrade = 2;
var DependantTypeEmployee = 1;
var DependantTypeSpouse = 2;
var DependantTypeChild = 3;
//var DependantTypeParent = 4;

function ProductViewModel(model, subRiders, isEditMode) {
    var self = this;

    self.id = model.Id;
    self.name = model.Name;
    self.productId = model.ProductId;
    self.productType = model.ProductType;
    self.dependantTypeList = model.DependantTypeList
    self.scopeOfCover = ko.observable(model.ScopeOfCover);
    self.geographicalLimits = ko.observable(model.GeographicalLimits);
    self.employeesInsured = ko.observable(model.EmployeesInsured);
    self.underwirtingNotes = ko.observable(model.UnderwirtingNotes);
    self.attributes = ko.observableArray();
    self.productRiders = ko.observableArray();
    //self.productRidersDisplayName = (ko.utils.arrayMap(self.productRiders(), function (item) { return item.name; })).join(',');

    ko.utils.arrayForEach(model.Attributes, function (item, index) {
        self.attributes.push(new AttributeViewModel(item, self.productId, model.Attributes, self, subRiders, isEditMode));
        if (model.Attributes.length == (index + 1)) {
            configAttributeEditiors(model.Attributes, self.attributes());
            addResolveMetadataForDependantTypeAttributes(self.attributes());
            addResolveMetadataForJobGradeAttributes(self.attributes());
        }
    });

    ko.utils.arrayForEach(model.SubRiders, function (item, index) {
        self.productRiders.push(new ProductViewModel(item, subRiders, isEditMode));
        if (model.SubRiders.length == (index + 1)) {
            var allAttributes = Enumerable.From(self.productRiders()).SelectMany(function (product) { return product.attributes() }).ToArray().concat(self.attributes());

            Enumerable.From(allAttributes).ForEach(function (attribute) {
                attribute.initExtendedEditor(allAttributes);
            });
        }
    });

    self.productRidersDisplayName = (ko.utils.arrayMap(self.productRiders(), function (item) { return item.name; })).join(', ');
}

function AttributeViewModel(model, productId, attributes, parent, riders, isEditMode) {
    var self = this;

    var type = ((model.Type == 4 || model.Type == 9) && !isEditMode) ? 2 : model.Type;
    self.model = model;

    self.productId = productId;
    self.code = model.Code;
    self.template = "EProductAttributeType_" + type + '_template';
    self.controlId = model.AttributeId + '_' + productId + '_' + generateUidNotMoreThan1Million();
    self.id = model.AttributeId;
    self.name = model.Name;
    self.currencyId = ko.observable(model.CurrencyId);
    self.value = ko.observable();
    self.templateAttributeId = model.TemplateAttributeId;
    self.visible = ko.observable(true);
    self.disabled = ko.observable(false);
    self.type = type;
    self.editorViewModel = {};
    self.metadata = model.Metadata;
    self.editTemplateId = model.EditTemplateId;
    self.isMedicalProduct = parent.productType === 1;
    if (model.AttributeId == 2) {
        self.isMinimum = true;
    }
    else {
        self.isMinimum = false;
    }
    self.validate = ko.computed(function () {
        return this.visible() ? 'true' : 'false';
    }, this);

    self.initExtendedEditor = function (allAttributess) {
        switch (self.type) {
            case 4: case 9: case 10:
                {
                    self.editorViewModel.allAttributess = allAttributess;
                } break;
        }
    }

    function generateUidNotMoreThan1Million() {
        return ("00000" + (Math.random() * Math.pow(36, 5) << 0).toString(36)).slice(-5);
    }

    //custom logic by type
    if (isEditMode) {
        switch (self.type) {
            case 4: case 9:
                {
                    self.editorViewModel = new MaximumTotalSumAssuredViewModel(productId, riders, self.controlId, self, self.type);
                } break;
            case 10:
                {
                    self.editorViewModel = new DependantTypeMultiSelectViewModel(productId, riders, self.controlId, self, self.type, parent);
                } break;
        }
    }

    //cutom logic by id
    switch (self.id) {
        case 14:
            {
                if (ko.utils.arrayFirst(attributes, function (item) { return item.AttributeId == 13; }) != undefined) {
                    self.visible(false);
                }
            } break;
        case 15:
            {
                if (ko.utils.arrayFirst(attributes, function (item) { return item.AttributeId == 13; }) != undefined) {
                    self.visible(false);
                }
            } break;
        case 13:
            {
                self.value.subscribe(function (value) {
                    switch (parseInt(value)) {
                        case 3:
                        case 1:
                            {
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 14; }).visible(true);
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 15; }).visible(false);
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 15; }).value(null);
                            } break;
                        case 2:
                            {
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 14; }).visible(false);
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 15; }).visible(true);
                                ko.utils.arrayFirst(parent.attributes(), function (item) { return item.id == 14; }).value(null);
                            } break;
                    }
                });
            } break;
    }
}

function DependantTypeMultiSelectViewModel(currentProductId, riders, controlId, parent, type, product) {
    var self = this;
    self.type = type;
    self.currentProductId = currentProductId;
    //init kendo multiselect control
    setTimeout(function () {
        self.productsMultiSelect = $('#multiselect_' + controlId).kendoMultiSelect().data("kendoMultiSelect");
    }, 200);
    self.selectedTypes = ko.observableArray();
    self.selectedTypes.subscribe(function (valueArr) {
        for (var i = 0; i < valueArr.length; i++) {
            if (self.selectedTypes().indexOf(valueArr[i]) == -1) {
                ko.utils.arrayForEach(self.selectedTypes(),
                    function(type) {
                        product.attributes.push(new AttributeViewModel());
                    });
            }
        }
        
    });


    self.dependantTypes = ko.observableArray(ko.utils.arrayMap(product.dependantTypeList, function (type) { return type; }));
}


function MaximumTotalSumAssuredViewModel(currentProductId, riders, controlId, parent, type) {
    var self = this;
    self.type = type;
    self.currentProductId = currentProductId;
    self.products = ko.observableArray(ko.utils.arrayFilter(riders, function (item) { return item.ProductId != currentProductId && ko.utils.arrayFilter(item.Attributes, function (attr) { return attr.Type == self.type }).length > 0 }));
    self.selectedProducts = ko.observableArray();
    self.allAttributess = [];
    self.isParent = ko.computed(function () { return self.selectedProducts().length > 0 && self.isDependant == false });
    self.isDependant = false;
    self.parentProductId = currentProductId;

    //init kendo multiselect control
    setTimeout(function () {
        self.productsMultiSelect = $('#multiselect_' + controlId).kendoMultiSelect().data("kendoMultiSelect");
    }, 200);

    self.setDepended = function (value) {
        if (self.productsMultiSelect) {
            self.isDependant = true;
            self.productsMultiSelect.value(value);
            self.parentProductId = value;
            parent.visible(false);
        }
    }

    self.clearDepending = function () {
        if (self.productsMultiSelect) {
            self.isDependant = false;
            self.productsMultiSelect.value([]);
            parent.visible(true);
            self.parentProductId = currentProductId;
        }
    };

    parent.currencyId.subscribe(function (value) {
        if (!self.isDependant) {
            self.setForOtherProducts(parent.value(), value);
        }
    });

    parent.value.subscribe(function (value) {
        if (!self.isDependant) {
            self.setForOtherProducts(value, parent.currencyId());
        }
    });

    self.setForOtherProducts = function (amountValue, amountCurrency) {
        //selecting all attributes exept current product attributes
        //and attributes with type 4 (Maximum Total Sum Assured)
        ko.utils.arrayForEach(ko.utils.arrayFilter(self.allAttributess, function (x) { return x.productId != currentProductId && x.type == self.type; }), function (attribute) {
            //cheking if attribute is binded to current one
            if (self.selectedProducts().indexOf(attribute.productId.toString()) != -1) {
                attribute.editorViewModel.setDepended([currentProductId]);
                attribute.value(amountValue);
                attribute.currencyId(amountCurrency);

                ko.utils.arrayForEach(ko.utils.arrayFilter(self.allAttributess, function (x) { return x.type == self.type }), function (x) {
                    if (!x.editorViewModel.isDependant && !x.editorViewModel.isParent()) {
                        if (x.editorViewModel.currentProductId == attribute.productId) {
                            console.log('skipped rem');
                            return;
                        }
                        var data = x.editorViewModel.productsMultiSelect.dataSource.data();
                        var itemBinded = Enumerable.From(data).FirstOrDefault(null, function (el) { return el.value == attribute.productId });
                        if (itemBinded) {
                            x.editorViewModel.productsMultiSelect.dataSource.remove(itemBinded);
                        }
                        var itemParent = Enumerable.From(data).FirstOrDefault(null, function (el) { return el.value == currentProductId });
                        if (itemParent) {
                            x.editorViewModel.productsMultiSelect.dataSource.remove(itemParent);
                        }

                        //if () {

                        //}

                    }
                });
            }
            else if (attribute.editorViewModel.parentProductId == currentProductId) {
                attribute.editorViewModel.clearDepending();
                attribute.value('');
                attribute.currencyId(attribute.model.CurrencyId);

                ko.utils.arrayForEach(ko.utils.arrayFilter(self.allAttributess, function (x) { return x.type == self.type }), function (x) {
                    if (!x.editorViewModel.isDependant) {
                        var data = x.editorViewModel.productsMultiSelect.dataSource.data();
                        if (x.editorViewModel.currentProductId == attribute.productId || x.editorViewModel.currentProductId == currentProductId) {
                            console.log('skipped add');
                            return;
                        }

                        var itemUnbided = Enumerable.From(riders).FirstOrDefault(null, function (el) { return el.ProductId == attribute.productId });
                        if (itemUnbided) {
                            if (Enumerable.From(data).FirstOrDefault(null, function (el) { return el.value == attribute.productId }) == null) {
                                x.editorViewModel.productsMultiSelect.dataSource.add({ text: itemUnbided.Name, value: itemUnbided.ProductId });
                            }
                        }

                        var itemParent = Enumerable.From(riders).FirstOrDefault(null, function (el) { return el.ProductId == currentProductId });
                        if (itemParent) {
                            if (Enumerable.From(data).FirstOrDefault(null, function (el) { return el.value == currentProductId }) == null) {
                                x.editorViewModel.productsMultiSelect.dataSource.add({ text: itemParent.Name, value: itemParent.ProductId });
                            }
                        }
                    }
                });
            }


            //if (self.selectedProducts().length != 0) {
            //    //attribute.editorViewModel.productsMultiSelect.dataSource.data(
            //    //    );                      
            //    console.log(ko.utils.arrayFilter(riders, function (item) {
            //        return item.ProductId != attribute.editorViewModel.currentProductId &&
            //            self.selectedProducts().indexOf(item.ProductId.toString()) == -1;
            //    }));
            //}
            ////console.log(attribute.editorViewModel.products())

        });
    }
    self.selectedProducts.subscribe(function (e) {
        if (!self.isDependant) {
            self.setForOtherProducts(parent.value(), parent.currencyId());
        }
    });
}

function ProductAttributeMetadataViewModel(attribute, metadataType, metadataValue, metadataName) {
    var self = this;

    self.productAttributeId = attribute.id;
    self.metadataType = metadataType;
    self.metadataValue = metadataValue;
    self.metadataName = typeof metadataName !== "undefined" ? metadataName : "";
    self.templateAttributeId = attribute.templateAttributeId;

    self.editTemplateId = attribute.editTemplateId;
    self.attributeValue = ko.observable(attribute.value());
    self.controlId = attribute.code + '_' + attribute.controlId + '_' + metadataValue;

    if (attribute.id == 2) {
        self.isMinimum = true;
    }
    else {
        self.isMinimum = false;
    }
}

function configAttributeEditiors(attributeData, attributeEditors) {
    ko.utils.arrayForEach(attributeData, function (item) {
        ko.utils.arrayFirst(attributeEditors, function (attr) {
            return attr.templateAttributeId == item.TemplateAttributeId;
            //            return attr.id == item.AttributeId;
        }).value(item.Type == 5 ? JSON.parse(item.Value) : item.Value);
    });
}

function addResolveMetadataForDependantTypeAttributes(attributes) {
    var minMetadatas = [];
    var maxMetadatas = [];
    var renewalMetadas = [];

    ko.utils.arrayForEach(attributes, function (attribute, attributeIndex) {
        if (attribute.type === ProductAttributeTableDependantType) {
            var employeeMetadata = new ProductAttributeMetadataViewModel(attribute, ProductAttributeMetadataDependantType, DependantTypeEmployee);
            var spouseMetadata = new ProductAttributeMetadataViewModel(attribute, ProductAttributeMetadataDependantType, DependantTypeSpouse);
            var childMetadata = new ProductAttributeMetadataViewModel(attribute, ProductAttributeMetadataDependantType, DependantTypeChild);
            //var parentMetadata = new ProductAttributeMetadataViewModel(attribute, ProductAttributeMetadataDependantType, DependantTypeParent);

            if (attribute.metadata.length === 0) {
                if (attribute.id === ProductAttributeMinimumAge) {
                    //min age
                    attribute.metadata.push(employeeMetadata);
                    attribute.metadata.push(spouseMetadata);
                    attribute.metadata.push(childMetadata);
                    //attribute.metadata.push(parentMetadata);
                }

                if (attribute.id === ProductAttributeMaximumAge) {
                    //max age
                    attribute.metadata.push(employeeMetadata);
                    attribute.metadata.push(spouseMetadata);
                    attribute.metadata.push(childMetadata);
                    //attribute.metadata.push(parentMetadata);
                }

                if (attribute.id === ProductAttributeRenewalMaximumAge) {
                    //max age
                    attribute.metadata.push(employeeMetadata);
                    attribute.metadata.push(spouseMetadata);
                    attribute.metadata.push(childMetadata);
                    //attribute.metadata.push(parentMetadata);
                }
            } else {
                if (attribute.id === ProductAttributeMinimumAge) {
                    ko.utils.arrayForEach(attribute.metadata, function (meta, metaIndex) {
                        var minMetadata = new ProductAttributeMetadataViewModel(attribute, meta.MetadataType, meta.MetadataValue);
                        minMetadatas.push(minMetadata);
                    });
                }

                if (attribute.id === ProductAttributeMaximumAge) {
                    ko.utils.arrayForEach(attribute.metadata, function (meta, metaIndex) {
                        var maxMetadata = new ProductAttributeMetadataViewModel(attribute, meta.MetadataType, meta.MetadataValue);
                        maxMetadatas.push(maxMetadata);
                    });
                }

                if (attribute.id === ProductAttributeRenewalMaximumAge) {
                    ko.utils.arrayForEach(attribute.metadata, function (meta, metaIndex) {
                        var renewalMaximumMetadata = new ProductAttributeMetadataViewModel(attribute, meta.MetadataType, meta.MetadataValue);
                        renewalMetadas.push(renewalMaximumMetadata);
                    });
                }
            }
        }
    });
    resolveMetadataAttribute(attributes, renewalMetadas, ProductAttributeTableDependantType, ProductAttributeRenewalMaximumAge);
    resolveMetadataAttribute(attributes, maxMetadatas, ProductAttributeTableDependantType, ProductAttributeMaximumAge);
    resolveMetadataAttribute(attributes, minMetadatas, ProductAttributeTableDependantType, ProductAttributeMinimumAge);
}

function addResolveMetadataForJobGradeAttributes(attributes) {
    var metadatas = [];
    var productAttributeMetadataViewModelList = [];

    ko.utils.arrayForEach(attributes, function (attribute, attributeIndex) {
        if (attribute.type === ProductAttributeTableJobGrade) {
            attribute.metadata.forEach(function (mData) {
                productAttributeMetadataViewModelList.push(new ProductAttributeMetadataViewModel(attribute, mData.MetadataType, mData.MetadataValue, mData.MetadataName));
            });

            if (attribute.metadata.length === 0 && productAttributeMetadataViewModelList.length > 0) {
                productAttributeMetadataViewModelList.forEach(function(mData) {
                    attribute.metadata.push(mData);
                });
            } else {
                ko.utils.arrayForEach(attribute.metadata, function(meta, metaIndex) {
                    var metadata = new ProductAttributeMetadataViewModel(attribute, meta.MetadataType, meta.MetadataValue, meta.MetadataName);
                    metadatas.push(metadata);
                });
            }
        }
    });
    resolveMetadataAttribute(attributes, metadatas, ProductAttributeTableJobGrade, ProductAttributeJobGrade);
}

function resolveMetadataAttribute(attributes, metadatas, attributeType, attributeId) {
    if (metadatas.length > 0) {
        var firstAttribute = ko.utils.arrayFirst(attributes, function (attribute) {
            return attribute.type === attributeType && attribute.id === attributeId;
        });
        attributes.removeAttributeByMetadata(metadatas);

        firstAttribute.metadata = metadatas;
        attributes.unshift(firstAttribute);
    }
}