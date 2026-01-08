define(['knockout', 'text!custom/reminders/reminder-row-component.html'], function (ko, htmlString) {

    var module = {};

    function ReminderRowViewModel(params) {
        //console.log(params);
      
        var self = this;

        self.Options = {
            Title: 'Title',
            ReminderDate: 'ReminderDate',
            CssClassIcon: 'CssClassIcon',
            Body: 'Body',
            LinkLabel: 'LinkLabel',
            Link: '/'
        };

        $.extend(self.Options, params);

        $.extend(self, self.Options);

        self.getSelf = function () {
            return self;
        }
        //self.Title = params.Title;
        //self.Date = params.Date;

    }

    ReminderRowViewModel.prototype.doSomething = function () {
    };


    return { viewModel: ReminderRowViewModel, template: htmlString };
});