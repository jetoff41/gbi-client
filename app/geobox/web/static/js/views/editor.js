$(document).ready(function() {
    var editor = initEditor();

    $('#tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })

    $("#tabs > li > a ").click(function() {
        if (editor.map.toolbars && editor.map.toolbars.length > 0) {
            var tab = $(this).attr('href');

            $.each(editor.map.toolbars, function(id, toolbar) {
                toolbar.deactivateAllControls();
                if (toolbar.select) {
                    toolbar.select.olControl.unselectAll();
                }
                if (toolbar.select && tab == '#edit') {
                    toolbar.select.activate();
                    orderToolbar();
                }
            });
        }
   });

   $('#remove_all_features').click(function() {
        var activeLayer = editor.layerManager.active();
        if(activeLayer instanceof gbi.Layers.SaveableVector) {
            editor.map.toolbars[1].delete_.olControl.deleteFeatures(activeLayer.features)
            activeLayer.changesMade();
        }
        $('#deleteAllGeometries').modal('hide');
        return false;
   });

   orderToolbar();

   function orderToolbar() {
       var toolbarButton = $('#edit-toolbar .olButton');
       var toolbarWork = ['DrawFeaturePoint', 'DrawFeatureLine', 'DrawFeaturePolygon'];
       $('#edit-toolbar').append('<div id="toolbar-draw" class="span12">'+
            '</div><div id="toolbar-work"></div>');
       // order toolbar as long as gbi editor dont support groups
       $.each(toolbarButton, function(id, button) {
            var class_ = $(button).attr('class');
            var toolbar = false;
            $.each(toolbarWork, function(index, buttonClass) {
                if (class_.indexOf(buttonClass) >= 0) {
                  $(button).appendTo('#toolbar-draw')
                  toolbar = true;
                }
            });

            if (!toolbar) {
                 $(button).appendTo('#toolbar-work')
            }

       });
    }

});

function initEditor() {
     var editor = new gbi.Editor({
       map: {
            element: 'map',
            numZoomLevels : numZoomLevels,
            theme: OpenlayersThemeURL
        },
        imgPath: OpenlayersImageURL
    });
    editor.addLayer(backgroundLayer)

    $.each(raster_sources, function(index, layer) {
        editor.addLayer(layer);
    });

    $.each(couchLayers, function(index, layer) {
        editor.addLayer(layer);
    });

    var layermanager = new gbi.widgets.LayerManager(editor, {
        element: 'layermanager'
    });

    var measure = new gbi.widgets.Measure(editor, {
    	element: 'measure-toolbar',
        srs: ['EPSG:3857', 'EPSG:4326', 'EPSG:25832', 'EPSG:25833', 'EPSG:31466', 'EPSG:31467', 'EPSG:31468']
    });

    var toolbar = new gbi.Toolbar(editor, {
        element: 'edit-toolbar',
        tools: {
            'drawPoint': true,
            'drawLine': true,
            'drawPolygon': true,
            'select': true,
            'edit': true,
            'split': true,
            'merge': true,
            'copy': true,
            'delete': true
        }
    });
    toolbar.select.deactivate();

    var attributeEditor = new gbi.widgets.AttributeEditor(editor);
    var styleEditor = new gbi.widgets.StyleEditor(editor);
    var pointStyleEditor = new gbi.widgets.PointStyleEditor(editor);

    var layerfilter = new gbi.widgets.Filter(editor, {
        element: 'filtermanager'
    });

    $('#save_changes').click(function() {
        var layer = editor.layerManager.active();
        layer.save();
        $(this).removeClass('btn-success').attr('disabled', 'disabled');
    });

	return editor;
}

