'use strict';

const { Adw, Gio, Gtk } = imports.gi;

function init() {
}

function fillPreferencesWindow(window) {
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
        active: true,
        valign: Gtk.Align.CENTER,
    });
    row.add_suffix(toggle);

    window.add(page);
}
