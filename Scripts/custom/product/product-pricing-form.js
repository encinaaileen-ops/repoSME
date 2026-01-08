const PRICING_MODEL_IDS = [1, 2, 9, 4, 7, 8, 5, 11, 17, 14, 15];
const SALARY_PRICING_MODEL_IDS = [15, 21, 17, 14, 22, 23, 24];

function PricingViewModel(model, premiumRates, maxAge, bundlesData, headcountsStart, headcountsEnd, personnelCoverage, products) {
    var self = this;

    self.form = $('#pricing_form');
    self.mainWizardNext = function (mainNext) {
        $.when(updateValidation('#pricing_form')).done(function () {
            updateValidation('#pricing_form');
            if (self.form.valid()) {
                var pricingModelInt = parseInt(self.pricingModel());
                switch (pricingModelInt) {
                    case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25: case 26: case 27:
                        {
                            if (self.dataModel.ageBands().length <= 0) {
                                return;
                            }
                        }
                }

                mainNext();
            }
        });
    };

    switch (model.PricingModel) {
        case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25:
            {
                if (maxAge <= 50) {
                    maxAge = 50;
                }
            }
    }

    self.categoryClassification = ko.observable();
    self.pricingModel = ko.observable();
    self.showHeadcountFields = ko.observable(false);
    self.prorataModel = ko.observable();
    self.baseCurrency = ko.observable(globalConstants.defaultCurrency);
    self.isBaseCurrencyVisible = model.IsBaseCurrencyVisible;
    self.renumerationStructure = ko.observable();
    self.commision = ko.observable();
    self.feeCurrency = ko.observable(globalConstants.defaultCurrency);
    self.feeAmount = ko.observable();
    self.dataModel = new FieldsViewModel(1);
    self.dataModelHeadcountStart = new FieldsViewModel(1, false, true);
    self.dataModelHeadcountEnd = new FieldsViewModel(1, false, true);
    self.dataModelPersonnelCoverage = new FieldsViewModel(1, false);
    self.editorTemplate = ko.observable({ data: self.dataModel, name: self.dataModel.template });
    self.editorTemplateHeadcountStart = ko.observable({ data: self.dataModelHeadcountStart, name: self.dataModelHeadcountStart.template });
    self.editorTemplateHeadcountEnd = ko.observable({ data: self.dataModelHeadcountEnd, name: self.dataModelHeadcountEnd.template });
    self.policyType = ko.observable();
    self.showPersonnelCoverage = ko.observable(false);
    self.editorTemplatePersonnelCoverage = ko.observable({ data: self.dataModelPersonnelCoverage, name: self.dataModelPersonnelCoverage.template });
    self.showOptionalCovers = model.showOptionalCovers;
    self.optionalCoversList = ko.observableArray();
    self.maxAge = ko.observable(maxAge);
    self.bundlesData = bundlesData;
    self.planOptionalCoverType = ko.observable();
    self.optionalCoverDataModel = new FieldsViewModel(1);
    self.products = ko.observableArray(products);

    self.setOptionalCoverageRates = function (rates) {
        ko.utils.arrayForEach(self.optionalCoversList(), function (optionalCover) {
            let premiumRates = rates.filter(function (item) {
                return optionalCover.id == item.OptionalCoverType;
            });
            if (premiumRates)
                self.setOptionalCover(optionalCover, premiumRates, getRndInteger(100, 999));
        });
    }

    self.setOptionalCover = function (optionalCover, premiumRates, id) {
        switch (optionalCover.type) {
            case 100: case 101: case 106:
                {
                    ko.utils.arrayForEach(premiumRates, function (premiumRate) {
                        var first = ko.utils.arrayFirst(optionalCover.data.ageBands(), function (item) {
                            return (premiumRate.AgeLowerBand == item.ageLowerBand() && premiumRate.AgeUpperBand == item.ageUpperBand());
                        });
                        if (first) {
                            var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                return item.type == premiumRate.RateType;
                            });
                            if (optionalCover.type == optionalZoneRateType) {
                                valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                    return item.name == premiumRate.ZoneName;
                                });
                            }
                            if (valueByType) {
                                valueByType.value(premiumRate.Rate);
                            }
                        } else {
                            var newBand = new AgeBandRateItemViewModel(getAttributes(optionalCover.type), id, premiumRate);
                            optionalCover.data.ageBands.push(newBand);
                            var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                return item.type == premiumRate.RateType;
                            });
                            if (optionalCover.type == optionalZoneRateType) {
                                valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                    return item.name == premiumRate.ZoneName;
                                });
                            }
                            if (valueByType) {
                                valueByType.value(premiumRate.Rate);
                            }
                        }
                    });
                } break;
            case 105:
                {
                    let coPayRate = premiumRates[0];
                    if (!coPayRate) {
                        break;
                    }
                    optionalCover.data.coPayType(coPayRate.RateType)
                    if (coPayRate.RateType == 1) {
                        optionalCover.data.percentage(coPayRate.Rate)
                    }
                    else if (coPayRate.RateType == 2) {
                        optionalCover.data.amount(coPayRate.Rate)
                    }
                    break;
                }
            case 107:
                {
                    let materintyType = premiumRates;
                    materintyType.forEach(function (item) {
                        if (item.RateType == 1) {
                            optionalCover.data.maternityAmount(item.Rate);
                        }
                        else if (item.RateType == 2) {
                            optionalCover.data.maternityLimit(item.Rate);
                        }
                    });
                    break;
                }
            case 110:
                {
                    ko.utils.arrayForEach(premiumRates, function (premiumRate) {
                        var first = ko.utils.arrayFirst(optionalCover.data.ageBands(), function (item) {
                            return (premiumRate.AgeLowerBand == item.ageLowerBand() && premiumRate.AgeUpperBand == item.ageUpperBand());
                        });
                        if (first) {
                            var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                return item.type == premiumRate.RateType;
                            });

                            if (valueByType) {
                                valueByType.value(premiumRate.Rate);
                            }
                        } else {
                            var newBand = new AgeBandRateItemViewModel(getAttributes(optionalCover.type), id, premiumRate);
                            optionalCover.data.ageBands.push(newBand);
                            var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                return item.type == premiumRate.RateType;
                            });

                            if (valueByType) {
                                valueByType.value(premiumRate.Rate);
                            }
                        }
                    });
                    //ko.utils.arrayForEach(premiumRates, function (premiumRate) {
                    //    var first = ko.utils.arrayFirst(self.dataModel.ageBands(), function (item) {
                    //        return (premiumRate.AgeLowerBand == item.ageLowerBand() && premiumRate.AgeUpperBand == item.ageUpperBand());
                    //    });
                    //    if (first) {
                    //        var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                    //            return item.type == premiumRate.PremiumRateTypes[0];
                    //        });
                    //        if (valueByType) {
                    //            valueByType.value(premiumRate.Rate);
                    //        }
                    //    } else {
                    //        var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt), ageBandId, premiumRate);
                    //        self.dataModel.ageBands.push(newBand);
                    //        var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                    //            return item.type == premiumRate.PremiumRateTypes[0];
                    //        });
                    //        if (valueByType) {
                    //            valueByType.value(premiumRate.Rate);
                    //        }
                    //    }
                    //});
                    break;
                }
            default:
                {
                    ko.utils.arrayForEach(optionalCover.data.values(), function (item) {
                        var model = ko.utils.arrayFirst(premiumRates, function (rate) {
                            return rate.PremiumRateTypes[0] == item.type;
                        });
                        if (model) {
                            item.value(model.Rate);
                        }
                    });
                }
                break;
        }
    }

    self.setPremiumRates = function () {
        if (premiumRates) {
            //TODO: Implement this
            var pricingModelInt = parseInt(self.pricingModel());
            var ageBandId = getRndInteger(100, 999);
            if (model.PricingModel != pricingModelInt)
                return;
            switch (pricingModelInt) {
                case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25: case 27:
                    {
                        ko.utils.arrayForEach(premiumRates, function (premiumRate) {
                            var first = ko.utils.arrayFirst(self.dataModel.ageBands(), function (item) {
                                return (premiumRate.AgeLowerBand == item.ageLowerBand() && premiumRate.AgeUpperBand == item.ageUpperBand());
                            });
                            if (first) {
                                var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                    return item.type == premiumRate.PremiumRateTypes[0];
                                });
                                if (premiumRate.PremiumRateTypes[0] == zoneRateType) {
                                    valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.name == premiumRate.ZoneName;
                                    });
                                }
                                if (valueByType) {
                                    valueByType.value(premiumRate.Rate);
                                }
                            } else {
                                var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt), ageBandId, premiumRate);
                                self.dataModel.ageBands.push(newBand);
                                var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                    return item.type == premiumRate.PremiumRateTypes[0];
                                });
                                if (premiumRate.PremiumRateTypes[0] == zoneRateType) {
                                    valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.name == premiumRate.ZoneName;
                                    });
                                }
                                if (valueByType) {
                                    valueByType.value(premiumRate.Rate);
                                }
                            }
                        });

                        if (PRICING_MODEL_IDS.includes(pricingModelInt)) {
                            ko.utils.arrayForEach(headcountsStart, function (headcount) {
                                var first = ko.utils.arrayFirst(self.dataModelHeadcountStart.ageBands(), function (item) {
                                    return (headcount.AgeLowerBand == item.ageLowerBand() && headcount.AgeUpperBand == item.ageUpperBand());
                                });
                                if (first) {
                                    var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                } else {
                                    var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt, true), ageBandId, headcount);
                                    self.dataModelHeadcountStart.ageBands.push(newBand);
                                    var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                }
                            });

                            ko.utils.arrayForEach(headcountsEnd, function (headcount) {
                                var first = ko.utils.arrayFirst(self.dataModelHeadcountEnd.ageBands(), function (item) {
                                    return (headcount.AgeLowerBand == item.ageLowerBand() && headcount.AgeUpperBand == item.ageUpperBand());
                                });
                                if (first) {
                                    var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                } else {
                                    var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt, true), ageBandId, headcount);
                                    self.dataModelHeadcountEnd.ageBands.push(newBand);
                                    var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                }
                            });
                        }
                    } break;
                case 26:
                    {
                        ko.utils.arrayForEach(premiumRates, function (premiumRate) {
                            var first = ko.utils.arrayFirst(self.dataModel.ageRates(), function (item) {
                                return (premiumRate.AgeLowerBand == item.ageLowerBand() && premiumRate.AgeUpperBand == item.ageUpperBand());
                            });
                            if (first) {
                                var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                    return item.type == premiumRate.PremiumRateTypes[0];
                                });
                                if (premiumRate.PremiumRateTypes[0] == zoneRateType) {
                                    valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.name == premiumRate.ZoneName;
                                    });
                                }
                                if (valueByType) {
                                    valueByType.value(premiumRate.Rate);
                                }
                            } else {
                                var newBand = new AgeRatedZonesViewModel(getAttributes(pricingModelInt), ageBandId, premiumRate);
                                self.dataModel.ageRates.push(newBand);
                                var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                    return item.type == premiumRate.PremiumRateTypes[0];
                                });
                                if (premiumRate.PremiumRateTypes[0] == zoneRateType) {
                                    valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.name == premiumRate.ZoneName;
                                    });
                                }
                                if (valueByType) {
                                    valueByType.value(premiumRate.Rate);
                                }
                            }
                        });

                        if (PRICING_MODEL_IDS.includes(pricingModelInt)) {
                            ko.utils.arrayForEach(headcountsStart, function (headcount) {
                                var first = ko.utils.arrayFirst(self.dataModelHeadcountStart.ageBands(), function (item) {
                                    return (headcount.AgeLowerBand == item.ageLowerBand() && headcount.AgeUpperBand == item.ageUpperBand());
                                });
                                if (first) {
                                    var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                } else {
                                    var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt, true), ageBandId, headcount);
                                    self.dataModelHeadcountStart.ageBands.push(newBand);
                                    var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                }
                            });

                            ko.utils.arrayForEach(headcountsEnd, function (headcount) {
                                var first = ko.utils.arrayFirst(self.dataModelHeadcountEnd.ageBands(), function (item) {
                                    return (headcount.AgeLowerBand == item.ageLowerBand() && headcount.AgeUpperBand == item.ageUpperBand());
                                });
                                if (first) {
                                    var valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(first.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                } else {
                                    var newBand = new AgeBandRateItemViewModel(getAttributes(pricingModelInt, true), ageBandId, headcount);
                                    self.dataModelHeadcountEnd.ageBands.push(newBand);
                                    var valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                        return item.type == headcount.PremiumRateTypes[0];
                                    });
                                    if (headcount.PremiumRateTypes[0] == zoneRateType) {
                                        valueByType = ko.utils.arrayFirst(newBand.values(), function (item) {
                                            return item.name == headcount.ZoneName;
                                        });
                                    }
                                    if (valueByType) {
                                        valueByType.value(headcount.Rate);
                                    }
                                }
                            });
                        }

                    } break;
                case 21:
                case 24:
                case 6:
                    {
                        var index = 0;
                        ko.utils.arrayForEach(self.dataModel.rates(), function (item) {
                            if (premiumRates[index]) {
                                item.rate(premiumRates[index].Rate);
                                index++;
                            }
                        });
                    } break;
                case 13:
                    {
                        var index = 0;
                        ko.utils.arrayForEach(self.dataModel.rates(), function (item) {
                            ko.utils.arrayForEach(item.values(), function (value) {
                                value.value(premiumRates[index].Rate);
                                index++;
                            });
                        });
                    } break;
                //case 18:
                //    {
                //        ko.utils.arrayForEach(self.dataModel.values(), function (item, index) {
                //            var model = ko.utils.arrayFirst(premiumRates, function (rate) {
                //                return rate.PremiumRateValues != null && rate.PremiumRateTypes[0] == item.type && rate.PremiumRateValues != null && rate.PremiumRateValues[0] == item.valueProp;
                //            });
                //            if (model) {
                //                item.value(model.Rate);
                //            }
                //        });
                //    }
                //        break;
                default:
                    {
                        ko.utils.arrayForEach(self.dataModel.values(), function (item) {
                            var model = ko.utils.arrayFirst(premiumRates, function (rate) {
                                return rate.PremiumRateTypes[0] == item.type;
                            });
                            if (model) {
                                item.value(model.Rate);
                            }
                        });

                        if (self.dataModelHeadcountStart && self.dataModelHeadcountStart.values && headcountsStart) {
                            ko.utils.arrayForEach(self.dataModelHeadcountStart.values(), function (item) {
                                var model = ko.utils.arrayFirst(headcountsStart, function (rate) {
                                    return rate.PremiumRateTypes[0] == item.type;
                                });
                                if (model) {
                                    item.value(model.Rate);
                                }
                            });
                        }

                        if (self.dataModelHeadcountEnd && self.dataModelHeadcountEnd.values && headcountsEnd) {
                            ko.utils.arrayForEach(self.dataModelHeadcountEnd.values(), function (item) {
                                var model = ko.utils.arrayFirst(headcountsEnd, function (rate) {
                                    return rate.PremiumRateTypes[0] == item.type;
                                });
                                if (model) {
                                    item.value(model.Rate);
                                }
                            });
                        }

                        if (
                            self.dataModelPersonnelCoverage &&
                            self.dataModelPersonnelCoverage.values &&
                            personnelCoverage &&
                            self.products() &&
                            self.products().length !== 0 &&
                            ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13)?.value() === '1'
                        ) {
                            ko.utils.arrayForEach(self.dataModelPersonnelCoverage.values(), function (item) {
                                var model = ko.utils.arrayFirst(personnelCoverage, function (rate) {
                                    return rate.PremiumRateTypes[0] == item.type;
                                });
                                if (model) {
                                    item.value(model.Rate);
                                }
                            });
                        }
                    }
                    break;
            }

            if (
                self.products() &&
                self.products().length !== 0
            ) {
                const attribute = ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13);
                if (attribute && attribute.value && attribute.value() === '1') {
                    ko.utils.arrayForEach(personnelCoverage, function (coverage) {
                        self.dataModelPersonnelCoverage.personnelCoverages.push(new PersonnelCoverageItemViewModel(coverage));
                    });
                }
            }
        }
    }
    setTimeout(kendooex.ui.init, 1000);

    self.updateProducts = function (products) {
        if (products.length !== 0) {
            const attribute = ko.utils.arrayFirst(products[0].attributes(), a => a.id === 13);
            if (attribute && attribute.value) {
                attribute.value.subscribe(function (val) {
                    openPersonnelCoverage(parseInt(self.categoryClassification()) === 2 && val === '1');
                    if (val === '2') {
                        var pricingModel = parseInt(self.pricingModel())
                        if (PRICING_MODEL_IDS.includes(pricingModel) && parseInt(self.categoryClassification()) === 2) {
                            self.showHeadcountFields(true);
                        }
                    }
                });
                openPersonnelCoverage(parseInt(self.categoryClassification()) === 2 && attribute.value() === '1');
                if (attribute.value() === '2') {
                    var pricingModel = parseInt(self.pricingModel())
                    if (PRICING_MODEL_IDS.includes(pricingModel) && parseInt(self.categoryClassification()) === 2) {
                        self.showHeadcountFields(true);
                    }
                }
            }
        }
    };

    self.categoryClassification.subscribe(function (newValue) {
        var pricingModel = parseInt(self.pricingModel())
        if (parseInt(newValue) == 2 && PRICING_MODEL_IDS.includes(pricingModel)) {
            self.showHeadcountFields(true);
            switch (pricingModel) {
                case 14: case 15:
                    if (self.dataModelHeadcountStart.template != self.dataModel.template) {
                        self.dataModelHeadcountStart = new PerMilAgeBandsRateViewModel(pricingModel, true, true);
                        self.dataModelHeadcountEnd = new PerMilAgeBandsRateViewModel(pricingModel, false, true);
                        self.dataModel.relatedModels = { dataModelHeadcountStart: self.dataModelHeadcountStart, dataModelHeadcountEnd: self.dataModelHeadcountEnd };

                        InitializeHeadcountModels(self.dataModel, self.dataModelHeadcountStart, self.dataModelHeadcountEnd);
                    }
                    break;
                case 5:
                case 11:
                    self.dataModelHeadcountStart = new AgeBandsRateViewModel(pricingModel, undefined, true, true);
                    self.dataModelHeadcountEnd = new AgeBandsRateViewModel(pricingModel, undefined, false, true);
                    self.dataModel.relatedModels = { dataModelHeadcountStart: self.dataModelHeadcountStart, dataModelHeadcountEnd: self.dataModelHeadcountEnd };

                    InitializeHeadcountModels(self.dataModel, self.dataModelHeadcountStart, self.dataModelHeadcountEnd);

                    break;
                default:
                    self.dataModelHeadcountStart.template = self.dataModel.template;
                    self.editorTemplateHeadcountStart().name = self.dataModelHeadcountStart.template;
                    self.editorTemplateHeadcountStart().data = self.dataModelHeadcountStart;
            }
            self.editorTemplateHeadcountStart().name = self.dataModelHeadcountStart.template;
            self.editorTemplateHeadcountStart().data = self.dataModelHeadcountStart;
            self.editorTemplateHeadcountEnd().name = self.dataModelHeadcountEnd.template;
            self.editorTemplateHeadcountEnd().data = self.dataModelHeadcountEnd;
            self.editorTemplateHeadcountStart.valueHasMutated();
            self.editorTemplateHeadcountEnd.valueHasMutated();
            setTimeout(kendooex.ui.init, 10);
        }
        else {
            if (self.pricingModel()) {
                self.dataModelHeadcountStart = new FieldsViewModel(parseInt(self.pricingModel()), false, true);
                self.dataModelHeadcountEnd = new FieldsViewModel(parseInt(self.pricingModel()), false, true);
            } else {
                self.dataModelHeadcountStart = new FieldsViewModel(1, false, true);
                self.dataModelHeadcountEnd = new FieldsViewModel(1, false, true);
            }
            self.editorTemplateHeadcountStart().name = self.dataModelHeadcountStart.template;
            self.editorTemplateHeadcountStart().data = self.dataModelHeadcountStart;
            self.editorTemplateHeadcountEnd().name = self.dataModelHeadcountEnd.template;
            self.editorTemplateHeadcountEnd().data = self.dataModelHeadcountEnd;
            self.editorTemplateHeadcountStart.valueHasMutated();
            self.editorTemplateHeadcountEnd.valueHasMutated();
            setTimeout(kendooex.ui.init, 10);
        }
        if (
            self.products() &&
            self.products().length !== 0 &&
            ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13)?.value() === '1'
        ) {
            openPersonnelCoverage(
                parseInt(newValue) === 2 &&
                ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13)?.value() === '1'
            );
        }
    });

    self.pricingModel.subscribe(function (value) {
        const pricingModelInt = parseInt(value);
        switch (pricingModelInt) {
            case 5: case 10: case 11: case 12: case 16: case 18: case 19: case 23: case 27:
                {
                    self.dataModelHeadcountStart = new AgeBandsRateViewModel(parseInt(value), undefined, self.categoryClassification() == 2 && PRICING_MODEL_IDS.includes(pricingModelInt), true);
                    self.dataModelHeadcountEnd = new AgeBandsRateViewModel(parseInt(value), undefined, false, true);
                    self.dataModel = new AgeBandsRateViewModel(parseInt(value));
                    self.dataModel.relatedModels = { dataModelHeadcountStart: self.dataModelHeadcountStart, dataModelHeadcountEnd: self.dataModelHeadcountEnd };
                } break;
            case 25:
                {
                    self.dataModel = new AgeBandsRateViewModel(parseInt(value), true);
                    self.dataModelHeadcountStart = new AgeBandsRateViewModel(parseInt(value), true, true, true);
                    self.dataModelHeadcountEnd = new AgeBandsRateViewModel(parseInt(value), true, false, true);
                } break;
            case 6:
            case 24:
                {
                    var maxAge6 = getBundlesMaxAgeOrFixed(self.bundlesData, self.maxAge());
                    self.dataModel = new AgeRatedRatesViewModel(parseInt(value), maxAge6);
                } break;
            //case 24:
            case 17:
                {
                    self.dataModel = new ExtendedFloatFieldsViewModel(parseInt(value));
                    self.dataModelHeadcountStart = new ExtendedFloatFieldsViewModel(parseInt(value), self.categoryClassification() == 2 && PRICING_MODEL_IDS.includes(pricingModelInt), true);
                    self.dataModelHeadcountEnd = new ExtendedFloatFieldsViewModel(parseInt(value), false, true);
                } break;
            case 21:
                {
                    var maxAge21 = getBundlesMaxAgeOrFixed(self.bundlesData, self.maxAge());
                    self.dataModel = new AgeRatedFloatRatesViewModel(parseInt(value), maxAge21);
                } break;
            case 13:
                {
                    self.dataModel = new DualBandRatesViewModel(parseInt(value));
                    self.dataModelHeadcountStart = new DualBandRatesViewModel(parseInt(value), false, true);
                    self.dataModelHeadcountEnd = new DualBandRatesViewModel(parseInt(value), false, true);
                } break;
            case 22:
                {
                    self.dataModel = new FieldsViewModel(parseInt(value));
                    self.dataModelHeadcountStart = new FieldsViewModel(parseInt(value), false, true);
                    self.dataModelHeadcountEnd = new FieldsViewModel(parseInt(value), false, true);
                } break;
            case 26:
                {
                    var maxAge26 = getBundlesMaxAgeOrFixed(self.bundlesData, self.maxAge());
                    self.dataModel = new AgeRatedZonesViewModel(parseInt(value), maxAge26, true);
                } break;
            case 14: case 15:
                {
                    self.dataModel = new PerMilAgeBandsRateViewModel(parseInt(value));
                    self.dataModelHeadcountStart = new PerMilAgeBandsRateViewModel(parseInt(value), true, true);
                    self.dataModelHeadcountEnd = new PerMilAgeBandsRateViewModel(parseInt(value), false, true);
                    if (self.categoryClassification() == 2) {
                        self.dataModel.relatedModels = { dataModelHeadcountStart: self.dataModelHeadcountStart, dataModelHeadcountEnd: self.dataModelHeadcountEnd };
                    }
                } break;
            default: {
                self.dataModel = new FieldsViewModel(parseInt(value));
                self.dataModelHeadcountStart = new FieldsViewModel(parseInt(value), self.categoryClassification() == 2 && PRICING_MODEL_IDS.includes(pricingModelInt), true);
                self.dataModelHeadcountEnd = new FieldsViewModel(parseInt(value), false, true);
            } break;


        }

        if (PRICING_MODEL_IDS.includes(pricingModelInt)) {
            self.showHeadcountFields(true);
        } else {
            self.showHeadcountFields(false);
        }

        if (
            self.categoryClassification() == 2 &&
            self.products() &&
            self.products().length !== 0
        ) {
            const attribute = ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13);
            if (attribute && attribute.value && attribute.value() === '1') {
                self.dataModelPersonnelCoverage = new PersonnelCoverageViewModel();
                self.showPersonnelCoverage(true);
                self.showHeadcountFields(false);
                self.dataModelHeadcountStart = new FieldsViewModel(1, false, true);
                self.dataModelHeadcountEnd = new FieldsViewModel(1, false, true);
                self.editorTemplateHeadcountStart.valueHasMutated();
                self.editorTemplateHeadcountEnd.valueHasMutated();
            } else {
                self.showPersonnelCoverage(false);
                self.dataModelPersonnelCoverage = new FieldsViewModel(1, false);
            }
        } else {
            self.showPersonnelCoverage(false);
            self.dataModelPersonnelCoverage = new FieldsViewModel(1, false);
        }

        self.planOptionalCoverType.subscribe(function (value) {
            if (self.oldPlanOptionalCoverType != undefined && (self.oldPlanOptionalCoverType != value || self.oldPlanOptionalCoverType == 0)) {
                self.optionalCoversList.removeAll();
                self.createOptionalCovers(value);
                self.oldPlanOptionalCoverType = value;
            }

            if (!self.optionalCoversList() || self.optionalCoversList().length < 1) {
                self.createOptionalCovers(value);
            }
        });

        self.createOptionalCovers = function (value) {
            switch (parseInt(value)) {
                case 2:
                    {
                        getOptionalCoversList(2).forEach(function (item, i, arr) {
                            let dataMod = {};
                            switch (parseInt(item.id)) {
                                case 3: {
                                    dataMod = new AgeBandsRateOptionalCoversViewModel(parseInt(item.type));
                                    self.optionalCoversList.push({ name: dataMod.template, data: dataMod, title: '1' + '. ' + item.name, type: item.type, id: item.id });
                                }
                                    break;
                                case 4: {
                                    dataMod = new AgeBandsRateOptionalCoversViewModel(parseInt(item.type), true);
                                    self.optionalCoversList.push({ name: dataMod.template, data: dataMod, title: '2' + '. ' + item.name, type: item.type, id: item.id });
                                }
                                    break;
                            }
                            setTimeout(kendooex.ui.init, 10);
                        });
                    } break;
                case 1: {
                    getOptionalCoversList(1).forEach(function (item, i, arr) {
                        let dataMod = {};
                        switch (parseInt(item.type)) {
                            case 101: case 106: {
                                dataMod = new AgeBandsRateOptionalCoversViewModel(parseInt(item.type));
                            }
                                break;
                            case 100:
                                {
                                    dataMod = new AgeBandsRateOptionalCoversViewModel(parseInt(item.type), true);
                                }
                                break;
                            case 105:
                                {
                                    dataMod = new CoPayRatesViewModel(parseInt(item.type));
                                }
                                break;
                            case 107:
                                {
                                    dataMod = new MaternityRatesViewModel(parseInt(item.type));
                                }
                                break;
                            default:
                                {
                                    dataMod = new FieldsViewModel(parseInt(item.type));
                                }
                                break;
                        }
                        self.optionalCoversList.push({ name: dataMod.template, data: dataMod, title: item.id + '. ' + item.name, type: item.type, id: item.id });
                        setTimeout(kendooex.ui.init, 10);
                    });
                } break;
            }
        }

        self.editorTemplate().name = self.dataModel.template;
        self.editorTemplate().data = self.dataModel;
        self.editorTemplateHeadcountStart().name = self.dataModelHeadcountStart.template;
        self.editorTemplateHeadcountStart().data = self.dataModelHeadcountStart;
        self.editorTemplateHeadcountEnd().name = self.dataModelHeadcountEnd.template;
        self.editorTemplateHeadcountEnd().data = self.dataModelHeadcountEnd;
        self.editorTemplatePersonnelCoverage().name = self.dataModelPersonnelCoverage.template;
        self.editorTemplatePersonnelCoverage().data = self.dataModelPersonnelCoverage;
        self.editorTemplateHeadcountStart.valueHasMutated();
        self.editorTemplateHeadcountEnd.valueHasMutated();
        self.editorTemplatePersonnelCoverage.valueHasMutated();
        self.editorTemplate.valueHasMutated();
        setTimeout(kendooex.ui.init, 10);
        self.setPremiumRates();
    });

    self.renumerationStructure.subscribe(function (value) {
        switch (parseInt(value)) {
            case 3: {
                self.feeAmount(0);
                self.commision(0);
                kendooex.ui.refresh();
            } break;
        }
    });

    if (model) {
        self.policyType(model.PolicyType);
        self.categoryClassification(model.CategoryClassification);
        self.pricingModel(model.PricingModel);
        self.prorataModel(model.ProrataModel);
        self.planOptionalCoverType(model.PlanOptionalCoverType);
        self.oldPlanOptionalCoverType = model.PlanOptionalCoverType;
        self.baseCurrency(model.BaseCurrency);
        self.renumerationStructure(model.RenumerationStructure);
        self.commision(model.Commision);
        self.feeCurrency(model.FeeCurrency);
        self.feeAmount(model.FeeAmount);
        if (model.OptionalCoverRates) {
            self.setOptionalCoverageRates(model.OptionalCoverRates);
        }
    }

    self.collectPricingData = function () {
        return {
            CategoryClassification: self.categoryClassification(),
            PricingModel: self.pricingModel(),
            ProrataModel: self.prorataModel(),
            PlanOptionalCoverType: self.planOptionalCoverType(),
            BaseCurrency: self.baseCurrency(),
            RenumerationStructure: self.renumerationStructure(),
            Commision: self.renumerationStructure() == 1 ? parseFloatWithCommaSeparator(self.commision()) : null,
            FeeCurrency: self.feeCurrency(),
            FeeAmount: self.renumerationStructure() == 2 ? parseFloatWithCommaSeparator(self.feeAmount()) : null
        };
    }
    self.getPremiumRates = function () {
        switch (parseInt(self.pricingModel())) {
            case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25: case 27: return self.collectAgeBandsData();
            case 6: case 24: case 21: return self.collectAgeRatedData();
            case 26: return self.collectAgeRateZonesdData();
            case 13: return self.collectDualBandData();
            default: return self.collectRatesData();
        }
    }
    self.getHeadcountsStart = function () {
        switch (parseInt(self.pricingModel())) {
            case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25: case 27: return self.collectAgeBandsData(true, true);
            case 6: case 24: case 21: return self.collectAgeRatedData(true, true);
            case 26: return self.collectAgeRateZonesdData(true, true);
            case 13: return self.collectDualBandData(true, true);
            default: return self.collectRatesData(true, true);
        }
    }

    self.getHeadcountsEnd = function () {
        switch (parseInt(self.pricingModel())) {
            case 5: case 10: case 11: case 12: case 14: case 15: case 16: case 18: case 19: case 23: case 25: case 27: return self.collectAgeBandsData(true, false);
            case 6: case 24: case 21: return self.collectAgeRatedData(true, false);
            case 26: return self.collectAgeRateZonesdData(true, false);
            case 13: return self.collectDualBandData(true, false);
            default: return self.collectRatesData(true, false);
        }
    }

    self.getPersonnelCoverage = function () {
        if (
            self.products() &&
            self.products().length !== 0
        ) {
            const attribute = ko.utils.arrayFirst(self.products()[0].attributes(), a => a.id === 13);
            if (attribute && attribute.value && attribute.value() === '1') {
                return self.collectPersonnelCoverageData();
            }
        }
        return null;
    };

    self.getOptionalCoversRates = function () {
        var optionalRates = [];
        self.optionalCoversList().forEach(function (item, i, arr) {
            switch (item.type) {
                case 100: case 101: case 106:
                    {
                        self.collectOptionalCoverageAgeBandsData(item).forEach(function (rate, ir, arrr) {
                            optionalRates.push(rate);
                        });
                        break;
                    }
                case 105:
                    {
                        var coPay = self.collectOptionalCoverageCoPayRates(item);
                        if (coPay.RateType) {
                            optionalRates.push(coPay);
                        }
                        break;
                    }
                case 107:
                    {
                        var maternity = self.collectOptionalCoverageMaternityRates(item);
                        if (maternity.length > 0) {
                            maternity.forEach(function (item) {
                                optionalRates.push(item);
                            });
                        }
                        break;
                    }
                case 110:
                    {
                        self.collectOptionalCoverCIGNAData(item).forEach(function (rate, ir, arrr) {
                            optionalRates.push(rate);
                        });
                        break;
                    }
            }
        });
        return optionalRates;
    }
    self.collectOptionalCoverageAgeBandsData = function (data) {
        return Enumerable.From(data.data.ageBands()).SelectMany(function (ageband) {
            return Enumerable.From(ageband.values()).Select(function (item) {
                return {
                    AgeLowerBand: parseInt(ageband.ageLowerBand()),
                    AgeUpperBand: parseInt(ageband.ageUpperBand()),
                    Rate: parseFloatWithCommaSeparator(item.value()),
                    OptionalCoverType: data.id,
                    ZoneName: item.name,
                    RateType: item.type
                }
            });
        }).ToArray();
    }

    self.collectOptionalCoverCIGNAData = function (data) {
        return Enumerable.From(data.data.ageBands()).SelectMany(function (ageband) {
            return Enumerable.From(ageband.values()).Select(function (item) {
                return {
                    AgeLowerBand: parseInt(ageband.ageLowerBand()),
                    AgeUpperBand: parseInt(ageband.ageUpperBand()),
                    Rate: parseFloatWithCommaSeparator(item.value()),
                    OptionalCoverType: data.id,
                    PremiumRateTypes: [item.type],
                    RateType: item.type
                }
            });
        }).ToArray();
    }

    self.collectOptionalCoverageCoPayRates = function (data) {
        return {
            Rate: data.data.coPayType() == 1 ? data.data.percentage() : data.data.amount(),
            OptionalCoverType: data.id,
            RateType: data.data.coPayType()
        };
    }

    self.collectOptionalCoverageMaternityRates = function (data) {
        if (data.data.maternityAmount() || data.data.maternityLimit()) {
            return [
                {
                    Rate: data.data.maternityAmount(),
                    OptionalCoverType: data.id,
                    RateType: 1
                },
                {
                    Rate: data.data.maternityLimit(),
                    OptionalCoverType: data.id,
                    RateType: 2
                }
            ];
        } else {
            return [];
        }
    }

    self.collectAgeBandsData = function (isHeadcount = false, isStart = false) {
        let ageBandsSource;

        if (!isHeadcount) {
            ageBandsSource = self.dataModel.ageBands();
        } else {
            if (isStart) {
                if (!self.dataModelHeadcountStart || !self.dataModelHeadcountStart.ageBands) {
                    return [];
                }
                ageBandsSource = self.dataModelHeadcountStart.ageBands();
            } else {
                if (!self.dataModelHeadcountEnd || !self.dataModelHeadcountEnd.ageBands) {
                    return [];
                }
                ageBandsSource = self.dataModelHeadcountEnd.ageBands();
            }
        }

        return Enumerable.From(ageBandsSource).SelectMany(function (ageband) {
            return Enumerable.From(ageband.values()).Select(function (item) {
                return {
                    AgeLowerBand: parseInt(ageband.ageLowerBand()),
                    AgeUpperBand: parseInt(ageband.ageUpperBand()),
                    Rate: !isHeadcount ? parseFloatWithCommaSeparator(item.value()) : parseInt(item.value()),
                    PremiumRateTypes: [item.type],
                    ZoneName: item.name,
                    IsStart: isStart
                };
            });
        }).ToArray();
    };


    self.collectPersonnelCoverageData = function () {
        if (
            self.dataModelPersonnelCoverage &&
            typeof self.dataModelPersonnelCoverage.personnelCoverages === 'function' &&
            self.dataModelPersonnelCoverage.personnelCoverages().length > 0
        ) {
            return Enumerable.From(self.dataModelPersonnelCoverage.personnelCoverages())
                .Select(function (coverage) {
                    return {
                        Description: coverage.description(),
                        HeadcountStart: parseInt(coverage.headcountStart() || 0),
                        TotalSumInsuredStart: parseFloatWithCommaSeparator(coverage.totalSumInsuredStart() || 0),
                        HeadcountEnd: parseInt(coverage.headcountEnd()),
                        TotalSumInsuredEnd: parseFloatWithCommaSeparator(coverage.totalSumInsuredEnd())
                    };
                })
                .ToArray();
        }
        return [];
    };

    self.collectRatesData = function (isHeadcount = false, isStart = false) {
        return ko.utils.arrayMap(!isHeadcount ? self.dataModel.values() : (isStart ? self.dataModelHeadcountStart.values() : self.dataModelHeadcountEnd.values()), function (item) {
            return {
                Rate: !isHeadcount ? parseFloatWithCommaSeparator(item.value()) : parseInt(item.value()),
                PremiumRateTypes: [item.type],
                PremiumRateValues: [item.valueProp],
                IsStart: isStart
            };
        });
    }
    self.collectAgeRatedData = function () {
        return ko.utils.arrayMap(self.dataModel.rates(), function (item, index) {
            return {
                AgeLowerBand: index,
                AgeUpperBand: index,
                Rate: parseFloatWithCommaSeparator(item.rate()),
                //ageRatedRateId takes from template file (_PricingTemplate.cshtml).
                PremiumRateTypes: [item.type]
            };
        });
    }
    self.collectAgeRateZonesdData = function (isHeadcount = false, isStart = false) {

        return Enumerable.From(!isHeadcount ? self.dataModel.ageRates() : (isStart ? self.dataModelHeadcountStart.ageRates() : self.dataModelHeadcountEnd.ageRates())).SelectMany(function (ageRate) {
            return Enumerable.From(ageRate.values()).Select(function (item) {
                return {
                    AgeLowerBand: parseInt(ageRate.ageLowerBand()),
                    AgeUpperBand: parseInt(ageRate.ageUpperBand()),
                    Rate: !isHeadcount ? parseFloatWithCommaSeparator(item.value()) : parseInt(item.value()),
                    PremiumRateTypes: [item.type],
                    ZoneName: item.name,
                    IsStart: isStart
                }
            });
        }).ToArray();
    }
    self.collectDualBandData = function (isHeadcount = false, isStart = false) {
        return Enumerable.From(!isHeadcount ? self.dataModel.rates() : (isStart ? self.dataModelHeadcountStart.rates() : self.dataModelHeadcountEnd.rates())).SelectMany(function (dualband) {
            return Enumerable.From(dualband.values()).Select(function (val) {
                return {
                    AgeLowerBand: dualband.ageLowerBand(),
                    AgeUpperBand: dualband.ageUpperBand(),
                    Rate: !isHeadcount ? parseFloatWithCommaSeparator(item.value()) : parseInt(item.value()),
                    PremiumRateTypes: [val.type, parseInt(dualband.id)],
                    IsStart: isStart
                };
            });
        }).ToArray();
    }
    function openPersonnelCoverage(open) {
        if (open) {
            self.dataModelPersonnelCoverage = new PersonnelCoverageViewModel();
            self.showPersonnelCoverage(true);
            self.editorTemplatePersonnelCoverage().name = self.dataModelPersonnelCoverage.template;
            self.editorTemplatePersonnelCoverage().data = self.dataModelPersonnelCoverage;
            self.editorTemplatePersonnelCoverage.valueHasMutated();

            self.showHeadcountFields(false);
            self.dataModelHeadcountStart = new FieldsViewModel(1, false, true);
            self.dataModelHeadcountEnd = new FieldsViewModel(1, false, true);
            self.editorTemplateHeadcountStart().name = self.dataModelHeadcountStart.template;
            self.editorTemplateHeadcountStart().data = self.dataModelHeadcountStart;
            self.editorTemplateHeadcountEnd().name = self.dataModelHeadcountEnd.template;
            self.editorTemplateHeadcountEnd().data = self.dataModelHeadcountEnd;

            self.editorTemplateHeadcountStart.valueHasMutated();
            self.editorTemplateHeadcountEnd.valueHasMutated();
        } else {
            self.showPersonnelCoverage(false);
            self.dataModelPersonnelCoverage = new FieldsViewModel(1, false);

            self.editorTemplatePersonnelCoverage().name = self.dataModelPersonnelCoverage.template;
            self.editorTemplatePersonnelCoverage().data = self.dataModelPersonnelCoverage;
            self.editorTemplatePersonnelCoverage.valueHasMutated();
        }
    }
}

function getBundlesMaxAge(data, savedValue) {
    var maxAge = savedValue;
    if (!data) {
        return maxAge;
    }
    ko.utils.arrayForEach(data(), function (bundle) {
        ko.utils.arrayForEach(bundle.products(), function (product) {
            ko.utils.arrayForEach(product.attributes(), function (attribute) {
                if (attribute.code == "MAXA" && attribute.id == 3) {
                    ko.utils.arrayForEach(attribute.metadata, function (metadata) {
                        if (metadata.attributeValue && parseInt(metadata.attributeValue()) > maxAge) {
                            maxAge = parseInt(metadata.attributeValue());
                        }
                    });
                }
            });
        });
    });
    return maxAge;
}

function getBundlesMaxAgeOrFixed(data, savedValue) {
    var maxAge = 0;

    if (!data) {
        return savedValue;
    }

    ko.utils.arrayForEach(data(), function (bundle) {
        ko.utils.arrayForEach(bundle.products(), function (product) {
            ko.utils.arrayForEach(product.attributes(), function (attribute) {
                if (attribute.code == "MAXA" && attribute.id == 3) {
                    ko.utils.arrayForEach(attribute.metadata, function (metadata) {
                        if (metadata.attributeValue && parseInt(metadata.attributeValue()) > maxAge) {
                            maxAge = parseInt(metadata.attributeValue());
                        }
                    });
                }
            });
        });
    });
    return maxAge > 0 ? maxAge : savedValue;
}

function parseFloatWithCommaSeparator(value) {
    return typeof value === "string" && isNaN(value) && value.indexOf(",") !== -1 && value.indexOf(".") !== -1
        ? value.replace(",", "")
        : value;
}

function PasteInput(input, controlId) {
    var table = $("[name=" + controlId + "]").parents("table")[0];
    var rows = $(table).find("tbody tr");
    var colNum = -1;

    var inpCoo =
    {
        row: 0,
        col: 0
    };

    for (var i = 0; i < rows.length; i++) {
        var row = $(rows[i]).find('td');

        for (var j = 0; j < row.length; j++) {
            if ($($(row[j]).find('input')[1]).attr("name") === controlId) {
                colNum = j;
                break;
            }
        }
        if (colNum >= 0) {
            for (var j = colNum; j < row.length; j++) {
                if (input[inpCoo.row] != undefined || input[inpCoo.row] != null) {
                    var inpVal = input[inpCoo.row][inpCoo.col].replace(/[^\d.]/g, "");
                    if (inpVal != undefined && inpVal != null && $(row[j]).find('input')[0] != undefined && $(row[j]).find('input')[1] != undefined) {
                        var viewModel = ko.dataFor($(row[j]).find('input')[1]);

                        if (viewModel != undefined && viewModel.value != undefined) {
                            $(row[j]).find('input')[0].value = parseFloat(inpVal).toFixed(2);
                            $(row[j]).find('input')[1].value = parseFloat(inpVal).toFixed(2);
                            viewModel.value(parseFloat(inpVal));
                        }
                        else if (viewModel != undefined && viewModel.rate != undefined) {
                            $(row[j]).find('input')[0].value = parseFloat(inpVal).toFixed(2);
                            $(row[j]).find('input')[1].value = parseFloat(inpVal).toFixed(2);
                            viewModel.rate(parseFloat(inpVal));
                        }
                        else if (viewModel != undefined && viewModel.values != undefined) {
                            if ($($(row[j]).find('input')[1]).attr("name").includes('ageLowerBand_')) {
                                $(row[j]).find('input')[0].value = parseInt(inpVal);
                                $(row[j]).find('input')[1].value = parseInt(inpVal);
                                viewModel.ageLowerBand(parseInt(inpVal));
                            }
                            else if ($($(row[j]).find('input')[1]).attr("name").includes('ageUpperBand_')) {
                                $(row[j]).find('input')[0].value = parseInt(inpVal);
                                $(row[j]).find('input')[1].value = parseInt(inpVal);
                                viewModel.ageUpperBand(parseInt(inpVal));
                            }
                        }

                        inpCoo.col++;
                    }
                }
                if (inpCoo.col >= input[inpCoo.row].length) {
                    break;
                }
            }
            inpCoo.row++;
            inpCoo.col = 0;

            if (inpCoo.row >= input.length) {
                break;
            }
        }
    }
}

function AgeBandsRateViewModel(id, hasZones, required = true, isHeadcount = false, relatedModels = {}) {
    var self = this;
    self.hasZones = hasZones;
    self.isRequired = required;
    self.template = isHeadcount && required
        ? 'productpricing_template_ageband_headcountStart'
        : required
            ? 'productpricing_template_ageband'
            : 'productpricing_template_ageband_notrequired';
    self.ageBands = ko.observableArray();
    self.attributes = ko.observableArray(getAttributes(id, isHeadcount));
    self.id = getRndInteger(100, 999);
    self.relatedModels = relatedModels;
    self.addZone = function () {
        self.attributes.push({ id: zoneRateType, name: 'Zone ' + (self.attributes().length + 1) });
        self.ageBands([]);
        kendooex.ui.init();
    }

    self.addAgeBand = function () {
        const newAgeBand = new AgeBandRateItemViewModel(self.attributes(), self.id);
        self.ageBands.push(newAgeBand);

        syncRelatedModel(self.relatedModels.dataModelHeadcountStart, newAgeBand, self.ageBands());
        syncRelatedModel(self.relatedModels.dataModelHeadcountEnd, newAgeBand, self.ageBands());

        kendooex.ui.init();
    };

    self.removeAgeBand = function (item) {
        const index = self.ageBands.indexOf(item);
        self.ageBands.remove(item);
        if (self.relatedModels.dataModelHeadcountStart && typeof self.relatedModels.dataModelHeadcountStart.addAgeBand === 'function') {
            var itemheadcountStart = self.relatedModels.dataModelHeadcountStart.ageBands()[index];
            if (itemheadcountStart)
                self.relatedModels.dataModelHeadcountStart.removeAgeBand(itemheadcountStart);
        }

        if (self.relatedModels.dataModelHeadcountEnd && typeof self.relatedModels.dataModelHeadcountEnd.addAgeBand === 'function') {
            var itemheadcountEnd = self.relatedModels.dataModelHeadcountEnd.ageBands()[index];
            if (itemheadcountEnd)
                self.relatedModels.dataModelHeadcountEnd.removeAgeBand(itemheadcountEnd);
        }
    }
}

function AgeBandsRateOptionalCoversViewModel(id, hasZones, required = true, isHeadcount = false) {
    var self = this;
    self.hasZones = hasZones;
    self.template = 'productpricing_template_ageband_optionalcovers';
    self.ageBands = ko.observableArray();
    self.attributes = ko.observableArray(getAttributes(id, isHeadcount));
    self.id = getRndInteger(100, 999);
    self.isRequired = required;
    self.addZone = function () {
        self.attributes.push({ id: zoneRateType, name: 'Zone ' + (self.attributes().length + 1) });
        self.ageBands([]);
        kendooex.ui.init();
    }
    self.addAgeBand = function () {
        self.ageBands.push(new AgeBandRateItemViewModel(self.attributes(), self.id));
        kendooex.ui.init();
    }
    self.removeAgeBand = function (item) {
        self.ageBands.remove(item);
    }

    self.onPaste = function (vm, event) {
        var exel = event.originalEvent.clipboardData.getData("text/html");
        if (exel != undefined && exel != "") {
            var rows = $(exel).find('tr');
            var table = [];

            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]).find('td');
                var arr = [];
                for (var j = 0; j < row.length; j++) {
                    arr.push(row[j].textContent);
                }
                table.push(arr);
            }

            console.log(table);
            PasteInput(table, $(event.target).attr("name"));
            return false;
        }
        return true;
    }

    self.resetAddContactForm = function () {
        $(contactFormId).formReset();
        updateValidation(contactFormId);
    }
    self.min = ko.observable(null);
    self.max = ko.observable(null);
    self.showModal = function () {
        var modal = $('#ageratedband_modal_' + self.id);
        $('#ageratedband_modal_' + self.id).modal('show');

        var maxAge = getMaxAge(self.ageBands());
        self.min(maxAge + 1);
        self.max(null);
        var tempMin = modal.find("#minvalue").data("kendoNumericTextBox");
        var tempMax = modal.find("#maxvalue").data("kendoNumericTextBox");
        tempMin.value(maxAge + 1);
        tempMax.value(null);
        tempMin.wrapper.find(".k-formatted-value").attr("title", maxAge + 1);
        tempMax.wrapper.find(".k-formatted-value").removeAttr("title");
    };

    function getMaxAge(items) {
        var age = -1;
        for (var i = items.length - 1; i >= 0; i--) {
            var upper = items[i].ageUpperBand();
            var lower = items[i].ageLowerBand();
            if (upper) {
                if (parseInt(upper) > age) {
                    return parseInt(upper);
                }
            }
            else if (lower) {
                if (parseInt(lower) > age) {
                    return parseInt(lower);
                }
            }
        }
        return age;
    }

    $('#ageratedband_modal_' + self.id).on('hidden.bs.modal', function () {
        self.min(null);
        self.max(null);
    });
    self.save = function () {
        $('#minvalue_msg_' + self.id).text('')
        $('#maxvalue_msg_' + self.id).text('')

        var maxAge = getMaxAge(self.ageBands());
        var valid = true;

        if (self.min() == null || self.min() === '') {
            $('#minvalue_msg_' + self.id).text('This Field Is Required');
            valid = false;
        }
        else if (self.min() <= maxAge) {
            $('#minvalue_msg_' + self.id).text('Lower must be greater than last Upper');
            valid = false;
        }

        if (self.max() == null || self.max() === '') {
            $('#maxvalue_msg_' + self.id).text('This Field Is Required');
            valid = false;
        }

        if (parseInt(self.min()) > parseInt(self.max())) {
            $('#maxvalue_msg_' + self.id).text('Upper must be greater or equal to Lower');
            valid = false;
        }

        if (!valid) {
            return false;
        }

        updateValidation('#ageratedband_modal_' + self.id);
        $("#agePopup_" + self.id).validate();
        if (!$("#agePopup_" + self.id).valid()) {
            return;
        }
        for (var i = self.min(); i <= self.max(); i++) {
            self.ageBands.push(new AgeBandRateItemViewModel(self.attributes(), self.id, { AgeLowerBand: i, AgeUpperBand: i }));
        }

        kendooex.ui.init();

        $('#ageratedband_modal_' + self.id).modal('hide');
    };
}
function PerMilAgeBandsRateViewModel(id, required = true, isHeadcount = false, relatedModels = {}) {
    var self = this;
    self.isRequired = required;
    self.ageBands = ko.observableArray();
    self.isHeadcount = isHeadcount;
    self.template = isHeadcount && required
        ? 'productpricing_template_permil_ageband_headcountStart'
        : required
            ? 'productpricing_template_permil_ageband'
            : 'productpricing_template_permil_ageband_notrequired';

    self.attributes = ko.observableArray(getAttributes(id, isHeadcount));
    self.id = getRndInteger(100, 999);
    self.relatedModels = relatedModels;

    self.addAgeBand = function () {
        const newAgeBand = new AgeBandRateItemViewModel(self.attributes(), self.id, null, true, isHeadcount);
        self.ageBands.push(newAgeBand);

        syncRelatedModel(self.relatedModels.dataModelHeadcountStart, newAgeBand, self.ageBands());
        syncRelatedModel(self.relatedModels.dataModelHeadcountEnd, newAgeBand, self.ageBands());

        kendooex.ui.init();
    };

    self.removeAgeBand = function (item) {
        const index = self.ageBands.indexOf(item);
        self.ageBands.remove(item);

        if (self.relatedModels.dataModelHeadcountStart && typeof self.relatedModels.dataModelHeadcountStart.addAgeBand === 'function') {
            const itemheadcountStart = self.relatedModels.dataModelHeadcountStart.ageBands()[index];
            if (itemheadcountStart) {
                self.relatedModels.dataModelHeadcountStart.removeAgeBand(itemheadcountStart);
            }
        }

        if (self.relatedModels.dataModelHeadcountEnd && typeof self.relatedModels.dataModelHeadcountEnd.addAgeBand === 'function') {
            const itemheadcountEnd = self.relatedModels.dataModelHeadcountEnd.ageBands()[index];
            if (itemheadcountEnd) {
                self.relatedModels.dataModelHeadcountEnd.removeAgeBand(itemheadcountEnd);
            }
        }
    };

    kendooex.ui.init();
}


function AgeBandRateItemViewModel(attributes, id, model, required = true, isHeadcount = false) {
    var self = this;
    self.ageLowerBandName = bnetflex.guid();
    self.ageUpperBandName = bnetflex.guid();
    self.id = ko.observable(id);
    self.ageLowerBand = ko.observable();
    self.ageUpperBand = ko.observable();
    self.isRequired = required;
    self.isHeadcount = ko.observable(isHeadcount);

    self.onPaste = function (vm, event) {
        var exel = event.originalEvent.clipboardData.getData("text/html");
        if (exel != undefined && exel != "") {
            var rows = $(exel).find('tr');
            var table = [];

            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]).find('td');
                var arr = [];
                for (var j = 0; j < row.length; j++) {
                    arr.push(row[j].textContent);
                }
                table.push(arr);
            }

            console.log(table);
            PasteInput(table, $(event.target).attr("name"));
            return false;
        }
        return true;
    }

    if (model) {
        self.ageLowerBand(model.AgeLowerBand);
        self.ageUpperBand(model.AgeUpperBand);
    }

    self.values = ko.observableArray();
    ko.utils.arrayForEach(attributes, function (item) {
        self.values.push(new FieldViewModel(item.id, item.name, null, item.isHeadcount));
    });

}

function PersonnelCoverageViewModel() {
    var self = this;
    self.isRequired = true;
    self.personnelCoverages = ko.observableArray([]);
    self.template = 'productpricing_template_personnel_coverage';

    self.addPersonnelCoverage = function () {
        self.personnelCoverages.push(new PersonnelCoverageItemViewModel());
        kendooex.ui.init();
    };

    self.removePersonnelCoverage = function (item) {
        self.personnelCoverages.remove(item);
    };
}

function PersonnelCoverageItemViewModel(data) {
    var self = this;
    data = data || {};

    self.description = ko.observable(data.Description || '');
    self.headcountStart = ko.observable(data.HeadcountStart || '');
    self.totalSumInsuredStart = ko.observable(data.TotalSumInsuredStart || '');
    self.headcountEnd = ko.observable(data.HeadcountEnd || '');
    self.totalSumInsuredEnd = ko.observable(data.TotalSumInsuredEnd || '');
}

function AgeRatedRatesViewModel(id, maxAge, required = true, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_agerated';
    self.isRequired = required;
    self.rates = ko.observableArray();
    var attributes = getAttributes(id, isHeadcount);
    for (var i = 0; i <= maxAge; i++) {
        var ageRatedRateViewModel = new AgeRatedRateViewModel(attributes);
        //ageRatedRateViewModel.rate(0);
        self.rates.push(ageRatedRateViewModel);
    }
}
function AgeRatedZonesViewModel(id, maxAge, hasZones, required = true, isHeadcount = false) {
    var self = this;
    self.hasZones = hasZones;
    self.ageRates = ko.observableArray();
    self.attributes = ko.observableArray(getAttributes(id, isHeadcount));
    self.isRequired = required;
    self.id = getRndInteger(100, 999);
    for (var i = 0; i <= maxAge; i++) {
        self.ageRates.push(new AgeRatedZonesItemViewModel(self.attributes(), self.id, i));
    }
}

function AgeRatedZonesItemViewModel(attributes, id, currentAge, required = true) {
    var self = this;
    self.ageLowerBandName = bnetflex.guid();
    self.ageUpperBandName = bnetflex.guid();
    self.id = ko.observable(id);
    self.ageLowerBand = ko.observable();
    self.ageUpperBand = ko.observable();
    self.isRequired = required;

    self.ageLowerBand(currentAge);
    self.ageUpperBand(currentAge);

    self.values = ko.observableArray();
    ko.utils.arrayForEach(attributes, function (item) {
        self.values.push(new FieldViewModel(item.id, item.name, null, item.isHeadcount));
    });
}

function CoPayRatesViewModel(id, required = true) {
    var self = this;
    self.template = 'productpricing_template_copay';
    self.coPayType = ko.observable();
    self.percentage = ko.observable(0);
    self.amount = ko.observable();
    self.values = ko.observableArray();
    self.isRequired = required;
}

function MaternityRatesViewModel(id, required = true) {
    var self = this;
    self.template = 'productpricing_template_maternity';
    self.maternityAmount = ko.observable();
    self.maternityLimit = ko.observable();
    self.isRequired = required;
}

function AgeRatedFloatRatesViewModel(id, maxAge, required = true, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_ageratedfloat';
    self.rates = ko.observableArray();
    var attributes = getAttributes(id, isHeadcount);
    for (var i = 0; i <= maxAge; i++) {
        var ageRatedRateViewModel = new AgeRatedRateViewModel(attributes);
        //ageRatedRateViewModel.rate(0);
        self.rates.push(ageRatedRateViewModel);
    }
}

function AgeRatedRateViewModel(attributes) {
    var self = this;
    self.rate = ko.observable();
    self.type = attributes[0].id;
    self.isHeadcount = attributes[0].isHeadcount;
    self.controlId = bnetflex.guid();

    self.onPaste = function (vm, event) {
        var exel = event.originalEvent.clipboardData.getData("text/html");
        if (exel != undefined && exel != "") {
            var rows = $(exel).find('tr');
            var table = [];

            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]).find('td');
                var arr = [];
                for (var j = 0; j < row.length; j++) {
                    arr.push(row[j].textContent);
                }
                table.push(arr);
            }

            console.log(table);
            PasteInput(table, self.controlId);
            return false;
        }
        return true;
    }
}

function DualBandRatesViewModel(id, required = true, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_dualband';
    self.isRequired = required;
    self.attributes = getAttributes(id, isHeadcount);
    self.rates = ko.observableArray();

    ko.utils.arrayForEach(dualBandRates, function (item) {
        self.rates.push(new DualBandRateViewModel(item, self.attributes));
    });
}
function DualBandRateViewModel(model, attributes) {
    console.log();
    var self = this;
    self.id = model.id;
    self.name = model.name;
    self.values = ko.observableArray();
    self.ageLowerBand = ko.observable(model.upper);
    self.ageUpperBand = ko.observable(model.lower);

    ko.utils.arrayForEach(attributes, function (item) {
        self.values.push(new FieldViewModel(item.id, item.name, null, item.isHeadcount));
    });
}

function ExtendedFloatFieldsViewModel(id, required = true, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_extfloatfields';
    if (!required) {
        self.template = self.template + '_notrequired';
    }
    self.values = ko.observableArray();

    ko.utils.arrayForEach(getAttributes(id, isHeadcount), function (item) {
        self.values.push(new FieldViewModel(item.id, item.name, null, item.isHeadcount));
    });
}

function FieldsViewModel(id, required = true, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_fields';
    if (!required) {
        self.template = self.template + '_notrequired';
    }
    self.values = ko.observableArray();

    ko.utils.arrayForEach(getAttributes(id, isHeadcount), function (item) {
        self.values.push(new FieldViewModel(item.id, item.name, null, item.isHeadcount));
    });
}

function FieldViewModel(type, name, value, isHeadcount = false) {
    var self = this;
    self.value = ko.observable();
    self.value.subscribe(function () {
        // MS EDGE fix //
        if (self.value() && typeof self.value() === 'string' && !/^[0-9\.]+$/.test(self.value()))
            self.value(self.value().replace(/[^0-9\.]+/g, ''));

        console.log(self.value());
    });
    self.name = name;
    self.type = type;
    self.controlId = name.replace(/ /g, '_') + '_' + type + '_' + bnetflex.guid();
    self.isHeadcount = isHeadcount;

    if (value) {
        self.value(value);
    }

    self.onPaste = function (vm, event) {
        var exel = event.originalEvent.clipboardData.getData("text/html");
        if (exel != undefined && exel != "") {
            var rows = $(exel).find('tr');
            var table = [];

            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]).find('td');
                var arr = [];
                for (var j = 0; j < row.length; j++) {
                    arr.push(row[j].textContent);
                }
                table.push(arr);
            }

            console.log(table);
            PasteInput(table, self.controlId);
            return false;
        }
        return true;
    }
}


function ValueFieldsViewModel(id, isHeadcount = false) {
    var self = this;
    self.template = 'productpricing_template_fields';
    self.values = ko.observableArray();

    ko.utils.arrayForEach(getAttributes(id, isHeadcount), function (item) {
        self.values.push(new ValueFieldViewModel(item.id, item.name, item.value));
    });
}
function ValueFieldViewModel(type, name, valueProp, value, isHeadcount = false) {
    var self = this;
    self.value = ko.observable();
    self.value.subscribe(function () {
        // MS EDGE fix //
        if (self.value() && typeof self.value() === 'string' && !/^[0-9\.]+$/.test(self.value()))
            self.value(self.value().replace(/[^0-9\.]+/g, ''));

        console.log(self.value());
    });
    self.name = name;
    self.type = type;
    self.valueProp = valueProp;
    self.controlId = name.replace(/ /g, '_') + '_' + type + '_' + valueProp;
    self.isHeadcount = isHeadcount;

    if (value) {
        self.value(value);
    }

    self.onPaste = function (vm, event) {
        var exel = event.originalEvent.clipboardData.getData("text/html");
        if (exel != undefined && exel != "") {
            var rows = $(exel).find('tr');
            var table = [];

            for (var i = 0; i < rows.length; i++) {
                var row = $(rows[i]).find('td');
                var arr = [];
                for (var j = 0; j < row.length; j++) {
                    arr.push(row[j].textContent);
                }
                table.push(arr);
            }

            console.log(table);
            PasteInput(table, self.controlId);
            return false;
        }
        return true;
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function syncRelatedModel(relatedModel, newAgeBand, ageBands) {
    if (relatedModel && typeof relatedModel.addAgeBand === 'function') {
        relatedModel.addAgeBand();
        const relatedAgeBand = relatedModel.ageBands()[ageBands.length - 1];

        if (relatedAgeBand) {
            relatedAgeBand.ageLowerBand(newAgeBand.ageLowerBand());
            relatedAgeBand.ageUpperBand(newAgeBand.ageUpperBand());

            newAgeBand.ageLowerBand.subscribe(function (newValue) {
                relatedAgeBand.ageLowerBand(newValue);
            });

            newAgeBand.ageUpperBand.subscribe(function (newValue) {
                relatedAgeBand.ageUpperBand(newValue);
            });
        }
    }
}

function InitializeHeadcountModels(dataModel, dataModelHeadcountStart, dataModelHeadcountEnd) {

    if (dataModel.ageBands().length > 0) {
        ko.utils.arrayForEach(dataModel.ageBands(), function (ageBand) {
            dataModelHeadcountStart.addAgeBand();
            const headcountStartAgeBand = dataModelHeadcountStart.ageBands()[dataModelHeadcountStart.ageBands().length - 1];
            if (headcountStartAgeBand) {
                headcountStartAgeBand.ageLowerBand(ageBand.ageLowerBand());
                headcountStartAgeBand.ageUpperBand(ageBand.ageUpperBand());
            }

            dataModelHeadcountEnd.addAgeBand();
            const headcountEndAgeBand = dataModelHeadcountEnd.ageBands()[dataModelHeadcountEnd.ageBands().length - 1];
            if (headcountEndAgeBand) {
                headcountEndAgeBand.ageLowerBand(ageBand.ageLowerBand());
                headcountEndAgeBand.ageUpperBand(ageBand.ageUpperBand());
            }
        });
    }
}


