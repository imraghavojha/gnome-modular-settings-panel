'use strict';

const { Adw, Gio, Gtk } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {
}

function fillPreferencesWindow(window) {
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.modular-settings-panel');

    const page = new Adw.PreferencesPage();
    const generalGroup = new Adw.PreferencesGroup({
        title: 'General',
    });
    page.add(generalGroup);

    const showIndicatorRow = new Adw.ActionRow({
        title: 'Show Indicator',
    });
    generalGroup.add(showIndicatorRow);

    const showIndicatorToggle = new Gtk.Switch({
        active: settings.get_boolean('show-indicator'),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(
        'show-indicator',
        showIndicatorToggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    showIndicatorRow.add_suffix(showIndicatorToggle);

    const modulesGroup = new Adw.PreferencesGroup({
        title: 'Modules',
    });
    page.add(modulesGroup);

    const modules = ['keyboard', 'quicksettings', 'rotation'];

    for (const module of modules) {
        const row = new Adw.ActionRow({
            title: `${module.charAt(0).toUpperCase() + module.slice(1)} Toggle`,
        });
        modulesGroup.add(row);

        const toggle = new Gtk.Switch({
            active: settings.get_boolean(`${module}-enabled`),
            valign: Gtk.Align.CENTER,
        });
        settings.bind(
            `${module}-enabled`,
            toggle,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );

        row.add_suffix(toggle);
    }

    const wallpaperGroup = new Adw.PreferencesGroup({
        title: 'Wallpaper Settings',
    });
    page.add(wallpaperGroup);

    const lightWallpaperRow = new Adw.ActionRow({
        title: 'Light Wallpaper',
    });
    wallpaperGroup.add(lightWallpaperRow);

    const lightWallpaperChooser = new Gtk.FileChooserButton({
        action: Gtk.FileChooserAction.OPEN,
        title: 'Select Light Wallpaper',
    });
    settings.bind(
        'light-wallpaper-path',
        lightWallpaperChooser,
        'file',
        Gio.SettingsBindFlags.DEFAULT
    );
    lightWallpaperRow.add_suffix(lightWallpaperChooser);

    const darkWallpaperRow = new Adw.ActionRow({
        title: 'Dark Wallpaper',
    });
    wallpaperGroup.add(darkWallpaperRow);

    const darkWallpaperChooser = new Gtk.FileChooserButton({
        action: Gtk.FileChooserAction.OPEN,
        title: 'Select Dark Wallpaper',
    });
    settings.bind(
        'dark-wallpaper-path',
        darkWallpaperChooser,
        'file',
        Gio.SettingsBindFlags.DEFAULT
    );
    darkWallpaperRow.add_suffix(darkWallpaperChooser);

    window.add(page);
}
