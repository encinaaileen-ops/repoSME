function fixHiddenCheckField(checkField) {
    var name = $(checkField).attr("name");
    var hiddenSelector = "input:hidden[name='" + name + "']";
    var checkBoxesInListSelector = "input:checkbox[name='" + name + "']";
    var checkedCheckBoxesInListSelector = "input:checked[name='" + name + "']";

    if ($(checkedCheckBoxesInListSelector).length >= 1 || $(checkBoxesInListSelector).length > 1) {
        $("input").remove(hiddenSelector);
    }
    else {
        if ($(hiddenSelector).length == 0)
            $(checkField).parents("form").append("<input type='hidden' name='" + name + "' value='false' />");
    }
}