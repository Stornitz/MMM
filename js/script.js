var $preview = $('#preview');
var $input = $("#input");

var $text = $("#text");
var $style = $("#style");
var $removeclickbutton = $("#removeclickbutton");
var $removehoverbutton = $("#removehoverbutton");
var $clickAction = $("#click-action");
var $clickValue = $("#click-value");
var $hoverAction = $("#hover-action");
var $hoverValue = $("#hover-value");
var $exportIcon = $('#exporticon')

var colorPattern = new RegExp('^[0-9a-fr]', 'i');
var formatPattern = new RegExp('^[klmno]', 'i');

var alias = {
	'0': 'black',
	'1': 'dark_blue',
	'2': 'dark_green',
	'3': 'dark_aqua',
	'4': 'dark_red',
	'5': 'dark_purple',
	'6': 'gold',
	'7': 'gray',
	'8': 'dark_gray',
	'9': 'blue',
	'a': 'green',
	'b': 'aqua',
	'c': 'red',
	'd': 'light_purple',
	'e': 'yellow',
	'f': 'white',
	'r': 'none'
}

var re = new RegExp("&([a-f0-9r])([^&]+)","g");

var inputText, actions = {};

var selected, hover, outputObj;

/**
 * INIT
 */
$(document).ready(function() {
	disableButtons();

	if(window.wactions) {
		actions = JSON.parse(b64_to_utf8(window.wactions));
	}
	if(window.wtext) {
		var val = b64_to_utf8(window.wtext);
		$input.val(val);
		$preview.html(processText(val));
		registerEvents();
	}
	if(window.wimport) {
		doImport(b64_to_utf8(window.wimport));
	}

	$input.keydown(function() {
		setTimeout(function() {
			var val = $input.val();

			$preview.html(processText(val));
			registerEvents();

			$exportIcon.removeClass('fa-check');
			$exportIcon.addClass('fa-times');
		}, 100);
	});

	$preview.click(function() {
		if(~selected) {
			$('#' + selected).removeClass('selected');
			disableButtons();
		}
	});
});

function registerEvents() {
	$('#preview span').click(function(e) {
		var id = $(this).attr('id');

		selectText(id);

		e.stopPropagation();
	}).mouseover(function(e) {
		hover = $(this).attr('id');

		viewActions(hover);

		$(this).addClass('hover');

		e.stopPropagation();
	}).mouseout(function(e) {
		$(this).removeClass('hover');
	});
}

function processText(input) {
	inputText = input;
	var texts = input.split('&');

	var formats = {};

	var output = '<span id="0">' + texts[0];
	outputObj = [];
	var openSpan = 1;

	outputObj.push({text: texts[0]});

	for(var i = 1; i < texts.length; i++) {
		var text = texts[i];
		if(colorPattern.test(text)) {
			while(openSpan > 0) {
				output += '</span>';
				openSpan--;
			}

			var color = text.substr(0, 1);

			var obj = {
				color: alias[color],
				text: text.substr(1)
			};

			for(key in formats) {
				if(formats[key]) {
					formats[key] = obj[key] = false;
				}
			}

			output += '<span id="' + i + '" class="c_' + color + '">' + escapeHTML(obj.text);
			openSpan++;

			outputObj.push(obj);
		} else if(formatPattern.test(text)) {
			var formatChar = text.substr(0, 1);

			var obj = {
				text: text.substr(1)
			};

			switch(formatChar) {
				case "k":
					obj["obfuscated"] = formats["obfuscated"] = true;
					break;
				case "l":
					obj["bold"] = formats["bold"] = true;
					break;
				case "m":
					obj["strikethrough"] = formats["strikethrough"] = true;
					break;
				case "n":
					obj["underlined"] = formats["underlined"] = true;
					break;
				case "o":
					obj["italic"] = formats["italic"] = true;
					break;
			}


			for(key in formats) {
				if(formats[key]) {
					obj[key] = true;
				}
			}

			output += '<span id="' + i + '" class="c_' + formatChar + '">' + escapeHTML(obj.text);
			openSpan++;

			outputObj.push(obj);
		} else {
			output += '&' + escapeHTML(text);

			outputObj[outputObj.length - 1].text += '&' + text;
		}
	}

	while(openSpan > 0) {
		output += '</span>';
		openSpan--;
	}

	return output;
}

function enableButtons(id) {
	$('.buttons-action').each(function(i) {
		enableButton($(this));
	});

	if(actions[id]) {
		if(actions[id].click) {
			editButton($('#' + actions[id].click.action));
		}
		if(actions[id].hover) {
			editButton($('#' + actions[id].hover.action));
		}
	}
}

function viewActions(id) {
	var action = actions[id];

	if(action && action.click && action.click.action) {
		$clickAction.text(action.click.action);
		$removeclickbutton.removeAttr('disabled');
	} else {
		$clickAction.text('None');
		$removeclickbutton.attr('disabled', true);
	}

	$clickValue.text(action && action.click && action.click.value ? action.click.value : 'None');

	if(action && action.hover && action.hover.action) {
		$hoverAction.text(action.hover.action);
		$removehoverbutton.removeAttr('disabled');
	} else {
		$hoverAction.text('None');
		$removehoverbutton.attr('disabled', true);
	}

	$hoverValue.text(action && action.hover && action.hover.value ? action.hover.value : 'None');
	$text.text($('#' + id).text());
	$style.attr('class', $('#' + id).attr('class'));


}

function enableButton(button) {
	button.removeAttr('disabled');

	button.html('<i class="fa fa-plus"></i> ' + button.data('val'));

	button.removeClass('btn-warning');
	button.removeClass('btn-info');
	button.addClass('btn-primary');
}

function editButton(button) {
	button.html('<i class="fa fa-pencil"></i> ' + button.data('val'));

	button.removeClass('btn-primary');
	button.addClass('btn-warning');
}

function disableButtons() {
	$('.buttons-action').each(function(i) {
		$(this).attr('disabled', true);
		$(this).html('<i class="fa fa-ban"></i> ' + $(this).data('val'));
		$(this).addClass('btn-info');
		$(this).removeClass('btn-primary');
		$(this).removeClass('btn-warning');
	});
}

function popup(action, hover) {
	var value = prompt('Enter a value for the action "' + action + '":');

	if(value) {
		if(!actions[selected]) {
			actions[selected] = {};
		}

		if(hover) {
			actions[selected].hover = {action: action, value: value};
		} else {
			actions[selected].click = {action: action, value: value};
		}
		viewActions(selected);
		selectText(selected);
	}
}

function removeAction(isHover) {
	if(actions[hover]) {
		if(isHover) {
			delete actions[hover].hover;
		} else {
			delete actions[hover].click;
		}
		viewActions(hover);
		selectText(hover);
	}
}

function selectText(id) {
	if(~selected) {
		$('#' + selected).removeClass('selected');
	}
	$('#' + id).addClass('selected');
	selected = id;

	enableButtons(id);
}

function share(e) {
	var actionsStr = "";
	if(actions && Object.keys(actions).length > 0)
		actionsStr += '&actions=' + utf8_to_b64(JSON.stringify(actions));
	if(inputText && inputText.trim() != "") {
		$('#shareinput').removeClass('hidden').val(getIndex() + '?text=' + utf8_to_b64(inputText) + actionsStr);
	}
}

function utf8_to_b64(str) {
	return window.btoa(escape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
	return decodeURIComponent(unescape(window.atob(str)));
}

function selectAll(el) {
	setTimeout(function () { el.focus(); el.select(); }, 50);
}

var escapeHTML = (function () {
    'use strict';
    var chr = { '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return function (text) {
        return text.replace(/[\"&<>]/g, function (a) { return chr[a]; });
    };
}());

function exportStr() {
	if(outputObj == null)
		outputObj = [];

	$exportIcon.removeClass('fa-check');
	$exportIcon.removeClass('fa-times');
	$exportIcon.addClass('fa-refresh fa-spin');

	for(i in outputObj) {
		if(actions[i]) {
			if(actions[i].click)
				outputObj[i].clickEvent = actions[i].click;
			if(actions[i].hover)
				outputObj[i].hoverEvent = actions[i].hover;
		}
	}

	if(outputObj.length > 0 && outputObj[0].text.trim() == "") {
		outputObj.shift();
	}

	$('#export').val(JSON.stringify(outputObj));
	setTimeout(function() {
		$exportIcon.removeClass('fa-refresh');
		$exportIcon.removeClass('fa-spin');
		$exportIcon.addClass('fa-check');
	}, 500);
}

function importStr() {
	var import_ = prompt('Enter a json string to import:');

	if(import_) {
		doImport(import_);
	}
}

function doImport(value) {
	try {
		var importObj = JSON.parse(value);

		if(importObj.length > 0) {
			var actions = {};
			var text = "";

			for(i in importObj) {
				var obj = importObj[i];

				if(obj.color) {
					var c = getColor(obj.color);
					if(c)
						text += "&" + c;
				}

				if(obj.obfuscated) {
					text += "&k";
				}
				if(obj.bold) {
					text += "&l";
				}
				if(obj.strikethrough) {
					text += "&m";
				}
				if(obj.underlined) {
					text += "&n";
				}
				if(obj.italic) {
					text += "&o";
				}

				text += obj.text;

				if(obj.clickEvent) {
					if(!actions[i])
						actions[i] = {}
					actions[i].click = obj.clickEvent;
				}
				if(obj.hoverEvent) {
					if(!actions[i])
						actions[i] = {}
					actions[i].hover = obj.hoverEvent;
				}
			}

			var actionsStr = "";
			if(Object.keys(actions).length > 0)
				actionsStr += '&actions=' + utf8_to_b64(JSON.stringify(actions));
			if(text.trim() != "") {
				window.location.href = getIndex() + '?text=' + utf8_to_b64(text) + actionsStr;
			}
		}
	} catch(e) {
		value = value.replace(/§/g, '&');

		$input.val(value);
		$preview.html(processText(value));
		registerEvents();
	};
}

function getIndex() {
	return window.location.href.split('?')[0];
}

function getColor(str) {
	for(key in alias) {
		if(str == alias[key]) {
			return key;
		}
	}

	return null;
}
