var md = window.markdownit();

$( document ).ready(
    function() {
        var query = window.location.search.substring(1);
        if (query.substring(0, 4) === "url=") {
            $('#gamebox').find('summary').html("Select another game:");
            loadGame(query.substring(4));
        }
        $.ajax({
            dataType: "json",
            url: 'manifest.json',
            success: function(data) {
                window.manifest = data.manifest;
                var $gamelist = $('#gamelist');
                $.each(window.manifest, function(i, game)
                {
                    var $item = $('<li>');
                    var $link = $('<a>', { href : '#game_'+i });
                    $link.html(game.title);
                    $link.click(function(e) { e.preventDefault(); loadGame(game.url); });
                    $item.html($link);
                    $gamelist.append($item);
                });
            }
        });
    }
);

function loadGame(url) {
    var $checklist = $('#checklist');
    $checklist.html("");
    $.ajax({
        dataType: "json",
        url: url,
        success: function(data) {
            window.data = [
                { th : "Title", td : data.title},
            ];
            if (data.url) {
                window.data.push({ th : "Checklist by", td : $('<a>', {href: data.url}).html(data.author)})
            } else {
                window.data.push({ th : "Checklist by", td : data.author});
            }
            window.checklist_groups = data.checklist_groups;
            $('#info').html(makeInfo());
            var $header = $('<h2>');
            $header.html(data.title);
            $checklist.append("<h2><cite>{0}</cite> checklist by {1}</h2>".format(data.title, data.author));
            $.each(window.checklist_groups, function(j, group)
            {
                var $group_fieldset = $('<fieldset>', { 'data-group' : j});
                var $group_legend = $('<legend>');
                $group_legend.html(md.renderInline(group.name));
                $group_fieldset.append($group_legend);
                $.each(group.items, function(i, item)
                {
                    if (item.description.length > 0) {
                        var $details = $('<details>', { 'data-item' : i});
                        var $summary = $('<summary>');
                        var $checkbox = $('<input type="checkbox" />');
                        $checkbox.attr('value', '{0}-{1}-{2}'.format(url, group.name, item.item));
                        $summary.html('{0}{1}'.format($('<div />').append($checkbox).html(), md.renderInline(item.item)));
                        $details.append($summary);

                        var $description = $('<div>');
                        $description.html(md.render(item.description));
                        $details.append($description);

                        $group_fieldset.append($details);
                    } else {
                        var $checkbox = $('<input type="checkbox" />');
                        $checkbox.attr('value', '{0}-{1}-{2}'.format(url, group.name, item.item));
                        $group_fieldset.append('<div>{0}{1}</div>'.format($('<div />').append($checkbox).html(), md.renderInline(item.item)))
                    }
                });
                $checklist.append($group_fieldset);
            });
            $('input').click(function(e) {
                localStorage.setItem(e.target.value, e.target.checked);
            });
            var i, checkboxes = document.querySelectorAll('input[type=checkbox]');
        
            for (i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = localStorage.getItem(checkboxes[i].value) === 'true' ? true : false;
            }
        }
    });
}

function makeInfo() {
    var $t = $('<table>');
    $.each(window.data, function(i, d)
    {
        var $r = $('<tr>');
        $r.append($('<th>').html(d.th));
        $r.append($('<td>').html(d.td));
        $t.append($r);
    });
    return($t);
}

// The following handy function is by gpvos, from an answer on stackoverflow:
// http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery/5077091#5077091
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
    if (m == "{{") { return "{"; }
    if (m == "}}") { return "}"; }
    return args[n];
  });
};
