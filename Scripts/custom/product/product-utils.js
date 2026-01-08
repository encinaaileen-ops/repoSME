var ProductAttributeMinimumAge = 2;
var ProductAttributeMaximumAge = 3;
var ProductAttributeJobGrade = 33;
var ProductAttributeRenewalMaximumAge = 40;

var ProductAction = {
    Edit: 1,
    Add: 2
};

if (!Array.prototype.removeAttribute) {
    Array.prototype.removeAttributeByMetadata = function (vals) {
        var i, removedItems = [];
        if (!Array.isArray(vals)) vals = [vals];
        for (var j = 0; j < vals.length; j++) {
            for (i = this.length; i--;) {
                if (this[i].templateAttributeId === vals[j].templateAttributeId) removedItems.push(this.splice(i, 1));
            }
        }
        return removedItems;
    };
}

function AddAttributesBasedOnMetadata(postBundleModel, addedProductsModel, productAction) {
    ko.utils.arrayForEach(postBundleModel.Products, function (product) {
        if (product.Attributes.length > 0) {
            for (var i = product.Attributes.length; i--;) {
                if (product.Attributes[i] === undefined
                    || product.Attributes[i].AttributeId === ProductAttributeMinimumAge
                    || product.Attributes[i].AttributeId === ProductAttributeMaximumAge
                    || product.Attributes[i].AttributeId === ProductAttributeJobGrade
                    || product.Attributes[i].AttributeId === ProductAttributeRenewalMaximumAge)
                    product.Attributes.splice(i, 1);
            }
        }
        if (product.SubRiders.length > 0) {
            for (var j = 0; j < product.SubRiders.length; j++) {
                for (var k = product.SubRiders[j].Attributes.length; k--;) {
                    if (product.SubRiders[j].Attributes[k] === undefined
                        || product.SubRiders[j].Attributes[k].AttributeId === ProductAttributeMinimumAge
                        || product.SubRiders[j].Attributes[k].AttributeId === ProductAttributeMaximumAge
                        || product.SubRiders[j].Attributes[k].AttributeId === ProductAttributeJobGrade)
                        product.SubRiders[j].Attributes.splice(k, 1);
                }
            }
        }
    });

    ko.utils.arrayForEach(addedProductsModel, function (product, productIndex) {
        ko.utils.arrayForEach(product.attributes(), function (attribute, attributeIndex) {
            if (attribute.metadata.length > 0) {
                ko.utils.arrayForEach(attribute.metadata, function (metadata, metadataIndex) {
                    if (metadata.attributeValue === undefined) {
                        return;
                    }
                    var newAttribute = {
                        AttributeId: metadata.productAttributeId,
                        Id: metadata.templateAttributeId,
                        CurrencyId: null,
                        TemplateAttributeId: productAction === ProductAction.Edit ? metadata.editTemplateId : metadata.templateAttributeId,
                        Value: metadata.attributeValue(),
                        Metadata: []
                    };
                    var newMetaData = {
                        MetadataType: metadata.metadataType,
                        MetadataValue: metadata.metadataValue
                    };
                    newAttribute.Metadata.push(newMetaData);

                    postBundleModel.Products[productIndex].Attributes.push(newAttribute);
                });
            }
        });


        ko.utils.arrayForEach(product.productRiders(), function (rider, riderIndex) {
            ko.utils.arrayForEach(rider.attributes(), function (attribute, attributeIndex) {
                if (attribute.metadata.length > 0) {
                    ko.utils.arrayForEach(attribute.metadata, function (metadata, metadataIndex) {
                        var newAttribute = {
                            AttributeId: metadata.productAttributeId,
                            Id: metadata.templateAttributeId,
                            CurrencyId: null,
                            TemplateAttributeId: productAction === ProductAction.Edit ? metadata.editTemplateId : metadata.templateAttributeId,
                            Value: metadata.attributeValue(),
                            Metadata: []
                        };
                        var newMetaData = {
                            MetadataType: metadata.metadataType,
                            MetadataValue: metadata.metadataValue
                        };
                        newAttribute.Metadata.push(newMetaData);

                        postBundleModel.Products[productIndex].SubRiders[riderIndex].Attributes.push(newAttribute);
                    });
                }
            });
        });

    });
}

function AddAttributesBasedOnMetadataForPlan(postModel, addedModel) {
    ko.utils.arrayForEach(postModel.PolicyCategoryPlanes, function (policyCategoryPlan, policyCategoryPlanIndex) {
        ko.utils.arrayForEach(policyCategoryPlan.Plans, function (plan, planIndex) {
            var bundles = Enumerable.From(Enumerable.From(addedModel.policies()).FirstOrDefault(null, "$.policy === '" + plan.Policy + "'").bundles()).FirstOrDefault(null, "$.id === " + plan.BundleId).products()
            AddAttributesBasedOnMetadata(plan, bundles, ProductAction.Add);
        });
    });
}

