kendooex = {
    processTable: function (data, idField, foreignKey, rootLevel) {
        var hash = {};

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var id = item[idField];
            var parentId = item[foreignKey];

            hash[id] = hash[id] || [];
            hash[parentId] = hash[parentId] || [];

            item.items = hash[id];
            hash[parentId].push(item);
        }

        return hash[rootLevel];
    },
    ui: {
        init: function () {
            $("[data-role='numeric-text-box']").each(function (index, item) {
                var $item = $(item);
                if (!$item.hasClass('k-input')) {
                    var format = $item.data('format');
                    var decimals = $item.data('decimals');
                    var round = $item.data('round');
                    $item.kendoNumericTextBox({ format: format, spinners: false, decimals: decimals, round: round });
                }
            });
            $("[data-role='combobox']").each(function (index, item) {
                var $item = $(item);
                if (!$item.hasClass('k-input')) {
                    $item.kendoComboBox();
                }
            });
            $("[data-role='datepicker']").each(function (index, item) {
                var $item = $(item);
                if (!$item.hasClass('k-input')) {
                    var format = $item.data('format');
                    $item.kendoDatePicker({ format: format });
                }
            });
            //$("[data-role='multiselect']").each(function (index, item) {
            //    var $item = $(item);
            //    if (!$item.hasClass('k-input')) {
            //        $item.kendoMultiSelect();
            //    }
            //});
        },
        refresh: function () {
            $("[data-role='numeric-text-box']").each(function (index, item) {
                var $item = $(item);
                var numerictextbox = $item.data("kendoNumericTextBox");
                if (numerictextbox)
                    numerictextbox.focus();
            });
        }
    },
    getTextFromMultiselect: function (id) {
        var originatorString = "";
        var dataitems = $("#" + id).data("kendoMultiSelect").dataItems();
        var selectedValues = $("#" + id).data("kendoMultiSelect").value();
        for (var i = 0; i < dataitems.length; i++) {
            for (var y = 0; y < selectedValues.length; y++) {
                if (dataitems[i].Id == selectedValues[y]) {
                    if (originatorString !== "") {
                        originatorString += ", "
                    }
                    originatorString += dataitems[i].Name;
                }
            }
        }

        return originatorString;
    }
}



