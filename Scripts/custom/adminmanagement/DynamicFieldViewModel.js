var DynamicFieldViewModel = (function ($, ko, undefined) {


    //const value
    //EDynamicFieldTypes Enum (namespace BenefitNetFlex.Common.Enums.Member)
    function  EDynamicFieldTypes (){ 
        return {
            Integer: 0,
            Decimal: 1,
            Text: 2,
            RichText: 3,
            Boolean: 4,
            DateTime: 5,
            Select: 6,
            Multiselect: 7
        }
    }

    function DynamicFieldModel(params) {

        var self = this;
        $.extend(self, params);

        // <origin fields>
        self.FieldId = ko.observable(self.model.FieldId);
        self.TypeId = ko.observable(self.model.TypeId);
        self.Name = ko.observable(self.model.Name);
        self.Description = ko.observable(self.model.Description);
        self.IsRequired = ko.observable(self.model.IsRequired);
        self.Order = ko.observable(self.model.Order);
        self.DisplayName = ko.observable(self.model.DisplayName);
        self.IsVisible = ko.observable(self.model.IsVisible);
        self.IsEnabled = ko.observable(self.model.IsEnabled);
        self.DefaultValue = ko.observable(self.model.DefaultValue);
        self.OptionLabel = ko.observable(self.model.OptionLabel);
        self.DataType = ko.observable(self.model.DataType);
        self.ErrorMessage = ko.observable(self.model.ErrorMessage);
        self.DynamicFieldDataList = ko.observableArray(ko.utils.arrayMap(self.model.DynamicFieldDataList, function (item) { return new DynamicFieldDataModel(item); }));
        // </origin fields>

        //self.IsEnabled.subscribe(function (value) {
        //    console.log(value);
        //});

        self.SelectOrMultiSelect = ko.computed(function () {   
            return result = (parseInt(self.TypeId()) === EDynamicFieldTypes().Select || parseInt(self.TypeId()) === EDynamicFieldTypes().Multiselect);
        });   

        self.selectedItem = ko.observable();

        self.addItem = function () {
            var num = self.DynamicFieldDataList().length === 0 ? 1 : Math.max.apply(Math, ko.toJS(self.DynamicFieldDataList).map(function (o) { return o.Value; })) + 1;
            var newItem = new DynamicFieldDataModel({
                FieldId : self.FieldId,
                DataName: 'New Item ' + num,
                Value: num
            });
            self.DynamicFieldDataList.push(newItem);
            self.selectedItem(newItem);
        };

        self.deleteItem = function (itemToDelete) {
            self.DynamicFieldDataList.remove(itemToDelete);
            self.selectedItem(null);
        };

        self.editItem = function (item) {
            self.selectedItem(item);
        };

        self.acceptItemEdit = function () {
            self.selectedItem().DataName.commit();
            self.selectedItem().Value.commit();
            self.selectedItem(null);
        };

        self.cancelItemEdit = function () {
            self.selectedItem().DataName.reset();
            self.selectedItem().Value.reset();
            self.selectedItem(null);
        };

        self.templateToUse = function (item) {
            return self.selectedItem() === item ? "editTmpl" : "itemTmpl";
        };

        self.GetCleanModel = function () {

            var cleanObj = ko.toJS(self);
            delete cleanObj.model
            if (!self.SelectOrMultiSelect()) {
                cleanObj.DynamicFieldDataList = [];
            }
            //console.log(cleanObj);
            return cleanObj
        }

        self.SubmitForm = function (formElement) {
        

            $(formElement).validate();
            if (!$(formElement).valid())
                return;
      

            bnetflex.ui.progressbar.show();


            $.ajax({
                url: self.submitAction,
                type: "POST",
                data: ko.toJSON(self.GetCleanModel()),
                contentType: 'application/json; charset=utf-8',          
                success: function (data) {
                    //console.log(data);
                    if (data.Success) {
                        onSuccessMessage('Ok');
                        window.location.href = self.redirectAction ;
                    } else {
                        onFailureValdationMessage(data.ValidationMessage);
                    };
                },
                error: function (data) {
                    bnetflex.ui.progressbar.hide();
                    onFailureValdationMessage("Status: " + data.status + ". " + data.statusText);
                },
                complete: function (o) {
                    //bnetflex.ui.progressbar.hide();
                }
            });
            
        }



    }

    function DynamicFieldDataModel(model) {

        var self = this;

        self.FieldDataId = ko.observable(model.FieldDataId);
        self.FieldId = ko.observable(model.FieldId);
        self.DataName = ko.protectedObservable(model.DataName);
        self.Value = ko.protectedObservable(model.Value);
    }

    //wrapper for an observable that protects value until committed
    ko.protectedObservable = function (initialValue) {
        //private variables
        var _temp = initialValue;
        var _actual = ko.observable(initialValue);

        var result = ko.dependentObservable({
            read: _actual,
            write: function (newValue) {
                _temp = newValue;
            }
        }).extend({ notify: "always" }); //needed in KO 3.0+ for reset, as computeds no longer notify when value is the same

        //commit the temporary value to our observable, if it is different
        result.commit = function () {
            if (_temp !== _actual()) {
                _actual(_temp);
            }
        };

        //notify subscribers to update their value with the original
        result.reset = function () {
            _actual.valueHasMutated();
            _temp = _actual();
        };

        return result;
    };

    return{
        GetModel: function (params) {
            return new DynamicFieldModel(params);
        }
    }

}(jQuery, ko))