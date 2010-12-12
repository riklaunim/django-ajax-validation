(function($) {
    function inputs(form)   {
        return form.find(":input:visible:not(:button)");
    }

    var errorRemover = {
	p: function(form){
	    form.find('ul.errorlist').remove();
	},
	table: function(form){
	    inputs(form).prev('ul.errorlist').remove();
            form.find('tr:has(ul.errorlist)').remove();
	},
	ul: function(form){
            inputs(form).prev().prev('ul.errorlist').remove();
            form.find('li:has(ul.errorlist)').remove();
	},
    };

    function removeErrors(form, form_type){
	return errorRemover[form_type](form);
    }

    $.fn.validate = function(url, settings) {
        settings = $.extend({
            type: 'table',
            callback: false,
            fields: false,
            dom: this,
            event: 'submit',
            submitHandler: null
        }, settings);

        return this.each(function() {
            var form = $(this);
            settings.dom.bind(settings.event, function()  {
                var status = false;
		var responseData = {};
                var data = form.serialize();
                if (settings.fields) {
                    data += '&' + $.param({fields: settings.fields});
                }
                $.ajax({
                    async: false,
                    data: data,
                    dataType: 'json',
                    traditional: true,
                    error: function(XHR, textStatus, errorThrown)   {
                        status = true;
                    },
                    success: function(data, textStatus) {
			responseData = data;
                        status = data.valid;
			removeErrors(form, settings.type)
                        if (!status)    {
                            if (settings.callback)  {
                                settings.callback(data, form);
                            }
                            else    {
                                var get_form_error_position = function(key) {
                                    key = key || '__all__';
                                    if (key == '__all__') {
                                        var filter = ':first';
                                    } else {
                                        var filter = ':first[id^=id_' + key.replace('__all__', '') + ']';
                                    }
                                    return inputs(form).filter(filter).parent();
                                };
                                if (settings.type == 'p')    {
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            var error = get_form_error_position(key);
                                            if (error.prev().is('ul.errorlist')) {
                                                error.prev().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                            }
                                            else    {
                                                error.before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                            }
                                        }
                                        else    {
                                            $('#' + key).parent().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                                if (settings.type == 'table')   {
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            get_form_error_position(key).parent().before('<tr><td colspan="2"><ul class="errorlist"><li>' + val + '.</li></ul></td></tr>');
                                        }
                                        else    {
                                            $('#' + key).before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                                if (settings.type == 'ul')  {
                                    $.each(data.errors, function(key, val)  {
                                        if (key.indexOf('__all__') >= 0)   {
                                            get_form_error_position(key).before('<li><ul class="errorlist"><li>' + val + '</li></ul></li>');
                                        }
                                        else    {
                                            $('#' + key).prev().before('<ul class="errorlist"><li>' + val + '</li></ul>');
                                        }
                                    });
                                }
                            }
                        }
                    },
                    type: 'POST',
                    url: url
                });
                if (status && settings.submitHandler) {
                    return settings.submitHandler(this, responseData);
                }
                return status;
            });
        });
    };
})(jQuery);
