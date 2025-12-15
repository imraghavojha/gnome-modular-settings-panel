'use strict';

const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.modular-settings-panel');

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
        title: 'General',
    });
    page.add(group);

    const row = new Adw.ActionRow({
        title: 'Show Indicator',
    });
    group.add(row);

    const toggle = new Gtk.Switch({
        active: settings.get_boolean('show-indicator'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'show-indicator',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    row.add_suffix(toggle);

    window.add(page);
}
