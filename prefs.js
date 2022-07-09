'use strict';

const { Adw, GLib, Gtk, Gio } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

function init() { }

function buildPrefsWidget() {
    const settings = ExtensionUtils.getSettings(Me.metadata['settings-schema']);
    const row = new Adw.ActionRow({
        title: 'Format String',
        subtitle: "Format string used by Glib DateTime.format",
    });
    const entry = new Gtk.Entry({ placeholderText: '%FT%T%:z' });

    settings.bind('format', entry, 'text', Gio.SettingsBindFlags.DEFAULT);
    settings.connect(
        'changed',
        settings => {
            const format = settings.get_string('format');
            // If requested time has seconds in it, so the clock needs to be updated every second, else can be updated every minute
            const setClockSeconds = (format.indexOf("%S") !== -1) ||
                (format.indexOf("%-S") !== -1) ||
                (format.indexOf("%r") !== -1) ||
                (format.indexOf("%T") !== -1);
            Gio.Settings.new("org.gnome.desktop.interface").set_boolean("clock-show-seconds", setClockSeconds);
        },
    );
    row.add_suffix(entry);
    row.set_activatable_widget(entry);
    return row;
}
