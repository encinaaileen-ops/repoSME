
function onUsersGridChange(event) {
	var multiselect = $('#SelectedUsersMultiSelect').data().kendoMultiSelect;

	var eventTarget = (event.target) ? $(event.target) : $(event.srcElement);
	var isAction = eventTarget.hasClass('glyphicon-check') || eventTarget.hasClass('btn-select-user');

	if (isAction) {
		var dataItem = $("#SearchUsersGrid").data("kendoGrid").dataItem($(event.currentTarget).closest("tr"));
		//var dataItem = $("#SearchUsersGrid").data("kendoGrid").dataItem($("#SearchUsersGrid").data("kendoGrid").select());
		if (dataItem == null)
			return;
		var ds = multiselect.dataSource;

		var arrayItems = ds.data();
		for (var i = 0; i < arrayItems.length; i++) {
			if (arrayItems[i].UserId == dataItem.UserId) {
				return;
			}
		}

		ds.add(dataItem);
		if (multiselect.value().length == 0) {
			multiselect.value(dataItem.UserId);
		} else {
			multiselect.dataSource.filter({});
			var userIdArray = [];

			$.each(arrayItems, function (index, value) {
				userIdArray.push(value.UserId);
			});


			multiselect.value(userIdArray);
		}
	}
}

function onSelectAllUsers(event) {
    var multiselect = $('#SelectedUsersMultiSelect').data().kendoMultiSelect;
    var displayedData = $("#SearchUsersGrid").data().kendoGrid.dataSource.view();

    var eventTarget = (event.target) ? $(event.target) : $(event.srcElement);
    var isAction = eventTarget.hasClass('glyphicon-check') || eventTarget.hasClass('btn-select-user');
    if (isAction) {
        multiselect.dataSource.data([]);
        multiselect.value([]);

        var ds = multiselect.dataSource;
        var userIdArray = [];

        $.each(displayedData, function (index, value) {
            userIdArray.push(value.UserId);
            ds.add(value);
        });

        multiselect.value(userIdArray);
    }
}

function onUsersSelectionChange(e) {
	var multiselect = $('#SelectedUsersMultiSelect').data().kendoMultiSelect;
	var ds = multiselect.dataSource;
	var arrayItems = ds.data();
	var multiselectValues = multiselect.value();


	for (var i = 0; i < arrayItems.length; i++) {
		if (!findElemInArray(arrayItems[i].UserId, multiselectValues)) {
			ds.remove(arrayItems[i]);
		}
	}
}

function findElemInArray(userId, multiselectValues) {
	for (var y = 0; y < multiselectValues.length; y++) {
		if (userId == multiselectValues[y]) {
			return true;
		}
	}
	return false;
}

function addSelectedUsers() {
	var arrayItems = $('#SelectedUsersMultiSelect').data().kendoMultiSelect.dataSource.data();


	for (var i = 0; i < arrayItems.length; i++) {
		var row = $("<tr>");
		row.append("<input type='hidden' value='" + arrayItems[i].UserId + "'>");
		row.append("<td>" + arrayItems[i].EmailAddress + "</td>");
		row.append("<td>" + arrayItems[i].UserName + "</td>");
		row.append("<td>" + arrayItems[i].CreateDate.toLocaleDateString("en-GB") + "</td>");
		row.append("<td><button data-toggle=\"tooltip\" data-placement=\"top\" title=\"Delete\" onclick=\"removeUsersRow(this)\" type=\"button\" class=\"btn btn-white btn-sm\"><i class=\"fa fa-trash color-red\"></i></button></td>");

		$("#selected_users_grid tbody").append(row);
	}

	arrangeUsersNameTags();

	$('#modal-users').modal("hide");
}

function arrangeUsersNameTags() {
	var userIds = $("#selected_users_grid tbody input[type=hidden]");
	for (var i = 0; i < userIds.length; i++) {
		$(userIds[i]).attr("name", "Users[" + i + "].UserId");
	}
}

function removeUsersRow(elem) {
	$(elem).closest("tr").remove();
	arrangeUsersNameTags();
}



var userSearchFilter = {
	UserName: "",
	ExcludedUsers: getExcludedUsersArray()
};;

function searchUsers() {

	userSearchFilter = {
		UserName: $("#search_username").val(),
        ExcludedUsers: getExcludedUsersArray()
    };

    var multiselect = $('#SelectedUsersMultiSelect').data().kendoMultiSelect;
    multiselect.dataSource.data([]);
    multiselect.value([]);

	$("#SearchUsersGrid").data("kendoGrid").dataSource.page(1);
}

function onUsersDataLoad() {
	return userSearchFilter;
}

function getExcludedUsersArray() {
	var inputs = $("#selected_users_grid tbody input[type=hidden]");
	var newArray = [];
	for (var i = 0; i < inputs.length; i++) {
		newArray.push($(inputs[i]).val());
	}

	return newArray;
}