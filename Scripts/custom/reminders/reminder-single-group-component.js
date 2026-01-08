define(['knockout',
    'text!custom/reminders/reminder-single-group-component.html',
], function (ko, htmlString) {

    function RemindersSingleGroupViewModel(params) {

        var self = this;

        self.Options = {
            loadReminderGroupsUrl: '/',
            PanelGroupSelector: '#accordion',
            GroupName: "Calendar Reminders"
        };

        $.extend(self.Options, params);

        self.getSelf = function () {
            return self;
        }

        self.Name = self.Options.GroupName;

        self.NameWithoutSpaces = self.Options.GroupName.replace(/\s+/g, '');;

        self.QntByTypeList = ko.observableArray();

        self.groupBy = function(xs, key) {
            return xs.reduce(function(rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };

        self.SuccessLoad = function (data) {
            var items = data.Items;
            var groups = self.groupBy(items, 'ReminderType');
            self.QntByTypeList([]);
            for (var propertyName in groups) {
                self.QntByTypeList.push(new QntLabelModel({
                    Type : propertyName,
                    Qnt : groups[propertyName].length
                }));
            }
            //console.log(self.QntByTypeList());
        }

        self.Options.IsLoaded(true);
      
    }   

    function QntLabelModel(model) {
        var self = this;
        self.Type = model.Type;
        self.Qnt = model.Qnt;
        self.Classes = ["label-warning", "label-danger", "label-pink", "label-blue", "label-dark-red", "label-cyan", "label-purple", "label-primary", ]
        self.CssClass = ko.computed(function () {
            return "label " + self.Classes[self.Type - 1];
        })
    }

    return { viewModel: RemindersSingleGroupViewModel, template: htmlString };
});